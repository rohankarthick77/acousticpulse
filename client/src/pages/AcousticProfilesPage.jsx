import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import {
  Waves,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Info,
  MapPin,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton.jsx';
import { NoiseBadge } from '../components/common/NoiseBadge.jsx';

export const AcousticProfilesPage = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    async function loadProfiles() {
      try {
        const res = await api.profiles.getAll();
        setProfiles(res.profiles || []);
      } catch (err) {
        console.error('Failed to load profiles:', err);
        toast.error('Failed to load acoustic profiles');
      } finally {
        setLoading(false);
      }
    }
    loadProfiles();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <LoadingSkeleton height="60px" count={1} />
        <LoadingSkeleton height="200px" count={3} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Acoustic Profile Classification</h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Urban environmental zoning standards, decibel exposure risk metrics, and recommended mitigation actions.
        </p>
      </div>

      {/* Profiles Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {profiles.map(p => {
          return (
            <div
              key={p.id}
              className="glass-card"
              style={{
                padding: '24px',
                borderLeft: `5px solid ${p.colorHex}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
            >
              {/* Header row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {p.name}
                    </h3>
                    <span
                      style={{
                        padding: '3px 10px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        background: `${p.colorHex}22`,
                        color: p.colorHex,
                        border: `1px solid ${p.colorHex}66`
                      }}
                    >
                      {p.lowerDba} – {p.upperDba >= 100 ? '100+' : p.upperDba} dBA
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {p.description}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '14px', textAlign: 'right' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Locations</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: p.colorHex }}>
                      {p.locationCount} Nodes
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Zone Mean</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                      {p.averageDba} dBA
                    </div>
                  </div>
                </div>
              </div>

              {/* Biological Health Risk & Recommended Action */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
                <div style={{ background: 'var(--bg-tertiary)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Biological Health Impact
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                    {p.healthRisk}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-tertiary)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-cyan)', marginBottom: '4px' }}>
                    Prescribed Intervention Policy
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                    {p.recommendedAction}
                  </div>
                </div>
              </div>

              {/* Station chips */}
              {p.stations && p.stations.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Classified Stations:
                  </span>
                  {p.stations.map(st => (
                    <span
                      key={st.id}
                      style={{
                        fontSize: '0.78rem',
                        background: 'var(--bg-input)',
                        padding: '3px 10px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <MapPin size={12} style={{ color: p.colorHex }} />
                      {st.name} ({st.lastReadingDba} dBA)
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
