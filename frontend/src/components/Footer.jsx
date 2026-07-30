import React from 'react';
import { HeartPulse, PhoneCall, ShieldCheck, Mail, MapPin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer style={{
      background: '#070a11',
      borderTop: '1px solid var(--border-glass)',
      padding: '3rem 2rem 1.5rem 2rem',
      marginTop: 'auto'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '2.5rem',
        marginBottom: '2rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div className="brand-icon-box">
              <HeartPulse size={20} color="#fff" />
            </div>
            <h3 style={{ fontSize: '1.3rem' }}>MediCare<span style={{ color: 'var(--accent-cyan)' }}>Hub</span></h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
            Connecting patients with premier hospitals, verified specialist doctors, and seamless 24/7 appointment scheduling.
          </p>
        </div>

        <div>
          <h4 style={{ marginBottom: '1rem', color: '#fff', fontSize: '1rem' }}>Quick Links</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <li><a href="/hospitals" style={{ color: 'inherit', textDecoration: 'none' }}>Search Hospitals</a></li>
            <li><a href="/auth?role=hospital" style={{ color: 'inherit', textDecoration: 'none' }}>Hospital Partner Portal</a></li>
            <li><a href="/patient-dashboard" style={{ color: 'inherit', textDecoration: 'none' }}>Patient Appointments</a></li>
            <li><a href="/#specialties" style={{ color: 'inherit', textDecoration: 'none' }}>Medical Specialties</a></li>
          </ul>
        </div>

        <div>
          <h4 style={{ marginBottom: '1rem', color: '#fff', fontSize: '1rem' }}>Emergency Services</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f87171' }}>
              <PhoneCall size={16} />
              <span><strong>Hotline:</strong> 911 / 1-800-MED-CARE</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail size={16} />
              <span>support@medicarehub.com</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={16} />
              <span>Global Healthcare Network</span>
            </div>
          </div>
        </div>

        <div>
          <h4 style={{ marginBottom: '1rem', color: '#fff', fontSize: '1rem' }}>Security & Platform</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            Powered by Supabase PostgreSQL Database, FastAPI Backend, and End-to-End Encryption.
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', color: '#34d399', fontSize: '0.8rem' }}>
            <ShieldCheck size={14} /> HIPAA Compliant Data Security
          </div>
        </div>
      </div>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        paddingTop: '1.5rem',
        borderTop: '1px solid var(--border-glass)',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.85rem'
      }}>
        © {new Date().getFullYear()} MediCare Hub. All rights reserved. Full Deployable Hospital Appointment Product.
      </div>
    </footer>
  );
};
