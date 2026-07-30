import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Clock, User, Phone, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const BookingModal = ({ hospital, doctor, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getTomorrowDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const [date, setDate] = useState(getTomorrowDate());
  const [selectedSlot, setSelectedSlot] = useState('');
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [patientName, setPatientName] = useState(user ? user.full_name : '');
  const [patientPhone, setPatientPhone] = useState(user ? (user.phone || '') : '');
  const [gender, setGender] = useState('Male');
  const [age, setAge] = useState(30);
  const [symptoms, setSymptoms] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!doctor) return;
    const fetchSlots = async () => {
      setLoadingSlots(true);
      setError('');
      try {
        const res = await axios.get(`/api/doctors/${doctor.id}/slots?date=${date}`);
        setSlots(res.data.slots || []);
        // Pick first available slot by default
        const available = (res.data.slots || []).find(s => s.available);
        if (available) setSelectedSlot(available.time);
        else setSelectedSlot('');
      } catch (err) {
        console.error('Failed to load slots', err);
        setError('Could not fetch available slots for selected date.');
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [doctor, date]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/auth?mode=login');
      return;
    }
    if (user.role === 'hospital') {
      setError('Hospital accounts cannot book appointments. Please log in as a Patient.');
      return;
    }
    if (!selectedSlot) {
      setError('Please select an available time slot.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await axios.post('/api/appointments', {
        hospital_id: hospital.id,
        doctor_id: doctor.id,
        department_id: doctor.department_id,
        appointment_date: date,
        time_slot: selectedSlot,
        patient_name: patientName,
        patient_phone: patientPhone,
        patient_gender: gender,
        patient_age: parseInt(age, 10),
        symptoms_notes: symptoms
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to book appointment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="modal-overlay">
        <div className="modal-content" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            background: 'rgba(16,185,129,0.15)',
            color: 'var(--accent-emerald)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.5rem'
          }}>
            <CheckCircle size={40} />
          </div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '0.75rem' }}>Appointment Request Submitted!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Your appointment with <strong>{doctor.title} {doctor.name}</strong> at <strong>{hospital.name}</strong> on <strong>{date}</strong> at <strong>{selectedSlot}</strong> has been created.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => { onClose(); navigate('/patient-dashboard'); }}>
              View My Appointments
            </button>
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.4rem' }}>Book Consultation</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              {hospital.name} • {doctor.title} {doctor.name} ({doctor.specialization})
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        {error && (
          <div style={{
            padding: '0.8rem 1rem',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: '#f87171',
            fontSize: '0.9rem',
            marginBottom: '1.2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label><CalendarIcon size={14} style={{ display: 'inline', marginRight: '4px' }} /> Appointment Date</label>
              <input
                type="date"
                className="form-control"
                min={getTomorrowDate()}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Consultation Fee</label>
              <div className="form-control" style={{ fontWeight: 'bold', color: 'var(--accent-emerald)' }}>
                ${doctor.fee.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label><Clock size={14} style={{ display: 'inline', marginRight: '4px' }} /> Available Time Slots</label>
            {loadingSlots ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading doctor schedule...</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginTop: '0.3rem' }}>
                {slots.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={!s.available}
                    onClick={() => setSelectedSlot(s.time)}
                    style={{
                      padding: '0.5rem 0.25rem',
                      borderRadius: 'var(--radius-sm)',
                      border: selectedSlot === s.time ? '1px solid var(--accent-cyan)' : '1px solid var(--border-glass)',
                      background: selectedSlot === s.time ? 'rgba(6, 182, 212, 0.2)' : (s.available ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.3)'),
                      color: selectedSlot === s.time ? 'var(--accent-cyan)' : (s.available ? '#fff' : 'var(--text-muted)'),
                      fontSize: '0.82rem',
                      fontWeight: selectedSlot === s.time ? 'bold' : 'normal',
                      cursor: s.available ? 'pointer' : 'not-allowed',
                      opacity: s.available ? 1 : 0.4
                    }}
                  >
                    {s.time}
                  </button>
                ))}
              </div>
            )}
          </div>

          <hr style={{ borderColor: 'var(--border-glass)', margin: '1.2rem 0' }} />

          <h4 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--accent-cyan)' }}>Patient Details</h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label><User size={14} style={{ display: 'inline', marginRight: '4px' }} /> Full Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Patient Name"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label><Phone size={14} style={{ display: 'inline', marginRight: '4px' }} /> Phone Number</label>
              <input
                type="text"
                className="form-control"
                placeholder="+1 (555) 000-0000"
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Gender</label>
              <select className="form-control" value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Age</label>
              <input
                type="number"
                className="form-control"
                min="1"
                max="120"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label><FileText size={14} style={{ display: 'inline', marginRight: '4px' }} /> Reason for Visit / Symptoms</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="Describe symptoms, medical history, or consultation goals..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
            ></textarea>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting || !selectedSlot}>
              {submitting ? 'Confirming...' : 'Confirm Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
