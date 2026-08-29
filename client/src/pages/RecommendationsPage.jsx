import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import {
  Sparkles,
  Moon,
  ShieldCheck,
  TrendingDown,
  Clock,
  ArrowRight,
  TreePine,
  VolumeX,
  Compass,
  CheckCircle2
} from 'lucide-react';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton.jsx';

export const RecommendationsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    async function loadRecommendations() {
      try {
        const res = await api.recommendations.getAll();
        setData(res);
      } catch (err) {
        console.error('Failed to load recommendations:', err);
        toast.error('Failed to load smart recommendations');
      } finally {
        setLoading(false);
      }
    }
    loadRecommendations();
  }, []);

  if (loading || !data) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <LoadingSkeleton height="180px" count={1} />
        <LoadingSkeleton height="140px" count={3} />
      </div>
    );
  }

  const { recommendations, quietHoursAnalysis } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Smart Acoustic Insights & Recommendations</h1>
          <span className="badge badge-safe">Predictive AI Model</span>
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Data-driven policy suggestions, diurnal quiet hour regulations, and targeted noise mitigation blueprints.
        </p>
      </div>

      {/* Featured Quiet Hours Hero Card */}
      <div
        className="glass-card"
        style={{
          padding: '28px',
          background: 'linear-gradient(135deg, rgba(16, 26, 46, 0.95) 0%, rgba(13, 20, 36, 0.95) 100%)',
          border: '1px solid var(--border-medium)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Moon size={20} style={{ color: 'var(--accent-cyan)' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-cyan)' }}>
                Recommended Municipal Quiet Window
              </span>
            </div>

            <div style={{ fontSize: '2.4rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', marginBottom: '8px' }}>
              {quietHoursAnalysis.recommendedWindow}
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '640px', lineHeight: 1.5 }}>
              Aggregated historical nighttime telemetry indicates that enforcing strict quiet limits in residential corridors during this window will reduce night acoustic exposure by <strong style={{ color: 'var(--severity-safe)' }}>~{quietHoursAnalysis.expectedExposureReductionPercent}%</strong>.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '220px' }}>
            <div style={{ background: 'var(--bg-tertiary)', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Model Confidence</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                {quietHoursAnalysis.confidenceScore}%
              </div>
            </div>
            <div style={{ background: 'var(--bg-tertiary)', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current vs Target Night dBA</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                {quietHoursAnalysis.currentNightAvgDba} → <span style={{ color: 'var(--severity-safe)' }}>{quietHoursAnalysis.targetNightAvgDba} dBA</span>
              </div>
            </div>
          </div>
        </div>

        {/* Key Findings List */}
        <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px' }}>
            Empirical Findings Supporting Recommendation:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {quietHoursAnalysis.keyFindings.map((kf, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />
                <span>{kf}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Policy Recommendations Cards */}
      <div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '14px' }}>Urban Infrastructure & Policy Blueprints</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '18px' }}>
          {recommendations.map(rec => (
            <div
              key={rec.id}
              className="glass-card"
              style={{
                padding: '22px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '14px'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span className="badge badge-neutral">
                    {rec.category.replace(/_/g, ' ')}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--severity-safe)', fontWeight: 700 }}>
                    -{rec.expectedReductionDba} dBA Target
                  </span>
                </div>

                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  {rec.title}
                </h4>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '12px' }}>
                  {rec.description}
                </p>
              </div>

              <div style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.78rem' }}>
                <div style={{ color: 'var(--text-muted)', marginBottom: '2px' }}>Impact Projection:</div>
                <div style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>{rec.impactEstimate}</div>
                <div style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Target Zone: <strong style={{ color: 'var(--text-primary)' }}>{rec.targetArea}</strong></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
