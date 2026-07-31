import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { HeartPulse, Mail, Lock, User, Phone, Building2, MapPin, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  const initialRole = searchParams.get('role') === 'hospital' ? 'hospital' : 'patient';

  const [mode, setMode] = useState(initialMode);
  const [role, setRole] = useState(initialRole);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  // Hospital fields
  const [hospitalName, setHospitalName] = useState('');
  const [city, setCity] = useState('New York');
  const [address, setAddress] = useState('');

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (mode === 'login') {
        const cleanEmail = email.trim().toLowerCase();
        const user = await login(cleanEmail, password);
        if (user.role === 'hospital') {
          navigate('/hospital-dashboard');
        } else {
          navigate('/patient-dashboard');
        }
      } else {
        const cleanEmail = email.trim().toLowerCase();
        const payload = {
          email: cleanEmail,
          password,
          full_name: fullName.trim(),
          phone: phone ? phone.trim() : undefined,
          role,
          hospital_name: role === 'hospital' ? (hospitalName || fullName).trim() : undefined,
          city: role === 'hospital' ? (city || 'New York').trim() : undefined,
          address: role === 'hospital' ? (address || '123 Care Street').trim() : undefined
        };
        const user = await register(payload);
        if (user.role === 'hospital') {
          navigate('/hospital-dashboard');
        } else {
          navigate('/patient-dashboard');
        }
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '480px', margin: '4rem auto', width: '100%', padding: '0 1.5rem 4rem 1.5rem' }}>
      
      <div className="glass-card" style={{ padding: '2.5rem' }}>
        
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="brand-icon-box" style={{ margin: '0 auto 1rem auto', width: '50px', height: '50px' }}>
            <HeartPulse size={26} color="#fff" />
          </div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {mode === 'login' ? 'Sign in to access appointments and profiles' : 'Join MediCare Hub healthcare network'}
          </p>
        </div>

        {/* Auth Mode Toggle */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', padding: '0.3rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            style={{
              padding: '0.6rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: mode === 'login' ? 'var(--accent-cyan)' : 'transparent',
              color: mode === 'login' ? '#fff' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); }}
            style={{
              padding: '0.6rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: mode === 'register' ? 'var(--accent-cyan)' : 'transparent',
              color: mode === 'register' ? '#fff' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            Register
          </button>
        </div>

        {/* Role Toggle for Register Mode */}
        {mode === 'register' && (
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>
              Account Type:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setRole('patient')}
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: role === 'patient' ? '1px solid var(--accent-cyan)' : '1px solid var(--border-glass)',
                  background: role === 'patient' ? 'rgba(6,182,212,0.15)' : 'rgba(255,255,255,0.03)',
                  color: role === 'patient' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                <User size={16} /> Patient
              </button>

              <button
                type="button"
                onClick={() => setRole('hospital')}
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: role === 'hospital' ? '1px solid var(--accent-indigo)' : '1px solid var(--border-glass)',
                  background: role === 'hospital' ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)',
                  color: role === 'hospital' ? 'var(--accent-indigo)' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                <Building2 size={16} /> Hospital Admin
              </button>
            </div>
          </div>
        )}

        {error && (
          <div style={{
            padding: '0.8rem 1rem',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: '#f87171',
            fontSize: '0.88rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="form-group">
              <label>Full Name / Contact Person</label>
              <input
                type="text"
                className="form-control"
                placeholder="Alex Morgan"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="text"
                className="form-control"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          )}

          {/* Hospital-specific registration fields */}
          {mode === 'register' && role === 'hospital' && (
            <>
              <hr style={{ borderColor: 'var(--border-glass)', margin: '1.2rem 0' }} />
              <h4 style={{ fontSize: '0.95rem', color: 'var(--accent-indigo)', marginBottom: '1rem' }}>Hospital Profile Details</h4>

              <div className="form-group">
                <label>Hospital Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Apex Health Institute"
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="New York"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="123 Care Street"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </div>
              </div>
            </>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={submitting}>
            {submitting ? 'Authenticating...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '1.5rem' }}>
          {mode === 'login' ? "Don't have an account yet?" : "Already have an account?"}{' '}
          <button
            type="button"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {mode === 'login' ? 'Register Now' : 'Sign In'}
          </button>
        </p>

      </div>
    </div>
  );
};
