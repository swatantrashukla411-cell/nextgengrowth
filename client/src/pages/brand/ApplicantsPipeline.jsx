import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/client';
import marketplaceApi from '../../api/marketplace';

const PIPELINE_COLUMNS = [
  { id: 'submitted', label: 'New Applicants', color: '#2563EB', bg: '#EFF6FF', dot: '●' },
  { id: 'shortlisted', label: 'Shortlisted', color: '#D97706', bg: '#FEF3C7', dot: '★' },
  { id: 'accepted', label: 'Hired & Escrowed', color: '#059669', bg: '#ECFDF5', dot: '✓' },
  { id: 'rejected', label: 'Archived', color: '#64748B', bg: '#F1F5F9', dot: '✕' },
];

export const ApplicantsPipeline = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'table'

  // Modal State for Candidate Detail / Hire
  const [activeCandidate, setActiveCandidate] = useState(null);
  const [hireModalOpen, setHireModalOpen] = useState(false);
  const [hireData, setHireData] = useState({
    title: '',
    totalBudget: 0,
    milestones: [
      { milestoneNumber: 1, title: 'Milestone 1 Deliverables', amount: 0, description: '' },
    ],
  });
  const [hireLoading, setHireLoading] = useState(false);

  // Fetch Brand's Jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await API.get('/api/brand/projects');
        const list = res.data?.projects || res.data?.jobs || [];
        setJobs(list);
        if (list.length > 0) {
          setSelectedJobId(list[0]._id || list[0].id);
        }
      } catch (err) {
        console.error('Fetch jobs error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  // Fetch Proposals for Selected Job
  useEffect(() => {
    if (!selectedJobId) return;
    const fetchProposals = async () => {
      setLoading(true);
      try {
        const res = await marketplaceApi.getJobProposals(selectedJobId);
        if (res.data?.success) {
          setProposals(res.data.proposals || []);
        }
      } catch (err) {
        console.error('Fetch proposals error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProposals();
  }, [selectedJobId]);

  // Update Status
  const handleStatusChange = async (proposalId, newStatus) => {
    try {
      const res = await marketplaceApi.updateProposalStatus(proposalId, newStatus);
      if (res.data?.success) {
        setProposals((prev) =>
          prev.map((p) => (p._id === proposalId ? { ...p, status: newStatus } : p))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Could not update applicant status.');
    }
  };

  // Open Hire Modal
  const openHireModal = (proposal) => {
    const job = jobs.find((j) => (j._id || j.id) === selectedJobId);
    setHireData({
      proposalId: proposal._id,
      studentId: proposal.studentId?._id || proposal.studentId,
      jobId: selectedJobId,
      title: job?.title || 'Creative Project Contract',
      totalBudget: proposal.bidAmount || 3000,
      milestones: [
        {
          milestoneNumber: 1,
          title: 'Full Deliverable Submission',
          amount: proposal.bidAmount || 3000,
          description: `Deliverables per proposal: ${proposal.coverLetter.slice(0, 100)}...`,
        },
      ],
    });
    setHireModalOpen(true);
  };

  // Confirm Hire & Generate Contract
  const handleCreateContract = async () => {
    setHireLoading(true);
    try {
      const res = await marketplaceApi.createContract(hireData);
      if (res.data?.success) {
        setHireModalOpen(false);
        setProposals((prev) =>
          prev.map((p) => (p._id === hireData.proposalId ? { ...p, status: 'accepted' } : p))
        );
        navigate('/brand-dashboard/projects');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate contract.');
    } finally {
      setHireLoading(false);
    }
  };

  const getBadgeStyle = (badge) => {
    if (badge === 'top-rated') return { bg: '#FEF3C7', color: '#92400E', label: '🏆 Top Rated' };
    if (badge === 'verified') return { bg: '#ECFDF5', color: '#065F46', label: '🛡️ Verified Talent' };
    return { bg: '#F1F5F9', color: '#475569', label: '🌱 Starter Profile' };
  };

  return (
    <div style={{ padding: '24px 28px 60px', maxWidth: '1240px', margin: '0 auto' }}>
      {/* Top Header and Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, background: 'var(--brand-surface)', color: 'var(--brand-primary)', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
              Linear Pipeline
            </span>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Side-by-side pitch & portfolio comparison
            </span>
          </div>
          <h2 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
            Applicants Comparison Pipeline
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* Job Selector Dropdown */}
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border-strong)',
              fontWeight: 600,
              fontSize: '0.86rem',
              background: '#FFFFFF',
              maxWidth: '320px',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {jobs.length === 0 && <option value="">No Active Projects Found</option>}
            {jobs.map((j) => (
              <option key={j._id || j.id} value={j._id || j.id}>
                {j.title} ({j.budget || `₹${j.budgetAmount || 0}`})
              </option>
            ))}
          </select>

          {/* View toggle */}
          <div style={{ display: 'flex', background: '#F1F5F9', borderRadius: '8px', padding: '3px', border: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => setViewMode('kanban')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                background: viewMode === 'kanban' ? '#FFFFFF' : 'transparent',
                fontWeight: 600,
                fontSize: '0.78rem',
                cursor: 'pointer',
                color: viewMode === 'kanban' ? 'var(--text-main)' : 'var(--text-muted)',
                boxShadow: viewMode === 'kanban' ? 'var(--shadow-sm)' : 'none',
              }}
            >
              Kanban
            </button>
            <button
              onClick={() => setViewMode('table')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                background: viewMode === 'table' ? '#FFFFFF' : 'transparent',
                fontWeight: 600,
                fontSize: '0.78rem',
                cursor: 'pointer',
                color: viewMode === 'table' ? 'var(--text-main)' : 'var(--text-muted)',
                boxShadow: viewMode === 'table' ? 'var(--shadow-sm)' : 'none',
              }}
            >
              Table View
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          Loading applicant pipeline...
        </div>
      )}

      {/* KANBAN VIEW (Linear-style high density) */}
      {!loading && viewMode === 'kanban' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', alignItems: 'start' }}>
          {PIPELINE_COLUMNS.map((col) => {
            const colProposals = proposals.filter((p) => p.status === col.id);
            return (
              <div
                key={col.id}
                style={{
                  background: '#F8FAFC',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '12px',
                  minHeight: '520px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: col.color, fontSize: '0.8rem' }}>{col.dot}</span>
                    <span style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--text-main)' }}>
                      {col.label}
                    </span>
                  </div>
                  <span
                    className="font-mono"
                    style={{
                      background: '#FFFFFF',
                      color: 'var(--text-muted)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      padding: '1px 7px',
                      borderRadius: '100px',
                    }}
                  >
                    {colProposals.length}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {colProposals.map((prop) => {
                    const student = prop.studentId || {};
                    const badgeMeta = getBadgeStyle(student.studentBadge || prop.studentBadgeAtApply);

                    return (
                      <div
                        key={prop._id}
                        className="card-tactile"
                        style={{
                          padding: '14px',
                          borderRadius: '8px',
                          background: '#FFFFFF',
                        }}
                      >
                        {/* Student Name & College */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                              {student.firstName} {student.lastName}
                            </div>
                            <div style={{ marginTop: '3px' }}>
                              <span className="chip-college" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                                🎓 {student.college || 'Verified Campus Creator'}
                              </span>
                            </div>
                          </div>
                          <span
                            style={{
                              background: badgeMeta.bg,
                              color: badgeMeta.color,
                              fontSize: '0.66rem',
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: '4px',
                            }}
                          >
                            {badgeMeta.label}
                          </span>
                        </div>

                        {/* Bid & Delivery Timeline (Monospace) */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', background: '#FAFAF9', border: '1px solid var(--border-subtle)', padding: '6px 10px', borderRadius: '6px', fontSize: '0.8rem', margin: '8px 0' }}>
                          <span className="font-mono" style={{ color: '#059669', fontWeight: 700 }}>
                            ₹{prop.bidAmount?.toLocaleString('en-IN')}
                          </span>
                          <span className="font-mono" style={{ color: 'var(--text-muted)' }}>
                            ⏱️ {prop.estimatedDays} days
                          </span>
                        </div>

                        {/* Cover pitch snippet */}
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.45, marginBottom: '10px', maxHeight: '44px', overflow: 'hidden' }}>
                          "{prop.coverLetter}"
                        </p>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '6px', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
                          <button
                            onClick={() => setActiveCandidate(prop)}
                            className="btn-secondary-tactile"
                            style={{
                              flex: 1,
                              padding: '5px 8px',
                              fontSize: '0.74rem',
                            }}
                          >
                            View Pitch
                          </button>

                          {prop.status !== 'accepted' && (
                            <button
                              onClick={() => openHireModal(prop)}
                              className="btn-emerald"
                              style={{
                                padding: '5px 10px',
                                fontSize: '0.74rem',
                              }}
                            >
                              Hire
                            </button>
                          )}
                        </div>

                        {/* Move column quick buttons */}
                        <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                          {col.id !== 'shortlisted' && prop.status !== 'accepted' && (
                            <button
                              onClick={() => handleStatusChange(prop._id, 'shortlisted')}
                              style={{ flex: 1, padding: '3px', fontSize: '0.68rem', background: '#FEF3C7', color: '#92400E', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
                            >
                              ★ Shortlist
                            </button>
                          )}
                          {col.id !== 'rejected' && prop.status !== 'accepted' && (
                            <button
                              onClick={() => handleStatusChange(prop._id, 'rejected')}
                              style={{ flex: 1, padding: '3px', fontSize: '0.68rem', background: '#FEE2E2', color: '#991B1B', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
                            >
                              ✕ Archive
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {colProposals.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '32px 10px', color: 'var(--text-subtle)', fontSize: '0.78rem' }}>
                      No applicants in this stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TABULAR VIEW */}
      {!loading && viewMode === 'table' && (
        <div className="card-tactile" style={{ padding: '0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontWeight: 600 }}>
                <th style={{ padding: '12px 16px' }}>Student Freelancer</th>
                <th style={{ padding: '12px 16px' }}>Badge & University</th>
                <th style={{ padding: '12px 16px' }}>Proposed Bid</th>
                <th style={{ padding: '12px 16px' }}>Turnaround</th>
                <th style={{ padding: '12px 16px' }}>Pipeline Stage</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {proposals.map((prop) => {
                const s = prop.studentId || {};
                const badge = getBadgeStyle(s.studentBadge || prop.studentBadgeAtApply);
                return (
                  <tr key={prop._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{s.firstName} {s.lastName}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{s.email}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ background: badge.bg, color: badge.color, padding: '2px 7px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600, display: 'inline-block', marginBottom: '3px' }}>
                        {badge.label}
                      </span>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{s.college || 'Verified Talent'}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className="font-mono" style={{ fontWeight: 700, color: '#059669' }}>
                        ₹{prop.bidAmount?.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className="font-mono" style={{ color: 'var(--text-muted)' }}>
                        {prop.estimatedDays} days
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <select
                        value={prop.status}
                        onChange={(e) => handleStatusChange(prop._id, e.target.value)}
                        style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '0.8rem', border: '1px solid var(--border-strong)', background: '#FFFFFF' }}
                      >
                        <option value="submitted">New</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="accepted">Hired</option>
                        <option value="rejected">Archived</option>
                      </select>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => setActiveCandidate(prop)}
                        className="btn-secondary-tactile"
                        style={{ padding: '5px 10px', fontSize: '0.76rem', marginRight: '6px' }}
                      >
                        Pitch
                      </button>
                      {prop.status !== 'accepted' && (
                        <button
                          onClick={() => openHireModal(prop)}
                          className="btn-emerald"
                          style={{ padding: '5px 12px', fontSize: '0.76rem' }}
                        >
                          Hire
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {proposals.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-subtle)' }}>
                    No proposals received for this project yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* CANDIDATE PROPOSAL DETAIL MODAL */}
      {activeCandidate && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
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
              maxWidth: '640px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '1.25rem', fontWeight: 700 }}>
                  {activeCandidate.studentId?.firstName} {activeCandidate.studentId?.lastName}
                </h3>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '2px' }}>
                  🎓 {activeCandidate.studentId?.college || 'Verified Talent'} • Bid: <span className="font-mono">₹{activeCandidate.bidAmount?.toLocaleString('en-IN')}</span> in <span className="font-mono">{activeCandidate.estimatedDays} days</span>
                </div>
              </div>
              <button
                onClick={() => setActiveCandidate(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>

            {/* Pitch */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text-main)', marginBottom: '6px' }}>
                Cover Letter / Pitch:
              </div>
              <div style={{ background: '#FAFAF9', border: '1px solid var(--border-subtle)', padding: '14px', borderRadius: '8px', fontSize: '0.86rem', lineHeight: 1.5, color: '#334155' }}>
                {activeCandidate.coverLetter}
              </div>
            </div>

            {/* Screening Answers */}
            {activeCandidate.answers?.length > 0 && (
              <div style={{ marginBottom: '18px' }}>
                <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text-main)', marginBottom: '8px' }}>
                  Screening Question Answers:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {activeCandidate.answers.map((ans, i) => (
                    <div key={i} style={{ background: '#F8FAFC', border: '1px solid var(--border-subtle)', padding: '10px 12px', borderRadius: '6px', fontSize: '0.82rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '3px' }}>{ans.question}</div>
                      <div style={{ color: 'var(--text-muted)' }}>{ans.answer}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Portfolio Links */}
            {activeCandidate.workSamples?.length > 0 && (
              <div style={{ marginBottom: '22px' }}>
                <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text-main)', marginBottom: '8px' }}>
                  Submitted Work Samples:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {activeCandidate.workSamples.map((s, i) => (
                    <a
                      key={i}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--brand-primary)', fontSize: '0.84rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
                    >
                      🔗 {s.title || s.url} ↗
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                className="btn-secondary-tactile"
                onClick={() => setActiveCandidate(null)}
              >
                Close
              </button>
              {activeCandidate.status !== 'accepted' && (
                <button
                  className="btn-emerald"
                  onClick={() => {
                    const c = activeCandidate;
                    setActiveCandidate(null);
                    openHireModal(c);
                  }}
                >
                  Hire & Create Escrow Contract →
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 1-CLICK HIRE & CONTRACT CREATION MODAL */}
      {hireModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
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
              maxWidth: '540px',
              width: '100%',
              padding: '24px',
            }}
          >
            <h3 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '1.25rem', fontWeight: 800, marginBottom: '6px' }}>
              Confirm Hire & Create Escrow Contract
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '18px' }}>
              Milestone escrow locks funding securely with Razorpay. You inspect deliverables before any funds are released.
            </p>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.84rem', marginBottom: '4px' }}>
                Contract Title
              </label>
              <input
                type="text"
                value={hireData.title}
                onChange={(e) => setHireData({ ...hireData, title: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--border-strong)', fontSize: '0.86rem' }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.84rem', marginBottom: '4px' }}>
                Total Agreed Budget (INR)
              </label>
              <div style={{ position: 'relative' }}>
                <span className="font-mono" style={{ position: 'absolute', left: '10px', top: '9px', fontWeight: 700, color: 'var(--text-muted)' }}>₹</span>
                <input
                  type="number"
                  className="font-mono"
                  value={hireData.totalBudget}
                  onChange={(e) => {
                    const val = Number(e.target.value) || 0;
                    setHireData({
                      ...hireData,
                      totalBudget: val,
                      milestones: [{ ...hireData.milestones[0], amount: val }],
                    });
                  }}
                  style={{ width: '100%', padding: '9px 12px 9px 24px', borderRadius: '6px', border: '1px solid var(--border-strong)', fontSize: '0.95rem', fontWeight: 700 }}
                />
              </div>
            </div>

            <div style={{ background: 'var(--brand-surface)', border: '1px solid var(--brand-border)', borderRadius: '8px', padding: '12px 14px', marginBottom: '20px', fontSize: '0.8rem', color: '#065F46' }}>
              🛡️ <strong>Milestone Escrow Guarantee:</strong> Student freelancer will see that funds are locked before beginning work. Standard 10% platform fee applies upon release.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                className="btn-secondary-tactile"
                onClick={() => setHireModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="btn-emerald"
                onClick={handleCreateContract}
                disabled={hireLoading}
              >
                {hireLoading ? 'Generating Contract...' : 'Confirm Hire & Generate Contract'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicantsPipeline;
