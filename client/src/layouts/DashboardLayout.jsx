import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Role-based navigation config
  const navItems = {
    brand: [
      {
        section: 'Marketplace Tools',
        items: [
          { label: 'Overview Hub', path: '/brand-dashboard', icon: 'fa-solid fa-layer-group' },
          { label: 'Post Project Wizard', path: '/brand-dashboard/post', icon: 'fa-solid fa-plus-circle' },
          { label: 'Applicant Pipeline', path: '/brand-dashboard/applications', icon: 'fa-solid fa-users-viewfinder' },
          { label: 'Active Contracts', path: '/brand-dashboard/projects', icon: 'fa-solid fa-shield-halved' },
        ],
      },
      {
        section: 'Financials',
        items: [
          { label: 'Escrow & GST Invoices', path: '/brand-dashboard/invoices', icon: 'fa-solid fa-file-invoice-dollar' },
        ],
      },
    ],
    student: [
      {
        section: 'Freelance Workspace',
        items: [
          { label: 'Freelancer Hub', path: '/dashboard', icon: 'fa-solid fa-compass' },
          { label: 'Opportunity Feed', path: '/dashboard/jobs', icon: 'fa-solid fa-magnifying-glass' },
          { label: 'Proposals Tracker', path: '/dashboard/applications', icon: 'fa-solid fa-paper-plane' },
          { label: 'Active Deliverables', path: '/dashboard/workspaces', icon: 'fa-solid fa-laptop-code' },
        ],
      },
      {
        section: 'Earnings & Reputation',
        items: [
          { label: 'Instant Payout Center', path: '/dashboard/earnings', icon: 'fa-solid fa-wallet' },
          { label: 'Profile & Verification', path: '/dashboard/profile', icon: 'fa-solid fa-award' },
        ],
      },
    ],
  };

  const currentNav = navItems[user?.role] || navItems.student;

  // Header Title Resolver
  const getHeaderDetails = () => {
    const path = location.pathname;
    if (path.includes('/post')) return { title: 'Post a Project Wizard', desc: 'AI-assisted brief creation with milestone budget recommendations' };
    if (path.includes('/projects')) return { title: 'Active Contracts & Escrow', desc: 'Dispute-proof milestone funding, deliverable inspection, and approvals' };
    if (path.includes('/applications') && user?.role === 'brand') return { title: 'Applicants Comparison Pipeline', desc: 'Kanban comparison of student pitches, verification badges, and samples' };
    if (path.includes('/invoices')) return { title: 'Financials & GST Tax Invoices', desc: 'Audit-ready transaction records with Razorpay Payment IDs and receipts' };
    if (path.includes('/jobs')) return { title: 'Opportunity Feed', desc: 'Filtered brand briefs with guaranteed milestone escrow protection' };
    if (path.includes('/applications') && user?.role === 'student') return { title: 'Proposals Tracker', desc: 'Live status tracking of submitted bids, pitches, and brand reviews' };
    if (path.includes('/workspaces')) return { title: 'Active Projects & Submissions', desc: 'Track deliverables, review client feedback, and trigger escrow releases' };
    if (path.includes('/earnings')) return { title: 'Earnings & Instant Payout Center', desc: 'Direct withdrawals to UPI ID (VPA) or IMPS/NEFT bank accounts' };
    if (path.includes('/profile')) return { title: 'Profile & Verification Hub', desc: 'Top 4 proof-of-work samples, verified socials, and Skill Compass' };
    return { title: user?.role === 'brand' ? 'Brand Workspace Hub' : 'Freelancer Workspace Hub', desc: `Welcome, ${user?.firstName || 'User'}!` };
  };

  const header = getHeaderDetails();

  return (
    <div className="app" style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#FAFAF9' }}>
      
      {/* Sidebar Navigation (Tactile Linear/Contra Dark Ink) */}
      <aside 
        className={`sidebar ${mobileOpen ? 'open' : ''}`} 
        id="sidebar"
        style={{
          width: '264px',
          background: '#0F172A', // Deep Slate / Ink
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          overflow: 'hidden',
          zIndex: 20,
          position: 'relative',
          borderRight: '1px solid #1E293B',
          transition: 'transform 0.28s ease',
        }}
      >
        {/* Brand Header */}
        <Link 
          to="/" 
          style={{
            padding: '20px 20px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            fontSize: '1.05rem',
            fontWeight: 700,
            color: '#FFFFFF',
            textDecoration: 'none',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            letterSpacing: '-0.02em',
          }}
        >
          <div style={{ width: '30px', height: '30px', borderRadius: '7px', background: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem', color: '#FFFFFF', boxShadow: '0 2px 8px rgba(5, 150, 105, 0.3)' }}>
            N
          </div>
          <div>
            <div>NextGenGrowth</div>
            <div style={{ fontSize: '0.65rem', color: '#10B981', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              ● Verified Indian Network
            </div>
          </div>
        </Link>
        
        <button 
          className="sb-close" 
          onClick={() => setMobileOpen(false)} 
          aria-label="Close menu"
          style={{ display: mobileOpen ? 'flex' : 'none', position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
        >
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18"/>
          </svg>
        </button>

        {/* User Status Card */}
        <div 
          style={{
            margin: '12px 14px',
            padding: '12px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <div 
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: user?.role === 'brand' ? '#1E293B' : '#064E3B',
              border: `1px solid ${user?.role === 'brand' ? '#334155' : '#059669'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.85rem',
              color: '#FFFFFF',
              flexShrink: 0,
            }}
          >
            {user?.firstName ? user.firstName.charAt(0).toUpperCase() : '?'}
          </div>
          <div style={{ overflow: 'hidden', minWidth: 0, flex: 1 }}>
            <div style={{ color: '#FFFFFF', fontWeight: 600, fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.companyName || `${user?.firstName || ''} ${user?.lastName || ''}`}
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.68rem', color: user?.role === 'brand' ? '#93C5FD' : '#6EE7B7', fontWeight: 600, marginTop: '2px' }}>
              {user?.role === 'brand' ? '🏢 Verified Brand' : `🎓 ${user?.studentBadge || 'Verified'} Student`}
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav style={{ padding: '8px 10px', flex: 1, overflowY: 'auto' }}>
          {currentNav.map((sec, sIdx) => (
            <React.Fragment key={sIdx}>
              <div 
                style={{
                  fontSize: '0.65rem',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  color: '#64748B',
                  fontWeight: 700,
                  padding: '12px 10px 4px',
                }}
              >
                {sec.section}
              </div>
              {sec.items.map((item, iIdx) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link 
                    key={iIdx} 
                    to={item.path} 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      color: isActive ? '#FFFFFF' : '#94A3B8',
                      fontSize: '0.85rem',
                      fontWeight: isActive ? 600 : 500,
                      textDecoration: 'none',
                      marginBottom: '2px',
                      background: isActive ? 'rgba(5, 150, 105, 0.16)' : 'transparent',
                      border: isActive ? '1px solid rgba(5, 150, 105, 0.3)' : '1px solid transparent',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span style={{ width: '18px', textAlign: 'center', color: isActive ? '#10B981' : '#64748B', fontSize: '0.85rem' }}>
                      <i className={item.icon}></i>
                    </span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </React.Fragment>
          ))}
          
          <div style={{ fontSize: '0.65rem', letterSpacing: '1px', textTransform: 'uppercase', color: '#64748B', fontWeight: 700, padding: '12px 10px 4px' }}>
            Account
          </div>
          <button 
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '9px 12px',
              borderRadius: '8px',
              color: '#94A3B8',
              fontSize: '0.85rem',
              fontWeight: 500,
              cursor: 'pointer',
              border: '1px solid transparent',
              background: 'transparent',
              width: '100%',
              textAlign: 'left',
              transition: 'all 0.15s ease',
            }}
          >
            <span style={{ width: '18px', textAlign: 'center', color: '#64748B' }}>
              <i className="fa-solid fa-arrow-right-from-bracket"></i>
            </span>
            Logout
          </button>
        </nav>

        {/* Promo Sidebar Panel for Brands */}
        {user?.role === 'brand' && (
          <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '10px', padding: '12px' }}>
              <div style={{ color: '#FFFFFF', fontSize: '0.8rem', fontWeight: 600, marginBottom: '2px' }}>
                Need urgent delivery?
              </div>
              <p style={{ color: '#94A3B8', fontSize: '0.72rem', lineHeight: 1.4, margin: '0 0 10px' }}>
                Post a brief and receive proposals from top student creators within 24 hours.
              </p>
              <button 
                onClick={() => navigate('/brand-dashboard/post')} 
                style={{ width: '100%', padding: '7px', borderRadius: '6px', background: '#059669', color: '#FFFFFF', border: 'none', fontWeight: 700, fontSize: '0.76rem', cursor: 'pointer' }}
              >
                + Post Brief
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Drawer Overlay for Mobile */}
      <div 
        className={`drawer-overlay ${mobileOpen ? 'show' : ''}`} 
        id="drawerOverlay" 
        onClick={() => setMobileOpen(false)}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          opacity: mobileOpen ? 1 : 0,
          pointerEvents: mobileOpen ? 'auto' : 'none',
          transition: 'opacity 0.25s ease',
          zIndex: 900
        }}
      ></div>

      {/* Main content body */}
      <div className="main" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        
        {/* Header Topbar (Tactile Paper-Style, 1px Crisp Border) */}
        <header 
          style={{
            background: '#FFFFFF',
            borderBottom: '1px solid #E2E8F0',
            padding: '0 28px',
            height: '62px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            position: 'sticky',
            top: 0,
            zIndex: 50,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button 
              className="mb" 
              onClick={() => setMobileOpen(true)} 
              aria-label="Open menu"
              style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
            >
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16"/>
              </svg>
            </button>
            <div>
              <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.01em' }}>
                {header.title}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '1px' }}>
                {header.desc}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {user?.role === 'brand' ? (
              <button 
                className="btn-emerald" 
                style={{ fontSize: '0.82rem', padding: '8px 14px' }} 
                onClick={() => navigate('/brand-dashboard/post')}
              >
                + Post a Project
              </button>
            ) : (
              <button 
                className="btn-emerald" 
                style={{ fontSize: '0.82rem', padding: '8px 14px' }} 
                onClick={() => navigate('/dashboard/jobs')}
              >
                Find Projects →
              </button>
            )}

            <div 
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: '#F1F5F9',
                border: '1px solid #CBD5E1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.82rem',
                color: '#0F172A',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
              }}
            >
              {user?.firstName ? user.firstName.charAt(0).toUpperCase() : '?'}
            </div>
          </div>
        </header>

        {/* Dynamic page outlet with warm paper background */}
        <div className="content" style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', background: '#FAFAF9' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
