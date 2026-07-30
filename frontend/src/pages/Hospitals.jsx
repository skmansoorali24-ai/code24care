import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, MapPin, Star, Building2, PhoneCall, Filter, Stethoscope, ChevronRight } from 'lucide-react';
import axios from 'axios';

export const Hospitals = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialCity = searchParams.get('city') || 'All';
  const initialSpecialty = searchParams.get('specialty') || 'All';

  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [city, setCity] = useState(initialCity);
  const [specialty, setSpecialty] = useState(initialSpecialty);

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/hospitals?search=${encodeURIComponent(search)}&city=${encodeURIComponent(city)}&specialty=${encodeURIComponent(specialty)}`);
      setHospitals(res.data || []);
    } catch (err) {
      console.error('Failed to fetch hospitals', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, [city, specialty]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHospitals();
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '2.5rem 2rem 4rem 2rem' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Find Partner Hospitals</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Browse accredited medical centers, view specialist rosters, and book appointments online.</p>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card" style={{ marginBottom: '2.5rem', padding: '1.25rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search by hospital name or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.8rem' }}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <MapPin size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', zIndex: 2 }} />
            <select className="form-control" value={city} onChange={(e) => setCity(e.target.value)} style={{ paddingLeft: '2.8rem' }}>
              <option value="All">All Cities</option>
              <option value="New York">New York</option>
              <option value="San Francisco">San Francisco</option>
            </select>
          </div>

          <div style={{ position: 'relative' }}>
            <Stethoscope size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', zIndex: 2 }} />
            <select className="form-control" value={specialty} onChange={(e) => setSpecialty(e.target.value)} style={{ paddingLeft: '2.8rem' }}>
              <option value="All">All Specialties</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Neurology">Neurology</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Orthopedics">Orthopedics</option>
              <option value="Obstetrics">Obstetrics</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>
      </div>

      {/* Hospital Results List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          Loading hospital directory...
        </div>
      ) : hospitals.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Building2 size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>No Hospitals Found</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Try modifying your search criteria or resetting filters.</p>
          <button className="btn btn-secondary" onClick={() => { setSearch(''); setCity('All'); setSpecialty('All'); }}>
            Reset Filters
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {hospitals.map((h) => (
            <div key={h.id} className="glass-card" style={{ display: 'grid', gridTemplateColumns: '260px 1fr auto', gap: '1.5rem', alignItems: 'center' }}>
              <img
                src={h.image_url || "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=800&q=80"}
                alt={h.name}
                style={{ width: '100%', height: '170px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
              />

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.3rem' }}>
                  <h2 style={{ fontSize: '1.4rem' }}>{h.name}</h2>
                  <span style={{ color: '#fbbf24', fontSize: '0.9rem', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                    <Star size={15} fill="#fbbf24" /> {h.rating}
                  </span>
                </div>

                <p style={{ color: 'var(--accent-cyan)', fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  {h.tagline || 'Leading Healthcare Center'}
                </p>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {h.description}
                </p>

                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <MapPin size={14} color="var(--accent-cyan)" /> {h.address}, {h.city}
                  </span>
                  {h.emergency_phone && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#f87171' }}>
                      <PhoneCall size={14} /> Emergency: {h.emergency_phone}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-end', borderLeft: '1px solid var(--border-glass)', paddingLeft: '1.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <strong>{h.doctors ? h.doctors.length : 0}</strong> Doctors Available
                </span>
                <Link to={`/hospitals/${h.id}`} className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
                  View Profile & Book <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
