import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import {
  BellRing,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Filter,
  ShieldCheck,
  MapPin,
  Clock,
  Radio
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge.jsx';
import { NoiseBadge } from '../components/common/NoiseBadge.jsx';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';

export const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({});
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [showResolved, setShowResolved] = useState(false);
  const [loading, setLoading] = useState(true);

  const { isAuthority } = useAuth();
  const toast = useToast();

  const loadAlerts = async () => {
    try {
      const [alertsRes, statsRes] = await Promise.all([
        api.alerts.getAll({
          severity: severityFilter,
          isResolved: showResolved ? 'true' : 'false'
        }),
        api.alerts.getStats()
      ]);
      setAlerts(alertsRes.alerts || []);
      setStats(statsRes.summary || {});
    } catch (err) {
      console.error('Failed to load alerts:', err);
      toast.error('Failed to load anomaly alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [severityFilter, showResolved]);

  const handleResolveAlert = async (id) => {
    try {
      await api.alerts.resolve(id);
      toast.success('Alert marked as resolved');
      await loadAlerts();
    } catch (err) {
      toast.error('Failed to resolve alert: ' + err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Acoustic Anomaly & Alert Center</h1>
            <span className="badge badge-critical">Real-Time Trigger</span>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Automated threshold breaches, prolonged acoustic exposure warnings, and IoT sensor drops.
          </p>
        </div>

        {/* Resolved toggle */}
        <div style={{ display: 'flex', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: '3px', border: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => setShowResolved(false)}
            style={{
              background: !showResolved ? 'var(--bg-card-hover)' : 'transparent',
              color: !showResolved ? 'var(--accent-cyan)' : 'var(--text-muted)',
              border: 'none',
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Active ({stats.totalUnresolved ?? 0})
          </button>
          <button
            onClick={() => setShowResolved(true)}
            style={{
              background: showResolved ? 'var(--bg-card-hover)' : 'transparent',
              color: showResolved ? 'var(--accent-cyan)' : 'var(--text-muted)',
              border: 'none',
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Resolved History
          </button>
        </div>
      </div>

      {/* Severity Counters Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px' }}>
        {[
          { label: 'All Alerts', key: 'ALL', count: alerts.length, color: 'var(--text-primary)' },
          { label: 'Critical Spikes', key: 'CRITICAL', count: stats.CRITICAL || 0, color: 'var(--severity-critical)' },
          { label: 'High Exposure', key: 'HIGH', count: stats.HIGH || 0, color: 'var(--severity-high)' },
          { label: 'Warnings', key: 'WARNING', count: stats.WARNING || 0, color: 'var(--severity-moderate)' }
        ].map(item => (
          <button
            key={item.key}
            onClick={() => setSeverityFilter(item.key)}
            style={{
              background: severityFilter === item.key ? 'var(--bg-card-hover)' : 'var(--bg-tertiary)',
              border: severityFilter === item.key ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              textAlign: 'left',
              cursor: 'pointer'
            }}
          >
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{item.label}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: item.color }}>
              {item.count}
            </div>
          </button>
        ))}
      </div>

      {/* Alert Feed List */}
      {loading ? (
        <LoadingSkeleton height="100px" count={4} />
      ) : alerts.length === 0 ? (
        <EmptyState
          title="No Active Alerts"
          description={showResolved ? "No resolved alert logs in database." : "All monitoring stations are reporting within safe regulatory limits."}
          icon={ShieldCheck}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {alerts.map(a => {
            const isCritical = a.severity === 'CRITICAL';
            return (
              <div
                key={a.id}
                className="glass-card"
                style={{
                  padding: '20px',
                  borderLeft: `5px solid ${isCritical ? 'var(--severity-critical)' : a.severity === 'HIGH' ? 'var(--severity-high)' : 'var(--severity-moderate)'}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flex: 1, minWidth: '280px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: 'var(--radius-md)',
                      background: isCritical ? 'var(--severity-critical-bg)' : 'var(--bg-tertiary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isCritical ? 'var(--severity-critical)' : 'var(--severity-high)',
                      flexShrink: 0
                    }}
                  >
                    {isCritical ? <Flame size={22} /> : <AlertTriangle size={22} />}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <StatusBadge status={a.severity} />
                      <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        {a.alertType}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      {a.location}
                    </h4>

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      {a.message}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={13} />
                        {new Date(a.createdAt).toLocaleTimeString()} ({new Date(a.createdAt).toLocaleDateString()})
                      </span>
                      {a.durationMinutes && (
                        <span>Duration: {a.durationMinutes} min sustained</span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  {a.dba && <NoiseBadge dba={a.dba} size="md" />}

                  {!a.isResolved && isAuthority && (
                    <button
                      onClick={() => handleResolveAlert(a.id)}
                      className="btn btn-secondary btn-sm"
                    >
                      <CheckCircle2 size={15} style={{ color: 'var(--severity-safe)' }} />
                      <span>Mark Resolved</span>
                    </button>
                  )}

                  {a.isResolved && (
                    <span className="badge badge-safe">
                      Resolved
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
