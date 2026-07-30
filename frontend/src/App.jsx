import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Hospitals } from './pages/Hospitals';
import { HospitalDetail } from './pages/HospitalDetail';
import { PatientDashboard } from './pages/PatientDashboard';
import { HospitalDashboard } from './pages/HospitalDashboard';
import { AuthPage } from './pages/AuthPage';

export function App() {
  return (
    <div className="app-container">
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/hospitals" element={<Hospitals />} />
          <Route path="/hospitals/:id" element={<HospitalDetail />} />
          <Route path="/patient-dashboard" element={<PatientDashboard />} />
          <Route path="/hospital-dashboard" element={<HospitalDashboard />} />
          <Route path="/auth" element={<AuthPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
