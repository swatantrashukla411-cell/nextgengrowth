import React, { useState } from 'react';
import { Building2, GraduationCap, ArrowRight, X, CheckCircle, Loader2 } from 'lucide-react';

export function CampusCTA({ 
  showBrandModal, 
  showStudentModal, 
  onCloseModals, 
  onOpenBrandModal, 
  onOpenStudentModal 
}) {
  // Brand Form State
  const [brandForm, setBrandForm] = useState({
    companyName: '',
    email: '',
    campaignGoal: 'brand_awareness',
    targetCampuses: 50,
    budgetRange: 'under_50k',
    message: ''
  });

  // Student Form State
  const [studentForm, setStudentForm] = useState({
    fullName: '',
    email: '',
    collegeName: '',
    year: '2nd',
    city: '',
    instagramHandle: '',
    whyJoin: ''
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleBrandSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/campus/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brandForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit inquiry.');
      setSuccessMsg('Thank you! Your campus campaign proposal request has been received. Our team will contact you within 24 hours.');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/campus/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit application.');
      setSuccessMsg('Awesome! Your Campus Ambassador application was submitted. We will reach out to you via WhatsApp / Email.');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="cta" className="cp-section">
      <div className="cp-container">
        
        <div className="cp-cta-grid">
          
          {/* Brand Card */}
          <div className="cp-glass-card cp-cta-card">
            <div className="cp-cta-icon-circle">
              <Building2 size={32} />
            </div>
            <h3 style={{ fontFamily: 'var(--cp-font-heading)', fontSize: '1.8rem', color: '#fff', marginBottom: '12px' }}>
              Launch Your Campus Campaign
            </h3>
            <p style={{ color: '#9ca3af', fontSize: '1rem', lineHeight: 1.6, marginBottom: '28px' }}>
              Scale your app downloads, product sampling, or on-ground brand presence across 500+ Indian colleges with our managed ambassador network.
            </p>
            <button onClick={onOpenBrandModal} className="cp-btn cp-btn-primary">
              Book Brand Campaign <ArrowRight size={18} />
            </button>
          </div>

          {/* Student Card */}
          <div className="cp-glass-card cp-cta-card">
            <div className="cp-cta-icon-circle" style={{ background: 'rgba(52, 211, 153, 0.15)' }}>
              <GraduationCap size={32} />
            </div>
            <h3 style={{ fontFamily: 'var(--cp-font-heading)', fontSize: '1.8rem', color: '#fff', marginBottom: '12px' }}>
              Become a Campus Ambassador
            </h3>
            <p style={{ color: '#9ca3af', fontSize: '1rem', lineHeight: 1.6, marginBottom: '28px' }}>
              Represent top startups on your college campus. Earn stipends up to ₹10,000/mo, performance rewards, LORs, and pre-placement offers.
            </p>
            <button onClick={onOpenStudentModal} className="cp-btn cp-btn-secondary">
              Apply as Student Leader
            </button>
          </div>

        </div>

      </div>

      {/* BRAND INQUIRY MODAL */}
      {showBrandModal && (
        <div className="cp-modal-backdrop" onClick={onCloseModals}>
          <div className="cp-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <button className="cp-modal-close-btn" onClick={onCloseModals}>
              <X size={20} />
            </button>

            {successMsg ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <CheckCircle size={56} style={{ color: '#34d399', margin: '0 auto 16px' }} />
                <h3 style={{ color: '#fff', fontSize: '1.4rem', fontFamily: 'var(--cp-font-heading)', marginBottom: '12px' }}>Inquiry Submitted!</h3>
                <p style={{ color: '#9ca3af', lineHeight: 1.6 }}>{successMsg}</p>
                <button onClick={onCloseModals} className="cp-btn cp-btn-primary" style={{ marginTop: '24px' }}>Close</button>
              </div>
            ) : (
              <>
                <div style={{ textAlign: 'left' }}>
                  <h3 style={{ color: '#fff', fontSize: '1.5rem', fontFamily: 'var(--cp-font-heading)', marginBottom: '6px' }}>
                    Book Campus Campaign
                  </h3>
                  <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
                    Tell us about your brand targets and we will send a customized proposal.
                  </p>
                </div>

                {errorMsg && <div style={{ color: '#ef4444', fontSize: '0.88rem', marginTop: '12px' }}>{errorMsg}</div>}

                <form className="cp-form" onSubmit={handleBrandSubmit}>
                  <div className="cp-form-group">
                    <label>Company / Brand Name *</label>
                    <input 
                      type="text" 
                      required 
                      className="cp-input" 
                      placeholder="e.g. Acme Tech"
                      value={brandForm.companyName}
                      onChange={(e) => setBrandForm({ ...brandForm, companyName: e.target.value })}
                    />
                  </div>

                  <div className="cp-form-group">
                    <label>Work Email *</label>
                    <input 
                      type="email" 
                      required 
                      className="cp-input" 
                      placeholder="name@company.com"
                      value={brandForm.email}
                      onChange={(e) => setBrandForm({ ...brandForm, email: e.target.value })}
                    />
                  </div>

                  <div className="cp-form-group">
                    <label>Primary Campaign Goal</label>
                    <select 
                      className="cp-select"
                      value={brandForm.campaignGoal}
                      onChange={(e) => setBrandForm({ ...brandForm, campaignGoal: e.target.value })}
                    >
                      <option value="brand_awareness">Brand Awareness & Engagement</option>
                      <option value="app_installs">App Installs & Signups</option>
                      <option value="product_sampling">Product Sampling & Feedback</option>
                      <option value="campus_hiring">Campus Hiring & Internships</option>
                      <option value="event_promotion">Event / Hackathon Sponsorship</option>
                    </select>
                  </div>

                  <div className="cp-form-group">
                    <label>Target Campuses ({brandForm.targetCampuses} Colleges)</label>
                    <input 
                      type="range" 
                      min="10" 
                      max="500" 
                      step="10" 
                      className="cp-range-input"
                      value={brandForm.targetCampuses}
                      onChange={(e) => setBrandForm({ ...brandForm, targetCampuses: Number(e.target.value) })}
                    />
                  </div>

                  <div className="cp-form-group">
                    <label>Campaign Message / Requirements</label>
                    <textarea 
                      className="cp-textarea" 
                      rows="3" 
                      placeholder="Share target cities, timeline, or key deliverables..."
                      value={brandForm.message}
                      onChange={(e) => setBrandForm({ ...brandForm, message: e.target.value })}
                    />
                  </div>

                  <button type="submit" disabled={loading} className="cp-btn cp-btn-primary" style={{ width: '100%' }}>
                    {loading ? <Loader2 size={20} className="cp-spin" /> : 'Submit Campaign Inquiry'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* STUDENT APPLICATION MODAL */}
      {showStudentModal && (
        <div className="cp-modal-backdrop" onClick={onCloseModals}>
          <div className="cp-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <button className="cp-modal-close-btn" onClick={onCloseModals}>
              <X size={20} />
            </button>

            {successMsg ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <CheckCircle size={56} style={{ color: '#34d399', margin: '0 auto 16px' }} />
                <h3 style={{ color: '#fff', fontSize: '1.4rem', fontFamily: 'var(--cp-font-heading)', marginBottom: '12px' }}>Application Received!</h3>
                <p style={{ color: '#9ca3af', lineHeight: 1.6 }}>{successMsg}</p>
                <button onClick={onCloseModals} className="cp-btn cp-btn-primary" style={{ marginTop: '24px' }}>Close</button>
              </div>
            ) : (
              <>
                <div style={{ textAlign: 'left' }}>
                  <h3 style={{ color: '#fff', fontSize: '1.5rem', fontFamily: 'var(--cp-font-heading)', marginBottom: '6px' }}>
                    Apply as Campus Leader
                  </h3>
                  <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
                    Join 50,000+ student leaders earning stipends and building corporate careers.
                  </p>
                </div>

                {errorMsg && <div style={{ color: '#ef4444', fontSize: '0.88rem', marginTop: '12px' }}>{errorMsg}</div>}

                <form className="cp-form" onSubmit={handleStudentSubmit}>
                  <div className="cp-form-group">
                    <label>Full Name *</label>
                    <input 
                      type="text" 
                      required 
                      className="cp-input" 
                      placeholder="e.g. Rahul Sharma"
                      value={studentForm.fullName}
                      onChange={(e) => setStudentForm({ ...studentForm, fullName: e.target.value })}
                    />
                  </div>

                  <div className="cp-form-group">
                    <label>Email Address *</label>
                    <input 
                      type="email" 
                      required 
                      className="cp-input" 
                      placeholder="rahul@college.edu.in"
                      value={studentForm.email}
                      onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                    />
                  </div>

                  <div className="cp-form-group">
                    <label>College / University Name *</label>
                    <input 
                      type="text" 
                      required 
                      className="cp-input" 
                      placeholder="e.g. IIT Delhi, Christ Univ, VIT..."
                      value={studentForm.collegeName}
                      onChange={(e) => setStudentForm({ ...studentForm, collegeName: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="cp-form-group">
                      <label>Year of Study *</label>
                      <select 
                        className="cp-select"
                        value={studentForm.year}
                        onChange={(e) => setStudentForm({ ...studentForm, year: e.target.value })}
                      >
                        <option value="1st">1st Year</option>
                        <option value="2nd">2nd Year</option>
                        <option value="3rd">3rd Year</option>
                        <option value="4th">4th Year</option>
                        <option value="PG">Postgraduate</option>
                      </select>
                    </div>

                    <div className="cp-form-group">
                      <label>City *</label>
                      <input 
                        type="text" 
                        required 
                        className="cp-input" 
                        placeholder="e.g. New Delhi, Bangalore"
                        value={studentForm.city}
                        onChange={(e) => setStudentForm({ ...studentForm, city: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="cp-form-group">
                    <label>Instagram / LinkedIn Handle</label>
                    <input 
                      type="text" 
                      className="cp-input" 
                      placeholder="@handle or profile link"
                      value={studentForm.instagramHandle}
                      onChange={(e) => setStudentForm({ ...studentForm, instagramHandle: e.target.value })}
                    />
                  </div>

                  <button type="submit" disabled={loading} className="cp-btn cp-btn-primary" style={{ width: '100%' }}>
                    {loading ? <Loader2 size={20} className="cp-spin" /> : 'Submit Ambassador Application'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

    </section>
  );
}
