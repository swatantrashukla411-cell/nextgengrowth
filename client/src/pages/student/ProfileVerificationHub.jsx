import React, { useState, useEffect } from 'react';
import marketplaceApi from '../../api/marketplace';

export const ProfileVerificationHub = () => {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    college: '',
    headline: '',
    bio: '',
    skills: [],
    linkedin: '',
    github: '',
    behance: '',
    portfolioLink: '',
    workSamples: [],
    studentBadge: 'beginner',
    verificationStatus: 'not_applied',
  });
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await marketplaceApi.getStudentProfileHub();
        if (res.data?.success && res.data.profile) {
          const p = res.data.profile;
          setProfile({
            firstName: p.firstName || '',
            lastName: p.lastName || '',
            email: p.email || '',
            college: p.college || '',
            headline: p.headline || '',
            bio: p.bio || '',
            skills: p.skills || [],
            linkedin: p.linkedin || '',
            github: p.github || '',
            behance: p.behance || '',
            portfolioLink: p.portfolioLink || '',
            workSamples: p.workSamples?.length
              ? p.workSamples
              : [{ title: '', category: 'Creative', link: '', description: '' }],
            studentBadge: p.studentBadge || 'beginner',
            verificationStatus: p.verificationStatus || 'not_applied',
          });
        }
      } catch (err) {
        console.error('Fetch profile hub error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const calculateCompleteness = () => {
    let score = 20;
    if (profile.skills?.length >= 3) score += 20;
    if (profile.college) score += 15;
    if (profile.headline) score += 10;
    if (profile.bio) score += 10;
    if (profile.portfolioLink || profile.github || profile.behance) score += 15;
    if (profile.workSamples?.filter((s) => s.link).length > 0) score += 10;
    return Math.min(100, score);
  };

  const addSkill = () => {
    if (skillInput.trim() && !profile.skills.includes(skillInput.trim())) {
      setProfile((prev) => ({ ...prev, skills: [...prev.skills, skillInput.trim()] }));
      setSkillInput('');
    }
  };

  const removeSkill = (s) => {
    setProfile((prev) => ({ ...prev, skills: prev.skills.filter((item) => item !== s) }));
  };

  const handleSampleChange = (index, field, value) => {
    const updated = [...profile.workSamples];
    updated[index][field] = value;
    setProfile((prev) => ({ ...prev, workSamples: updated }));
  };

  const addWorkSample = () => {
    if (profile.workSamples.length >= 4) return;
    setProfile((prev) => ({
      ...prev,
      workSamples: [...prev.workSamples, { title: '', category: 'Design', link: '', description: '' }],
    }));
  };

  const removeWorkSample = (index) => {
    setProfile((prev) => ({
      ...prev,
      workSamples: prev.workSamples.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await marketplaceApi.updateStudentProfileHub(profile);
      if (res.data?.success) {
        setSuccessMsg('✅ Profile & Portfolio showcase saved successfully!');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const completeness = calculateCompleteness();

  return (
    <div style={{ padding: '28px 24px 64px', maxWidth: '1080px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
          <span>●</span> Creator Reputation & Proof-of-Work
        </div>
        <h1 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.025em', margin: 0 }}>
          Profile & Verification Hub
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
          Showcase your top 4 proof-of-work samples, verify GitHub / Behance / LinkedIn links, and upgrade your badge tier.
        </p>
      </div>

      {successMsg && (
        <div style={{ padding: '14px 18px', background: '#ecfdf5', border: '1px solid #34d399', borderRadius: '10px', color: '#065f46', marginBottom: '22px', fontWeight: 600, fontSize: '0.9rem' }}>
          {successMsg}
        </div>
      )}

      {/* Top Banner: Badge Tier & Completeness */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '28px' }}>
        {/* Badge Tier Card */}
        <div className="card-tactile" style={{ padding: '22px', display: 'flex', alignItems: 'center', gap: '20px', background: '#ffffff' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '14px',
              background: profile.studentBadge === 'top-rated' ? '#fef3c7' : profile.studentBadge === 'verified' ? '#dbeafe' : '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.8rem',
              flexShrink: 0,
            }}
          >
            {profile.studentBadge === 'top-rated' ? '🏆' : profile.studentBadge === 'verified' ? '🛡️' : '🌱'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                {profile.studentBadge === 'top-rated' ? 'Top-Rated Talent' : profile.studentBadge === 'verified' ? 'Verified Talent' : 'Starter Profile'}
              </h3>
              <span className="font-mono" style={{ fontSize: '0.72rem', background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, textTransform: 'uppercase' }}>
                Tier Level
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.45, margin: '4px 0 0' }}>
              {profile.studentBadge === 'top-rated'
                ? 'High-reputation freelancer with consistent 5-star milestone deliveries.'
                : profile.studentBadge === 'verified'
                ? 'Portfolio and skills vetted by NextGenGrowth moderators.'
                : 'Complete your top 4 samples and add portfolio verifications to upgrade to Verified tier.'}
            </p>
          </div>
        </div>

        {/* Profile Completeness Card */}
        <div className="card-tactile" style={{ padding: '22px', textAlign: 'center', background: '#ffffff' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Profile Completeness
          </div>
          <div className="font-mono" style={{ fontSize: '2.1rem', fontWeight: 800, color: completeness >= 80 ? 'var(--brand-primary)' : '#2563eb', marginTop: '4px' }}>
            {completeness}%
          </div>
          <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '100px', marginTop: '10px', overflow: 'hidden' }}>
            <div style={{ width: `${completeness}%`, height: '100%', background: 'var(--brand-primary)', borderRadius: '100px', transition: 'width 0.5s ease' }} />
          </div>
        </div>
      </div>

      {/* Main Edit Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Bio & Socials */}
        <div className="card-tactile" style={{ padding: '26px 28px', background: '#ffffff' }}>
          <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '18px' }}>
            Personal Pitch & Social Verifications
          </h3>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-main)' }}>
              Professional Headline
            </label>
            <input
              type="text"
              placeholder="e.g. Video Editor & 3D Motion Designer | IIT Bombay"
              value={profile.headline}
              onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-strong)', fontSize: '0.9rem' }}
            />
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-main)' }}>
              About You / Creator Bio
            </label>
            <textarea
              rows="3"
              placeholder="Highlight your primary skills, tools (Premiere, Figma, Next.js), and what makes you reliable..."
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-strong)', fontSize: '0.88rem', lineHeight: 1.5, fontFamily: 'inherit' }}
            />
          </div>

          {/* Social Links Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', marginBottom: '4px', color: 'var(--text-main)' }}>
                GitHub Profile URL
              </label>
              <input
                type="url"
                placeholder="https://github.com/..."
                value={profile.github}
                onChange={(e) => setProfile({ ...profile, github: e.target.value })}
                style={{ width: '100%', padding: '9px 10px', borderRadius: '6px', border: '1px solid var(--border-strong)', fontSize: '0.85rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', marginBottom: '4px', color: 'var(--text-main)' }}>
                Behance / Dribbble URL
              </label>
              <input
                type="url"
                placeholder="https://behance.net/..."
                value={profile.behance}
                onChange={(e) => setProfile({ ...profile, behance: e.target.value })}
                style={{ width: '100%', padding: '9px 10px', borderRadius: '6px', border: '1px solid var(--border-strong)', fontSize: '0.85rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', marginBottom: '4px', color: 'var(--text-main)' }}>
                LinkedIn Profile URL
              </label>
              <input
                type="url"
                placeholder="https://linkedin.com/in/..."
                value={profile.linkedin}
                onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                style={{ width: '100%', padding: '9px 10px', borderRadius: '6px', border: '1px solid var(--border-strong)', fontSize: '0.85rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', marginBottom: '4px', color: 'var(--text-main)' }}>
                Personal Portfolio / Drive
              </label>
              <input
                type="url"
                placeholder="https://yourportfolio.com"
                value={profile.portfolioLink}
                onChange={(e) => setProfile({ ...profile, portfolioLink: e.target.value })}
                style={{ width: '100%', padding: '9px 10px', borderRadius: '6px', border: '1px solid var(--border-strong)', fontSize: '0.85rem' }}
              />
            </div>
          </div>
        </div>

        {/* Top 4 Work Samples Showcase */}
        <div className="card-tactile" style={{ padding: '26px 28px', background: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Top 4 Portfolio Showcase
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '2px' }}>
                These samples are presented to brands in the comparison pipeline.
              </p>
            </div>
            {profile.workSamples.length < 4 && (
              <button
                type="button"
                onClick={addWorkSample}
                className="btn-secondary-tactile"
                style={{ fontSize: '0.78rem', padding: '6px 14px' }}
              >
                + Add Sample
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {profile.workSamples.map((sample, idx) => (
              <div
                key={idx}
                style={{
                  padding: '16px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)',
                  background: '#f8fafc',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className="font-mono" style={{ fontWeight: 800, fontSize: '0.8rem', color: 'var(--brand-primary)' }}>
                    Sample #{idx + 1}
                  </span>
                  {profile.workSamples.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeWorkSample(idx)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1rem', padding: '0 4px' }}
                    >
                      ×
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  placeholder="Sample Title (e.g. Fintech Brand Reel)"
                  value={sample.title}
                  onChange={(e) => handleSampleChange(idx, 'title', e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-strong)', fontSize: '0.85rem', marginBottom: '8px' }}
                />

                <input
                  type="url"
                  placeholder="Live URL (Figma, GitHub, Drive, YouTube)"
                  value={sample.link}
                  onChange={(e) => handleSampleChange(idx, 'link', e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-strong)', fontSize: '0.85rem', marginBottom: '8px' }}
                />

                <textarea
                  rows="2"
                  placeholder="Short description of tools used and impact..."
                  value={sample.description}
                  onChange={(e) => handleSampleChange(idx, 'description', e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-strong)', fontSize: '0.82rem', fontFamily: 'inherit' }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Save Bar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
          <button
            className="btn-emerald"
            onClick={handleSave}
            disabled={saving}
            style={{ padding: '12px 28px', fontSize: '0.95rem' }}
          >
            {saving ? 'Saving...' : '💾 Save Profile Hub Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileVerificationHub;
