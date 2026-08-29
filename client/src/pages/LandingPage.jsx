import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import {
  Activity,
  Shield,
  Radio,
  MapPin,
  BarChart3,
  Waves,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  Lock,
  Mail,
  User
} from 'lucide-react';
import { WaveformVisualizer } from '../components/common/WaveformVisualizer.jsx';

export const LandingPage = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('CITIZEN');
  const [loading, setLoading] = useState(false);

  const { login, register, quickLogin } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLoginMode) {
        await login(email, password);
        toast.success('Welcome back to AcousticPulse Command Center');
      } else {
        await register({ name, email, password, role });
        toast.success('Citizen account created successfully');
      }
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoRole) => {
    setLoading(true);
    try {
      await quickLogin(demoRole);
      toast.success(`Logged in as Demo ${demoRole}`);
      navigate('/');
    } catch (err) {
      toast.error('Quick login failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at top, #111b2b 0%, #080c14 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}
    >
      <div
        className="glass-card animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '1100px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          overflow: 'hidden',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-medium)',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        {/* Left Hero & Visual Area */}
        <div
          style={{
            padding: '44px 38px',
            background: 'linear-gradient(180deg, rgba(16, 26, 45, 0.9) 0%, rgba(9, 14, 24, 0.95) 100%)',
            borderRight: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#030712',
                  boxShadow: '0 0 20px rgba(0, 242, 254, 0.4)'
                }}
              >
                <Activity size={26} strokeWidth={2.5} />
              </div>
              <div>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Acoustic<span style={{ color: 'var(--accent-cyan)' }}>Pulse</span>
                </h1>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Smart City Noise Intelligence
                </p>
              </div>
            </div>

            <h2 style={{ fontSize: '1.9rem', fontWeight: 800, lineHeight: 1.25, marginBottom: '14px', color: 'var(--text-primary)' }}>
              Turn Urban Sound Into <br />
              <span style={{ color: 'var(--accent-cyan)', textShadow: '0 0 20px rgba(0,242,254,0.3)' }}>
                Actionable Intelligence.
              </span>
            </h2>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '28px' }}>
              Next-generation environmental telemetry platform. Real-time GIS spatial decibel mapping, diurnal acoustic profiling, AI quiet-hour policy simulations, and citizen complaint resolution.
            </p>

            {/* Live Audio Waveform Simulation */}
            <div style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
                  Live Urban Acoustic Stream (68.4 dBA)
                </span>
                <span className="status-dot online pulsing" />
              </div>
              <WaveformVisualizer dba={68} barCount={28} height={52} />
            </div>

            {/* Feature Pills */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--accent-cyan)' }} />
                <span>GIS Heatmap Mapping</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--accent-cyan)' }} />
                <span>Health Score Index (0-100)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--accent-cyan)' }} />
                <span>Policy Mitigation Sandbox</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--accent-cyan)' }} />
                <span>Citizen Complaint Workflows</span>
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', marginTop: '24px' }}>
            AcousticPulse • “Listen to the City. Understand the Noise. Improve the Future.”
          </div>
        </div>

        {/* Right Authentication & Quick Demo Area */}
        <div style={{ padding: '40px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'var(--bg-secondary)' }}>
          {/* Quick Demo Access Bar */}
          <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '24px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--accent-cyan)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <UserCheck size={16} />
              1-Click Demo Command Roles
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handleQuickDemo('ADMIN')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '7px 4px' }}
                disabled={loading}
              >
                Administrator
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('AUTHORITY')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '7px 4px' }}
                disabled={loading}
              >
                Officer
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('CITIZEN')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '7px 4px' }}
                disabled={loading}
              >
                Citizen
              </button>
            </div>
          </div>

          {/* Form Header */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
              <button
                type="button"
                onClick={() => setIsLoginMode(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: isLoginMode ? 'var(--accent-cyan)' : 'var(--text-muted)',
                  borderBottom: isLoginMode ? '2px solid var(--accent-cyan)' : 'none',
                  paddingBottom: '8px',
                  marginBottom: '-10px',
                  cursor: 'pointer'
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setIsLoginMode(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: !isLoginMode ? 'var(--accent-cyan)' : 'var(--text-muted)',
                  borderBottom: !isLoginMode ? '2px solid var(--accent-cyan)' : 'none',
                  paddingBottom: '8px',
                  marginBottom: '-10px',
                  cursor: 'pointer'
                }}
              >
                Citizen Register
              </button>
            </div>
          </div>

          <form onSubmit={handleAuthSubmit}>
            {!isLoginMode && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Ramesh Varma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Official / Citizen Email</label>
              <input
                type="email"
                className="input"
                placeholder="user@acousticpulse.gov"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Security Password</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '8px', padding: '11px' }}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : isLoginMode ? 'Access Command Center' : 'Create Resident Account'}
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Guest map bypass */}
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <button
              type="button"
              onClick={() => navigate('/')}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Continue as Guest Viewer →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
