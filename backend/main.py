from typing import List, Optional

from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from auth import create_access_token, get_current_user, hash_password, verify_password
from database import Base, engine, get_db
from models import (
    AppointmentCreate,
    AppointmentDB,
    AppointmentResponse,
    AppointmentStatusUpdate,
    DepartmentCreate,
    DepartmentDB,
    DepartmentResponse,
    DoctorCreate,
    DoctorDB,
    DoctorResponse,
    HospitalCreate,
    HospitalDB,
    HospitalResponse,
    HospitalUpdate,
    TokenResponse,
    UserDB,
    UserLogin,
    UserRegister,
    UserResponse,
)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="MediCare Hub API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def serialize_user(user: UserDB) -> UserResponse:
    return UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        phone=user.phone,
        role=user.role,
        hospital_id=user.hospital.id if user.hospital else None,
    )


def serialize_department(dept: DepartmentDB) -> DepartmentResponse:
    return DepartmentResponse(
        id=dept.id,
        hospital_id=dept.hospital_id,
        name=dept.name,
        description=dept.description,
        icon=dept.icon,
    )


def serialize_doctor(doc: DoctorDB) -> DoctorResponse:
    return DoctorResponse(
        id=doc.id,
        hospital_id=doc.hospital_id,
        department_id=doc.department_id,
        department_name=doc.department.name if doc.department else None,
        name=doc.name,
        title=doc.title,
        specialization=doc.specialization,
        qualification=doc.qualification,
        experience_years=doc.experience_years,
        fee=doc.fee,
        image_url=doc.image_url,
        available_days=doc.available_days,
        working_hours=doc.working_hours,
    )


def serialize_hospital(hospital: HospitalDB) -> HospitalResponse:
    return HospitalResponse(
        id=hospital.id,
        user_id=hospital.user_id,
        name=hospital.name,
        tagline=hospital.tagline,
        description=hospital.description,
        address=hospital.address,
        city=hospital.city,
        phone=hospital.phone,
        email=hospital.email,
        image_url=hospital.image_url,
        banner_url=hospital.banner_url,
        rating=hospital.rating,
        emergency_phone=hospital.emergency_phone,
        established_year=hospital.established_year,
        facilities=hospital.facilities,
        departments=[serialize_department(dept) for dept in hospital.departments],
        doctors=[serialize_doctor(doc) for doc in hospital.doctors],
    )


def serialize_appointment(apt: AppointmentDB) -> AppointmentResponse:
    return AppointmentResponse(
        id=apt.id,
        patient_id=apt.patient_id,
        hospital_id=apt.hospital_id,
        hospital_name=apt.hospital.name if apt.hospital else None,
        doctor_id=apt.doctor_id,
        doctor_name=apt.doctor.name if apt.doctor else None,
        doctor_title=apt.doctor.title if apt.doctor else None,
        doctor_specialization=apt.doctor.specialization if apt.doctor else None,
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
        created_at=apt.created_at,
    )


@app.get("/")
def home():
    return {"message": "MediCare Hub API Running", "docs": "/docs"}


@app.post("/api/auth/register", response_model=TokenResponse)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    existing_user = db.query(UserDB).filter(UserDB.email == payload.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already exists")

    user = UserDB(
        email=str(payload.email),
        password_hash=hash_password(payload.password),
        full_name=payload.full_name,
        phone=payload.phone,
        role=payload.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    hospital_profile = None
    if payload.role == "hospital":
        hospital_name = payload.hospital_name or payload.full_name
        hospital_city = payload.city or "New York"
        hospital_address = payload.address or "123 Care Street"
        hospital_profile = HospitalDB(
            user_id=user.id,
            name=hospital_name,
            address=hospital_address,
            city=hospital_city,
            phone=payload.phone or "+1 (555) 000-0000",
            email=str(payload.email),
            tagline="New hospital partner",
            description="Hospital profile created during registration.",
            facilities="Emergency 24/7, ICU, Pharmacy, Diagnostics, Radiology, Surgery",
        )
        db.add(hospital_profile)
        db.commit()
        db.refresh(hospital_profile)

    access_token = create_access_token({"sub": user.id})
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=serialize_user(user),
    )


@app.post("/api/auth/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(UserDB).filter(UserDB.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid Email")
    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Wrong Password")

    access_token = create_access_token({"sub": user.id})
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=serialize_user(user),
    )


@app.get("/api/auth/me", response_model=UserResponse)
def auth_me(current_user: UserDB = Depends(get_current_user)):
    return serialize_user(current_user)


