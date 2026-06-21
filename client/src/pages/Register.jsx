import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/client';
import { ParticleCanvas } from '../components/ParticleCanvas';
import gsap from 'gsap';

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  // Wizard Steps
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('student');

  // Input states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(Array(6).fill(''));
  
  // Student Specific
  const [college, setCollege] = useState('');
  const [year, setYear] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);

  // Brand Specific
  const [companyName, setCompanyName] = useState('');
  const [brandLink, setBrandLink] = useState('');
  const [serviceNeeded, setServiceNeeded] = useState('');

  // Password fields
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({ width: '0%', color: '#ef4444', text: '' });

  // Async & UI loading states
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Notifications
  const [alert, setAlert] = useState(null); // { msg: '', type: 'error'|'info'|'success' }
  const [toast, setToast] = useState(null); // { msg: '', type: 'success'|'error'|'info' }

  // Refs
  const mainContainerRef = useRef(null);
  const otpInputsRef = useRef([]);

  // Available skills list matching register.html
  const availableSkills = [
    { label: '🎬 Video', value: 'Video Editing' },
    { label: '🎨 Design', value: 'Graphic Design' },
    { label: '💻 Web Dev', value: 'Web Dev' },
    { label: '✍️ Content', value: 'Content' },
    { label: '📱 Social', value: 'Social Media' },
    { label: '🤖 AI Tools', value: 'AI Tools' },
  ];

  // GSAP animation check
  const canAnimate = () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isCompactScreen = window.matchMedia('(max-width: 768px)').matches;
    return !prefersReducedMotion && !isCompactScreen;
  };

  useEffect(() => {
    if (canAnimate()) {
      gsap.from(mainContainerRef.current, { y: 40, opacity: 0, duration: 1.2, ease: 'power3.out' });
      gsap.from('.feature', { x: -30, opacity: 0, duration: 1.2, ease: 'power2.out', stagger: 0.3, delay: 0.5 });
    }
  }, []);

  // Resend OTP countdown timer
  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  // Alert and Toast dismiss timers
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showAlert = (msg, type = 'error') => {
    setAlert({ msg, type });
  };

  const showToastMsg = (msg, type = 'info') => {
    setToast({ msg, type });
  };

  const selectRole = (selectedRole) => {
    setRole(selectedRole);
  };

  const googleAuth = () => {
    window.location.href = `/auth/google?role=${role}`;
  };

  const handleSendOtp = async () => {
    setAlert(null);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showAlert('Please enter a valid email address.');
      return;
    }

    setSendingOtp(true);
    try {
      const res = await API.post('/api/send-otp', {
        email,
        name: firstName || 'User',
        role,
      });

      if (res.data && res.data.success) {
        setStep(2);
        showToastMsg('OTP sent successfully!', 'success');
        setResendTimer(60);
      } else {
        showAlert(res.data.message || 'Failed to send OTP.');
      }
    } catch (err) {
      showAlert(err.response?.data?.message || 'Error sending OTP. Please try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  // OTP inputs autofocus and backspace handling
  const handleOtpChange = (index, value) => {
    const numericVal = value.replace(/\D/g, '');
    const newOtp = [...otp];
    newOtp[index] = numericVal;
    setOtp(newOtp);

    // Shift focus forward
    if (numericVal && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }

    // Auto verify when all filled
    if (newOtp.join('').length === 6) {
      handleVerifyOtp(newOtp.join(''));
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim().replace(/\D/g, '').slice(0, 6);
    if (pasteData.length === 6) {
      const newOtp = pasteData.split('');
      setOtp(newOtp);
      handleVerifyOtp(pasteData);
    }
  };

  const handleVerifyOtp = async (otpValue) => {
    const finalOtp = otpValue || otp.join('');
    if (finalOtp.length !== 6) return;

    setVerifyingOtp(true);
    setAlert(null);
    try {
      const res = await API.post('/api/verify-otp', {
        email,
        otp: finalOtp,
      });

      if (res.data && res.data.success) {
        showToastMsg('Email verified successfully!', 'success');
        setStep(3);
      } else {
        showAlert(res.data.message || 'Invalid OTP code.');
        // Shake animation on OTP boxes
        if (canAnimate()) {
          gsap.fromTo('.otp-inputs', { x: -8 }, { x: 0, duration: 0.1, repeat: 3 });
        }
      }
    } catch (err) {
      showAlert(err.response?.data?.message || 'OTP verification failed.');
      if (canAnimate()) {
        gsap.fromTo('.otp-inputs', { x: -8 }, { x: 0, duration: 0.1, repeat: 3 });
      }
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Password strength calculation
  const handlePasswordChange = (val) => {
    setPassword(val);
    if (!val) {
      setPasswordStrength({ width: '0%', color: '#ef4444', text: '' });
      return;
    }

    let score = 0;
    if (val.length >= 8) score++;
    if (val.length >= 12) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    const levels = [
      { width: '25%', color: '#ef4444', text: 'Weak' },
      { width: '50%', color: '#f59e0b', text: 'Fair' },
      { width: '80%', color: '#3b82f6', text: 'Good' },
      { width: '100%', color: '#22c55e', text: 'Strong' },
    ];

    const currentLevel = levels[Math.min(score, 3)];
    setPasswordStrength(currentLevel);
  };

  const toggleSkill = (skillVal, event) => {
    let updated;
    if (selectedSkills.includes(skillVal)) {
      updated = selectedSkills.filter((s) => s !== skillVal);
    } else {
      updated = [...selectedSkills, skillVal];
      if (canAnimate() && event.currentTarget) {
        gsap.fromTo(event.currentTarget, { scale: 0.9 }, { scale: 1, duration: 0.3, ease: 'back.out' });
      }
    }
    setSelectedSkills(updated);
  };

  const handleRegisterSubmit = async () => {
    setAlert(null);

    // Validation
    if (!firstName || !lastName || password.length < 8) {
      showAlert('First name, Last name and password (>8 characters) are required.');
      return;
    }
    if (password !== confirmPassword) {
      showAlert("Passwords do not match.");
      return;
    }

    let payload = {
      firstName,
      lastName,
      email,
      password,
      role,
    };

    if (role === 'student') {
      if (!college || !year || selectedSkills.length === 0) {
        showAlert('Please fill in university details and choose at least one skill.');
        return;
      }
      payload.college = college;
      payload.year = year;
      payload.skills = selectedSkills;
    } else {
      if (!companyName || !brandLink || !serviceNeeded) {
        showAlert('Please fill in all company fields.');
        return;
      }
      payload.companyName = companyName;
      payload.brandLink = brandLink;
      payload.serviceNeeded = serviceNeeded;
    }

    setRegistering(true);
    const result = await register(payload);

    if (result.success) {
      showToastMsg(role === 'brand' ? 'Brand account created!' : 'Student account created!', 'success');
      const destination = role === 'brand' ? '/brand-dashboard' : '/dashboard';
      setTimeout(() => navigate(destination), 1000);
    } else {
      showAlert(result.message || 'Registration failed.');
      setRegistering(false);
    }
  };

  return (
    <div className="register-body">
      <div className="ambient-glow"></div>
      <ParticleCanvas />

      <div className="container" id="main-container" ref={mainContainerRef}>
        
        {/* Left column: Branding */}
        <div className="branding">
          <Link to="/" className="logo">
            <div className="logo-icon">
              <img src="/android-chrome-192x192.png" alt="NextGenGrowth Logo" />
            </div>
            NextGenGrowth
          </Link>
          <h1 className="tagline">Join the<br />Creative Revolution.</h1>
          <p className="desc">Set up your account to connect, collaborate, and grow with top talents and leading brands.</p>

          <div className="features">
            <div className="feature">
              <div className="feature-icon"><i className="fas fa-building"></i></div>
              <div className="feature-text">
                <h4>For Brands</h4>
                <p>Access pre-vetted creative talent ready to scale your vision.</p>
              </div>
            </div>
            <div className="feature">
              <div className="feature-icon"><i className="fas fa-graduation-cap"></i></div>
              <div className="feature-text">
                <h4>For Students</h4>
                <p>Get real-world experience, build portfolios, and earn.</p>
              </div>
            </div>
            <div className="feature">
              <div className="feature-icon"><i className="fas fa-shield-halved"></i></div>
              <div className="feature-text">
                <h4>Secure & Verified</h4>
                <p>Trusted community with robust verification protocols.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Form Panels */}
        <div className="register-section">
          
          {/* Progress Steps */}
          <div className="steps-container">
            <div className="steps">
              <div className="step">
                <div className={`step-num ${step > 1 ? 'done' : step === 1 ? 'active' : 'pending'}`}>
                  {step > 1 ? <i className="fas fa-check"></i> : '1'}
                </div>
                <span className={`step-lbl ${step === 1 ? 'active' : ''}`}>Role</span>
              </div>
              <div className={`step-line ${step > 1 ? 'done' : ''}`}></div>
              <div className="step">
                <div className={`step-num ${step > 2 ? 'done' : step === 2 ? 'active' : 'pending'}`}>
                  {step > 2 ? <i className="fas fa-check"></i> : '2'}
                </div>
                <span className={`step-lbl ${step === 2 ? 'active' : ''}`}>Verify</span>
              </div>
              <div className={`step-line ${step > 2 ? 'done' : ''}`}></div>
              <div className="step">
                <div className={`step-num ${step === 3 ? 'active' : 'pending'}`}>3</div>
                <span className={`step-lbl ${step === 3 ? 'active' : ''}`}>Details</span>
              </div>
            </div>
          </div>

          {/* Form Alert Box */}
          {alert && (
            <div className={`alert-box alert-${alert.type}`}>
              <i className="fas fa-circle-exclamation"></i>
              <span>{alert.msg}</span>
            </div>
          )}

          {/* Step 1: Role selection & Email submission */}
          {step === 1 && (
            <div className="panel active">
              <h2 className="panel-title">Get Started</h2>
              <p className="panel-sub">Choose your path in NextGenGrowth</p>

              <div className="role-grid">
                <div 
                  className={`role-card ${role === 'student' ? 'sel' : ''}`}
                  onClick={() => selectRole('student')}
                >
                  <div className="role-tick"><i className="fas fa-check"></i></div>
                  <div className="rc-ico">🎓</div>
                  <div className="rc-t">Student</div>
                  <div className="rc-s">Find projects & earn</div>
                </div>
                <div 
                  className={`role-card ${role === 'brand' ? 'sel' : ''}`}
                  onClick={() => selectRole('brand')}
                >
                  <div className="role-tick"><i className="fas fa-check"></i></div>
                  <div className="rc-ico">🏢</div>
                  <div className="rc-t">Brand</div>
                  <div className="rc-s">Post jobs & hire</div>
                </div>
              </div>

              <button className="oauth-btn google-btn" type="button" onClick={googleAuth}>
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign up with Google
              </button>

              <div className="divider">or use email</div>

              <div className="form-group">
                <label className="form-label"><i className="fas fa-user"></i> First Name <span className="label-required">*</span></label>
                <input 
                  className="form-input" 
                  type="text" 
                  placeholder="Your name" 
                  value={firstName} 
                  onChange={(e) => setFirstName(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label className="form-label"><i className="fas fa-envelope"></i> Email Address <span className="label-required">*</span></label>
                <div className="email-group">
                  <input 
                    className="form-input" 
                    type="email" 
                    placeholder={role === 'brand' ? 'partnership@brand.com' : 'student@university.edu'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <button 
                    className="btn-action btn-main" 
                    style={{ width: 'auto' }} 
                    onClick={handleSendOtp}
                    disabled={sendingOtp}
                  >
                    {sendingOtp ? <span className="loader" style={{ width: '14px', height: '14px' }}></span> : <i className="fas fa-paper-plane"></i>} OTP
                  </button>
                </div>
              </div>

              <div className="bottom-links">
                Already have an account? <Link to="/login">Log In</Link>
              </div>
            </div>
          )}

          {/* Step 2: OTP Entry */}
          {step === 2 && (
            <div className="panel active">
              <h2 className="panel-title">Verify Email</h2>
              <p className="panel-sub">Enter the 6-digit code sent to <strong style={{ color: '#fff' }}>{email}</strong></p>

              <div className="otp-inputs">
                {otp.map((val, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpInputsRef.current[idx] = el)}
                    className={`otp-inp ${val ? 'filled' : ''}`}
                    type="text"
                    maxlength="1"
                    inputmode="numeric"
                    value={val}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    onPaste={handleOtpPaste}
                  />
                ))}
              </div>

              <button className="btn-action btn-main" onClick={() => handleVerifyOtp()} disabled={verifyingOtp}>
                {verifyingOtp ? <span className="loader" style={{ width: '16px', height: '16px' }}></span> : <i className="fas fa-check-circle"></i>} Verify Code
              </button>
              
              <button className="btn-action outline" onClick={() => setStep(1)} style={{ marginTop: '0.5rem', width: '100%' }}>
                <i className="fas fa-arrow-left"></i> Back
              </button>

              <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--gray-400)' }}>
                Didn't receive it?{' '}
                <button 
                  onClick={handleSendOtp} 
                  disabled={resendTimer > 0 || sendingOtp} 
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer' }}
                >
                  Resend{resendTimer > 0 ? ` (${resendTimer}s)` : ''}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Details Completion */}
          {step === 3 && (
            <div className="panel active">
              <h2 className="panel-title">{role === 'brand' ? 'Brand Details' : 'Complete Profile'}</h2>
              <p className="panel-sub">Almost there! Finalize your info.</p>

              <div className="form-grid" style={{ marginBottom: '1.2rem' }}>
                <div>
                  <label className="form-label"><i className="fas fa-user"></i> First Name</label>
                  <input 
                    className="form-input" 
                    type="text" 
                    placeholder="First Name" 
                    value={firstName} 
                    onChange={(e) => setFirstName(e.target.value)} 
                  />
                </div>
                <div>
                  <label className="form-label"><i className="fas fa-user"></i> Last Name <span className="label-required">*</span></label>
                  <input 
                    className="form-input" 
                    type="text" 
                    placeholder="Last Name" 
                    value={lastName} 
                    onChange={(e) => setLastName(e.target.value)} 
                  />
                </div>
              </div>

              {/* Student Specific Fields */}
              {role === 'student' && (
                <div>
                  <div className="form-grid" style={{ marginBottom: '1.2rem' }}>
                    <div>
                      <label className="form-label"><i className="fas fa-university"></i> University <span className="label-required">*</span></label>
                      <input 
                        className="form-input" 
                        type="text" 
                        placeholder="e.g. Delhi University" 
                        value={college} 
                        onChange={(e) => setCollege(e.target.value)} 
                      />
                    </div>
                    <div>
                      <label className="form-label"><i className="fas fa-calendar"></i> Year <span className="label-required">*</span></label>
                      <select 
                        className="form-input" 
                        value={year} 
                        onChange={(e) => setYear(e.target.value)}
                        style={{ background: 'rgba(255, 255, 255, 0.03)', color: '#fff' }}
                      >
                        <option value="" style={{ background: '#0f172a' }}>Select...</option>
                        <option style={{ background: '#0f172a' }}>1st Year</option>
                        <option style={{ background: '#0f172a' }}>2nd Year</option>
                        <option style={{ background: '#0f172a' }}>3rd Year</option>
                        <option style={{ background: '#0f172a' }}>4th Year</option>
                        <option style={{ background: '#0f172a' }}>Post Grad</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label"><i className="fas fa-star"></i> Skills <span className="label-required">*</span></label>
                    <div className="skills-grid">
                      {availableSkills.map((sk) => (
                        <span 
                          key={sk.value}
                          className={`sk-tag ${selectedSkills.includes(sk.value) ? 'sel' : ''}`}
                          onClick={(e) => toggleSkill(sk.value, e)}
                        >
                          {sk.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Brand Specific Fields */}
              {role === 'brand' && (
                <div>
                  <div className="form-group">
                    <label className="form-label"><i className="fas fa-building"></i> Company Name <span className="label-required">*</span></label>
                    <input 
                      className="form-input" 
                      type="text" 
                      placeholder="e.g. StyleCo" 
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label"><i className="fas fa-link"></i> Website / LinkedIn <span className="label-required">*</span></label>
                    <input 
                      className="form-input" 
                      type="url" 
                      placeholder="https://..." 
                      value={brandLink}
                      onChange={(e) => setBrandLink(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label"><i className="fas fa-tasks"></i> Service Needed <span className="label-required">*</span></label>
                    <select 
                      className="form-input" 
                      value={serviceNeeded} 
                      onChange={(e) => setServiceNeeded(e.target.value)}
                      style={{ background: 'rgba(255, 255, 255, 0.03)', color: '#fff' }}
                    >
                      <option value="" style={{ background: '#0f172a' }}>Select...</option>
                      <option style={{ background: '#0f172a' }}>Video & Graphics</option>
                      <option style={{ background: '#0f172a' }}>Web Dev</option>
                      <option style={{ background: '#0f172a' }}>Content & Social</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Password Fields */}
              <div className="form-group">
                <label className="form-label"><i className="fas fa-lock"></i> Password <span className="label-required">*</span></label>
                <input 
                  className="form-input" 
                  type="password" 
                  placeholder="Min 8 chars" 
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                />
                <div className="strength-bar">
                  <div 
                    className="strength-fill" 
                    style={{ width: passwordStrength.width, background: passwordStrength.color }}
                  ></div>
                </div>
                <div className="strength-txt" style={{ color: passwordStrength.color }}>{passwordStrength.text}</div>
              </div>

              <div className="form-group">
                <label className="form-label"><i className="fas fa-lock"></i> Confirm Password <span className="label-required">*</span></label>
                <input 
                  className="form-input" 
                  type="password" 
                  placeholder="Re-enter" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              {role === 'brand' && (
                <div className="alert-box alert-info">
                  <i className="fas fa-shield-halved" style={{ fontSize: '1.5rem' }}></i>
                  <div>
                    <strong style={{ display: 'block', color: '#fff' }}>Brand account ready</strong>
                    You can start posting projects from your dashboard.
                  </div>
                </div>
              )}

              <button className="btn-action btn-main" onClick={handleRegisterSubmit} disabled={registering}>
                {registering ? <span className="loader" style={{ width: '16px', height: '16px' }}></span> : <i className="fas fa-rocket"></i>} Create Account
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Global Toast */}
      {toast && (
        <div className={`toast toast-${toast.type} show`}>
          <i className={`fas fa-${toast.type === 'success' ? 'check' : toast.type === 'error' ? 'exclamation' : 'info'}-circle`}></i>
          <span>{toast.msg}</span>
        </div>
      )}
    </div>
  );
};
export default Register;
