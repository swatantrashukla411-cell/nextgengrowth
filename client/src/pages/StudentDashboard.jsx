import React from 'react';
import { useAuth } from '../context/AuthContext';

export const StudentDashboard = () => {
  const { user } = useAuth();
  
  return (
    <div style={{ padding: '24px' }}>
      <div className="wb" style={{ background: 'linear-gradient(135deg, #064e3b, #022c22)' }}>
        <div>
          <div className="wb-pill"><span className="wb-pd"></span>Student Workspace</div>
          <div className="wb-t">Welcome, {user?.firstName}! 🎓</div>
          <div className="wb-d">You are logged in as a verified student. Browse projects from brands, submit work, and track your payments.</div>
        </div>
      </div>
      
      <div className="card" style={{ marginTop: '20px' }}>
        <div className="st">🎓 Verified Profile Details</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
          <div><strong>Name:</strong> {user?.firstName} {user?.lastName}</div>
          <div><strong>Email:</strong> {user?.email}</div>
          <div><strong>University:</strong> {user?.college || 'Not set'}</div>
          <div><strong>Year:</strong> {user?.year || 'Not set'}</div>
          <div><strong>Skills:</strong> {user?.skills?.join(', ') || 'None selected'}</div>
        </div>
      </div>
    </div>
  );
};
export default StudentDashboard;
