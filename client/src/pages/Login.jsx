import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/client';
import gsap from 'gsap';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Notifications State
  const [alert, setAlert] = useState(null); // { msg: '', type: 'error'|'success' }
  const [toast, setToast] = useState(null); // string

  // Reset Password Modal State
  const [resetOpen, setResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetStatus, setResetStatus] = useState(null); // { msg: '', type: 'info'|'success'|'error' }
  const [resetSending, setResetSending] = useState(false);
  const [resetUpdating, setResetUpdating] = useState(false);

  // Refs for animations
  const mainContainerRef = useRef(null);
  const cardRef = useRef(null);

  // Animation checks
  const canAnimate = () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isCompactScreen = window.matchMedia('(max-width: 768px)').matches;
    return !prefersReducedMotion && !isCompactScreen;
  };

  // Entrance animations
  useEffect(() => {
    if (canAnimate()) {
      gsap.fromTo(mainContainerRef.current, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: 'power3.out' });
      gsap.fromTo('.benefit', { x: -14, opacity: 0 }, { x: 0, opacity: 1, duration: 0.42, stagger: 0.08, delay: 0.2, ease: 'power2.out' });
    }

    // Load saved email
    const savedEmail = localStorage.getItem('ngg_saved_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }

    // Parse URL queries for errors (from Google OAuth)
    const errorParam = searchParams.get('error');
    if (errorParam === 'role_mismatch') {
      const actual = searchParams.get('actual') || 'another role';
      const selected = searchParams.get('selected') || 'this role';
      showAlert(`This Google account is already registered as ${actual}. Continue as ${actual}, or use a different Google account for ${selected}.`);
    } else if (errorParam === 'registration_closed') {
      const selected = searchParams.get('selected') || 'selected';
      showAlert(`${selected.charAt(0).toUpperCase() + selected.slice(1)} registrations are currently closed by admin.`);
    } else if (errorParam === 'google_failed') {
      showAlert('Google sign-in expired or was rejected. Please start again with Continue with Google.');
    } else if (errorParam) {
      showAlert('Google login failed. Please try again.');
    }
  }, [searchParams]);

  // Alert dismiss timer
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        setAlert(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  // Toast dismiss timer
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showAlert = (msg, type = 'error') => {
    setAlert({ msg, type });
  };

  const showToast = (msg) => {
    setToast(msg);
  };

  const handleRoleToggle = (selectedRole, event) => {
    setRole(selectedRole);
    if (canAnimate() && event.currentTarget) {
      gsap.fromTo(event.currentTarget, { scale: 0.96 }, { scale: 1, duration: 0.18, ease: 'power2.out' });
    }
  };

  const handleGoogleLogin = () => {
    showToast('Redirecting to Google...');
    // Clear old state before redirecting to clean login
    localStorage.removeItem('ngg_token');
    localStorage.removeItem('ngg_user');
    window.location.href = `/auth/google?role=${encodeURIComponent(role)}&switch=1&t=${Date.now()}`;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (password.length < 6) {
      showAlert('Password must be at least 6 characters.');
      if (canAnimate()) {
        gsap.fromTo(cardRef.current, { x: -6 }, { x: 0, duration: 0.08, repeat: 3, yoyo: true });
      }
      return;
    }

    setLoading(true);
    const result = await login(email, password, role);

    if (result.success) {
      if (rememberMe) {
        localStorage.setItem('ngg_saved_email', email);
      } else {
        localStorage.removeItem('ngg_saved_email');
      }

      showToast('Login successful. Redirecting...');
      const destination = result.user?.role === 'brand' ? '/brand-dashboard' : '/dashboard';
      
      if (canAnimate()) {
        gsap.to(mainContainerRef.current, { 
          opacity: 0, 
          scale: 0.98, 
          duration: 0.28, 
          onComplete: () => navigate(destination) 
        });
      } else {
        navigate(destination);
      }
    } else {
      showAlert(result.message || 'Invalid email or password.');
      setLoading(false);
    }
  };

  // Reset Modal Operations
  const openResetModal = () => {
    if (email) setResetEmail(email);
    setResetStatus(null);
    setResetOpen(true);
  };

  const closeResetModal = () => {
    setResetOpen(false);
  };

  const sendResetOtp = async () => {
    if (!resetEmail.trim()) {
      setResetStatus({ msg: 'Enter your account email.', type: 'error' });
      return;
    }
    setResetSending(true);
    setResetStatus({ msg: 'Sending OTP to your email...', type: 'info' });
    try {
      const res = await API.post('/api/forgot-password/send-otp', { email: resetEmail });
      if (res.data && res.data.success) {
        setResetStatus({ msg: res.data.message || 'OTP sent. Check your email and enter the code below.', type: 'success' });
      } else {
        setResetStatus({ msg: res.data.message || 'Could not send reset OTP.', type: 'error' });
      }
    } catch (err) {
      setResetStatus({ msg: err.response?.data?.message || 'Could not send reset OTP. Check your connection.', type: 'error' });
    } finally {
      setResetSending(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail || !resetOtp || !newPassword) {
      setResetStatus({ msg: 'Email, OTP and new password are required.', type: 'error' });
      return;
    }
    if (newPassword.length < 8) {
      setResetStatus({ msg: 'New password must be at least 8 characters.', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetStatus({ msg: 'New passwords do not match.', type: 'error' });
      return;
    }

    setResetUpdating(true);
    setResetStatus({ msg: 'Verifying OTP and updating password...', type: 'info' });

    try {
      const res = await API.post('/api/forgot-password/reset', {
        email: resetEmail,
        otp: resetOtp,
        password: newPassword,
      });

      if (res.data && res.data.success) {
        closeResetModal();
        setEmail(resetEmail);
        setPassword('');
        showAlert(res.data.message || 'Password reset successfully. Please login.', 'success');
      } else {
        setResetStatus({ msg: res.data.message || 'Password reset failed.', type: 'error' });
      }
    } catch (err) {
      setResetStatus({ msg: err.response?.data?.message || 'Password reset failed. Check your connection.', type: 'error' });
    } finally {
      setResetUpdating(false);
    }
  };

  return (
    <div className="login-body">
      <main className="shell" id="main-container" ref={mainContainerRef}>
        
        {/* Left Side: Brand Story & Flow Overview */}
        <section className="story" aria-label="NextGenGrowth introduction">
          <Link to="/" className="brand" aria-label="NextGenGrowth home">
            <span className="brand-mark">
              <img src="/android-chrome-192x192.png" alt="NextGenGrowth Icon" />
            </span>
            NextGenGrowth
          </Link>

          <div className="welcome-pill">Secure growth workspace</div>
          <div className="hero-copy">
            <h1>Login where real work <span>moves forward.</span></h1>
            <p>Brands hire verified students, students submit serious work, and every project stays clear from brief to approval.</p>
          </div>

          <div className="benefits">
            <div className="benefit">
              <div className="benefit-icon"><i className="fa-solid fa-user-check"></i></div>
              <div>
                <strong>Verified profiles</strong>
                <span>Skills, links and recent work before approval.</span>
              </div>
            </div>
            <div className="benefit">
              <div className="benefit-icon"><i className="fa-solid fa-shield-halved"></i></div>
              <div>
                <strong>Secure payments</strong>
                <span>Razorpay flow and clear earning records.</span>
              </div>
            </div>
            <div className="benefit">
              <div className="benefit-icon"><i className="fa-solid fa-briefcase"></i></div>
              <div>
                <strong>Project workspace</strong>
                <span>Resources, submission, revision and approval.</span>
              </div>
            </div>
          </div>

          <div className="workspace-preview" aria-hidden="true">
            <div className="workspace-top">
              <div>
                <div className="workspace-kicker">NextGenGrowth flow</div>
                <div className="workspace-title">From login to delivery</div>
              </div>
              <span className="live-badge">Protected workflow</span>
            </div>
            <div className="pipeline">
              <div className="pipe-step"><b>01 Login</b><span>Choose student or brand workspace.</span></div>
              <div className="pipe-step"><b>02 Review</b><span>Check profile proof and project fit.</span></div>
              <div className="pipe-step"><b>03 Build</b><span>Share resources and submit work.</span></div>
              <div className="pipe-step"><b>04 Approve</b><span>Pay, revise and close cleanly.</span></div>
            </div>
          </div>

          <div className="proof-strip" aria-hidden="true">
            <span className="proof-pill"><i className="fa-solid fa-clock"></i> 24h response target</span>
            <span class="proof-pill"><i className="fa-solid fa-lock"></i> Secure access</span>
            <span className="proof-pill"><i className="fa-solid fa-star"></i> Built for Gen-Z creators</span>
          </div>
        </section>

        {/* Right Side: Login Form Form Panel */}
        <section className="login-side" aria-label="Login form">
          <div className="login-card" ref={cardRef}>
            <div className="mobile-brand">
              <span className="brand-mark">
                <img src="/android-chrome-192x192.png" alt="NextGenGrowth Icon" />
              </span>
              NextGenGrowth
            </div>

            <div className="header-text">
              <h2>Welcome back</h2>
              <p>Open your dashboard and continue from the right side of the marketplace.</p>
            </div>

            {/* Alert Box message display */}
            {alert && (
              <div className={`alert-box alert-${alert.type}`} style={{ display: 'flex' }}>
                <i className="fas fa-circle-exclamation"></i>
                <span>{alert.msg}</span>
              </div>
            )}

            {/* Role Toggles */}
            <div className="role-toggle" role="tablist" aria-label="Account type">
              <button 
                className={`role-btn ${role === 'student' ? 'active' : ''}`}
                type="button" 
                onClick={(e) => handleRoleToggle('student', e)}
              >
                🎓 Student
              </button>
              <button 
                className={`role-btn ${role === 'brand' ? 'active' : ''}`}
                type="button" 
                onClick={(e) => handleRoleToggle('brand', e)}
              >
                🏢 Brand
              </button>
            </div>

            {/* OAuth Google Button */}
            <button className="oauth-btn" type="button" onClick={handleGoogleLogin}>
              <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google as {role}
            </button>

            <div className="divider">or use email access</div>

            {/* Email form */}
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="loginEmail">Email address</label>
                <div className="field">
                  <i className="fas fa-envelope input-icon"></i>
                  <input 
                    type="email" 
                    id="loginEmail" 
                    className="form-input" 
                    placeholder="name@example.com" 
                    required 
                    autocomplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="loginPass">Password</label>
                <div className="field">
                  <i className="fas fa-lock input-icon"></i>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    id="loginPass" 
                    className="form-input" 
                    placeholder="••••••••" 
                    required 
                    autocomplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button 
                    type="button" 
                    className="pass-toggle" 
                    onClick={() => setShowPassword(!showPassword)} 
                    aria-label="Show or hide password"
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              <div className="form-footer">
                <label className="remember">
                  <input 
                    type="checkbox" 
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="custom-check"></span>
                  Remember me
                </label>
                <a href="#" className="forgot" onClick={(e) => { e.preventDefault(); openResetModal(); }}>
                  Forgot Password?
                </a>
              </div>

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? (
                  <span className="loader"></span>
                ) : (
                  <span>Enter Dashboard <i className="fas fa-arrow-right"></i></span>
                )}
              </button>
            </form>

            <div className="bottom-links">
              <span>Don't have an account? <Link to="/register">Create one</Link></span>
              <a href="mailto:hello@nextgengrowth.in"><i class="fas fa-headset"></i> Need Help?</a>
            </div>
          </div>
        </section>
      </main>

      {/* Global Toast */}
      <div className={`toast toast-info ${toast ? 'show' : ''}`}>
        <i className="fas fa-info-circle"></i>
        <span>{toast}</span>
      </div>

      {/* Forgot Password Reset Modal */}
      <div className={`reset-modal ${resetOpen ? 'show' : ''}`} aria-hidden={!resetOpen}>
        <div className="reset-card">
          <button className="reset-close" type="button" onClick={closeResetModal} aria-label="Close password reset">
            <i className="fas fa-xmark"></i>
          </button>
          <h3>Reset password</h3>
          <p>Enter your account email, get the OTP, then set a new password.</p>
          
          <div className="form-group">
            <label className="form-label" htmlFor="resetEmail">Email address</label>
            <div className="field">
              <i className="fas fa-envelope input-icon"></i>
              <input 
                type="email" 
                id="resetEmail" 
                className="form-input" 
                placeholder="name@example.com" 
                autocomplete="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="reset-actions">
            <button 
              className="reset-btn secondary" 
              type="button" 
              onClick={sendResetOtp}
              disabled={resetSending}
            >
              {resetSending ? 'Sending...' : 'Send OTP'}
            </button>
          </div>

          {resetStatus && (
            <div className={`reset-status show ${resetStatus.type}`}>
              {resetStatus.msg}
            </div>
          )}

          <div className="form-group" style={{ marginTop: '18px' }}>
            <label className="form-label" htmlFor="resetOtp">OTP code</label>
            <div className="field">
              <i className="fas fa-key input-icon"></i>
              <input 
                type="text" 
                id="resetOtp" 
                className="form-input" 
                placeholder="6 digit code" 
                inputmode="numeric" 
                maxlength="6"
                value={resetOtp}
                onChange={(e) => setResetOtp(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="resetPass">New password</label>
            <div className="field">
              <i className="fas fa-lock input-icon"></i>
              <input 
                type="password" 
                id="resetPass" 
                className="form-input" 
                placeholder="Minimum 8 characters" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="resetPass2">Confirm password</label>
            <div className="field">
              <i className="fas fa-lock input-icon"></i>
              <input 
                type="password" 
                id="resetPass2" 
                className="form-input" 
                placeholder="Re-enter new password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            className="reset-btn primary" 
            type="button" 
            onClick={handleResetPassword}
            style={{ width: '100%' }}
            disabled={resetUpdating}
          >
            {resetUpdating ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </div>
    </div>
  );
};
export default Login;
