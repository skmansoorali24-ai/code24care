import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Stethoscope, Building2, Calendar, Shield, Award, ArrowRight, Star, Heart, Users, Activity } from 'lucide-react';
import axios from 'axios';

export const Home = () => {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const res = await axios.get('/api/hospitals');
        setHospitals(res.data || []);
      } catch (err) {
        console.error('Failed to load home hospitals', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHospitals();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/hospitals?search=${encodeURIComponent(searchQuery)}&city=${encodeURIComponent(selectedCity)}`);
  };

  const specialties = [
    { name: 'Cardiology', icon: Heart, desc: 'Heart Care & Vascular Diagnostics', count: '14+ Specialists' },
    { name: 'Neurology', icon: Activity, desc: 'Brain & Spine Therapy', count: '10+ Specialists' },
    { name: 'Pediatrics', icon: Users, desc: 'Child & Infant Healthcare', count: '18+ Specialists' },
    { name: 'Orthopedics', icon: Stethoscope, desc: 'Joint & Bone Surgery', count: '12+ Specialists' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem', paddingBottom: '4rem' }}>
      
      {/* HERO SECTION */}
      <section style={{
        position: 'relative',
        padding: '5rem 2rem 4rem 2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gap: '3rem',
        alignItems: 'center'
      }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1rem',
            borderRadius: '50px',
            background: 'rgba(6,182,212,0.1)',
            border: '1px solid rgba(6,182,212,0.3)',
            color: 'var(--accent-cyan)',
            fontSize: '0.88rem',
            fontWeight: 600,
            marginBottom: '1.5rem'
          }}>
            <span className="pulse-dot"></span> Next-Gen Healthcare Platform
          </div>

          <h1 style={{ fontSize: '3.2rem', lineHeight: '1.15', marginBottom: '1.2rem' }}>
            Book Top-Rated <br />
            <span style={{
              background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-indigo))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Hospitals & Doctors</span> Instantly
          </h1>

          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '2.5rem', maxWidth: '540px' }}>
            Discover trusted hospitals near you, explore specialist qualifications, compare fees, and reserve your time slot in seconds.
          </p>

          {/* Search Box Component */}
          <form onSubmit={handleSearch} style={{
            background: 'rgba(18, 24, 38, 0.9)',
            border: '1px solid var(--border-accent)',
            borderRadius: 'var(--radius-xl)',
            padding: '0.6rem',
            display: 'flex',
            gap: '0.5rem',
            boxShadow: 'var(--shadow-glow), 0 20px 40px rgba(0,0,0,0.5)',
            marginBottom: '2rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, padding: '0 0.8rem' }}>
              <Search size={20} color="var(--accent-cyan)" />
              <input
                type="text"
                placeholder="Search hospital name, specialty, or doctor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  outline: 'none',
                  fontSize: '0.95rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderLeft: '1px solid var(--border-glass)', padding: '0 0.8rem' }}>
              <MapPin size={18} color="var(--text-muted)" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  outline: 'none',
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                <option value="All" style={{ background: '#0f172a' }}>All Cities</option>
                <option value="New York" style={{ background: '#0f172a' }}>New York</option>
                <option value="San Francisco" style={{ background: '#0f172a' }}>San Francisco</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary">
              Find Doctors
            </button>
          </form>

          {/* Quick Metrics */}
          <div style={{ display: 'flex', gap: '2.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.8rem', color: 'var(--accent-cyan)' }}>150+</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Partner Hospitals</p>
            </div>
            <div>
              <h3 style={{ fontSize: '1.8rem', color: 'var(--accent-teal)' }}>1,200+</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Verified Specialists</p>
            </div>
            <div>
              <h3 style={{ fontSize: '1.8rem', color: 'var(--accent-indigo)' }}>99.4%</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Patient Satisfaction</p>
            </div>
          </div>
        </div>

        {/* Hero Visual Card Stack */}
        <div style={{ position: 'relative' }}>
          <div className="glass-card" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--border-accent)' }}>
            <img
              src="https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=800&q=80"
              alt="Modern Medical Hospital"
              style={{ width: '100%', height: '340px', objectFit: 'cover' }}
            />
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span className="badge badge-confirmed">Top Recommended</span>
                <span style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.9rem' }}>
                  <Star size={16} fill="#fbbf24" /> 4.9 (420 reviews)
                </span>
              </div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.4rem' }}>MetroCare Health City</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>New York • 24/7 Robotic Surgery & Trauma Suite</p>
            </div>
          </div>

          <div style={{
            position: 'absolute',
            bottom: '-25px',
            left: '-25px',
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid var(--accent-cyan)',
            backdropFilter: 'blur(12px)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            boxShadow: '0 15px 35px rgba(0,0,0,0.6)'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent-emerald), var(--accent-teal))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Calendar size={22} color="#fff" />
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Next Slot Available</p>
              <p style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#fff' }}>Today at 02:30 PM</p>
            </div>
          </div>
        </div>
      </section>

      {/* SPECIALTIES GRID */}
      <section id="specialties" style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '0 2rem' }}>
        <div style={{ textCenter: 'center', marginBottom: '2.5rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Browse by Medical Specialty</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Connect directly with dedicated clinical departments</p>
        </div>

        <div className="grid-4">
          {specialties.map((sp, idx) => {
            const IconComponent = sp.icon;
            return (
              <div key={idx} className="glass-card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/hospitals?specialty=${encodeURIComponent(sp.name)}`)}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(6,182,212,0.1)',
                  color: 'var(--accent-cyan)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem'
                }}>
                  <IconComponent size={26} />
                </div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.3rem' }}>{sp.name}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '0.8rem' }}>{sp.desc}</p>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-teal)', fontWeight: 600 }}>{sp.count} →</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* FEATURED HOSPITALS */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '0 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '2.2rem', marginBottom: '0.4rem' }}>Featured Medical Centers</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Top rated hospital profiles accepting online bookings</p>
          </div>
          <Link to="/hospitals" className="btn btn-secondary">
            View All Hospitals <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading hospitals...</p>
        ) : (
          <div className="grid-3">
            {hospitals.slice(0, 3).map((h) => (
              <div key={h.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <img
                  src={h.image_url || "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=800&q=80"}
                  alt={h.name}
                  style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <MapPin size={14} color="var(--accent-cyan)" /> {h.city}
                  </span>
                  <span style={{ color: '#fbbf24', fontSize: '0.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <Star size={14} fill="#fbbf24" /> {h.rating}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.4rem' }}>{h.name}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.2rem', flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {h.description}
                </p>

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
                  {(h.departments || []).slice(0, 3).map((d, i) => (
                    <span key={i} style={{ padding: '0.2rem 0.6rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {d.name}
                    </span>
                  ))}
                </div>

                <Link to={`/hospitals/${h.id}`} className="btn btn-primary" style={{ width: '100%' }}>
                  View Profile & Book
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* HOSPITAL PARTNER BANNER */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '0 2rem' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(6, 182, 212, 0.15))',
          border: '1px solid var(--border-accent)',
          borderRadius: 'var(--radius-xl)',
          padding: '3rem 2.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '2rem'
        }}>
          <div>
            <span className="badge badge-hospital" style={{ marginBottom: '0.75rem' }}>Hospital Administrators</span>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Are You a Healthcare Provider?</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '600px' }}>
              Register your hospital profile, manage clinical departments, add specialist doctors, and receive real-time appointment requests seamlessly.
            </p>
          </div>
          <Link to="/auth?role=hospital&mode=register" className="btn btn-emerald" style={{ padding: '0.9rem 1.8rem' }}>
            <Building2 size={18} /> Add Your Hospital Profile
          </Link>
        </div>
      </section>

    </div>
  );
};
