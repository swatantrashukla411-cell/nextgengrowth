import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/client';

const formatDate = (value) => value ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    API.get('/api/student/stats')
      .then((response) => setApplications(response.data.applications || []))
      .catch((err) => setError(err.response?.data?.message || 'Could not load your applications.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section style={{ padding: 24 }}>
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="st">My applications</div>
        <p style={{ color: 'var(--ts)', marginTop: 6 }}>Track your 10 most recent project applications and their current status.</p>
      </div>
      {error && <div role="alert" className="card" style={{ color: '#b91c1c' }}>{error}</div>}
      {loading ? <div className="card">Loading your applications…</div> : applications.length === 0 ? (
        <div className="card">You have not applied to a project yet. <Link to="/dashboard/jobs">Find work</Link>.</div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {applications.map((application) => (
            <article className="card" key={application._id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <div className="st">{application.jobTitle || 'Project application'}</div>
                  <div style={{ color: 'var(--ts)', marginTop: 5 }}>{application.brandName || 'Brand'} · Submitted {formatDate(application.createdAt)}</div>
                </div>
                <strong style={{ textTransform: 'capitalize' }}>{application.status || 'review'}</strong>
              </div>
              <p style={{ marginTop: 10 }}>Project pay: {application.pay || 'Not listed'}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default ApplicationsPage;
