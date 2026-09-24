import React, { useState, useEffect } from 'react';
import marketplaceApi from '../../api/marketplace';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES = [
  'All',
  'Video Editing',
  'Graphic Design',
  'Web Development',
  'Content Writing',
  'AI Tools',
  'Social Media',
];

export const OpportunityFeed = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedJobType, setSelectedJobType] = useState('all');
  const [search, setSearch] = useState('');
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');

  // Proposal modal state
  const [proposalModalOpen, setProposalModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [proposalData, setProposalData] = useState({
    bidAmount: '',
    estimatedDays: '',
    coverLetter: '',
    workSamples: [{ title: '', url: '' }],
    answers: [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedJobType !== 'all') params.jobType = selectedJobType;
      if (search) params.search = search;
      if (minBudget) params.minBudget = minBudget;
      if (maxBudget) params.maxBudget = maxBudget;

      const res = await marketplaceApi.getJobsFeed(params);
      if (res.data?.success) {
        setJobs(res.data.jobs || []);
      }
    } catch (err) {
      console.error('Fetch feed error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [selectedCategory, selectedJobType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const openProposalModal = (job) => {
    setSelectedJob(job);
    const questions = job.screeningQuestions || job.applicationQuestions || [];
    setProposalData({
      bidAmount: job.budgetAmount || 3000,
      estimatedDays: 4,
      coverLetter: '',
      workSamples: user?.portfolioLink ? [{ title: 'Primary Portfolio', url: user.portfolioLink }] : [{ title: '', url: '' }],
      answers: questions.map((q) => ({ question: q, answer: '' })),
    });
    setErrorMsg('');
    setProposalModalOpen(true);
  };

  const handleAddSample = () => {
    if (proposalData.workSamples.length >= 4) return;
    setProposalData((prev) => ({
      ...prev,
      workSamples: [...prev.workSamples, { title: '', url: '' }],
    }));
  };

  const handleRemoveSample = (index) => {
    setProposalData((prev) => ({
      ...prev,
      workSamples: prev.workSamples.filter((_, i) => i !== index),
    }));
  };

  const handleSubmitProposal = async () => {
    if (!proposalData.bidAmount || !proposalData.estimatedDays || !proposalData.coverLetter.trim()) {
      setErrorMsg('Please enter your bid amount, delivery timeline, and a clear cover pitch.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await marketplaceApi.submitProposal({
        jobId: selectedJob._id,
        bidAmount: Number(proposalData.bidAmount),
        estimatedDays: Number(proposalData.estimatedDays),
        coverLetter: proposalData.coverLetter,
        workSamples: proposalData.workSamples.filter((s) => s.url.trim().length > 0),
        answers: proposalData.answers,
      });

      if (res.data?.success) {
        setProposalModalOpen(false);
        setSuccessMsg('🎉 Proposal submitted successfully! Track live status in "Proposals Tracker".');
        setTimeout(() => setSuccessMsg(''), 6000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit proposal.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '28px 24px 64px', maxWidth: '1180px', margin: '0 auto' }}>
      {/* Feed Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
          <span>●</span> Campus Talent Marketplace
        </div>
        <h1 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.025em', margin: 0 }}>
          Opportunity Feed
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
          Browse verified brand projects with guaranteed milestone escrow funding in INR.
        </p>
      </div>

      {successMsg && (
        <div style={{ padding: '14px 18px', background: '#ecfdf5', border: '1px solid #34d399', borderRadius: '10px', color: '#065f46', marginBottom: '22px', fontWeight: 600, fontSize: '0.9rem' }}>
          {successMsg}
        </div>
      )}

      {/* Filter Bar */}
      <div className="card-tactile" style={{ padding: '18px 22px', marginBottom: '28px' }}>
        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '14px', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '6px 16px',
                borderRadius: '100px',
                border: '1px solid',
                borderColor: selectedCategory === cat ? 'var(--brand-primary)' : 'var(--border-subtle)',
                background: selectedCategory === cat ? 'var(--brand-surface)' : '#ffffff',
                color: selectedCategory === cat ? 'var(--brand-primary-hover)' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search & Secondary Filters */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search keywords (e.g. reels, figma, saas)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: '1 1 240px', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-strong)', fontSize: '0.88rem', background: '#ffffff', color: 'var(--text-main)' }}
          />

          <select
            value={selectedJobType}
            onChange={(e) => setSelectedJobType(e.target.value)}
            style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-strong)', fontSize: '0.85rem', background: '#ffffff', color: 'var(--text-main)' }}
          >
            <option value="all">All Contract Types</option>
            <option value="fixed_project">Fixed Project</option>
            <option value="milestone_based">Milestone Escrow</option>
            <option value="monthly_retainer">Monthly Retainer</option>
          </select>

          <input
            type="number"
            placeholder="Min ₹"
            value={minBudget}
            onChange={(e) => setMinBudget(e.target.value)}
            className="font-mono"
            style={{ width: '96px', padding: '9px 10px', borderRadius: '8px', border: '1px solid var(--border-strong)', fontSize: '0.85rem', background: '#ffffff', color: 'var(--text-main)' }}
          />

          <input
            type="number"
            placeholder="Max ₹"
            value={maxBudget}
            onChange={(e) => setMaxBudget(e.target.value)}
            className="font-mono"
            style={{ width: '96px', padding: '9px 10px', borderRadius: '8px', border: '1px solid var(--border-strong)', fontSize: '0.85rem', background: '#ffffff', color: 'var(--text-main)' }}
          />

          <button type="submit" className="btn-emerald" style={{ padding: '9px 18px', fontSize: '0.85rem' }}>
            Filter Feed
          </button>
        </form>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          Searching opportunities...
        </div>
      )}

      {/* Jobs Feed Grid */}
      {!loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {jobs.map((job) => (
            <div
              key={job._id}
              className="card-tactile"
              style={{
                padding: '24px 26px',
                background: '#ffffff',
                transition: 'border-color 0.2s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, background: 'var(--brand-surface)', color: 'var(--brand-primary)', border: '1px solid var(--brand-border)', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                      {job.category}
                    </span>
                    <span style={{ fontSize: '0.72rem', background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                      {job.jobType ? job.jobType.replace('_', ' ') : 'Fixed'}
                    </span>
                    {job.deadline && (
                      <span className="font-mono" style={{ fontSize: '0.72rem', color: '#b45309', background: '#fef3c7', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                        ⏰ Deadline: {job.deadline}
                      </span>
                    )}
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
                    {job.title}
                  </h3>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Posted by <strong>{job.brandName || 'Verified Brand'}</strong> • Est. Scope: {job.scopeDuration || '1-2 weeks'}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div className="font-mono" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--brand-primary)' }}>
                    {job.budget?.startsWith('₹') ? job.budget : `₹${job.budget}`}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>Guaranteed Escrow</div>
                </div>
              </div>

              {/* Description Snippet */}
              <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.5, marginBottom: '16px' }}>
                {job.description}
              </p>

              {/* Tags and Action */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {job.tags?.map((t, idx) => (
                    <span key={idx} style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.75rem', padding: '3px 8px', borderRadius: '4px', fontWeight: 500 }}>
                      #{t}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => openProposalModal(job)}
                  className="btn-emerald"
                  style={{ padding: '8px 18px', fontSize: '0.85rem' }}
                >
                  Apply & Submit Proposal →
                </button>
              </div>
            </div>
          ))}

          {jobs.length === 0 && (
            <div className="card-tactile" style={{ padding: '54px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔍</div>
              <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.1rem', color: 'var(--text-main)', margin: 0 }}>No Opportunities Match Your Criteria</h4>
              <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>Try switching categories or clearing search filters.</p>
            </div>
          )}
        </div>
      )}

      {/* PROPOSAL SUBMISSION MODAL */}
      {proposalModalOpen && selectedJob && (
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
              maxWidth: '680px',
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              padding: '32px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px', marginBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '0.72rem', background: 'var(--brand-surface)', color: 'var(--brand-primary)', border: '1px solid var(--brand-border)', padding: '3px 8px', borderRadius: '4px', fontWeight: 700, textTransform: 'uppercase' }}>
                  Project Proposal & Pitch
                </span>
                <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '8px', letterSpacing: '-0.02em' }}>
                  {selectedJob.title}
                </h3>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Brand Budget: <strong className="font-mono" style={{ color: 'var(--text-main)' }}>{selectedJob.budget}</strong>
                </div>
              </div>
              <button onClick={() => setProposalModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}>
                ✕
              </button>
            </div>

            {errorMsg && (
              <div style={{ padding: '10px 14px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px' }}>
                ⚠️ {errorMsg}
              </div>
            )}

            {/* Bid and Timeline */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-main)' }}>
                  Your Bid Amount (INR) *
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '10px', fontWeight: 700, color: 'var(--text-muted)' }}>₹</span>
                  <input
                    type="number"
                    value={proposalData.bidAmount}
                    onChange={(e) => setProposalData({ ...proposalData, bidAmount: e.target.value })}
                    className="font-mono"
                    style={{ width: '100%', padding: '10px 12px 10px 26px', borderRadius: '8px', border: '1px solid var(--border-strong)', fontSize: '1rem', fontWeight: 700 }}
                  />
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  10% facilitation fee deducted on milestone release (Net: <span className="font-mono" style={{ fontWeight: 600, color: 'var(--brand-primary)' }}>₹{Math.round((Number(proposalData.bidAmount) || 0) * 0.9).toLocaleString('en-IN')}</span>)
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-main)' }}>
                  Delivery Timeline (Days) *
                </label>
                <input
                  type="number"
                  placeholder="e.g. 4"
                  value={proposalData.estimatedDays}
                  onChange={(e) => setProposalData({ ...proposalData, estimatedDays: e.target.value })}
                  className="font-mono"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-strong)', fontSize: '0.95rem' }}
                />
              </div>
            </div>

            {/* Cover Pitch */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-main)' }}>
                Cover Letter / Pitch *
              </label>
              <textarea
                rows="4"
                placeholder="Explain why you are the best student creator for this scope. Highlight similar deliverables completed and relevant tools..."
                value={proposalData.coverLetter}
                onChange={(e) => setProposalData({ ...proposalData, coverLetter: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-strong)', fontSize: '0.88rem', lineHeight: 1.5, fontFamily: 'inherit' }}
              />
            </div>

            {/* Screening Questions */}
            {proposalData.answers?.length > 0 && (
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', marginBottom: '8px', color: 'var(--text-main)' }}>
                  Screening Questions from Brand:
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {proposalData.answers.map((ans, idx) => (
                    <div key={idx}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                        Q: {ans.question}
                      </div>
                      <input
                        type="text"
                        placeholder="Your answer..."
                        value={ans.answer}
                        onChange={(e) => {
                          const updated = [...proposalData.answers];
                          updated[idx].answer = e.target.value;
                          setProposalData({ ...proposalData, answers: updated });
                        }}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-strong)', fontSize: '0.85rem' }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Work Samples */}
            <div style={{ marginBottom: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-main)' }}>
                  Relevant Work Samples / Portfolio Links
                </label>
                {proposalData.workSamples.length < 4 && (
                  <button
                    type="button"
                    onClick={handleAddSample}
                    style={{ background: 'none', border: 'none', color: 'var(--brand-primary)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    + Add Link
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {proposalData.workSamples.map((s, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="Title (e.g. Figma Prototype)"
                      value={s.title}
                      onChange={(e) => {
                        const updated = [...proposalData.workSamples];
                        updated[idx].title = e.target.value;
                        setProposalData({ ...proposalData, workSamples: updated });
                      }}
                      style={{ width: '35%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-strong)', fontSize: '0.82rem' }}
                    />
                    <input
                      type="url"
                      placeholder="https://drive.google.com/... or https://github.com/..."
                      value={s.url}
                      onChange={(e) => {
                        const updated = [...proposalData.workSamples];
                        updated[idx].url = e.target.value;
                        setProposalData({ ...proposalData, workSamples: updated });
                      }}
                      style={{ flex: 1, padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-strong)', fontSize: '0.82rem' }}
                    />
                    {proposalData.workSamples.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSample(idx)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1rem', padding: '0 4px' }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                className="btn-secondary-tactile"
                onClick={() => setProposalModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="btn-emerald"
                onClick={handleSubmitProposal}
                disabled={submitting}
              >
                {submitting ? 'Submitting Proposal...' : '🚀 Submit Proposal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpportunityFeed;
