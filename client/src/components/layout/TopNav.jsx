import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../services/api.js';
import {
  Search,
  Bell,
  Radio,
  PlusCircle,
  Menu,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TopNav = ({ onOpenSidebar, onOpenCommandPalette }) => {
  const { user, role, isCitizen } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications, setNotifications] = useState([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const navigate = useNavigate();

  // Clock ticker
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch alerts for notification dropdown
  useEffect(() => {
    async function loadAlerts() {
      try {
        const { alerts } = await api.alerts.getAll({ limit: 5, isResolved: 'false' });
        if (alerts) setNotifications(alerts);
      } catch (err) {
        // quiet error
      }
    }
    loadAlerts();
    const interval = setInterval(loadAlerts, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header
      className="glass-card"
      style={{
        height: '70px',
        padding: '0 24px',
        borderRadius: 0,
        borderTop: 'none',
        borderLeft: 'none',
        borderRight: 'none',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 90,
        background: 'var(--bg-card)'
      }}
    >
      {/* Left Area: Mobile Menu + Status + Time */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onOpenSidebar}
          className="btn btn-secondary btn-sm"
          style={{ display: 'none', padding: '8px' }}
          id="mobile-menu-btn"
        >
          <Menu size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="status-dot online pulsing" />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--severity-safe)' }}>
            Live Telemetry Grid
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--bg-tertiary)',
            padding: '5px 12px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.78rem',
            color: 'var(--text-secondary)'
          }}
        >
          <Clock size={14} style={{ color: 'var(--accent-cyan)' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
            {currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {currentTime.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Right Area: Search Shortcut + Submit Complaint + Notifications + Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Global Command Palette search trigger */}
        <button
          onClick={onOpenCommandPalette}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 14px',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
            cursor: 'pointer',
            minWidth: '220px',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Search size={15} />
            <span>Search telemetry, stations...</span>
          </div>
          <kbd
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-medium)',
              borderRadius: '4px',
              padding: '2px 6px',
              fontSize: '0.7rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-secondary)'
            }}
          >
            ⌘K
          </kbd>
        </button>

        {/* Submit Complaint quick CTA */}
        <button
          onClick={() => navigate('/complaints')}
          className="btn btn-primary btn-sm"
        >
          <PlusCircle size={16} />
          <span>Report Noise</span>
        </button>

        {/* Notifications Popover */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            <Bell size={18} />
            {notifications.length > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '5px',
                  right: '5px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--severity-critical)',
                  boxShadow: '0 0 6px var(--severity-critical)'
                }}
              />
            )}
          </button>

          {showNotifMenu && (
            <div
              className="glass-card animate-fade-in"
              style={{
                position: 'absolute',
                top: '46px',
                right: 0,
                width: '320px',
                padding: '16px',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 100
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Acoustic Alerts</span>
                <span className="badge badge-critical">{notifications.length} Active</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>
                    No active threshold alerts.
                  </div>
                ) : (
                  notifications.map(a => (
                    <div
                      key={a.id}
                      onClick={() => {
                        setShowNotifMenu(false);
                        navigate('/alerts');
                      }}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-tertiary)',
                        borderLeft: '3px solid var(--severity-critical)',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {a.location}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {a.dba ? `${a.dba} dBA • ` : ''}{a.message}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <button
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', marginTop: '12px' }}
                onClick={() => {
                  setShowNotifMenu(false);
                  navigate('/alerts');
                }}
              >
                View Alert Command Center
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
