import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import marketplaceApi from '../api/marketplace';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [wallet, setWallet] = useState({ availableBalance: 0, pendingBalance: 0, lifetimeEarned: 0 });
  const [escrowLocked, setEscrowLocked] = useState(0);
  const [activeContracts, setActiveContracts] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const [walletRes, contractsRes, proposalsRes] = await Promise.all([
          marketplaceApi.getStudentWallet().catch(() => ({ data: {} })),
          marketplaceApi.getStudentContracts().catch(() => ({ data: { contracts: [] } })),
          marketplaceApi.getStudentProposals().catch(() => ({ data: { proposals: [] } })),
        ]);

        if (walletRes.data?.success) {
          setWallet(walletRes.data.wallet || {});
          setEscrowLocked(walletRes.data.escrowLocked || 0);
        }
        setActiveContracts(contractsRes.data?.contracts || []);
        setProposals(proposalsRes.data?.proposals || []);
      } catch (err) {
        console.error('Student dashboard overview load error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadOverview();
  }, []);

  const badge = user?.studentBadge || 'beginner';

  return (
    <div style={{ padding: '28px 24px 64px', maxWidth: '1180px', margin: '0 auto' }}>
      {/* Editorial Welcome Banner */}
      <div
        className="card-tactile"
        style={{
          padding: '28px 32px',
          background: '#ffffff',
          marginBottom: '28px',
          borderLeft: '4px solid var(--brand-primary)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--brand-surface)', color: 'var(--brand-primary)', border: '1px solid var(--brand-border)', padding: '4px 12px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
              <span>●</span> Student Freelancer Hub • Verified Campus Talent
            </div>
            <h1 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em', margin: '0 0 6px' }}>
              Welcome back, {user?.firstName || 'Creator'}!
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '640px', margin: 0, lineHeight: 1.5 }}>
              Apply to verified brand projects with guaranteed milestone escrow funding, submit deliverables with 7-day auto-release protection, and withdraw earnings directly to UPI or Bank.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/dashboard/jobs')}
              className="btn-emerald"
            >
              Browse Opportunities →
            </button>
            <button
              onClick={() => navigate('/dashboard/earnings')}
              className="btn-secondary-tactile"
            >
              Withdraw Payout
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div className="card-tactile" style={{ padding: '20px', borderLeft: '3px solid var(--brand-primary)' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--brand-primary-hover)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Available for Payout
          </div>
          <div className="font-mono" style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--brand-primary)', marginTop: '6px' }}>
            ₹{wallet.availableBalance?.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Instant UPI VPA / Bank transfer
          </div>
        </div>

        <div className="card-tactile" style={{ padding: '20px', borderLeft: '3px solid #f59e0b' }}>
          <div style={{ fontSize: '0.78rem', color: '#b45309', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Funds in Escrow (Locked)
          </div>
          <div className="font-mono" style={{ fontSize: '1.85rem', fontWeight: 800, color: '#b45309', marginTop: '6px' }}>
            ₹{(wallet.pendingBalance || escrowLocked).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#92400e', marginTop: '4px' }}>
            Secured by hiring brands
          </div>
        </div>

        <div className="card-tactile" style={{ padding: '20px', borderLeft: '3px solid #6366f1' }}>
          <div style={{ fontSize: '0.78rem', color: '#4f46e5', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Lifetime Earned
          </div>
          <div className="font-mono" style={{ fontSize: '1.85rem', fontWeight: 800, color: '#4338ca', marginTop: '6px' }}>
            ₹{wallet.lifetimeEarned?.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Total milestone payouts received
          </div>
        </div>

        <div className="card-tactile" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Talent Badge Level
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
            <span style={{ fontSize: '1.3rem' }}>
              {badge === 'top-rated' ? '🏆' : badge === 'verified' ? '🛡️' : '🌱'}
            </span>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {badge === 'top-rated' ? 'Top Rated' : badge === 'verified' ? 'Verified' : 'Starter'}
            </span>
          </div>
          <Link to="/dashboard/profile" style={{ fontSize: '0.75rem', color: 'var(--brand-primary)', marginTop: '6px', display: 'inline-block', textDecoration: 'none', fontWeight: 600 }}>
            View Skill Compass & Badges →
          </Link>
        </div>
      </div>

      {/* Main Grid: Active Deliverables & Submitted Proposals */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Left: Active Contracts Workspaces */}
        <div className="card-tactile" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', paddingBottom: '14px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Active Contracts & Workspaces
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '2px 0 0' }}>
                Track milestone progress and deliverables review
              </p>
            </div>
            <Link to="/dashboard/workspaces" style={{ fontSize: '0.82rem', color: 'var(--brand-primary)', fontWeight: 600, textDecoration: 'none' }}>
              View all ({activeContracts.length}) →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activeContracts.slice(0, 3).map((c) => {
              const pendingSubmission = c.milestones?.find((m) => m.escrowStatus === 'funded' && m.workStatus !== 'approved');

              return (
                <div
                  key={c._id}
                  style={{
                    padding: '16px 18px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-subtle)',
                    background: '#f8fafc',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                      {c.title}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                      Client: <strong>{c.brandId?.companyName || 'Verified Brand'}</strong> • Total Budget:{' '}
                      <span className="font-mono" style={{ fontWeight: 700, color: 'var(--text-main)' }}>₹{c.totalBudget?.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {pendingSubmission && (
                      <span className="chip-escrow-locked">
                        <span>🔒</span> Milestone #{pendingSubmission.milestoneNumber} Funded
                      </span>
                    )}
                    <button
                      onClick={() => navigate('/dashboard/workspaces')}
                      className="btn-emerald"
                      style={{ padding: '6px 14px', fontSize: '0.78rem' }}
                    >
                      Workspace →
                    </button>
                  </div>
                </div>
              );
            })}

            {activeContracts.length === 0 && (
              <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                <div style={{ fontSize: '1.4rem', marginBottom: '6px' }}>📁</div>
                <div style={{ fontWeight: 600 }}>No active contracts currently</div>
                <div style={{ fontSize: '0.8rem', marginTop: '2px' }}>
                  Submit proposals to projects in your opportunity feed to get contracted!
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Quick Links & Recent Proposals */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card-tactile" style={{ padding: '22px' }}>
            <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Hub Navigation
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => navigate('/dashboard/jobs')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '11px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  background: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: 'var(--text-main)',
                  transition: 'background 0.15s, border-color 0.15s',
                }}
              >
                <span>🎯</span> Opportunity Feed
              </button>

              <button
                onClick={() => navigate('/dashboard/applications')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '11px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  background: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: 'var(--text-main)',
                }}
              >
                <span>📤</span> Proposals Tracker ({proposals.length})
              </button>

              <button
                onClick={() => navigate('/dashboard/workspaces')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '11px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  background: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: 'var(--text-main)',
                }}
              >
                <span>💻</span> Active Projects & Submissions
              </button>

              <button
                onClick={() => navigate('/dashboard/earnings')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '11px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  background: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: 'var(--text-main)',
                }}
              >
                <span>💸</span> Earnings & Instant Payouts
              </button>

              <button
                onClick={() => navigate('/dashboard/profile')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '11px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  background: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: 'var(--text-main)',
                }}
              >
                <span>🌟</span> Profile & Verification Hub
              </button>
            </div>
          </div>

          {/* Escrow Guarantee Box */}
          <div
            className="card-tactile"
            style={{
              padding: '20px',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, fontSize: '0.88rem', color: '#166534', marginBottom: '6px' }}>
              <span>🛡️</span> Escrow Guarantee for Students
            </div>
            <p style={{ fontSize: '0.82rem', color: '#15803d', lineHeight: 1.45, margin: 0 }}>
              Never work without secured escrow! On NextGenGrowth, brands fund milestones upfront in INR, and funds are dispute-protected with a 7-day auto-release timer upon deliverable submission.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
