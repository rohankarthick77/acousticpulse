import React, { useState } from 'react';
import { useToast } from '../context/ToastContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import {
  Settings,
  Shield,
  Sliders,
  Moon,
  Sun,
  Database,
  Radio,
  Save,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api.js';

export const SettingsPage = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  const [pollingRate, setPollingRate] = useState('8');
  const [criticalThreshold, setCriticalThreshold] = useState('80');
  const [alertDuration, setAlertDuration] = useState('15');
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  const toast = useToast();

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('System configuration parameters saved');
    }, 500);
  };

  const handleSimulateTick = async () => {
    try {
      await api.noise.triggerSimulateTick();
      toast.success('Live simulated noise readings updated across all stations');
    } catch (err) {
      toast.error('Simulation update failed');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '900px' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Platform Settings & Parameters</h1>
          <span className="badge badge-safe">Config v1.0</span>
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Adjust acoustic telemetry polling frequencies, global anomaly thresholds, and interface preferences.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Appearance Settings */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Interface Theme</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Toggle between high-contrast dark command center and clean light mode</p>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="btn btn-secondary btn-sm"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
              <span>{isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</span>
            </button>
          </div>
        </div>

        {/* Anomaly & Polling Thresholds */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Telemetry Engine Configuration</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Configure sampling rate and auto-trigger criteria</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Simulation Sampling Interval (seconds)</label>
              <select
                className="select"
                value={pollingRate}
                onChange={(e) => setPollingRate(e.target.value)}
              >
                <option value="5">5 Seconds (Ultra Real-Time)</option>
                <option value="8">8 Seconds (Standard Demo)</option>
                <option value="15">15 Seconds</option>
                <option value="30">30 Seconds</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Critical Noise Spike Threshold (dBA)</label>
              <input
                type="number"
                className="input"
                value={criticalThreshold}
                onChange={(e) => setCriticalThreshold(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Prolonged Exposure Anomaly Window (minutes)</label>
            <input
              type="number"
              className="input"
              value={alertDuration}
              onChange={(e) => setAlertDuration(e.target.value)}
            />
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Triggers a municipal alert if decibels remain continuously above threshold for this duration.
            </div>
          </div>
        </div>

        {/* Live Simulation Testing Bar */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Instant Telemetry Simulation Trigger</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Force an immediate recalculation and broadcast across all 12 smart nodes</p>
          </div>
          <button
            type="button"
            onClick={handleSimulateTick}
            className="btn btn-secondary btn-sm"
          >
            <RefreshCw size={15} />
            <span>Trigger Simulation Tick</span>
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
};
