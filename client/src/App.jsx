import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { DashboardLayout } from './layouts/DashboardLayout';
import LandingPage from './pages/LandingPage';
import CampusPage from './pages/CampusPage';

// Brand Pages
import { BrandDashboard } from './pages/BrandDashboard';
import { PostProjectWizard } from './pages/brand/PostProjectWizard';
import { ApplicantsPipeline } from './pages/brand/ApplicantsPipeline';
import { ActiveContractsView } from './pages/brand/ActiveContractsView';
import { FinancialsInvoicesView } from './pages/brand/FinancialsInvoicesView';

// Student Pages
import { StudentDashboard } from './pages/StudentDashboard';
import { OpportunityFeed } from './pages/student/OpportunityFeed';
import { ProposalsTracker } from './pages/student/ProposalsTracker';
import { ActiveProjectsView } from './pages/student/ActiveProjectsView';
import { EarningsPayoutCenter } from './pages/student/EarningsPayoutCenter';
import { ProfileVerificationHub } from './pages/student/ProfileVerificationHub';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Auth routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/campus" element={<CampusPage />} />
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
            <Route path="jobs" element={<OpportunityFeed />} />
            <Route path="applications" element={<ProposalsTracker />} />
            <Route path="workspaces" element={<ActiveProjectsView />} />
            <Route path="earnings" element={<EarningsPayoutCenter />} />
            <Route path="profile" element={<ProfileVerificationHub />} />
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
            <Route path="post" element={<PostProjectWizard />} />
            <Route path="projects" element={<ActiveContractsView />} />
            <Route path="applications" element={<ApplicantsPipeline />} />
            <Route path="invoices" element={<FinancialsInvoicesView />} />
            <Route path="students" element={<ApplicantsPipeline />} />
            <Route path="profile" element={<BrandDashboard />} />
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
