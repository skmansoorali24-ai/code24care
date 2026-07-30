from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload

from database import engine, get_db, Base
from models import (
    UserDB, HospitalDB, DepartmentDB, DoctorDB, AppointmentDB,
    UserRegister, UserLogin, UserResponse, TokenResponse,
    HospitalCreate, HospitalUpdate, HospitalResponse,
    DepartmentCreate, DepartmentResponse,
    DoctorCreate, DoctorResponse,
    AppointmentCreate, AppointmentStatusUpdate, AppointmentResponse
)
from auth import hash_password, verify_password, create_access_token, get_current_user

# Create database tables if using SQLAlchemy/SQLite/Postgres
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="MediCare Hospital Appointment API",
    description="Full End-to-End Hospital & Patient Booking Backend with Supabase Integration",
    version="1.0.0"
)

# Enable CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "message": "Welcome to MediCare Hospital Appointment API",
        "status": "online",
        "docs": "/docs"
    }

# ==========================================
# AUTH ENDPOINTS
# ==========================================

@app.post("/api/auth/register", response_model=TokenResponse)
def register(data: UserRegister, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(UserDB).filter(UserDB.email == data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="An account with this email already exists")

    # Create User
    new_user = UserDB(
        email=data.email,
        password_hash=hash_password(data.password),
        full_name=data.full_name,
        phone=data.phone,
        role=data.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    hospital_id = None
    # If registering as a Hospital, create initial hospital record
    if data.role == "hospital":
        h_name = data.hospital_name or f"{data.full_name}'s Medical Center"
        h_city = data.city or "New York"
        h_address = data.address or "123 Healthcare Ave"

        hospital = HospitalDB(
            user_id=new_user.id,
            name=h_name,
            tagline="Leading Care & Advanced Medicine",
            description="Providing state-of-the-art medical services with compassionate patient care.",
            address=h_address,
            city=h_city,
            phone=data.phone or "+1 (555) 019-2831",
            email=data.email,
            image_url="https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=800&q=80",
            banner_url="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80",
            rating=4.9,
            facilities="Emergency 24/7, ICU, Surgery, Pharmacy, Radiology, Laboratory"
        )
        db.add(hospital)
        db.commit()
        db.refresh(hospital)

        # Create default departments for new hospital
        default_deps = [
            DepartmentDB(hospital_id=hospital.id, name="General Medicine", description="Primary health consultations and routine care.", icon="Activity"),
            DepartmentDB(hospital_id=hospital.id, name="Cardiology", description="Heart health, diagnostic tests, and vascular surgery.", icon="Heart"),
            DepartmentDB(hospital_id=hospital.id, name="Pediatrics", description="Comprehensive medical care for children and adolescents.", icon="Users")
        ]
        db.add_all(default_deps)
        db.commit()
        hospital_id = hospital.id

    access_token = create_access_token({"sub": new_user.id, "role": new_user.role})

    user_resp = UserResponse(
        id=new_user.id,
        email=new_user.email,
        full_name=new_user.full_name,
        phone=new_user.phone,
        role=new_user.role,
        hospital_id=hospital_id
    )

    return TokenResponse(access_token=access_token, user=user_resp)


@app.post("/api/auth/login", response_model=TokenResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(UserDB).filter(UserDB.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    hospital_id = None
    if user.role == "hospital":
        h = db.query(HospitalDB).filter(HospitalDB.user_id == user.id).first()
        if h:
            hospital_id = h.id

    access_token = create_access_token({"sub": user.id, "role": user.role})

    user_resp = UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        phone=user.phone,
        role=user.role,
        hospital_id=hospital_id
    )

    return TokenResponse(access_token=access_token, user=user_resp)


@app.get("/api/auth/me", response_model=UserResponse)
def get_me(current_user: UserDB = Depends(get_current_user), db: Session = Depends(get_db)):
    hospital_id = None
    if current_user.role == "hospital":
        h = db.query(HospitalDB).filter(HospitalDB.user_id == current_user.id).first()
        if h:
            hospital_id = h.id

    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        phone=current_user.phone,
        role=current_user.role,
        hospital_id=hospital_id
    )


# ==========================================
# HOSPITAL ENDPOINTS
# ==========================================

@app.get("/api/hospitals", response_model=List[HospitalResponse])
def get_hospitals(
    search: Optional[str] = None,
    city: Optional[str] = None,
    specialty: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(HospitalDB).options(
        joinedload(HospitalDB.departments),
        joinedload(HospitalDB.doctors)
    )

    if city and city != "All":
        query = query.filter(HospitalDB.city.ilike(f"%{city}%"))

    if search:
        query = query.filter(
            (HospitalDB.name.ilike(f"%{search}%")) |
            (HospitalDB.description.ilike(f"%{search}%")) |
            (HospitalDB.city.ilike(f"%{search}%"))
        )

    hospitals = query.all()

    # Post filter by specialty if provided
    results = []
    for h in hospitals:
        doc_resps = [
            DoctorResponse(
                id=d.id,
                hospital_id=d.hospital_id,
                department_id=d.department_id,
                department_name=d.department.name if d.department else "General",
                name=d.name,
                title=d.title,
                specialization=d.specialization,
                qualification=d.qualification,
                experience_years=d.experience_years,
                fee=d.fee,
                image_url=d.image_url,
                available_days=d.available_days,
                working_hours=d.working_hours
            )
            for d in h.doctors
        ]

        if specialty and specialty != "All":
            doc_resps = [d for d in doc_resps if specialty.lower() in d.specialization.lower()]
            if not doc_resps and not any(specialty.lower() in dep.name.lower() for dep in h.departments):
                continue

        dept_resps = [DepartmentResponse.from_orm(dep) for dep in h.departments]

        results.append(
            HospitalResponse(
                id=h.id,
                user_id=h.user_id,
                name=h.name,
                tagline=h.tagline,
                description=h.description,
                address=h.address,
                city=h.city,
                phone=h.phone,
                email=h.email,
                image_url=h.image_url,
                banner_url=h.banner_url,
                rating=h.rating,
                emergency_phone=h.emergency_phone,
                established_year=h.established_year,
                facilities=h.facilities,
                departments=dept_resps,
                doctors=doc_resps
            )
        )

    return results


@app.get("/api/hospitals/{hospital_id}", response_model=HospitalResponse)
def get_hospital_by_id(hospital_id: str, db: Session = Depends(get_db)):
    h = db.query(HospitalDB).options(
        joinedload(HospitalDB.departments),
        joinedload(HospitalDB.doctors).joinedload(DoctorDB.department)
    ).filter(HospitalDB.id == hospital_id).first()

    if not h:
        raise HTTPException(status_code=404, detail="Hospital not found")

    dept_resps = [DepartmentResponse.from_orm(dep) for dep in h.departments]
    doc_resps = [
        DoctorResponse(
            id=d.id,
            hospital_id=d.hospital_id,
            department_id=d.department_id,
            department_name=d.department.name if d.department else "General",
            name=d.name,
            title=d.title,
            specialization=d.specialization,
            qualification=d.qualification,
            experience_years=d.experience_years,
            fee=d.fee,
            image_url=d.image_url,
            available_days=d.available_days,
            working_hours=d.working_hours
        )
        for d in h.doctors
    ]

    return HospitalResponse(
        id=h.id,
        user_id=h.user_id,
        name=h.name,
        tagline=h.tagline,
        description=h.description,
        address=h.address,
        city=h.city,
        phone=h.phone,
        email=h.email,
        image_url=h.image_url,
        banner_url=h.banner_url,
        rating=h.rating,
        emergency_phone=h.emergency_phone,
        established_year=h.established_year,
        facilities=h.facilities,
        departments=dept_resps,
        doctors=doc_resps
    )


@app.get("/api/hospitals/my/profile", response_model=HospitalResponse)
def get_my_hospital_profile(current_user: UserDB = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "hospital":
        raise HTTPException(status_code=403, detail="Only hospital accounts can access this profile")

    h = db.query(HospitalDB).options(
        joinedload(HospitalDB.departments),
        joinedload(HospitalDB.doctors).joinedload(DoctorDB.department)
    ).filter(HospitalDB.user_id == current_user.id).first()

    if not h:
        raise HTTPException(status_code=404, detail="Hospital profile not found")

    dept_resps = [DepartmentResponse.from_orm(dep) for dep in h.departments]
    doc_resps = [
        DoctorResponse(
            id=d.id,
            hospital_id=d.hospital_id,
            department_id=d.department_id,
            department_name=d.department.name if d.department else "General",
            name=d.name,
            title=d.title,
            specialization=d.specialization,
            qualification=d.qualification,
            experience_years=d.experience_years,
            fee=d.fee,
            image_url=d.image_url,
            available_days=d.available_days,
            working_hours=d.working_hours
        )
        for d in h.doctors
    ]

    return HospitalResponse(
        id=h.id,
        user_id=h.user_id,
        name=h.name,
        tagline=h.tagline,
        description=h.description,
        address=h.address,
        city=h.city,
        phone=h.phone,
        email=h.email,
        image_url=h.image_url,
        banner_url=h.banner_url,
        rating=h.rating,
        emergency_phone=h.emergency_phone,
        established_year=h.established_year,
        facilities=h.facilities,
        departments=dept_resps,
        doctors=doc_resps
    )


@app.put("/api/hospitals/my/profile", response_model=HospitalResponse)
def update_my_hospital_profile(
    data: HospitalUpdate,
    current_user: UserDB = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "hospital":
        raise HTTPException(status_code=403, detail="Only hospital accounts can update profile")

    h = db.query(HospitalDB).filter(HospitalDB.user_id == current_user.id).first()
    if not h:
        raise HTTPException(status_code=404, detail="Hospital profile not found")

    for field, val in data.dict(exclude_unset=True).items():
        if val is not None:
            setattr(h, field, val)

    db.commit()
    db.refresh(h)
    return get_my_hospital_profile(current_user=current_user, db=db)


# ==========================================
# DEPARTMENT & DOCTOR ENDPOINTS
# ==========================================

@app.post("/api/hospitals/my/departments", response_model=DepartmentResponse)
def add_department(
    data: DepartmentCreate,
    current_user: UserDB = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "hospital":
        raise HTTPException(status_code=403, detail="Only hospital accounts can add departments")

    h = db.query(HospitalDB).filter(HospitalDB.user_id == current_user.id).first()
    if not h:
        raise HTTPException(status_code=404, detail="Hospital profile not found")

    dep = DepartmentDB(
        hospital_id=h.id,
        name=data.name,
        description=data.description,
        icon=data.icon or "Activity"
    )
    db.add(dep)
    db.commit()
    db.refresh(dep)
    return DepartmentResponse.from_orm(dep)


@app.post("/api/hospitals/my/doctors", response_model=DoctorResponse)
def add_doctor(
    data: DoctorCreate,
    current_user: UserDB = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "hospital":
        raise HTTPException(status_code=403, detail="Only hospital accounts can add doctors")

    h = db.query(HospitalDB).filter(HospitalDB.user_id == current_user.id).first()
    if not h:
        raise HTTPException(status_code=404, detail="Hospital profile not found")

    doc = DoctorDB(
        hospital_id=h.id,
        department_id=data.department_id,
        name=data.name,
        title=data.title or "Dr.",
        specialization=data.specialization,
        qualification=data.qualification,
        experience_years=data.experience_years,
        fee=data.fee,
        image_url=data.image_url or "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80",
        available_days=data.available_days,
        working_hours=data.working_hours
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    dept_name = "General"
    if doc.department_id:
        d_dep = db.query(DepartmentDB).filter(DepartmentDB.id == doc.department_id).first()
        if d_dep:
            dept_name = d_dep.name

    return DoctorResponse(
        id=doc.id,
        hospital_id=doc.hospital_id,
        department_id=doc.department_id,
        department_name=dept_name,
        name=doc.name,
        title=doc.title,
        specialization=doc.specialization,
        qualification=doc.qualification,
        experience_years=doc.experience_years,
        fee=doc.fee,
        image_url=doc.image_url,
        available_days=doc.available_days,
        working_hours=doc.working_hours
    )


@app.delete("/api/doctors/{doctor_id}")
def delete_doctor(
    doctor_id: str,
    current_user: UserDB = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "hospital":
        raise HTTPException(status_code=403, detail="Only hospital accounts can delete doctors")

    h = db.query(HospitalDB).filter(HospitalDB.user_id == current_user.id).first()
    doc = db.query(DoctorDB).filter(DoctorDB.id == doctor_id, DoctorDB.hospital_id == h.id).first()

    if not doc:
        raise HTTPException(status_code=404, detail="Doctor not found or unauthorized")

    db.delete(doc)
    db.commit()
    return {"message": "Doctor removed successfully"}


@app.get("/api/doctors/{doctor_id}/slots")
def get_doctor_slots(doctor_id: str, date: str, db: Session = Depends(get_db)):
    doc = db.query(DoctorDB).filter(DoctorDB.id == doctor_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Doctor not found")

    # Generate default standard time slots
    standard_slots = [
        "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
        "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM"
    ]

    # Find already booked slots on this date
    booked_appointments = db.query(AppointmentDB).filter(
        AppointmentDB.doctor_id == doctor_id,
        AppointmentDB.appointment_date == date,
        AppointmentDB.status.in_(["pending", "confirmed"])
    ).all()

    booked_slots = set(apt.time_slot for apt in booked_appointments)

    available_slots = [
        {"time": slot, "available": slot not in booked_slots}
        for slot in standard_slots
    ]

    return {
        "doctor_id": doctor_id,
        "doctor_name": f"{doc.title} {doc.name}",
        "date": date,
        "slots": available_slots
    }


# ==========================================
# APPOINTMENT ENDPOINTS
# ==========================================

@app.post("/api/appointments", response_model=AppointmentResponse)
def book_appointment(
    data: AppointmentCreate,
    current_user: UserDB = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "patient":
        raise HTTPException(status_code=403, detail="Hospitals cannot book patient appointments")

    hospital = db.query(HospitalDB).filter(HospitalDB.id == data.hospital_id).first()
    doctor = db.query(DoctorDB).filter(DoctorDB.id == data.doctor_id).first()

    if not hospital or not doctor:
        raise HTTPException(status_code=404, detail="Hospital or Doctor not found")

    # Check if slot already booked
    existing = db.query(AppointmentDB).filter(
        AppointmentDB.doctor_id == data.doctor_id,
        AppointmentDB.appointment_date == data.appointment_date,
        AppointmentDB.time_slot == data.time_slot,
        AppointmentDB.status.in_(["pending", "confirmed"])
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="This time slot is already booked. Please choose another slot.")

    apt = AppointmentDB(
        patient_id=current_user.id,
        hospital_id=data.hospital_id,
        doctor_id=data.doctor_id,
        department_id=data.department_id or doctor.department_id,
        appointment_date=data.appointment_date,
        time_slot=data.time_slot,
        status="pending",
        patient_name=data.patient_name,
        patient_phone=data.patient_phone,
        patient_gender=data.patient_gender,
        patient_age=data.patient_age,
        symptoms_notes=data.symptoms_notes
    )
    db.add(apt)
    db.commit()
    db.refresh(apt)

    dept_name = None
    if apt.department_id:
        dep = db.query(DepartmentDB).filter(DepartmentDB.id == apt.department_id).first()
        if dep:
            dept_name = dep.name

    return AppointmentResponse(
        id=apt.id,
        patient_id=apt.patient_id,
        hospital_id=apt.hospital_id,
        hospital_name=hospital.name,
        doctor_id=apt.doctor_id,
        doctor_name=f"{doctor.title} {doctor.name}",
        doctor_title=doctor.title,
        doctor_specialization=doctor.specialization,
        department_id=apt.department_id,
        department_name=dept_name,
        appointment_date=apt.appointment_date,
        time_slot=apt.time_slot,
        status=apt.status,
        patient_name=apt.patient_name,
        patient_phone=apt.patient_phone,
        patient_gender=apt.patient_gender,
        patient_age=apt.patient_age,
        symptoms_notes=apt.symptoms_notes,
        created_at=apt.created_at
    )


@app.get("/api/appointments/patient", response_model=List[AppointmentResponse])
def get_patient_appointments(
    current_user: UserDB = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    appointments = db.query(AppointmentDB).options(
        joinedload(AppointmentDB.hospital),
        joinedload(AppointmentDB.doctor),
        joinedload(AppointmentDB.department)
    ).filter(AppointmentDB.patient_id == current_user.id).order_by(AppointmentDB.created_at.desc()).all()

    res = []
    for apt in appointments:
        res.append(
            AppointmentResponse(
                id=apt.id,
                patient_id=apt.patient_id,
                hospital_id=apt.hospital_id,
                hospital_name=apt.hospital.name if apt.hospital else "Hospital",
                doctor_id=apt.doctor_id,
                doctor_name=f"{apt.doctor.title} {apt.doctor.name}" if apt.doctor else "Doctor",
                doctor_title=apt.doctor.title if apt.doctor else "Dr.",
                doctor_specialization=apt.doctor.specialization if apt.doctor else "",
                department_id=apt.department_id,
                department_name=apt.department.name if apt.department else None,
                appointment_date=apt.appointment_date,
                time_slot=apt.time_slot,
                status=apt.status,
                patient_name=apt.patient_name,
                patient_phone=apt.patient_phone,
                patient_gender=apt.patient_gender,
                patient_age=apt.patient_age,
                symptoms_notes=apt.symptoms_notes,
                created_at=apt.created_at
            )
        )
    return res


@app.get("/api/appointments/hospital", response_model=List[AppointmentResponse])
def get_hospital_appointments(
    current_user: UserDB = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "hospital":
        raise HTTPException(status_code=403, detail="Only hospitals can view hospital appointments")

    h = db.query(HospitalDB).filter(HospitalDB.user_id == current_user.id).first()
    if not h:
        raise HTTPException(status_code=404, detail="Hospital profile not found")

    appointments = db.query(AppointmentDB).options(
        joinedload(AppointmentDB.doctor),
        joinedload(AppointmentDB.department)
    ).filter(AppointmentDB.hospital_id == h.id).order_by(AppointmentDB.created_at.desc()).all()

    res = []
    for apt in appointments:
        res.append(
            AppointmentResponse(
                id=apt.id,
                patient_id=apt.patient_id,
                hospital_id=apt.hospital_id,
                hospital_name=h.name,
                doctor_id=apt.doctor_id,
                doctor_name=f"{apt.doctor.title} {apt.doctor.name}" if apt.doctor else "Doctor",
                doctor_title=apt.doctor.title if apt.doctor else "Dr.",
                doctor_specialization=apt.doctor.specialization if apt.doctor else "",
                department_id=apt.department_id,
                department_name=apt.department.name if apt.department else None,
                appointment_date=apt.appointment_date,
                time_slot=apt.time_slot,
                status=apt.status,
                patient_name=apt.patient_name,
                patient_phone=apt.patient_phone,
                patient_gender=apt.patient_gender,
                patient_age=apt.patient_age,
                symptoms_notes=apt.symptoms_notes,
                created_at=apt.created_at
            )
        )
    return res


@app.patch("/api/appointments/{appointment_id}/status", response_model=AppointmentResponse)
def update_appointment_status(
    appointment_id: str,
    data: AppointmentStatusUpdate,
    current_user: UserDB = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "hospital":
        raise HTTPException(status_code=403, detail="Only hospitals can update appointment statuses")

    h = db.query(HospitalDB).filter(HospitalDB.user_id == current_user.id).first()
    apt = db.query(AppointmentDB).filter(AppointmentDB.id == appointment_id, AppointmentDB.hospital_id == h.id).first()

    if not apt:
        raise HTTPException(status_code=404, detail="Appointment not found or unauthorized")

    apt.status = data.status
    db.commit()
    db.refresh(apt)

    return AppointmentResponse(
        id=apt.id,
        patient_id=apt.patient_id,
        hospital_id=apt.hospital_id,
        hospital_name=h.name,
        doctor_id=apt.doctor_id,
        doctor_name=f"{apt.doctor.title} {apt.doctor.name}" if apt.doctor else "Doctor",
        doctor_title=apt.doctor.title if apt.doctor else "Dr.",
        doctor_specialization=apt.doctor.specialization if apt.doctor else "",
        department_id=apt.department_id,
        department_name=apt.department.name if apt.department else None,
        appointment_date=apt.appointment_date,
        time_slot=apt.time_slot,
        status=apt.status,
        patient_name=apt.patient_name,
        patient_phone=apt.patient_phone,
        patient_gender=apt.patient_gender,
        patient_age=apt.patient_age,
        symptoms_notes=apt.symptoms_notes,
        created_at=apt.created_at
    )


@app.patch("/api/appointments/{appointment_id}/cancel")
def cancel_appointment(
    appointment_id: str,
    current_user: UserDB = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    apt = db.query(AppointmentDB).filter(AppointmentDB.id == appointment_id, AppointmentDB.patient_id == current_user.id).first()
    if not apt:
        raise HTTPException(status_code=404, detail="Appointment not found or unauthorized")

    apt.status = "cancelled"
    db.commit()
    return {"message": "Appointment cancelled successfully"}


# ==========================================
# HOSPITAL ANALYTICS DASHBOARD STATS
# ==========================================

@app.get("/api/hospitals/my/stats")
def get_hospital_stats(
    current_user: UserDB = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "hospital":
        raise HTTPException(status_code=403, detail="Only hospitals can view stats")

    h = db.query(HospitalDB).filter(HospitalDB.user_id == current_user.id).first()
    if not h:
        raise HTTPException(status_code=404, detail="Hospital not found")

    total_doctors = db.query(DoctorDB).filter(DoctorDB.hospital_id == h.id).count()
    total_appointments = db.query(AppointmentDB).filter(AppointmentDB.hospital_id == h.id).count()
    pending_appointments = db.query(AppointmentDB).filter(AppointmentDB.hospital_id == h.id, AppointmentDB.status == "pending").count()
    confirmed_appointments = db.query(AppointmentDB).filter(AppointmentDB.hospital_id == h.id, AppointmentDB.status == "confirmed").count()
    completed_appointments = db.query(AppointmentDB).filter(AppointmentDB.hospital_id == h.id, AppointmentDB.status == "completed").count()

    # Calculate estimated revenue
    completed_apts = db.query(AppointmentDB).options(joinedload(AppointmentDB.doctor)).filter(
        AppointmentDB.hospital_id == h.id, AppointmentDB.status == "completed"
    ).all()
    est_revenue = sum(apt.doctor.fee for apt in completed_apts if apt.doctor)

    return {
        "hospital_name": h.name,
        "total_doctors": total_doctors,
        "total_appointments": total_appointments,
        "pending_appointments": pending_appointments,
        "confirmed_appointments": confirmed_appointments,
        "completed_appointments": completed_appointments,
        "estimated_revenue": est_revenue
    }

if __name__ == "__main__":
    import os
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)