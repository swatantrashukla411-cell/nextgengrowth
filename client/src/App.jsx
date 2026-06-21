import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { DashboardLayout } from './layouts/DashboardLayout';
import { StudentDashboard } from './pages/StudentDashboard';
import { BrandDashboard } from './pages/BrandDashboard';
import LandingPage from './pages/LandingPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Auth routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Student Protected routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<StudentDashboard />} />
            <Route path="jobs" element={<div style={{ padding: '24px' }} className="card"><h3>Find Work</h3><p style={{ marginTop: '10px', color: 'var(--ts)', fontSize: '0.85rem' }}>Listing available student projects...</p></div>} />
            <Route path="applications" element={<div style={{ padding: '24px' }} className="card"><h3>My Applications</h3><p style={{ marginTop: '10px', color: 'var(--ts)', fontSize: '0.85rem' }}>Track your project applications...</p></div>} />
            <Route path="workspaces" element={<div style={{ padding: '24px' }} className="card"><h3>Workspaces</h3><p style={{ marginTop: '10px', color: 'var(--ts)', fontSize: '0.85rem' }}>Your active workspaces and deliverables...</p></div>} />
            <Route path="profile" element={<div style={{ padding: '24px' }} className="card"><h3>Profile & KYC</h3><p style={{ marginTop: '10px', color: 'var(--ts)', fontSize: '0.85rem' }}>Manage verification credentials...</p></div>} />
          </Route>

          {/* Brand Protected routes */}
          <Route 
            path="/brand-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['brand']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<BrandDashboard />} />
            <Route path="post" element={<div style={{ padding: '24px' }} className="card"><h3>Post a Project</h3><p style={{ marginTop: '10px', color: 'var(--ts)', fontSize: '0.85rem' }}>AI brief builder and details form...</p></div>} />
            <Route path="projects" element={<div style={{ padding: '24px' }} className="card"><h3>My Projects</h3><p style={{ marginTop: '10px', color: 'var(--ts)', fontSize: '0.85rem' }}>Active and historical brand projects...</p></div>} />
            <Route path="applications" element={<div style={{ padding: '24px' }} className="card"><h3>Applications</h3><p style={{ marginTop: '10px', color: 'var(--ts)', fontSize: '0.85rem' }}>Review submitted student profiles...</p></div>} />
            <Route path="students" element={<div style={{ padding: '24px' }} className="card"><h3>Browse Students</h3><p style={{ marginTop: '10px', color: 'var(--ts)', fontSize: '0.85rem' }}>Search active student talents...</p></div>} />
            <Route path="longterm" element={<div style={{ padding: '24px' }} className="card"><h3>Long-Term Hiring</h3><p style={{ marginTop: '10px', color: 'var(--ts)', fontSize: '0.85rem' }}>Manage monthly student retainers...</p></div>} />
            <Route path="profile" element={<div style={{ padding: '24px' }} className="card"><h3>Brand Profile</h3><p style={{ marginTop: '10px', color: 'var(--ts)', fontSize: '0.85rem' }}>Manage company details...</p></div>} />
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
