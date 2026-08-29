import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import {
  BarChart3,
  PieChart as PieIcon,
  Clock,
  Layers,
  Calendar,
  Filter,
  Download,
  Flame,
  Volume2
} from 'lucide-react';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton.jsx';
import { NoiseBadge } from '../components/common/NoiseBadge.jsx';

// Chart.js components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
);

export const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    async function loadAnalytics() {
      setLoading(true);
      try {
        const res = await api.analytics.getOverview(timeRange);
        setData(res);
      } catch (err) {
        console.error('Analytics load error:', err);
        toast.error('Failed to load acoustic analytics');
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, [timeRange]);

  if (loading || !data) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <LoadingSkeleton height="60px" count={1} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
          <LoadingSkeleton height="320px" count={2} />
        </div>
        <LoadingSkeleton height="350px" count={1} />
      </div>
    );
  }

  // 1. Station Comparison Bar Chart
  const barChartData = {
    labels: data.stationComparisons.map(s => s.name.split(' ')[0] + ' ' + (s.name.split(' ')[1] || '')),
    datasets: [
      {
        label: 'Average dBA',
        data: data.stationComparisons.map(s => s.avgDba),
        backgroundColor: '#00f2fe',
        borderRadius: 4
      },
      {
        label: 'Peak Spike dBA',
        data: data.stationComparisons.map(s => s.peakDba),
        backgroundColor: '#f97316',
        borderRadius: 4
      }
    ]
  };

  // 2. Severity Doughnut Chart
  const doughnutData = {
    labels: data.severityDistribution.map(s => s.label),
    datasets: [
      {
        data: data.severityDistribution.map(s => s.count),
        backgroundColor: ['#10b981', '#f59e0b', '#f97316', '#ef4444'],
        borderColor: 'rgba(13, 18, 29, 0.8)',
        borderWidth: 2
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#94a3b8', font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 } }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#64748b', font: { size: 10 } }
      },
      y: {
        min: 30,
        max: 95,
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#64748b' }
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Acoustic Profile Analytics</h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Multi-station decibel comparisons, severity distribution, diurnal periods, and noise source attribution.
          </p>
        </div>

        {/* Range switcher */}
        <div style={{ display: 'flex', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: '3px', border: '1px solid var(--border-subtle)' }}>
          {['7d', '30d', '90d'].map(r => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              style={{
                background: timeRange === r ? 'var(--bg-card-hover)' : 'transparent',
                color: timeRange === r ? 'var(--accent-cyan)' : 'var(--text-muted)',
                border: 'none',
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Last {r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Top 2-Column Visual Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
        {/* Multi-Station Bar Comparison */}
        <div className="glass-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Station Acoustic Comparison</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Average vs Peak recorded decibels by monitoring node</p>
            </div>
            <BarChart3 size={18} style={{ color: 'var(--accent-cyan)' }} />
          </div>

          <div style={{ height: '300px', width: '100%' }}>
            <Bar data={barChartData} options={chartOptions} />
          </div>
        </div>

        {/* Noise Severity Distribution Doughnut */}
        <div className="glass-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Noise Severity Distribution</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Classification of all temporal sensor telemetry</p>
            </div>
            <PieIcon size={18} style={{ color: 'var(--severity-safe)' }} />
          </div>

          <div style={{ height: '240px', width: '100%', position: 'relative' }}>
            <Doughnut
              data={doughnutData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', boxWidth: 12 } } }
              }}
            />
          </div>

          {/* Quick stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '16px', textAlign: 'center' }}>
            {data.severityDistribution.map(s => (
              <div key={s.label} style={{ background: 'var(--bg-tertiary)', padding: '6px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{s.label.split(' ')[0]}</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: s.color }}>{s.percentage}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Time-of-Day Diurnal Periods Analysis */}
      <div className="glass-card" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Diurnal Time-of-Day Acoustic Rhythm</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Acoustic energy variations across morning, afternoon, evening rush, and night</p>
          </div>
          <Clock size={18} style={{ color: 'var(--accent-cyan)' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {data.timeOfDay.map((p, idx) => (
            <div
              key={p.period}
              style={{
                background: 'var(--bg-tertiary)',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {p.period}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: p.avgDba > 70 ? 'var(--severity-high)' : 'var(--text-primary)' }}>
                  {p.avgDba} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>dBA</span>
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--severity-high)' }}>Peak {p.peakDba} dBA</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '6px' }}>
                Traffic Contribution: <strong style={{ color: 'var(--text-primary)' }}>{p.trafficShare}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Noise Source Attribution & Citizen Incident Shares */}
      <div className="glass-card" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Urban Noise Source Breakdown</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Attribution percentage based on sensor acoustic fingerprinting and citizen grievance logs</p>
          </div>
          <Volume2 size={18} style={{ color: 'var(--accent-cyan)' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {data.sourceBreakdown.map(src => (
            <div key={src.source}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{src.source}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: src.color }}>{src.share}%</span>
              </div>
              <div style={{ height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${src.share}%`,
                    background: src.color,
                    borderRadius: '4px',
                    transition: 'width 1s ease-in-out'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
