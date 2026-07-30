# 🏥 MediCare Hub - End-to-End Deployable Hospital Appointment Application

A full-stack, production-ready Healthcare Platform where Hospitals can register, maintain their profiles, add clinical departments, manage specialist doctors, and process patient appointments in real-time. Patients can search hospitals by city or specialty, check doctor fees & slot availability, book consultations, and track booking statuses.

---

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, React Router 6, Lucide Icons, Axios, Modern Glassmorphism CSS Design System
- **Backend**: FastAPI (Python 3.10+), Pydantic v2, SQLAlchemy ORM, JWT Authentication, CORS Middleware
- **Database & Auth**: Supabase PostgreSQL Database, Email & Password Authentication (with SQLite zero-config local fallback support)
- **Deployment**: Docker & Docker Compose

---

## ⚡ Key Features

### 🏢 Hospital Partner Portal
1. **Hospital Registration & Authentication**: Secure sign-up/sign-in using Email & Password.
2. **Profile Manager**: Custom hospital name, tagline, description, address, city, phone, emergency hotline, banner & image URLs, and facility badges.
3. **Department Management**: Create clinical departments (e.g. Cardiology, Neurology, Pediatrics, Orthopedics).
4. **Doctor Roster**: Add/remove specialist doctors with titles, qualifications, experience years, consultation fees, working hours, and doctor photos.
5. **Real-time Appointment Dashboard**: View incoming patient requests, filter by status, and confirm/complete/reject appointments.
6. **Analytics Stats**: Total appointments, pending reviews, active doctors, and estimated revenue.

### 👤 Patient Booking Portal
1. **Hospital Discovery**: Interactive search bar, city filtering (New York, San Francisco, etc.), specialty category chips.
2. **Detailed Hospital Profile**: Explore facilities, emergency helpline, department tabs, doctor schedules, and consultation fees.
3. **Interactive Slot Booking**: Real-time available slot picker, patient age/gender, and reason for visit/symptoms notes.
4. **Patient Dashboard**: Track upcoming & past appointments, real-time status badges (`Pending`, `Confirmed`, `Completed`, `Cancelled`), and 1-click appointment cancellation.

---

## 🚀 Quick Start Guide

### 1. Database Setup (Supabase)
1. Go to your [Supabase Dashboard](https://supabase.com) and create a new project.
2. Open the **SQL Editor** tab.
3. Copy the contents of [`supabase_schema.sql`](file:///c:/Users/sumay/OneDrive/Desktop/health/supabase_schema.sql) and click **Run**.
4. Retrieve your `SUPABASE_URL` and `SUPABASE_KEY` (or direct PostgreSQL Connection String) from Project Settings -> API.

---

### 2. Backend Setup (FastAPI)

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (optional but recommended)
python -m venv venv
# On Windows: venv\Scripts\activate
# On Mac/Linux: source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Seed initial database with sample hospitals, doctors, and appointments
python seed.py

# Start FastAPI server
uvicorn main:app --reload --port 8000
```
- API Documentation is available at: `http://localhost:8000/docs`

---

### 3. Frontend Setup (React + Vite)

```bash
# Navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start Vite React development server
npm run dev
```
- Open browser at: `http://localhost:3000`

---

### 4. Docker One-Command Deployment

You can launch both the frontend and backend using Docker Compose:

```bash
docker-compose up --build
```
- Frontend will run on: `http://localhost:3000`
- Backend API will run on: `http://localhost:8000`

---

## 🔐 Default Demo Accounts

You can log in directly using the seeded demo accounts:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Patient** | `patient@example.com` | `password123` | Pre-booked appointment with Dr. Sarah Jenkins |
| **Hospital Admin** | `hospital@metrocare.com` | `hospital123` | Admin for MetroCare Health City |
| **Hospital Admin** | `info@stjude-health.org` | `hospital123` | Admin for St. Jude Children's Hospital |
