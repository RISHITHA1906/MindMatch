import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import IncomingCall from './video/IncomingCall';

const nav = [
  { to: '/',          icon: '🏠', label: 'Dashboard',    exact: true },
  { to: '/matching',  icon: '🔍', label: 'Find Partners' },
  { to: '/barter',    icon: '🔄', label: 'Skill Barter'  },
  { to: '/chat',      icon: '💬', label: 'Messages'      },
  { to: '/sessions',  icon: '📅', label: 'Sessions'      },
  { to: '/mentors',   icon: '🏆', label: 'Mentors'       },
  { to: '/analytics', icon: '📊', label: 'Analytics'     },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const isMobile = () => window.innerWidth < 768;

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (isMobile()) setSidebarOpen(false);
  }, [location.pathname]);

  // Update sidebar state on resize
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setSidebarOpen(true);
      else setSidebarOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const avatarSrc = user?.avatar;
  const sidebarW = 240;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)', position: 'relative' }}>

      {/* ── Mobile overlay backdrop ── */}
      {sidebarOpen && isMobile() && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 99 }}
        />
      )}

      {/* ── Sidebar ── */}
      <aside style={{
        width: sidebarW,
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: sidebarOpen ? 0 : -sidebarW,
        height: '100vh',
        zIndex: 100,
        transition: 'left 0.28s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: sidebarOpen ? 'var(--shadow-lg)' : 'none',
        overflowY: 'auto',
      }}>
        {/* Logo row + close btn */}
        <div style={{ padding: '16px 14px 12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,var(--primary),var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.95rem', flexShrink: 0 }}>🧠</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>MindMatch</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>AI Peer Learning</div>
          </div>
          {/* Close button — visible always for easy toggle */}
          <button
            onClick={() => setSidebarOpen(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--text-muted)', padding: '4px', lineHeight: 1, flexShrink: 0 }}
            title="Close sidebar"
          >✕</button>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '10px 8px' }}>
          {nav.map(({ to, icon, label, exact }) => (
            <NavLink key={to} to={to} end={exact} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 'var(--radius-md)',
              marginBottom: 2, fontSize: '0.87rem', fontWeight: isActive ? 700 : 500,
              color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
              background: isActive ? 'var(--accent-pink)' : 'transparent',
              textDecoration: 'none', transition: 'var(--transition)',
            })}
            onMouseEnter={e => { if (!e.currentTarget.getAttribute('aria-current')) e.currentTarget.style.background = 'var(--bg-hover)'; }}
            onMouseLeave={e => { if (!e.currentTarget.getAttribute('aria-current')) e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ fontSize: '1rem', flexShrink: 0 }}>{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User area */}
        <div style={{ padding: '10px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          <div
            onClick={() => navigate('/profile')}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px', cursor: 'pointer', borderRadius: 'var(--radius-md)', transition: 'var(--transition)', marginBottom: 6 }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,var(--primary),var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.85rem', overflow: 'hidden', flexShrink: 0 }}>
              {avatarSrc ? <img src={avatarSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : user?.name?.[0]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-primary)' }}>{user?.name}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>💎 {user?.skill_credits || 0} credits</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={toggle} style={{ flex: 1, padding: '7px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-card)', cursor: 'pointer', fontSize: '0.78rem', color: 'var(--text-secondary)', transition: 'var(--transition)' }}>
              {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
            </button>
            <button onClick={logout} style={{ flex: 1, padding: '7px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-card)', cursor: 'pointer', fontSize: '0.78rem', color: 'var(--text-muted)', transition: 'var(--transition)' }}>
              🚪 Logout
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main style={{
        flex: 1,
        marginLeft: (!isMobile() && sidebarOpen) ? sidebarW : 0,
        minHeight: '100vh',
        overflowX: 'hidden',
        background: 'var(--bg-primary)',
        transition: 'margin-left 0.28s cubic-bezier(0.4,0,0.2,1)',
      }}>
        {/* Top bar with hamburger */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 50,
          background: 'var(--bg-card)',
          borderBottom: '1px solid var(--border)',
          padding: '10px 16px',
          display: 'flex', alignItems: 'center', gap: 12,
          boxShadow: 'var(--shadow-sm)',
        }}>
          <button
            onClick={() => setSidebarOpen(o => !o)}
            style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '6px 10px', cursor: 'pointer', fontSize: '1rem', color: 'var(--text-secondary)', transition: 'var(--transition)', flexShrink: 0 }}
            title="Toggle sidebar"
          >☰</button>
          <div style={{ flex: 1 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              {nav.find(n => n.to === location.pathname)?.label || 'MindMatch'}
            </span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>💎 {user?.skill_credits || 0}</div>
        </div>

        <div style={{ padding: '0' }}>
          <Outlet />
        </div>
      </main>

      <IncomingCall />
    </div>
  );
}
