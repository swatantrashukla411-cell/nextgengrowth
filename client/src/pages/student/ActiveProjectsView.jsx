import React, { useState, useEffect } from 'react';
import marketplaceApi from '../../api/marketplace';

export const ActiveProjectsView = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Submit modal state
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [activeMilestoneData, setActiveMilestoneData] = useState(null);
  const [deliverableUrl, setDeliverableUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchContracts = async () => {
    try {
      const res = await marketplaceApi.getStudentContracts();
      if (res.data?.success) {
        setContracts(res.data.contracts || []);
      }
    } catch (err) {
      console.error('Fetch student contracts error:', err);
      setError('Failed to load active project workspaces.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const openSubmitModal = (contract, milestone) => {
    setActiveMilestoneData({
      contractId: contract._id,
      milestoneNumber: milestone.milestoneNumber,
      milestoneTitle: milestone.title,
      amount: milestone.amount,
      dueDate: milestone.dueDate,
      revisions: milestone.revisions || [],
    });
    setDeliverableUrl(milestone.submission?.deliverableUrl || '');
    setNotes(milestone.submission?.notes || '');
    setSubmitModalOpen(true);
  };

  const handleSubmitDeliverable = async () => {
    if (!deliverableUrl.trim()) {
      alert('Please provide a valid deliverable URL (Figma, Google Drive, GitHub, Loom, etc.)');
      return;
    }

    setSubmitting(true);
    try {
      const res = await marketplaceApi.submitMilestoneWork(
        activeMilestoneData.contractId,
        activeMilestoneData.milestoneNumber,
        { deliverableUrl, notes }
      );

      if (res.data?.success) {
        setSubmitModalOpen(false);
        setSuccessMsg(res.data.message);
        setTimeout(() => setSuccessMsg(''), 6000);
        fetchContracts();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Deliverable submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (escrowStatus, workStatus) => {
    if (escrowStatus === 'released' || workStatus === 'approved') {
      return { bg: '#ecfdf5', color: '#047857', label: '✅ Approved & Released' };
    }
    if (workStatus === 'submitted') {
      return { bg: '#eff6ff', color: '#1d4ed8', label: '👀 Under Review' };
    }
    if (workStatus === 'revision') {
      return { bg: '#fef3c7', color: '#b45309', label: '🔄 Revision Requested' };
    }
    if (escrowStatus === 'funded') {
      return { bg: '#f0fdf4', color: '#15803d', label: '🛡️ Escrow Funded (In Progress)' };
    }
    return { bg: '#f1f5f9', color: '#64748b', label: '⏳ Waiting for Brand Escrow' };
  };

  // Helper for deadline countdown
  const getDaysRemaining = (dueDate) => {
    if (!dueDate) return null;
    const diff = new Date(dueDate).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return 'Overdue';
    if (days === 0) return 'Due today';
    return `${days} days left`;
  };

  return (
    <div style={{ padding: '28px 24px 64px', maxWidth: '1140px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
          <span>●</span> Deliverable Workspace & Milestones
        </div>
        <h1 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.025em', margin: 0 }}>
          Active Projects & Workspaces
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
          Submit milestones, review actionable brand feedback, and trigger escrow fund releases.
        </p>
      </div>

      {successMsg && (
        <div style={{ padding: '14px 18px', background: '#ecfdf5', border: '1px solid #34d399', borderRadius: '10px', color: '#065f46', marginBottom: '22px', fontWeight: 600, fontSize: '0.9rem' }}>
          {successMsg}
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          Loading active project workspaces...
        </div>
      )}

      {!loading && contracts.length === 0 && (
        <div className="card-tactile" style={{ padding: '54px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📁</div>
          <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 6px' }}>
            No Active Contracts Yet
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '0 auto' }}>
            When a brand accepts your proposal and initiates a contract, your deliverables workspace will appear here.
          </p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {contracts.map((contract) => {
          const brand = contract.brandId || {};
          const isDone = contract.status === 'completed';

          return (
            <div
              key={contract._id}
              className="card-tactile"
              style={{
                padding: '26px 28px',
                background: '#ffffff',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '18px', marginBottom: '18px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
                      {contract.title}
                    </h3>
                    <span
                      style={{
                        background: isDone ? '#ecfdf5' : '#eff6ff',
                        color: isDone ? '#047857' : '#1d4ed8',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {contract.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Client Brand: <strong>{brand.companyName || `${brand.firstName} ${brand.lastName}`}</strong> • Total Project Value:{' '}
                    <strong className="font-mono" style={{ color: 'var(--text-main)' }}>₹{contract.totalBudget?.toLocaleString('en-IN')}</strong>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--brand-primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    🛡️ Escrow Protected
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Net student cut: <span className="font-mono" style={{ fontWeight: 600 }}>{100 - (contract.platformFeePercent || 10)}%</span>
                  </div>
                </div>
              </div>

              {/* Milestones List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {contract.milestones?.map((m) => {
                  const badge = getStatusBadge(m.escrowStatus, m.workStatus);
                  const isFunded = m.escrowStatus === 'funded';
                  const isSubmitted = m.workStatus === 'submitted';
                  const isApproved = m.workStatus === 'approved';
                  const isRevision = m.workStatus === 'revision';
                  const daysLeft = getDaysRemaining(m.dueDate);

                  return (
                    <div
                      key={m.milestoneNumber}
                      style={{
                        padding: '18px 20px',
                        borderRadius: '10px',
                        background: '#f8fafc',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '14px',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: '280px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                          <span className="font-mono" style={{ fontWeight: 800, fontSize: '0.82rem', color: 'var(--brand-primary)' }}>
                            #{m.milestoneNumber}
                          </span>
                          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                            {m.title}
                          </span>
                          <span style={{ background: badge.bg, color: badge.color, fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>
                            {badge.label}
                          </span>
                          {daysLeft && !isApproved && (
                            <span className="font-mono" style={{ fontSize: '0.72rem', background: '#fef3c7', color: '#92400e', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                              ⏳ {daysLeft}
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          Gross: <strong className="font-mono" style={{ color: 'var(--text-main)' }}>₹{m.amount?.toLocaleString('en-IN')}</strong> • Net Payout:{' '}
                          <strong className="font-mono" style={{ color: 'var(--brand-primary)' }}>₹{Math.round(m.amount * 0.9).toLocaleString('en-IN')}</strong>
                          {m.description && ` • ${m.description}`}
                        </div>

                        {/* Revision feedback alert */}
                        {isRevision && m.revisions?.length > 0 && (
                          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '10px 14px', marginTop: '10px', fontSize: '0.82rem', color: '#92400e' }}>
                            <strong>🔄 Brand Feedback (Revision #{m.revisions.length}):</strong> {m.revisions[m.revisions.length - 1].notes}
                          </div>
                        )}

                        {/* Submission Link Info */}
                        {m.submission?.deliverableUrl && (
                          <div style={{ marginTop: '10px', fontSize: '0.8rem' }}>
                            <a href={m.submission.deliverableUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>
                              🔗 View Submitted Deliverable
                            </a>
                            {m.autoReleaseAt && !isApproved && (
                              <span className="font-mono" style={{ marginLeft: '12px', color: '#b45309', fontSize: '0.75rem' }}>
                                (Auto-releases on {new Date(m.autoReleaseAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })})
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Action */}
                      <div>
                        {isFunded && !isApproved && (
                          <button
                            onClick={() => openSubmitModal(contract, m)}
                            className="btn-emerald"
                            style={{ padding: '8px 16px', fontSize: '0.82rem' }}
                          >
                            {isRevision ? 'Submit Revised Work' : isSubmitted ? 'Update Submission' : '📤 Submit Deliverable'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* WORK SUBMISSION MODAL */}
      {submitModalOpen && activeMilestoneData && (
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
              maxWidth: '580px',
              width: '100%',
              padding: '30px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  Submit Milestone Deliverable
                </h3>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '4px' }}>
                  Milestone #{activeMilestoneData.milestoneNumber}: {activeMilestoneData.milestoneTitle} (<span className="font-mono" style={{ fontWeight: 600, color: 'var(--brand-primary)' }}>₹{activeMilestoneData.amount?.toLocaleString('en-IN')}</span>)
                </div>
              </div>
              <button onClick={() => setSubmitModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}>
                ✕
              </button>
            </div>

            {/* Revision Changelog */}
            {activeMilestoneData.revisions?.length > 0 && (
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '12px', marginBottom: '16px', fontSize: '0.82rem' }}>
                <div style={{ fontWeight: 700, color: '#92400e', marginBottom: '4px' }}>
                  Brand Revision Feedback Log:
                </div>
                {activeMilestoneData.revisions.map((rev, i) => (
                  <div key={i} style={{ color: '#78350f', marginTop: '2px' }}>
                    • Revision #{i + 1}: "{rev.notes}"
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-main)' }}>
                Deliverable Link (Figma, GitHub, Google Drive, Loom, etc.) *
              </label>
              <input
                type="url"
                placeholder="https://drive.google.com/... or https://figma.com/..."
                value={deliverableUrl}
                onChange={(e) => setDeliverableUrl(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-strong)', fontSize: '0.88rem' }}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>Ensure public view or edit permissions are granted.</span>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-main)' }}>
                Work Notes / Summary for Brand Review
              </label>
              <textarea
                rows="4"
                placeholder="Detail what was completed, outline any key components, and explain how feedback was addressed..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-strong)', fontSize: '0.88rem', lineHeight: 1.5, fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px 14px', marginBottom: '22px', fontSize: '0.8rem', color: '#166534' }}>
              🛡️ <strong>Escrow Auto-Release Protection:</strong> Upon submission, the client has a 7-day review window. If no revision is requested within 7 days, funds auto-release directly to your wallet!
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn-secondary-tactile" onClick={() => setSubmitModalOpen(false)}>
                Cancel
              </button>
              <button
                className="btn-emerald"
                onClick={handleSubmitDeliverable}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : '🚀 Submit for Approval'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveProjectsView;
