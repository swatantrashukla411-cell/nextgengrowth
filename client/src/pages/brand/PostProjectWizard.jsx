import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import marketplaceApi from '../../api/marketplace';

const CATEGORIES = [
  { id: 'Video Editing', label: '🎬 Video & Reels Editing', minBudget: 2500, recBudget: 6000, desc: 'Reels, YouTube shorts, podcasts & commercial cuts' },
  { id: 'Graphic Design', label: '🎨 Graphic & Brand Identity', minBudget: 1500, recBudget: 4500, desc: 'Social carousels, pitch decks, Figma UI, logos' },
  { id: 'Web Development', label: '💻 Web Development & MVP', minBudget: 5000, recBudget: 15000, desc: 'Landing pages, Next.js / React apps, Webflow' },
  { id: 'Content Writing', label: '✍️ SEO & Copywriting', minBudget: 1200, recBudget: 3500, desc: 'Technical blogs, founder LinkedIn ghosts, sales copy' },
  { id: 'AI Tools', label: '🤖 AI Automation & Prompts', minBudget: 3000, recBudget: 8000, desc: 'Zapier, Make.com, custom GPTs, workflow automations' },
  { id: 'Social Media', label: '📱 Social Media & Growth', minBudget: 3000, recBudget: 7500, desc: 'Content calendars, community management, memes' },
];