@app.get("/api/hospitals", response_model=List[HospitalResponse])
def list_hospitals(
    search: Optional[str] = Query(default=""),
    city: Optional[str] = Query(default="All"),
    specialty: Optional[str] = Query(default="All"),
    db: Session = Depends(get_db),
):
    query = db.query(HospitalDB)

    if city and city != "All":
        query = query.filter(HospitalDB.city == city)

    if search:
        like_term = f"%{search}%"
        query = query.filter(
            or_(
                HospitalDB.name.ilike(like_term),
                HospitalDB.description.ilike(like_term),
                HospitalDB.tagline.ilike(like_term),
            )
        )

    hospitals = query.all()
    if specialty and specialty != "All":
        filtered = []
        for hospital in hospitals:
            doctor_match = any(
                doc.specialization.lower().startswith(specialty.lower())
                or specialty.lower() in doc.specialization.lower()
                for doc in hospital.doctors
            )
            if doctor_match:
                filtered.append(hospital)
        hospitals = filtered

    return [serialize_hospital(h) for h in hospitals]


@app.get("/api/hospitals/{hospital_id}", response_model=HospitalResponse)
def get_hospital(hospital_id: str, db: Session = Depends(get_db)):
    hospital = db.query(HospitalDB).filter(HospitalDB.id == hospital_id).first()
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")
    return serialize_hospital(hospital)


