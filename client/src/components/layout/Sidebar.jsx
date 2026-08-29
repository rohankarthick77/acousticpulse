import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import {
  LayoutDashboard,
  Radio,
  MapPin,
  BarChart3,
  Waves,
  MessageSquareWarning,
  BellRing,
  Sparkles,
  Sliders,
  FileText,
  Server,
  Users,
  Settings,
  Sun,
  Moon,
  LogOut,
  Activity,
  ShieldAlert
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, role, logout, isAdmin, isAuthority } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard, exact: true },
    { label: 'Live Monitoring', path: '/monitoring', icon: Radio },
    { label: 'Noise Map', path: '/map', icon: MapPin },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Acoustic Profiles', path: '/profiles', icon: Waves },
    { label: 'Complaints', path: '/complaints', icon: MessageSquareWarning },
    { label: 'Alerts & Anomalies', path: '/alerts', icon: BellRing },
    { label: 'Recommendations', path: '/recommendations', icon: Sparkles },
    { label: 'Policy Simulator', path: '/simulator', icon: Sliders },
    { label: 'Reports', path: '/reports', icon: FileText }
  ];

  // Admin & Management items
  const adminItems = [
    { label: 'Stations Management', path: '/stations', icon: Server },
    { label: 'User Directory', path: '/users', icon: Users },
    { label: 'Platform Settings', path: '/settings', icon: Settings }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 998,
            display: 'block'
          }}
        />
      )}

      <aside
        className="glass-card"
        style={{
          width: '260px',
          height: '100vh',
          position: 'sticky',
          top: 0,
          left: 0,
          zIndex: 999,
          borderRadius: 0,
          borderTop: 'none',
          borderBottom: 'none',
          borderLeft: 'none',
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '20px 14px',
          background: 'var(--bg-secondary)',
          flexShrink: 0
        }}
      >
        {/* Brand Header */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 10px 20px 10px',
              borderBottom: '1px solid var(--border-subtle)'
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#040b17',
                boxShadow: '0 0 16px rgba(0, 242, 254, 0.4)'
              }}
            >
              <Activity size={22} strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                Acoustic<span style={{ color: 'var(--accent-cyan)' }}>Pulse</span>
              </div>
              <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Urban Acoustic Intel
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', padding: '6px 12px' }}>
              Intelligence Core
            </div>
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.exact}
                  onClick={() => onClose && onClose()}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.85rem',
                    fontWeight: isActive ? 700 : 500,
                    textDecoration: 'none',
                    color: isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                    background: isActive ? 'var(--bg-tertiary)' : 'transparent',
                    borderLeft: isActive ? '3px solid var(--accent-cyan)' : '3px solid transparent',
                    transition: 'var(--transition)'
                  })}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}

            {/* Administration section */}
            {isAdmin && (
              <>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', padding: '12px 12px 6px 12px', marginTop: '6px' }}>
                  Administration
                </div>
                {adminItems.map(item => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => onClose && onClose()}
                      style={({ isActive }) => ({
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '9px 12px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.85rem',
                        fontWeight: isActive ? 700 : 500,
                        textDecoration: 'none',
                        color: isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                        background: isActive ? 'var(--bg-tertiary)' : 'transparent',
                        borderLeft: isActive ? '3px solid var(--accent-cyan)' : '3px solid transparent',
                        transition: 'var(--transition)'
                      })}
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </>
            )}
          </div>
        </div>

        {/* Footer Profile & Actions */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* User badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 8px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-medium)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.85rem',
                color: 'var(--accent-cyan)'
              }}
            >
              {user?.name ? user.name[0].toUpperCase() : 'G'}
            </div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user?.name || 'Public Guest'}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {role}
              </div>
            </div>
          </div>

          {/* Theme & Logout Controls */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={toggleTheme}
              className="btn btn-secondary btn-sm"
              style={{ flex: 1 }}
              title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
              <span>{isDark ? 'Light' : 'Dark'}</span>
            </button>

            {user ? (
              <button
                onClick={handleLogout}
                className="btn btn-outline btn-sm"
                style={{ padding: '6px 10px', color: 'var(--severity-critical)' }}
                title="Logout"
              >
                <LogOut size={15} />
              </button>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="btn btn-primary btn-sm"
                style={{ flex: 1 }}
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
