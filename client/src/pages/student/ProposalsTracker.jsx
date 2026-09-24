import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import marketplaceApi from '../../api/marketplace';

export const ProposalsTracker = () => {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProposal, setSelectedProposal] = useState(null);

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const res = await marketplaceApi.getStudentProposals();
        if (res.data?.success) {
          setProposals(res.data.proposals || []);
        }
      } catch (err) {
        console.error('Fetch student proposals error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProposals();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted':
        return { bg: '#ecfdf5', color: '#047857', label: '🎉 Hired & Contracted' };
      case 'shortlisted':
        return { bg: '#fef3c7', color: '#b45309', label: '⭐ Shortlisted by Brand' };
      case 'rejected':
        return { bg: '#f1f5f9', color: '#64748b', label: '📁 Declined' };
      default:
        return { bg: '#eff6ff', color: '#1d4ed8', label: '👀 Under Review' };
    }
  };

  return (
    <div style={{ padding: '28px 24px 64px', maxWidth: '1140px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
          <span>●</span> Bid Management & Client Review
        </div>
        <h1 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.025em', margin: 0 }}>
          Proposals Tracker
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
          Real-time tracking of submitted project pitches and brand review status.
        </p>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          Loading your proposals...
        </div>
      )}

      {!loading && proposals.length === 0 && (
        <div className="card-tactile" style={{ padding: '54px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📝</div>
          <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 6px' }}>
            No Submitted Proposals Yet
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '18px', maxWidth: '480px', margin: '0 auto 18px' }}>
            Explore the opportunity feed, submit bids to high-converting brand briefs, and kickstart your student career!
          </p>
          <button onClick={() => navigate('/dashboard/jobs')} className="btn-emerald">
            Explore Opportunities →
          </button>
        </div>
      )}

      {!loading && proposals.length > 0 && (
        <div className="card-tactile" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FAFAF9' }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
              Active Proposals
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Total: {proposals.length} submissions
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-subtle)', color: '#475569', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                  <th style={{ padding: '12px 18px' }}>Date</th>
                  <th style={{ padding: '12px 18px' }}>Project & Brand</th>
                  <th style={{ padding: '12px 18px' }}>Your Bid</th>
                  <th style={{ padding: '12px 18px' }}>Timeline</th>
                  <th style={{ padding: '12px 18px' }}>Status</th>
                  <th style={{ padding: '12px 18px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {proposals.map((prop) => {
                  const job = prop.jobId || {};
                  const isAccepted = prop.status === 'accepted';
                  const isShortlisted = prop.status === 'shortlisted';
                  const isRejected = prop.status === 'rejected';

                  return (
                    <tr key={prop._id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s' }}>
                      <td className="font-mono" style={{ padding: '14px 18px', color: 'var(--text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                        {new Date(prop.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9rem' }}>{job.title || 'Project Scope'}</div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Brand: <strong>{job.brandName || job.brandId?.companyName || 'Verified Brand'}</strong> • {job.category}
                        </div>
                      </td>
                      <td className="font-mono" style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--brand-primary)', fontSize: '0.92rem' }}>
                        ₹{prop.bidAmount?.toLocaleString('en-IN')}
                      </td>
                      <td className="font-mono" style={{ padding: '14px 18px', color: '#334155' }}>
                        {prop.estimatedDays} days
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        {isAccepted ? (
                          <span className="chip-escrow-released">
                            <span>🎉</span> Hired & Contracted
                          </span>
                        ) : isShortlisted ? (
                          <span className="chip-escrow-locked">
                            <span>⭐</span> Shortlisted
                          </span>
                        ) : isRejected ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#f1f5f9', color: '#64748b', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>
                            Declined
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#eff6ff', color: '#1d4ed8', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>
                            Under Review
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button
                          onClick={() => setSelectedProposal(prop)}
                          className="btn-secondary-tactile"
                          style={{ padding: '5px 12px', fontSize: '0.78rem', marginRight: '6px' }}
                        >
                          Details
                        </button>

                        {isAccepted && (
                          <button
                            onClick={() => navigate('/dashboard/workspaces')}
                            className="btn-emerald"
                            style={{ padding: '5px 12px', fontSize: '0.78rem' }}
                          >
                            Workspace →
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Proposal Details Modal */}
      {selectedProposal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            className="card-tactile"
            style={{
              background: '#ffffff',
              maxWidth: '600px',
              width: '100%',
              padding: '28px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  {selectedProposal.jobId?.title}
                </h3>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Your Bid: <strong className="font-mono" style={{ color: 'var(--brand-primary)' }}>₹{selectedProposal.bidAmount?.toLocaleString('en-IN')}</strong> in <span className="font-mono">{selectedProposal.estimatedDays}</span> days
                </div>
              </div>
              <button onClick={() => setSelectedProposal(null)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}>
                ✕
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-main)' }}>Your Cover Pitch:</div>
              <div style={{ background: '#f8fafc', border: '1px solid var(--border-subtle)', padding: '14px', borderRadius: '8px', fontSize: '0.88rem', color: '#334155', lineHeight: 1.5 }}>
                {selectedProposal.coverLetter}
              </div>
            </div>

            {selectedProposal.answers?.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px', color: 'var(--text-main)' }}>Answers to Screening Questions:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedProposal.answers.map((a, i) => (
                    <div key={i} style={{ background: '#f8fafc', border: '1px solid var(--border-subtle)', padding: '10px 12px', borderRadius: '6px', fontSize: '0.82rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{a.question}</div>
                      <div style={{ color: '#475569', marginTop: '3px' }}>{a.answer}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button className="btn-secondary-tactile" onClick={() => setSelectedProposal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProposalsTracker;