@app.get("/api/doctors/{doctor_id}/slots")
def doctor_slots(doctor_id: str, date: str, db: Session = Depends(get_db)):
    doctor = db.query(DoctorDB).filter(DoctorDB.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    slot_list = [
        "09:00 AM",
        "10:00 AM",
        "11:30 AM",
        "01:00 PM",
        "02:30 PM",
        "04:00 PM",
    ]
    slots = [
        {"time": slot, "available": True}
        for slot in slot_list
    ]
    return {
        "doctor_id": doctor.id,
        "doctor_name": doctor.name,
        "date": date,
        "slots": slots,
    }


@app.post("/api/appointments", response_model=AppointmentResponse)
def create_appointment(payload: AppointmentCreate, db: Session = Depends(get_db)):
    hospital = db.query(HospitalDB).filter(HospitalDB.id == payload.hospital_id).first()
    doctor = db.query(DoctorDB).filter(DoctorDB.id == payload.doctor_id).first()
    if not hospital or not doctor:
        raise HTTPException(status_code=404, detail="Hospital or doctor not found")

    patient = None
    try:
        from auth import get_current_user
        from fastapi import Request
        # The frontend always includes the auth token when a patient is signed in.
        # If the token is absent, the booking still falls back to a lightweight guest patient.
        request = None
    except Exception:
        request = None

    patient_id = ""
    existing_patient = db.query(UserDB).filter(UserDB.phone == payload.patient_phone).first()
    if existing_patient:
        patient_id = existing_patient.id
    else:
        patient = UserDB(
            email=f"guest-{payload.patient_phone.replace('+', '').replace(' ', '')}@booking.local",
            password_hash=hash_password("guest-booking"),
            full_name=payload.patient_name,
            phone=payload.patient_phone,
            role="patient",
        )
        db.add(patient)
        db.commit()
        db.refresh(patient)
        patient_id = patient.id

    apt = AppointmentDB(
        patient_id=patient_id,
        hospital_id=payload.hospital_id,
        doctor_id=payload.doctor_id,
        department_id=payload.department_id,
        appointment_date=payload.appointment_date,
        time_slot=payload.time_slot,
        status="pending",
        patient_name=payload.patient_name,
        patient_phone=payload.patient_phone,
        patient_gender=payload.patient_gender,
        patient_age=payload.patient_age,
        symptoms_notes=payload.symptoms_notes,
    )

    db.add(apt)
    db.commit()
    db.refresh(apt)
    return serialize_appointment(apt)


@app.get("/api/appointments/patient", response_model=List[AppointmentResponse])
def patient_appointments(current_user: UserDB = Depends(get_current_user), db: Session = Depends(get_db)):
    appointments = (
        db.query(AppointmentDB)
        .filter(AppointmentDB.patient_id == current_user.id)
        .order_by(AppointmentDB.created_at.desc())
        .all()
    )
    return [serialize_appointment(apt) for apt in appointments]


@app.get("/api/appointments/hospital", response_model=List[AppointmentResponse])
def hospital_appointments(current_user: UserDB = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "hospital":
        raise HTTPException(status_code=403, detail="Hospital account required")

    hospital = db.query(HospitalDB).filter(HospitalDB.user_id == current_user.id).first()
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital profile not found")

    appointments = (
        db.query(AppointmentDB)
        .filter(AppointmentDB.hospital_id == hospital.id)
        .order_by(AppointmentDB.created_at.desc())
        .all()
    )
    return [serialize_appointment(apt) for apt in appointments]


@app.patch("/api/appointments/{appointment_id}/cancel", response_model=AppointmentResponse)
def cancel_appointment(
    appointment_id: str,
    current_user: UserDB = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    apt = db.query(AppointmentDB).filter(AppointmentDB.id == appointment_id).first()
    if not apt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    if apt.patient_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only cancel your own appointments")

    apt.status = "cancelled"
    db.commit()
    db.refresh(apt)
    return serialize_appointment(apt)


@app.patch("/api/appointments/{appointment_id}/status", response_model=AppointmentResponse)
def update_appointment_status(
    appointment_id: str,
    payload: AppointmentStatusUpdate,
    current_user: UserDB = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "hospital":
        raise HTTPException(status_code=403, detail="Hospital account required")

    apt = db.query(AppointmentDB).filter(AppointmentDB.id == appointment_id).first()
    if not apt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    hospital = db.query(HospitalDB).filter(HospitalDB.user_id == current_user.id).first()
    if not hospital or apt.hospital_id != hospital.id:
        raise HTTPException(status_code=403, detail="You can only manage appointments in your hospital")

    apt.status = payload.status
    db.commit()
    db.refresh(apt)
    return serialize_appointment(apt)


@app.get("/api/hospitals/my/stats")
def hospital_stats(current_user: UserDB = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "hospital":
        raise HTTPException(status_code=403, detail="Hospital account required")

    hospital = db.query(HospitalDB).filter(HospitalDB.user_id == current_user.id).first()
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital profile not found")

    total_appointments = db.query(AppointmentDB).filter(AppointmentDB.hospital_id == hospital.id).count()
    pending_appointments = db.query(AppointmentDB).filter(
        AppointmentDB.hospital_id == hospital.id,
        AppointmentDB.status == "pending",
    ).count()
    total_doctors = db.query(DoctorDB).filter(DoctorDB.hospital_id == hospital.id).count()
    estimated_revenue = (
        db.query(func.coalesce(func.sum(DoctorDB.fee), 0))
        .filter(DoctorDB.hospital_id == hospital.id)
        .scalar()
        or 0
    )

    return {
        "total_appointments": total_appointments,
        "pending_appointments": pending_appointments,
        "total_doctors": total_doctors,
        "estimated_revenue": float(estimated_revenue),
    }


@app.get("/api/hospitals/my/profile", response_model=HospitalResponse)
def my_hospital_profile(current_user: UserDB = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "hospital":
        raise HTTPException(status_code=403, detail="Hospital account required")

    hospital = db.query(HospitalDB).filter(HospitalDB.user_id == current_user.id).first()
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital profile not found")

    return serialize_hospital(hospital)


@app.put("/api/hospitals/my/profile", response_model=HospitalResponse)
def update_my_hospital_profile(
    payload: HospitalUpdate,
    current_user: UserDB = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "hospital":
        raise HTTPException(status_code=403, detail="Hospital account required")

    hospital = db.query(HospitalDB).filter(HospitalDB.user_id == current_user.id).first()
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital profile not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(hospital, field, value)

    db.commit()
    db.refresh(hospital)
    return serialize_hospital(hospital)


@app.post("/api/hospitals/my/departments", response_model=DepartmentResponse)
def create_department(
    payload: DepartmentCreate,
    current_user: UserDB = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "hospital":
        raise HTTPException(status_code=403, detail="Hospital account required")

    hospital = db.query(HospitalDB).filter(HospitalDB.user_id == current_user.id).first()
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital profile not found")

    dept = DepartmentDB(
        hospital_id=hospital.id,
        name=payload.name,
        description=payload.description,
        icon=payload.icon,
    )
    db.add(dept)
    db.commit()
    db.refresh(dept)
    return serialize_department(dept)


@app.post("/api/hospitals/my/doctors", response_model=DoctorResponse)
def create_doctor(
    payload: DoctorCreate,
    current_user: UserDB = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "hospital":
        raise HTTPException(status_code=403, detail="Hospital account required")

    hospital = db.query(HospitalDB).filter(HospitalDB.user_id == current_user.id).first()
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital profile not found")

    doc = DoctorDB(
        hospital_id=hospital.id,
        department_id=payload.department_id,
        name=payload.name,
        title=payload.title,
        specialization=payload.specialization,
        qualification=payload.qualification,
        experience_years=payload.experience_years,
        fee=payload.fee,
        image_url=payload.image_url,
        available_days=payload.available_days,
        working_hours=payload.working_hours,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return serialize_doctor(doc)


@app.delete("/api/doctors/{doctor_id}")
def delete_doctor(doctor_id: str, current_user: UserDB = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "hospital":
        raise HTTPException(status_code=403, detail="Hospital account required")

    doctor = db.query(DoctorDB).filter(DoctorDB.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    hospital = db.query(HospitalDB).filter(HospitalDB.user_id == current_user.id).first()
    if not hospital or doctor.hospital_id != hospital.id:
        raise HTTPException(status_code=403, detail="You can only manage doctors in your hospital")

    db.delete(doctor)
    db.commit()
    return {"message": "Doctor removed successfully"}
