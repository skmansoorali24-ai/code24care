import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, Stethoscope, AlertCircle, XCircle, CheckCircle, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export const PatientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [cancellingId, setCancellingId] = useState(null);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/appointments/patient');
      setAppointments(res.data || []);
    } catch (err) {
      console.error('Failed to load appointments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/auth?mode=login');
      return;
    }
    fetchAppointments();
  }, [user]);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    setCancellingId(id);
    try {
      await axios.patch(`/api/appointments/${id}/cancel`);
      fetchAppointments();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to cancel appointment');
    } finally {
      setCancellingId(null);
    }
  };

  const filtered = appointments.filter(a => {
    if (filterStatus === 'all') return true;
    return a.status === filterStatus;
  });

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '2.5rem 2rem 4rem 2rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.4rem' }}>Patient Appointment Portal</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Welcome back, <strong>{user?.full_name}</strong>. Track your medical consultations and bookings.
          </p>
        </div>
        <button onClick={fetchAppointments} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RefreshCw size={16} /> Refresh Schedule
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(st => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`btn ${filterStatus === st ? 'btn-primary' : 'btn-secondary'}`}
            style={{ textTransform: 'capitalize', fontSize: '0.88rem', padding: '0.5rem 1rem' }}
          >
            {st} ({appointments.filter(a => st === 'all' ? true : a.status === st).length})
          </button>
        ))}
      </div>

      {/* Appointments List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          Loading your appointment history...
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Calendar size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>No Appointments Found</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>You don't have any appointments matching the selected status filter.</p>
          <Link to="/hospitals" className="btn btn-emerald">
            Book a New Appointment
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filtered.map((apt) => (
            <div key={apt.id} className="glass-card" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1.5rem', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.6rem' }}>
                  <span className={`badge badge-${apt.status}`}>
                    {apt.status}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Calendar size={14} color="var(--accent-cyan)" /> {apt.appointment_date}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Clock size={14} color="var(--accent-teal)" /> {apt.time_slot}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.3rem', marginBottom: '0.3rem' }}>
                  {apt.doctor_name} <span style={{ fontSize: '0.9rem', color: 'var(--accent-cyan)', fontWeight: 'normal' }}>({apt.doctor_specialization})</span>
                </h3>

                <p style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.8rem' }}>
                  🏥 {apt.hospital_name}
                </p>

                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <span>Patient: <strong>{apt.patient_name}</strong> ({apt.patient_gender}, {apt.patient_age} yrs)</span>
                  <span>Contact: <strong>{apt.patient_phone}</strong></span>
                </div>

                {apt.symptoms_notes && (
                  <p style={{ marginTop: '0.8rem', padding: '0.6rem 0.8rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <strong>Notes:</strong> {apt.symptoms_notes}
                  </p>
                )}
              </div>

              <div>
                {(apt.status === 'pending' || apt.status === 'confirmed') && (
                  <button
                    onClick={() => handleCancel(apt.id)}
                    className="btn btn-danger"
                    disabled={cancellingId === apt.id}
                    style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}
                  >
                    <XCircle size={16} /> {cancellingId === apt.id ? 'Cancelling...' : 'Cancel Booking'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
