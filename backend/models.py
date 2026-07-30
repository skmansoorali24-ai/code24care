import uuid
from datetime import datetime
from typing import Optional, List
from sqlalchemy import Column, String, Text, Float, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from pydantic import BaseModel, EmailStr

from database import Base

# ==================== SQLAlchemy Models ====================

def generate_uuid():
    return str(uuid.uuid4())

class UserDB(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    role = Column(String(20), nullable=False, default="patient") # 'patient' or 'hospital'
    created_at = Column(DateTime, default=datetime.utcnow)

    hospital = relationship("HospitalDB", back_populates="user", uselist=False)
    appointments = relationship("AppointmentDB", back_populates="patient", foreign_keys="AppointmentDB.patient_id")

class HospitalDB(Base):
    __tablename__ = "hospitals"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    name = Column(String(255), nullable=False)
    tagline = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    address = Column(Text, nullable=False)
    city = Column(String(100), nullable=False, index=True)
    phone = Column(String(50), nullable=False)
    email = Column(String(255), nullable=True)
    image_url = Column(Text, nullable=True)
    banner_url = Column(Text, nullable=True)
    rating = Column(Float, default=4.8)
    emergency_phone = Column(String(50), nullable=True)
    established_year = Column(Integer, nullable=True)
    facilities = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("UserDB", back_populates="hospital")
    departments = relationship("DepartmentDB", back_populates="hospital", cascade="all, delete-orphan")
    doctors = relationship("DoctorDB", back_populates="hospital", cascade="all, delete-orphan")
    appointments = relationship("AppointmentDB", back_populates="hospital", cascade="all, delete-orphan")

class DepartmentDB(Base):
    __tablename__ = "departments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    hospital_id = Column(String(36), ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    icon = Column(String(50), default="Activity")
    created_at = Column(DateTime, default=datetime.utcnow)

    hospital = relationship("HospitalDB", back_populates="departments")
    doctors = relationship("DoctorDB", back_populates="department")

class DoctorDB(Base):
    __tablename__ = "doctors"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    hospital_id = Column(String(36), ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=False)
    department_id = Column(String(36), ForeignKey("departments.id", ondelete="SET NULL"), nullable=True)
    name = Column(String(255), nullable=False)
    title = Column(String(50), default="Dr.")
    specialization = Column(String(255), nullable=False)
    qualification = Column(String(255), nullable=False)
    experience_years = Column(Integer, default=5)
    fee = Column(Float, default=50.0)
    image_url = Column(Text, nullable=True)
    available_days = Column(String(255), default="Mon,Tue,Wed,Thu,Fri")
    working_hours = Column(String(100), default="09:00 AM - 05:00 PM")
    created_at = Column(DateTime, default=datetime.utcnow)

    hospital = relationship("HospitalDB", back_populates="doctors")
    department = relationship("DepartmentDB", back_populates="doctors")
    appointments = relationship("AppointmentDB", back_populates="doctor", cascade="all, delete-orphan")

class AppointmentDB(Base):
    __tablename__ = "appointments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    hospital_id = Column(String(36), ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=False)
    doctor_id = Column(String(36), ForeignKey("doctors.id", ondelete="CASCADE"), nullable=False)
    department_id = Column(String(36), ForeignKey("departments.id", ondelete="SET NULL"), nullable=True)
    appointment_date = Column(String(20), nullable=False)
    time_slot = Column(String(50), nullable=False)
    status = Column(String(20), default="pending") # 'pending', 'confirmed', 'completed', 'cancelled'
    patient_name = Column(String(255), nullable=False)
    patient_phone = Column(String(50), nullable=False)
    patient_gender = Column(String(20), nullable=True)
    patient_age = Column(Integer, nullable=True)
    symptoms_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("UserDB", back_populates="appointments", foreign_keys=[patient_id])
    hospital = relationship("HospitalDB", back_populates="appointments")
    doctor = relationship("DoctorDB", back_populates="appointments")


# ==================== Pydantic Schemas ====================

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None
    role: str = "patient" # "patient" or "hospital"
    # Optional fields if registering directly as a hospital
    hospital_name: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    phone: Optional[str] = None
    role: str
    hospital_id: Optional[str] = None

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class HospitalCreate(BaseModel):
    name: str
    tagline: Optional[str] = None
    description: Optional[str] = None
    address: str
    city: str
    phone: str
    email: Optional[str] = None
    image_url: Optional[str] = None
    banner_url: Optional[str] = None
    emergency_phone: Optional[str] = None
    established_year: Optional[int] = 2010
    facilities: Optional[str] = "Emergency 24/7, ICU, Pharmacy, Diagnostics, Radiology, Surgery"

class HospitalUpdate(BaseModel):
    name: Optional[str] = None
    tagline: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    image_url: Optional[str] = None
    banner_url: Optional[str] = None
    emergency_phone: Optional[str] = None
    established_year: Optional[int] = None
    facilities: Optional[str] = None

class DepartmentCreate(BaseModel):
    name: str
    description: Optional[str] = None
    icon: Optional[str] = "Activity"

class DepartmentResponse(BaseModel):
    id: str
    hospital_id: str
    name: str
    description: Optional[str] = None
    icon: Optional[str] = "Activity"

    class Config:
        from_attributes = True

class DoctorCreate(BaseModel):
    department_id: Optional[str] = None
    name: str
    title: Optional[str] = "Dr."
    specialization: str
    qualification: str
    experience_years: int = 5
    fee: float = 50.0
    image_url: Optional[str] = None
    available_days: str = "Mon,Tue,Wed,Thu,Fri"
    working_hours: str = "09:00 AM - 05:00 PM"

class DoctorResponse(BaseModel):
    id: str
    hospital_id: str
    department_id: Optional[str] = None
    department_name: Optional[str] = None
    name: str
    title: str
    specialization: str
    qualification: str
    experience_years: int
    fee: float
    image_url: Optional[str] = None
    available_days: str
    working_hours: str

    class Config:
        from_attributes = True

class HospitalResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    name: str
    tagline: Optional[str] = None
    description: Optional[str] = None
    address: str
    city: str
    phone: str
    email: Optional[str] = None
    image_url: Optional[str] = None
    banner_url: Optional[str] = None
    rating: float
    emergency_phone: Optional[str] = None
    established_year: Optional[int] = None
    facilities: Optional[str] = None
    departments: List[DepartmentResponse] = []
    doctors: List[DoctorResponse] = []

    class Config:
        from_attributes = True

class AppointmentCreate(BaseModel):
    hospital_id: str
    doctor_id: str
    department_id: Optional[str] = None
    appointment_date: str # YYYY-MM-DD
    time_slot: str
    patient_name: str
    patient_phone: str
    patient_gender: Optional[str] = "Other"
    patient_age: Optional[int] = 30
    symptoms_notes: Optional[str] = None

class AppointmentStatusUpdate(BaseModel):
    status: str # 'pending', 'confirmed', 'completed', 'cancelled'

class AppointmentResponse(BaseModel):
    id: str
    patient_id: str
    hospital_id: str
    hospital_name: Optional[str] = None
    doctor_id: str
    doctor_name: Optional[str] = None
    doctor_title: Optional[str] = None
    doctor_specialization: Optional[str] = None
    department_id: Optional[str] = None
    department_name: Optional[str] = None
    appointment_date: str
    time_slot: str
    status: str
    patient_name: str
    patient_phone: str
    patient_gender: Optional[str] = None
    patient_age: Optional[int] = None
    symptoms_notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True