export const PostProjectWizard = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'Video Editing',
    jobType: 'milestone_based',
    roughIdea: '',
    description: '',
    tags: ['Premiere Pro', 'Reels', 'CapCut'],
    scopeDuration: '1-2 weeks',
    deadline: '',
    budgetAmount: 6000,
    milestones: [
      { milestoneNumber: 1, title: 'Storyboards & Raw Clip Rough Cut', amount: 2500, description: 'First round review with pacing and soundtrack' },
      { milestoneNumber: 2, title: 'Final Polished Cut with Captions & Color', amount: 3500, description: 'Master 1080x1920 MP4 files + project source' },
    ],
    screeningQuestions: [
      'Share links to 1-2 viral reels or video edits you have created recently.',
      'Which video editing suite do you work in (Premiere, DaVinci, After Effects)?',
    ],
  });

  const [tagInput, setTagInput] = useState('');

  const currentCategoryMeta = CATEGORIES.find((c) => c.id === formData.category) || CATEGORIES[0];

  // AI Brief Enhancer
  const handleAiEnhance = async () => {
    if (!formData.roughIdea || formData.roughIdea.trim().length < 8) {
      setError('Please provide 1-2 rough sentences explaining what you need before invoking the brief enhancer.');
      return;
    }
    setError('');
    setAiLoading(true);
    try {
      const res = await marketplaceApi.enhanceBriefWithAI(
        formData.roughIdea,
        formData.category,
        formData.budgetAmount
      );
      if (res.data?.success && res.data.enhanced) {
        const enh = res.data.enhanced;
        setFormData((prev) => ({
          ...prev,
          title: enh.title || prev.title,
          description: enh.description || prev.description,
          tags: enh.requiredSkills?.length ? enh.requiredSkills : prev.tags,
          screeningQuestions: enh.screeningQuestions?.length ? enh.screeningQuestions : prev.screeningQuestions,
          budgetAmount: enh.suggestedBudgetINR || prev.budgetAmount,
        }));
        setSuccessMsg('✨ Professional brief draft generated and populated below.');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'AI brief generator is temporarily unavailable.');
    } finally {
      setAiLoading(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };

  const removeTag = (t) => {
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((item) => item !== t) }));
  };

  const handleMilestoneChange = (index, field, value) => {
    const updated = [...formData.milestones];
    updated[index][field] = field === 'amount' ? Number(value) || 0 : value;
    setFormData((prev) => {
      const sum = updated.reduce((acc, m) => acc + (Number(m.amount) || 0), 0);
      return { ...prev, milestones: updated, budgetAmount: sum || prev.budgetAmount };
    });
  };

  const addMilestone = () => {
    const num = formData.milestones.length + 1;
    setFormData((prev) => ({
      ...prev,
      milestones: [
        ...prev.milestones,
        { milestoneNumber: num, title: `Milestone ${num}`, amount: 2000, description: '' },
      ],
    }));
  };

  const removeMilestone = (index) => {
    if (formData.milestones.length <= 1) return;
    const updated = formData.milestones.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, milestones: updated }));
  };

  const handleQuestionChange = (index, val) => {
    const updated = [...formData.screeningQuestions];
    updated[index] = val;
    setFormData((prev) => ({ ...prev, screeningQuestions: updated }));
  };

  const addQuestion = () => {
    if (formData.screeningQuestions.length >= 3) return;
    setFormData((prev) => ({
      ...prev,
      screeningQuestions: [...prev.screeningQuestions, ''],
    }));
  };

  const removeQuestion = (index) => {
    setFormData((prev) => ({
      ...prev,
      screeningQuestions: prev.screeningQuestions.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        jobType: formData.jobType,
        budget: `₹${formData.budgetAmount.toLocaleString('en-IN')}`,
        budgetAmount: formData.budgetAmount,
        tags: formData.tags,
        scopeDuration: formData.scopeDuration,
        deadline: formData.deadline,
        screeningQuestions: formData.screeningQuestions.filter((q) => q.trim().length > 0),
      };

      const res = await marketplaceApi.postJob(payload);
      if (res.data?.success) {
        navigate('/brand-dashboard/projects');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post project.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '920px', margin: '0 auto', padding: '24px 20px 60px' }}>
      {/* Wizard Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, background: 'var(--brand-surface)', color: 'var(--brand-primary)', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
            Upwork & Contra Architecture
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            100% Escrow Protected Scope
          </span>
        </div>
        <h2 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '1.7rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
          Post a New Project Brief
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '2px' }}>
          Define deliverables with milestone escrow protection and receive vetted proposals from Indian student creators.
        </p>
      </div>

      {/* Progress Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {[
          { num: 1, label: '1. Basics & Category' },
          { num: 2, label: '2. Scope & AI Draft' },
          { num: 3, label: '3. Milestones & Budget' },
          { num: 4, label: '4. Screening & Publish' },
        ].map((s) => (
          <div
            key={s.num}
            onClick={() => setStep(s.num)}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '8px',
              cursor: 'pointer',
              background: step === s.num ? '#FFFFFF' : '#FAFAF9',
              color: step === s.num ? 'var(--text-main)' : 'var(--text-muted)',
              border: '1px solid',
              borderColor: step === s.num ? 'var(--brand-primary)' : 'var(--border-subtle)',
              borderBottom: step === s.num ? '2px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
              fontWeight: 600,
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: '8px', color: '#991B1B', marginBottom: '20px', fontSize: '0.86rem' }}>
          ⚠️ {error}
        </div>
      )}

      {successMsg && (
        <div style={{ padding: '12px 16px', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '8px', color: '#065F46', marginBottom: '20px', fontSize: '0.86rem' }}>
          {successMsg}
        </div>
      )}

      {/* STEP 1: BASICS & CATEGORY */}
      {step === 1 && (
        <div className="card-tactile" style={{ padding: '24px' }}>
          <h3 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px' }}>
            Select Project Category & Contract Architecture
          </h3>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.86rem', marginBottom: '8px', color: 'var(--text-main)' }}>
              Discipline / Category
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
              {CATEGORIES.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => setFormData({ ...formData, category: cat.id, budgetAmount: cat.recBudget })}
                  style={{
                    padding: '14px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: formData.category === cat.id ? 'var(--brand-primary)' : 'var(--border-subtle)',
                    background: formData.category === cat.id ? 'var(--brand-surface)' : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: formData.category === cat.id ? 'var(--brand-primary)' : 'var(--text-main)' }}>
                    {cat.label}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {cat.desc}
                  </div>
                  <div className="font-mono" style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 600, marginTop: '6px' }}>
                    Suggested: ₹{cat.recBudget.toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.86rem', marginBottom: '8px', color: 'var(--text-main)' }}>
              Contract Type
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              {[
                { id: 'milestone_based', title: '🛡️ Milestone Escrow', desc: 'Upfront funding per deliverable release. Highly recommended.' },
                { id: 'fixed_project', title: '🎯 Fixed Delivery', desc: 'Single turnaround scope with lump-sum release on approval.' },
                { id: 'monthly_retainer', title: '📅 Monthly Retainer', desc: '7-day paid trial leading into recurring monthly output.' },
              ].map((t) => (
                <div
                  key={t.id}
                  onClick={() => setFormData({ ...formData, jobType: t.id })}
                  style={{
                    padding: '14px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: formData.jobType === t.id ? 'var(--brand-primary)' : 'var(--border-subtle)',
                    background: formData.jobType === t.id ? 'var(--brand-surface)' : '#FFFFFF',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>{t.title}</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '3px', lineHeight: 1.4 }}>{t.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.86rem', marginBottom: '6px', color: 'var(--text-main)' }}>
              Project Headline *
            </label>
            <input
              type="text"
              placeholder="e.g. 10 Viral Reels for D2C Brand with Motion Graphics & Hindi/English Subtitles"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-strong)',
                fontSize: '0.92rem',
                fontFamily: 'var(--font-sans)',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button
              className="btn-emerald"
              onClick={() => {
                if (!formData.title) return setError('Please enter a project headline.');
                setError('');
                setStep(2);
              }}
            >
              Continue to Scope Details →
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: SCOPE & AI ASSISTANT */}
      {step === 2 && (
        <div className="card-tactile" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '1.15rem', fontWeight: 700 }}>
              Project Scope & AI Editorial Assistant
            </h3>
            <span style={{ fontSize: '0.72rem', background: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
              Gemini Pro Architect
            </span>
          </div>

          {/* AI Brief Assistant Box */}
          <div style={{ background: '#F8FAFC', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-main)', marginBottom: '4px' }}>
              ✍️ Rough project thoughts (AI will structure into a professional brief):
            </label>
            <textarea
              rows="3"
              placeholder="e.g. We have 5 raw video interviews recorded on Zoom. We need a skilled editor to clip the best 45-second moments, add bold animated captions, b-roll footage, and sound effects for Instagram & LinkedIn."
              value={formData.roughIdea}
              onChange={(e) => setFormData({ ...formData, roughIdea: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border-strong)',
                fontSize: '0.86rem',
                marginBottom: '10px',
                background: '#FFFFFF',
              }}
            />
            <button
              className="btn-emerald"
              onClick={handleAiEnhance}
              disabled={aiLoading}
              style={{ fontSize: '0.8rem', padding: '7px 14px' }}
            >
              {aiLoading ? 'Drafting Brief with Gemini...' : '⚡ Generate Editorial Brief Draft'}
            </button>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.86rem', marginBottom: '6px', color: 'var(--text-main)' }}>
              Detailed Deliverables & Guidelines *
            </label>
            <textarea
              rows="6"
              placeholder="Explain the background, specifications, format, brand references, and deliverables required..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-strong)',
                fontSize: '0.9rem',
                lineHeight: 1.5,
                background: '#FFFFFF',
              }}
            />
          </div>

          {/* Skills Tags */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.86rem', marginBottom: '6px', color: 'var(--text-main)' }}>
              Required Tool / Skills Tags
            </label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input
                type="text"
                placeholder="Add tool (e.g. Premiere Pro, Figma, After Effects)..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                style={{ flex: 1, padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--border-strong)', fontSize: '0.85rem' }}
              />
              <button type="button" onClick={addTag} className="btn-secondary-tactile" style={{ padding: '8px 14px' }}>
                + Add
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {formData.tags.map((t, idx) => (
                <span
                  key={idx}
                  style={{
                    background: '#F1F5F9',
                    color: '#334155',
                    border: '1px solid #CBD5E1',
                    padding: '3px 9px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {t}
                  <span onClick={() => removeTag(t)} style={{ cursor: 'pointer', color: '#64748B' }}>×</span>
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
            <button className="btn-secondary-tactile" onClick={() => setStep(1)}>
              ← Back
            </button>
            <button
              className="btn-emerald"
              onClick={() => {
                if (!formData.description) return setError('Please provide a project description.');
                setError('');
                setStep(3);
              }}
            >
              Milestones & Budget →
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: MILESTONES & BUDGET */}
      {step === 3 && (
        <div className="card-tactile" style={{ padding: '24px' }}>
          <h3 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px' }}>
            Milestones Breakdown & Indian Pricing Benchmark
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.86rem', marginBottom: '6px' }}>
                Total Budget (INR) *
              </label>
              <div style={{ position: 'relative' }}>
                <span className="font-mono" style={{ position: 'absolute', left: '12px', top: '10px', fontWeight: 700, color: 'var(--text-muted)' }}>₹</span>
                <input
                  type="number"
                  className="font-mono"
                  value={formData.budgetAmount}
                  onChange={(e) => setFormData({ ...formData, budgetAmount: Number(e.target.value) || 0 })}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 28px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-strong)',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                  }}
                />
              </div>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Campus benchmark for {formData.category}: ₹{currentCategoryMeta.recBudget.toLocaleString('en-IN')}
              </p>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.86rem', marginBottom: '6px' }}>
                Delivery Timeline
              </label>
              <select
                value={formData.scopeDuration}
                onChange={(e) => setFormData({ ...formData, scopeDuration: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-strong)', fontSize: '0.9rem', background: '#FFFFFF' }}
              >
                <option value="Less than 1 week">⚡ Under 1 week (Fast Turnaround)</option>
                <option value="1-2 weeks">📅 1 to 2 weeks (Standard Scope)</option>
                <option value="2-4 weeks">🗓️ 2 to 4 weeks (Comprehensive MVP)</option>
                <option value="1-3 months">🚀 1 to 3 months (Extended / Retainer)</option>
              </select>
            </div>
          </div>

          {/* Milestones Planner */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <label style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                Escrow Milestones Schedule
              </label>
              <button
                type="button"
                onClick={addMilestone}
                className="btn-secondary-tactile"
                style={{ fontSize: '0.76rem', padding: '5px 12px' }}
              >
                + Add Milestone
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {formData.milestones.map((m, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '14px',
                    background: '#FAFAF9',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span className="font-mono" style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--brand-primary)', width: '24px' }}>
                      #{idx + 1}
                    </span>
                    <input
                      type="text"
                      placeholder="Milestone Title"
                      value={m.title}
                      onChange={(e) => handleMilestoneChange(idx, 'title', e.target.value)}
                      style={{ flex: 1, padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-strong)', fontSize: '0.86rem', background: '#FFFFFF' }}
                    />
                    <div style={{ position: 'relative', width: '140px' }}>
                      <span className="font-mono" style={{ position: 'absolute', left: '8px', top: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>₹</span>
                      <input
                        type="number"
                        className="font-mono"
                        value={m.amount}
                        onChange={(e) => handleMilestoneChange(idx, 'amount', e.target.value)}
                        style={{ width: '100%', padding: '8px 10px 8px 22px', borderRadius: '6px', border: '1px solid var(--border-strong)', fontSize: '0.88rem', fontWeight: 700, background: '#FFFFFF' }}
                      />
                    </div>
                    {formData.milestones.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMilestone(idx)}
                        style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px', fontSize: '1rem' }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Deliverable specifications for this milestone..."
                    value={m.description}
                    onChange={(e) => handleMilestoneChange(idx, 'description', e.target.value)}
                    style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-subtle)', fontSize: '0.82rem', background: '#FFFFFF' }}
                  />
                </div>
              ))}
            </div>

            <div className="font-mono" style={{ marginTop: '12px', textAlign: 'right', fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Sum: ₹{formData.milestones.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0).toLocaleString('en-IN')}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
            <button className="btn-secondary-tactile" onClick={() => setStep(2)}>
              ← Back
            </button>
            <button className="btn-emerald" onClick={() => setStep(4)}>
              Screening & Review →
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: SCREENING & REVIEW */}
      {step === 4 && (
        <div className="card-tactile" style={{ padding: '24px' }}>
          <h3 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px' }}>
            Candidate Screening & Final Verification
          </h3>

          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>
                Screening Questions (Up to 3)
              </label>
              {formData.screeningQuestions.length < 3 && (
                <button
                  type="button"
                  onClick={addQuestion}
                  className="btn-secondary-tactile"
                  style={{ fontSize: '0.74rem', padding: '4px 10px' }}
                >
                  + Add Question
                </button>
              )}
            </div>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
              Applicants must answer these to test relevant experience, software proficiency, and turnaround availability.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {formData.screeningQuestions.map((q, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span className="font-mono" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', width: '24px' }}>
                    Q{idx + 1}
                  </span>
                  <input
                    type="text"
                    value={q}
                    onChange={(e) => handleQuestionChange(idx, e.target.value)}
                    style={{ flex: 1, padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--border-strong)', fontSize: '0.86rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => removeQuestion(idx)}
                    style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '1.1rem' }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Project Summary Review Box */}
          <div style={{ background: '#FAFAF9', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '16px', marginBottom: '24px' }}>
            <div style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--text-main)', marginBottom: '4px' }}>
              {formData.title}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--brand-primary)', fontWeight: 600, marginBottom: '8px', display: 'flex', gap: '8px' }}>
              <span>{formData.category}</span>
              <span>•</span>
              <span className="font-mono">Budget: ₹{formData.budgetAmount.toLocaleString('en-IN')}</span>
              <span>•</span>
              <span>{formData.scopeDuration}</span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.45, maxHeight: '72px', overflow: 'hidden', margin: 0 }}>
              {formData.description}
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
            <button className="btn-secondary-tactile" onClick={() => setStep(3)}>
              ← Back
            </button>
            <button className="btn-emerald" onClick={handleSubmit} disabled={loading} style={{ padding: '11px 24px', fontSize: '0.92rem' }}>
              {loading ? 'Publishing Brief...' : '🚀 Publish Project & Receive Proposals'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostProjectWizard;
