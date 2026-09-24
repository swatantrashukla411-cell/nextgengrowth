import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import marketplaceApi from '../api/marketplace';
import API from '../api/client';

export const BrandDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    activeJobs: 0,
    activeContracts: 0,
    inEscrow: 0,
    totalProposals: 0,
  });
  const [recentContracts, setRecentContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const [contractsRes, projectsRes] = await Promise.all([
          marketplaceApi.getBrandContracts().catch(() => ({ data: { contracts: [] } })),
          API.get('/api/brand/projects').catch(() => ({ data: { projects: [] } })),
        ]);

        const contracts = contractsRes.data?.contracts || [];
        const projects = projectsRes.data?.projects || projectsRes.data?.jobs || [];

        let escrowSum = 0;
        contracts.forEach((c) => {
          c.milestones?.forEach((m) => {
            if (m.escrowStatus === 'funded') escrowSum += Number(m.amount || 0);
          });
        });

        setRecentContracts(contracts.slice(0, 4));
        setStats({
          activeJobs: projects.filter((p) => p.status === 'open').length,
          activeContracts: contracts.filter((c) => c.status === 'active').length,
          inEscrow: escrowSum,
          totalProposals: 0,
        });
      } catch (err) {
        console.error('Error loading dashboard overview:', err);
      } finally {
        setLoading(false);
      }
    };
    loadOverview();
  }, []);

  return (
    <div style={{ padding: '24px 28px 60px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Editorial Header Banner */}
      <div
        className="card-tactile"
        style={{
          padding: '24px 28px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '18px',
          background: '#FFFFFF',
          borderLeft: '4px solid var(--brand-primary)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, background: 'var(--brand-surface)', color: 'var(--brand-primary)', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Client Workspace
            </span>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Verified Indian Campus Talent Network (DU, IIT, BITS, VIT)
            </span>
          </div>

          <h1 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: '0 0 4px' }}>
            {user?.companyName ? `${user.companyName}` : `Welcome, ${user?.firstName}!`}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0, maxWidth: '640px' }}>
            Manage scopes of work, review student portfolios in your comparison pipeline, and fund milestone escrow with 100% dispute protection.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => navigate('/brand-dashboard/post')}
            className="btn-emerald"
          >
            + Post Project Brief
          </button>
          <button
            onClick={() => navigate('/brand-dashboard/applications')}
            className="btn-secondary-tactile"
          >
            Applicant Pipeline →
          </button>
        </div>
      </div>

      {/* Metrics Row (High Information Density with Monospace Figures) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div className="card-tactile" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
            Active Open Scopes
          </div>
          <div className="font-mono" style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>
            {stats.activeJobs}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 500, marginTop: '4px' }}>
            Accepting student proposals
          </div>
        </div>

        <div className="card-tactile" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
            Active Contracts
          </div>
          <div className="font-mono" style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>
            {stats.activeContracts}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 500, marginTop: '4px' }}>
            Hired student talent
          </div>
        </div>

        <div className="card-tactile" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
            Secured in Escrow
          </div>
          <div className="font-mono" style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--escrow-locked-text)', marginTop: '4px' }}>
            ₹{stats.inEscrow.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '4px' }}>
            Held safely until review approval
          </div>
        </div>

        <div className="card-tactile" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
            Review Window
          </div>
          <div className="font-mono" style={{ fontSize: '1.45rem', fontWeight: 700, color: '#047857', marginTop: '7px' }}>
            7 Days Policy
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '4px' }}>
            Dispute-proof automatic protection
          </div>
        </div>
      </div>

      {/* Main Grid: Contracts & Workspace Quick Launcher */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '22px' }}>
        {/* Left Column: Active Contracts & Workspaces */}
        <div className="card-tactile" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Active Milestone Workspaces
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: '2px 0 0' }}>
                Track student submissions, fund milestone escrow, or approve deliverables.
              </p>
            </div>
            <Link to="/brand-dashboard/projects" style={{ fontSize: '0.8rem', color: 'var(--brand-primary)', fontWeight: 600, textDecoration: 'none' }}>
              View all ({recentContracts.length}) →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentContracts.map((c) => {
              const student = c.studentId || {};
              const pendingReview = c.milestones?.find((m) => m.workStatus === 'submitted');
              const unfunded = c.milestones?.find((m) => m.escrowStatus === 'unfunded');

              return (
                <div
                  key={c._id}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    background: '#FAFAF9',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '10px',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                      {c.title}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>Freelancer: <strong>{student.firstName} {student.lastName}</strong></span>
                      {student.college && <span className="chip-college">{student.college}</span>}
                      <span>•</span>
                      <span className="font-mono">₹{c.totalBudget?.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {pendingReview && (
                      <span className="chip-escrow-locked">
                        ● Submission to Review
                      </span>
                    )}
                    {unfunded && (
                      <span style={{ background: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5', fontSize: '0.7rem', fontWeight: 600, padding: '3px 8px', borderRadius: '4px' }}>
                        Funding Needed
                      </span>
                    )}
                    <button
                      onClick={() => navigate('/brand-dashboard/projects')}
                      className="btn-secondary-tactile"
                      style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                    >
                      Workspace →
                    </button>
                  </div>
                </div>
              );
            })}

            {recentContracts.length === 0 && (
              <div style={{ textAlign: 'center', padding: '36px 10px', color: 'var(--text-subtle)', fontSize: '0.85rem' }}>
                No active contracts yet. Post a brief or review applicant proposals to hire talent.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Workflow Actions & Verified Campus Proof */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card-tactile" style={{ padding: '20px' }}>
            <h4 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '0.95rem', fontWeight: 700, marginBottom: '14px' }}>
              Marketplace Workflows
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => navigate('/brand-dashboard/post')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '11px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  background: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span>🚀 Post a Project Brief</span>
                <span style={{ color: 'var(--text-subtle)' }}>→</span>
              </button>

              <button
                onClick={() => navigate('/brand-dashboard/applications')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '11px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  background: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span>👥 Applicants Comparison Pipeline</span>
                <span style={{ color: 'var(--text-subtle)' }}>→</span>
              </button>

              <button
                onClick={() => navigate('/brand-dashboard/projects')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '11px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  background: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span>🛡️ Escrow Contracts & Approvals</span>
                <span style={{ color: 'var(--text-subtle)' }}>→</span>
              </button>

              <button
                onClick={() => navigate('/brand-dashboard/invoices')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '11px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  background: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span>🧾 GST Tax Invoices</span>
                <span style={{ color: 'var(--text-subtle)' }}>→</span>
              </button>
            </div>
          </div>

          {/* Real Indian Campus Social Proof Box */}
          <div
            className="card-tactile"
            style={{
              padding: '18px 20px',
              background: '#FFFFFF',
              borderLeft: '3px solid #059669',
            }}
          >
            <div style={{ fontWeight: 700, fontSize: '0.84rem', color: '#0F172A', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🇮🇳</span> Authentic Campus Creators
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.45, margin: '0 0 10px' }}>
              Over <strong>5,000+</strong> student creators from premier colleges across Delhi University, IITs, BITS, and VIT are active with verified portfolio proof.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              <span className="chip-college">Hansraj, DU</span>
              <span className="chip-college">IIT Delhi</span>
              <span className="chip-college">VIT Vellore</span>
              <span className="chip-college">NID</span>
              <span className="chip-college">SRCC</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandDashboard;
