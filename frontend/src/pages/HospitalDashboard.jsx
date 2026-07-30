import React, { useState, useEffect } from 'react';
import { Building2, Users, Calendar, DollarSign, Plus, Trash2, CheckCircle, XCircle, Clock, Edit3, Settings, ShieldCheck, Activity } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const HospitalDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('appointments'); // 'appointments', 'doctors', 'departments', 'profile'
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Doctor Form Modal / State
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [newDoc, setNewDoc] = useState({
    name: '',
    title: 'Dr.',
    specialization: '',
    qualification: '',
    experience_years: 5,
    fee: 50.0,
    image_url: '',
    available_days: 'Mon,Tue,Wed,Thu,Fri',
    working_hours: '09:00 AM - 05:00 PM',
    department_id: ''
  });

  // Department Form
  const [showAddDepartment, setShowAddDepartment] = useState(false);
  const [newDept, setNewDept] = useState({ name: '', description: '', icon: 'Activity' });

  // Profile Edit State
  const [editProfile, setEditProfile] = useState({
    name: '', tagline: '', description: '', address: '', city: '', phone: '', emergency_phone: '', facilities: ''
  });

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [statsRes, profileRes, aptsRes] = await Promise.all([
        axios.get('/api/hospitals/my/stats'),
        axios.get('/api/hospitals/my/profile'),
        axios.get('/api/appointments/hospital')
      ]);
      setStats(statsRes.data);
      setProfile(profileRes.data);
      setAppointments(aptsRes.data || []);
      setEditProfile({
        name: profileRes.data.name || '',
        tagline: profileRes.data.tagline || '',
        description: profileRes.data.description || '',
        address: profileRes.data.address || '',
        city: profileRes.data.city || '',
        phone: profileRes.data.phone || '',
        emergency_phone: profileRes.data.emergency_phone || '',
        facilities: profileRes.data.facilities || ''
      });
    } catch (err) {
      console.error('Failed to load hospital dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/auth?mode=login');
      return;
    }
    if (user.role !== 'hospital') {
      navigate('/patient-dashboard');
      return;
    }
    loadAllData();
  }, [user]);

  const handleUpdateStatus = async (aptId, newStatus) => {
    try {
      await axios.patch(`/api/appointments/${aptId}/status`, { status: newStatus });
      loadAllData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update status');
    }
  };

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/hospitals/my/doctors', newDoc);
      setShowAddDoctor(false);
      setNewDoc({
        name: '', title: 'Dr.', specialization: '', qualification: '', experience_years: 5, fee: 50.0, image_url: '', available_days: 'Mon,Tue,Wed,Thu,Fri', working_hours: '09:00 AM - 05:00 PM', department_id: ''
      });
      loadAllData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to add doctor');
    }
  };

  const handleDeleteDoctor = async (docId) => {
    if (!window.confirm('Delete doctor profile?')) return;
    try {
      await axios.delete(`/api/doctors/${docId}`);
      loadAllData();
    } catch (err) {
      alert('Failed to delete doctor');
    }
  };

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/hospitals/my/departments', newDept);
      setShowAddDepartment(false);
      setNewDept({ name: '', description: '', icon: 'Activity' });
      loadAllData();
    } catch (err) {
      alert('Failed to add department');
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await axios.put('/api/hospitals/my/profile', editProfile);
      alert('Hospital profile updated successfully!');
      loadAllData();
    } catch (err) {
      alert('Failed to update profile');
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>Loading hospital dashboard...</div>;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '2.5rem 2rem 4rem 2rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <span className="badge badge-hospital" style={{ marginBottom: '0.5rem' }}>
            <ShieldCheck size={14} /> Hospital Administration Portal
          </span>
          <h1 style={{ fontSize: '2.2rem' }}>{profile?.name || 'Hospital Dashboard'}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{profile?.city} • {profile?.tagline}</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={loadAllData}>
            Refresh
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(6,182,212,0.15)', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calendar size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Appointments</p>
            <h3 style={{ fontSize: '1.6rem' }}>{stats?.total_appointments || 0}</h3>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245,158,11,0.15)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Pending Reviews</p>
            <h3 style={{ fontSize: '1.6rem', color: '#fbbf24' }}>{stats?.pending_appointments || 0}</h3>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16,185,129,0.15)', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Active Doctors</p>
            <h3 style={{ fontSize: '1.6rem' }}>{stats?.total_doctors || 0}</h3>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99,102,241,0.15)', color: 'var(--accent-indigo)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Est. Revenue</p>
            <h3 style={{ fontSize: '1.6rem', color: 'var(--accent-emerald)' }}>${(stats?.estimated_revenue || 0).toFixed(2)}</h3>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <button className={`btn ${activeTab === 'appointments' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('appointments')}>
          <Calendar size={16} /> Patient Appointments ({appointments.length})
        </button>
        <button className={`btn ${activeTab === 'doctors' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('doctors')}>
          <Users size={16} /> Manage Doctors ({profile?.doctors?.length || 0})
        </button>
        <button className={`btn ${activeTab === 'departments' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('departments')}>
          <Activity size={16} /> Departments ({profile?.departments?.length || 0})
        </button>
        <button className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('profile')}>
          <Settings size={16} /> Hospital Profile Settings
        </button>
      </div>

      {/* TAB 1: APPOINTMENTS */}
      {activeTab === 'appointments' && (
        <div>
          {appointments.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
              <Calendar size={40} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
              <h3>No Appointments Received Yet</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Appointments booked by patients will appear here in real-time.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {appointments.map((apt) => (
                <div key={apt.id} className="glass-card" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1.5rem', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                      <span className={`badge badge-${apt.status}`}>{apt.status}</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Date: {apt.appointment_date} @ {apt.time_slot}</span>
                    </div>

                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>
                      Patient: {apt.patient_name} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>({apt.patient_gender}, {apt.patient_age} yrs • Phone: {apt.patient_phone})</span>
                    </h3>

                    <p style={{ color: 'var(--accent-cyan)', fontSize: '0.9rem', fontWeight: 600 }}>
                      Assigned Doctor: {apt.doctor_name} ({apt.doctor_specialization})
                    </p>

                    {apt.symptoms_notes && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: '4px' }}>
                        Symptoms/Notes: {apt.symptoms_notes}
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {apt.status === 'pending' && (
                      <>
                        <button className="btn btn-emerald" onClick={() => handleUpdateStatus(apt.id, 'confirmed')}>
                          <CheckCircle size={15} /> Confirm
                        </button>
                        <button className="btn btn-danger" onClick={() => handleUpdateStatus(apt.id, 'cancelled')}>
                          <XCircle size={15} /> Reject
                        </button>
                      </>
                    )}
                    {apt.status === 'confirmed' && (
                      <button className="btn btn-primary" onClick={() => handleUpdateStatus(apt.id, 'completed')}>
                        Mark Completed
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DOCTORS MANAGEMENT */}
      {activeTab === 'doctors' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.4rem' }}>Doctor Roster</h3>
            <button className="btn btn-emerald" onClick={() => setShowAddDoctor(true)}>
              <Plus size={16} /> Add New Doctor
            </button>
          </div>

          <div className="grid-3">
            {(profile?.doctors || []).map((doc) => (
              <div key={doc.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <img
                      src={doc.image_url || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80"}
                      alt={doc.name}
                      style={{ width: '70px', height: '70px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                    />
                    <div>
                      <h4 style={{ fontSize: '1.1rem' }}>{doc.title} {doc.name}</h4>
                      <p style={{ color: 'var(--accent-cyan)', fontSize: '0.85rem' }}>{doc.specialization}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{doc.qualification}</p>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    <div><strong>Fee:</strong> ${doc.fee.toFixed(2)}</div>
                    <div><strong>Hours:</strong> {doc.available_days} ({doc.working_hours})</div>
                  </div>
                </div>

                <button className="btn btn-danger" style={{ width: '100%', fontSize: '0.85rem' }} onClick={() => handleDeleteDoctor(doc.id)}>
                  <Trash2 size={14} /> Remove Doctor
                </button>
              </div>
            ))}
          </div>

          {/* ADD DOCTOR MODAL */}
          {showAddDoctor && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3 style={{ marginBottom: '1rem' }}>Add Specialist Doctor</h3>
                <form onSubmit={handleCreateDoctor}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label>Title</label>
                      <input type="text" className="form-control" value={newDoc.title} onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label>Doctor Full Name</label>
                      <input type="text" className="form-control" placeholder="Jane Doe" value={newDoc.name} onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })} required />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label>Specialization</label>
                      <input type="text" className="form-control" placeholder="e.g. Cardiologist" value={newDoc.specialization} onChange={(e) => setNewDoc({ ...newDoc, specialization: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label>Qualification</label>
                      <input type="text" className="form-control" placeholder="e.g. MD, FACC" value={newDoc.qualification} onChange={(e) => setNewDoc({ ...newDoc, qualification: e.target.value })} required />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label>Experience (Yrs)</label>
                      <input type="number" className="form-control" value={newDoc.experience_years} onChange={(e) => setNewDoc({ ...newDoc, experience_years: parseInt(e.target.value, 10) })} required />
                    </div>
                    <div className="form-group">
                      <label>Consultation Fee ($)</label>
                      <input type="number" step="0.01" className="form-control" value={newDoc.fee} onChange={(e) => setNewDoc({ ...newDoc, fee: parseFloat(e.target.value) })} required />
                    </div>
                    <div className="form-group">
                      <label>Department</label>
                      <select className="form-control" value={newDoc.department_id} onChange={(e) => setNewDoc({ ...newDoc, department_id: e.target.value })}>
                        <option value="">General</option>
                        {(profile?.departments || []).map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Doctor Photo URL (Optional)</label>
                    <input type="url" className="form-control" placeholder="https://..." value={newDoc.image_url} onChange={(e) => setNewDoc({ ...newDoc, image_url: e.target.value })} />
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowAddDoctor(false)}>Cancel</button>
                    <button type="submit" className="btn btn-emerald">Save Doctor</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DEPARTMENTS */}
      {activeTab === 'departments' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.4rem' }}>Clinical Departments</h3>
            <button className="btn btn-emerald" onClick={() => setShowAddDepartment(true)}>
              <Plus size={16} /> Add Department
            </button>
          </div>

          <div className="grid-3">
            {(profile?.departments || []).map((dept) => (
              <div key={dept.id} className="glass-card">
                <h4 style={{ fontSize: '1.2rem', marginBottom: '0.4rem', color: 'var(--accent-cyan)' }}>{dept.name}</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{dept.description || 'General clinical department services.'}</p>
              </div>
            ))}
          </div>

          {showAddDepartment && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3 style={{ marginBottom: '1rem' }}>Add Department</h3>
                <form onSubmit={handleCreateDepartment}>
                  <div className="form-group">
                    <label>Department Name</label>
                    <input type="text" className="form-control" placeholder="e.g. Oncology" value={newDept.name} onChange={(e) => setNewDept({ ...newDept, name: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea className="form-control" rows="3" placeholder="Overview of clinical services offered..." value={newDept.description} onChange={(e) => setNewDept({ ...newDept, description: e.target.value })}></textarea>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowAddDepartment(false)}>Cancel</button>
                    <button type="submit" className="btn btn-emerald">Add Department</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: PROFILE SETTINGS */}
      {activeTab === 'profile' && (
        <div className="glass-card" style={{ maxWidth: '800px' }}>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '1.5rem' }}>Edit Hospital Profile</h3>
          <form onSubmit={handleSaveProfile}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Hospital Name</label>
                <input type="text" className="form-control" value={editProfile.name} onChange={(e) => setEditProfile({ ...editProfile, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>City</label>
                <input type="text" className="form-control" value={editProfile.city} onChange={(e) => setEditProfile({ ...editProfile, city: e.target.value })} required />
              </div>
            </div>

            <div className="form-group">
              <label>Tagline</label>
              <input type="text" className="form-control" value={editProfile.tagline} onChange={(e) => setEditProfile({ ...editProfile, tagline: e.target.value })} />
            </div>

            <div className="form-group">
              <label>Full Address</label>
              <input type="text" className="form-control" value={editProfile.address} onChange={(e) => setEditProfile({ ...editProfile, address: e.target.value })} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>General Phone</label>
                <input type="text" className="form-control" value={editProfile.phone} onChange={(e) => setEditProfile({ ...editProfile, phone: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>24/7 Emergency Phone</label>
                <input type="text" className="form-control" value={editProfile.emergency_phone} onChange={(e) => setEditProfile({ ...editProfile, emergency_phone: e.target.value })} />
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea className="form-control" rows="4" value={editProfile.description} onChange={(e) => setEditProfile({ ...editProfile, description: e.target.value })}></textarea>
            </div>

            <div className="form-group">
              <label>Facilities (Comma separated)</label>
              <input type="text" className="form-control" value={editProfile.facilities} onChange={(e) => setEditProfile({ ...editProfile, facilities: e.target.value })} />
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              Save Profile Changes
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
