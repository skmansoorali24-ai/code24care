import os
from sqlalchemy.orm import Session
from database import engine, SessionLocal, Base
from models import UserDB, HospitalDB, DepartmentDB, DoctorDB, AppointmentDB
from auth import hash_password

def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    # Check if hospitals already exist
    if db.query(HospitalDB).count() > 0:
        print("Database already contains data. Skipping seed.")
        db.close()
        return

    print("Seeding database with initial hospital, doctor, and department data...")

    # 1. Create Patient User
    patient_user = UserDB(
        email="patient@example.com",
        password_hash=hash_password("password123"),
        full_name="Alex Morgan",
        phone="+1 (555) 234-5678",
        role="patient"
    )
    db.add(patient_user)

    # 2. Create Hospital 1 - MetroCare Health City
    h1_user = UserDB(
        email="hospital@metrocare.com",
        password_hash=hash_password("hospital123"),
        full_name="MetroCare Health City Admin",
        phone="+1 (555) 987-6543",
        role="hospital"
    )
    db.add(h1_user)
    db.commit()

    h1 = HospitalDB(
        user_id=h1_user.id,
        name="MetroCare Health City",
        tagline="Excellence in Multi-Specialty Healthcare & Surgery",
        description="MetroCare Health City is a state-of-the-art 500-bed tertiary care center equipped with cutting-edge medical technology, robotic surgery suites, and round-the-clock emergency trauma response.",
        address="742 Medical Center Blvd, Suite 100",
        city="New York",
        phone="+1 (555) 987-6543",
        email="contact@metrocarehealth.com",
        image_url="https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=800&q=80",
        banner_url="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80",
        rating=4.9,
        emergency_phone="+1 (555) 911-0010",
        established_year=2008,
        facilities="24/7 Trauma Care, Robotic Surgery Suite, MRI & PET CT, Intensive Care Unit, In-house Pharmacy, Helipad"
    )
    db.add(h1)
    db.commit()

    # Departments for H1
    d1_cardio = DepartmentDB(hospital_id=h1.id, name="Cardiology", description="Comprehensive heart health, interventional cardiology, and cardiac rehabilitation.", icon="Heart")
    d1_neuro = DepartmentDB(hospital_id=h1.id, name="Neurology & Spine", description="Advanced neurological diagnostics, brain surgery, and spine therapy.", icon="Brain")
    d1_ortho = DepartmentDB(hospital_id=h1.id, name="Orthopedics & Joint Care", description="Joint replacement, sports injury management, and arthroscopic surgery.", icon="Activity")
    d1_peds = DepartmentDB(hospital_id=h1.id, name="Pediatrics & Child Care", description="Specialized pediatric treatments, infant ICU, and adolescent medicine.", icon="Users")

    db.add_all([d1_cardio, d1_neuro, d1_ortho, d1_peds])
    db.commit()

    # Doctors for H1
    doc1 = DoctorDB(
        hospital_id=h1.id,
        department_id=d1_cardio.id,
        name="Sarah Jenkins",
        title="Dr.",
        specialization="Senior Interventional Cardiologist",
        qualification="MD, FACC, Harvard Medical School",
        experience_years=14,
        fee=120.00,
        image_url="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80",
        available_days="Mon,Wed,Fri",
        working_hours="09:00 AM - 04:00 PM"
    )

    doc2 = DoctorDB(
        hospital_id=h1.id,
        department_id=d1_neuro.id,
        name="Robert Chen",
        title="Dr.",
        specialization="Consultant Neurosurgeon",
        qualification="MBBS, MS (Neurosurgery), FRCS London",
        experience_years=18,
        fee=150.00,
        image_url="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80",
        available_days="Tue,Thu,Sat",
        working_hours="10:00 AM - 05:00 PM"
    )

    doc3 = DoctorDB(
        hospital_id=h1.id,
        department_id=d1_ortho.id,
        name="Elena Rostova",
        title="Dr.",
        specialization="Orthopedic Surgeon & Joint Specialist",
        qualification="MD (Orthopedics), Fellowship Joint Reconstruction",
        experience_years=10,
        fee=95.00,
        image_url="https://images.unsplash.com/photo-1594824813566-78a509935105?auto=format&fit=crop&w=400&q=80",
        available_days="Mon,Tue,Wed,Thu,Fri",
        working_hours="08:30 AM - 03:30 PM"
    )

    db.add_all([doc1, doc2, doc3])

    # 3. Create Hospital 2 - St. Jude Children & Family Hospital
    h2_user = UserDB(
        email="info@stjude-health.org",
        password_hash=hash_password("hospital123"),
        full_name="St. Jude Family Hospital",
        phone="+1 (555) 432-1098",
        role="hospital"
    )
    db.add(h2_user)
    db.commit()

    h2 = HospitalDB(
        user_id=h2_user.id,
        name="St. Jude Children & Family Hospital",
        tagline="Compassionate Care for Families & Children",
        description="St. Jude focuses on family medicine, maternal wellness, pediatric specialties, and preventive outpatient healthcare with gentle, modern care.",
        address="104 Wellness Parkway",
        city="San Francisco",
        phone="+1 (555) 432-1098",
        email="info@stjude-health.org",
        image_url="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80",
        banner_url="https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=1200&q=80",
        rating=4.8,
        emergency_phone="+1 (555) 911-0020",
        established_year=2012,
        facilities="Pediatric Emergency, Maternity Suites, Neonatal ICU, Vaccination Clinic, Pediatric Therapy"
    )
    db.add(h2)
    db.commit()

    d2_peds = DepartmentDB(hospital_id=h2.id, name="Pediatrics", description="Infant care, child growth monitoring, vaccinations.", icon="Users")
    d2_obgyn = DepartmentDB(hospital_id=h2.id, name="Obstetrics & Gynecology", description="Maternity care, high-risk pregnancy management.", icon="Heart")
    db.add_all([d2_peds, d2_obgyn])
    db.commit()

    doc4 = DoctorDB(
        hospital_id=h2.id,
        department_id=d2_peds.id,
        name="Marcus Vance",
        title="Dr.",
        specialization="Chief Pediatrician & Child Health Specialist",
        qualification="MD (Pediatrics), Johns Hopkins",
        experience_years=12,
        fee=85.00,
        image_url="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&q=80",
        available_days="Mon,Tue,Wed,Thu,Fri",
        working_hours="09:00 AM - 04:00 PM"
    )

    doc5 = DoctorDB(
        hospital_id=h2.id,
        department_id=d2_obgyn.id,
        name="Aisha Patel",
        title="Dr.",
        specialization="Obstetrician & Gynecologist",
        qualification="MBBS, DGO, MD (OB/GYN)",
        experience_years=11,
        fee=100.00,
        image_url="https://images.unsplash.com/photo-1594824813566-78a509935105?auto=format&fit=crop&w=400&q=80",
        available_days="Mon,Wed,Fri,Sat",
        working_hours="10:00 AM - 04:00 PM"
    )

    db.add_all([doc4, doc5])
    db.commit()

    # Create Sample Appointment
    apt1 = AppointmentDB(
        patient_id=patient_user.id,
        hospital_id=h1.id,
        doctor_id=doc1.id,
        department_id=d1_cardio.id,
        appointment_date="2026-08-05",
        time_slot="10:00 AM",
        status="confirmed",
        patient_name="Alex Morgan",
        patient_phone="+1 (555) 234-5678",
        patient_gender="Male",
        patient_age=34,
        symptoms_notes="Routine annual cardiac checkup and mild hypertension review."
    )
    db.add(apt1)
    db.commit()

    print("Database seeding completed successfully!")
    db.close()

if __name__ == "__main__":
    seed_database()
