import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Star, PhoneCall, Award, Calendar, Clock, DollarSign, Stethoscope, CheckCircle2, Building2 } from 'lucide-react';
import axios from 'axios';
import { BookingModal } from '../components/BookingModal';

export const HospitalDetail = () => {
  const { id } = useParams();
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState('All');

  const [bookingDoctor, setBookingDoctor] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await axios.get(`/api/hospitals/${id}`);
        setHospital(res.data);
      } catch (err) {
        console.error('Failed to load hospital details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
        Loading hospital profile...
      </div>
    );
  }

  if (!hospital) {
    return (
      <div style={{ maxWidth: '800px', margin: '4rem auto', textAlign: 'center' }} className="glass-card">
        <h2>Hospital Profile Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '1rem 0 1.5rem 0' }}>The requested medical center profile does not exist or has been removed.</p>
        <Link to="/hospitals" className="btn btn-primary">Back to Hospitals</Link>
      </div>
    );
  }

  const filteredDoctors = selectedDepartment === 'All'
    ? hospital.doctors
    : hospital.doctors.filter(d => d.department_id === selectedDepartment || d.department_name === selectedDepartment);

  const facilitiesList = hospital.facilities
    ? hospital.facilities.split(',').map(f => f.trim())
    : ['24/7 Emergency Care', 'ICU', 'Pharmacy', 'Radiology & Imaging'];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '2rem 2rem 4rem 2rem' }}>
      
      {/* Banner & Hero Header */}
      <div className="glass-card" style={{ padding: '0', overflow: 'hidden', marginBottom: '2.5rem' }}>
        <div style={{ position: 'relative', height: '240px' }}>
          <img
            src={hospital.banner_url || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80"}
            alt={hospital.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(11,15,25,0.95), transparent)' }} />
        </div>

        <div style={{ padding: '2rem', marginTop: '-60px', position: 'relative', display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '2rem', alignItems: 'flex-start' }}>
          <img
            src={hospital.image_url || "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=800&q=80"}
            alt={hospital.name}
            style={{
              width: '120px',
              height: '120px',
              objectFit: 'cover',
              borderRadius: 'var(--radius-lg)',
              border: '3px solid var(--bg-main)',
              boxShadow: 'var(--shadow-card)'
            }}
          />

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
              <h1 style={{ fontSize: '2.2rem' }}>{hospital.name}</h1>
              <span className="badge badge-confirmed">
                <Star size={14} fill="#fbbf24" style={{ color: '#fbbf24' }} /> {hospital.rating} Rating
              </span>
            </div>

            <p style={{ color: 'var(--accent-cyan)', fontWeight: 600, fontSize: '1rem', marginBottom: '0.8rem' }}>
              {hospital.tagline || 'Leading Healthcare Institution'}
            </p>

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={16} color="var(--accent-cyan)" /> {hospital.address}, {hospital.city}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Phone size={16} color="var(--accent-teal)" /> {hospital.phone}
              </span>
              {hospital.email && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Mail size={16} color="var(--accent-indigo)" /> {hospital.email}
                </span>
              )}
            </div>
          </div>

          {hospital.emergency_phone && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem 1.25rem',
              textAlign: 'center',
              color: '#f87171'
            }}>
              <p style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 'bold' }}>24/7 Emergency Hotline</p>
              <p style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <PhoneCall size={20} /> {hospital.emergency_phone}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Description & Facilities */}
      <div className="grid-3" style={{ gridTemplateColumns: '2fr 1fr', marginBottom: '3rem' }}>
        <div className="glass-card">
          <h3 style={{ fontSize: '1.3rem', marginBottom: '0.8rem', color: 'var(--accent-cyan)' }}>About {hospital.name}</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '0.95rem' }}>
            {hospital.description}
          </p>
        </div>

        <div className="glass-card">
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Key Facilities</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {facilitiesList.map((fac, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                <CheckCircle2 size={16} color="var(--accent-emerald)" />
                <span>{fac}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Clinical Departments & Doctors Browser */}
      <div>
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '0.3rem' }}>Specialist Doctors & Faculty</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Select a department or browse all verified consultants</p>
          </div>
        </div>

        {/* Department Tabs */}
        <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '2rem' }}>
          <button
            className={`btn ${selectedDepartment === 'All' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedDepartment('All')}
          >
            All Departments ({hospital.doctors.length})
          </button>
          {hospital.departments.map((dept) => (
            <button
              key={dept.id}
              className={`btn ${selectedDepartment === dept.id ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSelectedDepartment(dept.id)}
            >
              {dept.name}
            </button>
          ))}
        </div>

        {/* Doctors Grid */}
        {filteredDoctors.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
            <Stethoscope size={40} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
            <h3>No Doctors Found</h3>
            <p style={{ color: 'var(--text-secondary)' }}>No doctors currently listed under this department.</p>
          </div>
        ) : (
          <div className="grid-3">
            {filteredDoctors.map((doc) => (
              <div key={doc.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <img
                      src={doc.image_url || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80"}
                      alt={doc.name}
                      style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                    />
                    <div>
                      <span className="badge badge-patient" style={{ marginBottom: '0.3rem' }}>
                        {doc.department_name || 'Specialist'}
                      </span>
                      <h3 style={{ fontSize: '1.2rem' }}>{doc.title} {doc.name}</h3>
                      <p style={{ color: 'var(--accent-cyan)', fontSize: '0.85rem', fontWeight: 600 }}>{doc.specialization}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.2rem' }}>
                    <div><strong>Qualification:</strong> {doc.qualification}</div>
                    <div><strong>Experience:</strong> {doc.experience_years} Years</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Clock size={14} color="var(--accent-teal)" />
                      <span>{doc.available_days} ({doc.working_hours})</span>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Consultation Fee</span>
                    <p style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>${doc.fee.toFixed(2)}</p>
                  </div>
                  <button className="btn btn-emerald" onClick={() => setBookingDoctor(doc)}>
                    <Calendar size={16} /> Book Appointment
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal Trigger */}
      {bookingDoctor && (
        <BookingModal
          hospital={hospital}
          doctor={bookingDoctor}
          onClose={() => setBookingDoctor(null)}
        />
      )}

    </div>
  );
};
