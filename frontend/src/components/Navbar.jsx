import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Building2, Calendar, User, LogOut, HeartPulse, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="brand-logo">
        <div className="brand-icon-box">
          <HeartPulse size={22} color="#fff" />
        </div>
        <span>MediCare<span style={{ color: 'var(--accent-cyan)' }}>Hub</span></span>
      </Link>

      <ul className="nav-links">
        <li>
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            Home
          </Link>
        </li>
        <li>
          <Link to="/hospitals" className={`nav-link ${location.pathname.startsWith('/hospitals') ? 'active' : ''}`}>
            Find Hospitals
          </Link>
        </li>

        {user && user.role === 'patient' && (
          <li>
            <Link to="/patient-dashboard" className={`nav-link ${location.pathname === '/patient-dashboard' ? 'active' : ''}`}>
              <Calendar size={16} style={{ display: 'inline', marginRight: '4px' }} />
              My Appointments
            </Link>
          </li>
        )}

        {user && user.role === 'hospital' && (
          <li>
            <Link to="/hospital-dashboard" className={`nav-link ${location.pathname === '/hospital-dashboard' ? 'active' : ''}`}>
              <Building2 size={16} style={{ display: 'inline', marginRight: '4px' }} />
              Hospital Portal
            </Link>
          </li>
        )}
      </ul>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span className={`badge ${user.role === 'hospital' ? 'badge-hospital' : 'badge-patient'}`}>
              <ShieldCheck size={13} /> {user.role === 'hospital' ? 'Hospital Admin' : 'Patient'}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-cyan)',
                fontWeight: 'bold'
              }}>
                {user.full_name ? user.full_name[0].toUpperCase() : 'U'}
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#e2e8f0' }}>
                {user.full_name}
              </span>
            </div>
            <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}>
              <LogOut size={15} /> Logout
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/auth?mode=login" className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
              Sign In
            </Link>
            <Link to="/auth?mode=register" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};
