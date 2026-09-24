import React from 'react';
import { useAuth } from '../context/AuthContext';

export const BrandDashboard = () => {
  const { user } = useAuth();
  
  return (
    <div style={{ padding: '24px' }}>
      <div className="wb">
        <div>
          <div className="wb-pill"><span className="wb-pd"></span>Brand Workspace</div>
          <div className="wb-t">Welcome, {user?.firstName}! 🏢</div>
          <div className="wb-d">You are logged in as a brand. Create scopes of work, review student applications, and approve deliveries.</div>
        </div>
      </div>
      
      <div className="card" style={{ marginTop: '20px' }}>
        <div className="st">🏢 Brand Profile Details</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
          <div><strong>Company:</strong> {user?.companyName || 'Not set'}</div>
          <div><strong>Representative:</strong> {user?.firstName} {user?.lastName}</div>
          <div><strong>Email:</strong> {user?.email}</div>
          <div><strong>Website/LinkedIn:</strong> <a href={user?.brandLink} target="_blank" rel="noopener noreferrer" style={{ color: '#1d4ed8' }}>{user?.brandLink || 'Not set'}</a></div>
          <div><strong>Service Requested:</strong> {user?.serviceNeeded || 'Not set'}</div>
        </div>
      </div>
    </div>
  );
};
export default BrandDashboard;
