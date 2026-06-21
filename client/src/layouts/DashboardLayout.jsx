import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import gsap from 'gsap';

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
    navigate('/login');
  };

  // Role-based navigation config
  const navItems = {
    brand: [
      {
        section: 'Main',
        items: [
          { label: 'Dashboard', path: '/brand-dashboard', icon: 'fa-solid fa-chart-line' },
          { label: 'Post a Project', path: '/brand-dashboard/post', icon: 'fa-solid fa-plus' },
          { label: 'My Projects', path: '/brand-dashboard/projects', icon: 'fa-solid fa-briefcase' },
          { label: 'Applications', path: '/brand-dashboard/applications', icon: 'fa-solid fa-file-invoice' },
          { label: 'Browse Students', path: '/brand-dashboard/students', icon: 'fa-solid fa-users' },
          { label: 'Long-Term Hiring', path: '/brand-dashboard/longterm', icon: 'fa-solid fa-business-time' },
        ],
      },
      {
        section: 'Account',
        items: [
          { label: 'Brand Profile', path: '/brand-dashboard/profile', icon: 'fa-solid fa-building' },
        ],
      },
    ],
    student: [
      {
        section: 'Main',
        items: [
          { label: 'Dashboard', path: '/dashboard', icon: 'fa-solid fa-gauge' },
          { label: 'Find Work', path: '/dashboard/jobs', icon: 'fa-solid fa-magnifying-glass' },
          { label: 'My Applications', path: '/dashboard/applications', icon: 'fa-solid fa-paper-plane' },
          { label: 'Workspaces', path: '/dashboard/workspaces', icon: 'fa-solid fa-laptop-code' },
        ],
      },
      {
        section: 'Account',
        items: [
          { label: 'Profile & KYC', path: '/dashboard/profile', icon: 'fa-solid fa-user-check' },
        ],
      },
    ],
  };

  const currentNav = navItems[user?.role] || navItems.student;

  // Header Title Resolver
  const getHeaderDetails = () => {
    const path = location.pathname;
    if (path.includes('/post')) return { title: 'Post a Project', desc: 'Describe what you need with budget & deadline' };
    if (path.includes('/projects')) return { title: 'My Projects', desc: 'Track and manage your posted scopes' };
    if (path.includes('/applications')) return { title: 'Applications', desc: 'Review student applications and portfolios' };
    if (path.includes('/students')) return { title: 'Browse Students', desc: 'Find top creative student talents' };
    if (path.includes('/longterm')) return { title: 'Long-Term Hiring', desc: 'Hire students on monthly retainers' };
    if (path.includes('/profile')) return { title: 'Profile Settings', desc: 'Manage your verified business credentials' };
    if (path.includes('/jobs')) return { title: 'Find Work', desc: 'Apply to active projects and build your career' };
    if (path.includes('/workspaces')) return { title: 'Workspaces', desc: 'Deliver items, track briefs, and manage earnings' };
    return { title: 'Dashboard', desc: `Welcome back, ${user?.firstName || 'User'}!` };
  };

  const header = getHeaderDetails();

  return (
    <div className="app" style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#f1f5f9' }}>
      
      {/* Sidebar Navigation */}
      <aside 
        className={`sidebar ${mobileOpen ? 'open' : ''}`} 
        id="sidebar"
        style={{
          width: '260px',
          background: '#1d4ed8',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          overflow: 'hidden',
          zIndex: 20,
          position: 'relative',
          transition: 'transform 0.28s ease',
        }}
      >
        <Link to="/" className="sb-logo">
          <div className="ld">
            <img src="/android-chrome-192x192.png" alt="NextGenGrowth Logo" />
          </div>
          NextGenGrowth
        </Link>
        
        <button 
          className="sb-close" 
          onClick={() => setMobileOpen(false)} 
          aria-label="Close menu"
          style={{ display: mobileOpen ? 'flex' : 'none' }}
        >
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18"/>
          </svg>
        </button>

        {/* User Card */}
        <div className="sb-user">
          <div className="av" id="sbAv">
            {user?.firstName ? user.firstName.charAt(0).toUpperCase() : '?'}
          </div>
          <div style={{ overflow: 'hidden', minWidth: 0 }}>
            <div className="sb-nm" id="sbNm" style={{ color: 'white', fontWeight: 600, fontSize: '0.83rem' }}>
              {user?.firstName} {user?.lastName}
            </div>
            <div className="sb-bg">
              {user?.role === 'brand' ? '🏢 Brand' : '🎓 Student'}
            </div>
          </div>
        </div>

        {/* Nav list */}
        <nav className="nav" style={{ padding: '6px 8px', flex: 1, overflowY: 'auto' }}>
          {currentNav.map((sec, sIdx) => (
            <React.Fragment key={sIdx}>
              <div className="nl" style={{ fontSize: '0.63rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', padding: '9px 10px 4px' }}>
                {sec.section}
              </div>
              {sec.items.map((item, iIdx) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link 
                    key={iIdx} 
                    to={item.path} 
                    className={`ni ${isActive ? 'active' : ''}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '9px',
                      padding: '10px 12px',
                      borderRadius: '9px',
                      color: isActive ? 'white' : 'rgba(255,255,255,0.7)',
                      fontSize: '0.86rem',
                      fontWeight: 500,
                      textDecoration: 'none',
                      marginBottom: '2px',
                      background: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
                      border: isActive ? '1px solid rgba(255,255,255,0.2)' : 'none'
                    }}
                  >
                    <span className="nicon">
                      <i className={item.icon}></i>
                    </span>
                    {item.label}
                  </Link>
                );
              })}
            </React.Fragment>
          ))}
          
          <div className="nl" style={{ fontSize: '0.63rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', padding: '9px 10px 4px' }}>
            Action
          </div>
          <button 
            className="ni" 
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '9px',
              padding: '10px 12px',
              borderRadius: '9px',
              color: 'rgba(255,255,255,0.7)',
              fontSize: '0.86rem',
              fontWeight: 500,
              cursor: 'pointer',
              border: 'none',
              background: 'transparent',
              width: '100%',
              textAlign: 'left'
            }}
          >
            <span className="nicon">
              <i className="fa-solid fa-right-from-bracket"></i>
            </span>
            Logout
          </button>
        </nav>

        {/* Promo Sidebar Panel */}
        {user?.role === 'brand' && (
          <div className="sbf" style={{ padding: '10px', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
            <div className="promo">
              <h4>🎯 Find Talent Fast!</h4>
              <p>Post a project and get applications from skilled students within 24hrs.</p>
              <button className="pb" onClick={() => navigate('/brand-dashboard/post')}>
                Post a Project
              </button>
              <button className="pb" style={{ marginTop: '8px', background: '#e8fdf2', color: '#064e2b' }} onClick={() => navigate('/brand-dashboard/longterm')}>
                Hire Monthly Talent
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
          background: 'rgba(10,31,18,0.48)',
          opacity: mobileOpen ? 1 : 0,
          pointerEvents: mobileOpen ? 'auto' : 'none',
          transition: 'opacity 0.25s ease',
          zIndex: 900
        }}
      ></div>

      {/* Main content body */}
      <div className="main" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        
        {/* Header Topbar */}
        <header className="topbar">
          <div className="tl">
            <button 
              className="mb" 
              onClick={() => setMobileOpen(true)} 
              aria-label="Open menu"
            >
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
                <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16"/>
              </svg>
            </button>
            <div>
              <div className="tt">{header.title}</div>
              <div className="ts_">{header.desc}</div>
            </div>
          </div>
          <div className="tr_">
            {user?.role === 'brand' && (
              <button className="btn bpri" style={{ fontSize: '0.82rem', padding: '8px 14px' }} onClick={() => navigate('/brand-dashboard/post')}>
                + Post Project
              </button>
            )}
            <div className="tav">
              {user?.firstName ? user.firstName.charAt(0).toUpperCase() : '?'}
            </div>
          </div>
        </header>

        {/* Dynamic page outlet */}
        <div className="content" style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};
export default DashboardLayout;
