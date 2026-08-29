import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import {
  Activity,
  Radio,
  MapPin,
  AlertTriangle,
  ShieldCheck,
  MessageSquareWarning,
  Flame,
  RefreshCw,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Sliders,
  CheckCircle2,
  BellRing
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard.jsx';
import { HealthGauge } from '../components/common/HealthGauge.jsx';
import { WaveformVisualizer } from '../components/common/WaveformVisualizer.jsx';
import { NoiseMap } from '../components/map/NoiseMap.jsx';
import { NoiseBadge } from '../components/common/NoiseBadge.jsx';
import { StatusBadge } from '../components/common/StatusBadge.jsx';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton.jsx';

// Chart.js registration
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const DashboardOverview = () => {
  const [stats, setStats] = useState(null);
  const [stations, setStations] = useState([]);
  const [trends, setTrends] = useState([]);
  const [violations, setViolations] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();

  const loadDashboardData = async () => {
    try {
      const [statsRes, stationsRes, trendsRes, violationsRes, alertsRes] = await Promise.all([
        api.noise.getStats(),
        api.stations.getAll(),
        api.noise.getTrends('24h'),
        api.noise.getViolations(6),
        api.alerts.getAll({ limit: 4, isResolved: 'false' })
      ]);

      setStats(statsRes);
      setStations(stationsRes.stations || []);
      setTrends(trendsRes.data || []);
      setViolations(violationsRes.violations || []);
      setAlerts(alertsRes.alerts || []);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      toast.error('Failed to load real-time telemetry');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    // Auto-refresh telemetry every 10 seconds
    const interval = setInterval(loadDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    try {
      await api.noise.triggerSimulateTick();
      await loadDashboardData();
      toast.success('Live telemetry synchronized');
    } catch (err) {
      toast.error('Simulation refresh failed');
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <LoadingSkeleton height="60px" count={1} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <LoadingSkeleton height="130px" count={6} />
        </div>
        <LoadingSkeleton height="450px" count={1} />
      </div>
    );
  }

  // Chart configuration for 24h Diurnal Curve
  const chartData = {
    labels: trends.map(t => t.timeLabel),
    datasets: [
      {
        label: 'Average Noise (dBA)',
        data: trends.map(t => t.averageDba),
        borderColor: '#00f2fe',
        backgroundColor: 'rgba(0, 242, 254, 0.12)',
        fill: true,
        tension: 0.35,
        borderWidth: 2.5,
        pointRadius: 3,
        pointHoverRadius: 6
      },
      {
        label: 'Peak Decibels (dBA)',
        data: trends.map(t => t.peakDba),
        borderColor: '#f97316',
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        tension: 0.3,
        borderWidth: 1.8,
        pointRadius: 2
      },
      {
        label: 'Regulatory Limit (dBA)',
        data: trends.map(t => t.threshold),
        borderColor: '#ef4444',
        borderDash: [3, 3],
        tension: 0,
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#94a3b8',
          font: { family: "'Plus Jakarta Sans', sans-serif", size: 11, weight: 600 },
          boxWidth: 12
        }
      },
      tooltip: {
        backgroundColor: 'rgba(13, 18, 29, 0.95)',
        titleColor: '#f8fafc',
        bodyColor: '#94a3b8',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        padding: 10
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#64748b', font: { family: "'JetBrains Mono', monospace", size: 10 } }
      },
      y: {
        min: 30,
        max: 100,
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#64748b', font: { family: "'JetBrains Mono', monospace", size: 10 } }
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Urban Noise Intelligence Command</h1>
            <span className="badge badge-safe">City Center Online</span>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Continuous acoustic telemetry, spatial noise mapping, and environmental violation tracking.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleManualRefresh}
            className="btn btn-secondary btn-sm"
            disabled={refreshing}
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            <span>{refreshing ? 'Syncing...' : 'Live Telemetry Sync'}</span>
          </button>

          <button
            onClick={() => navigate('/simulator')}
            className="btn btn-primary btn-sm"
          >
            <Sliders size={15} />
            <span>Policy Sandbox</span>
          </button>
        </div>
      </div>

      {/* 6 Executive KPI Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px' }}>
        <StatCard
          title="Average Noise Level"
          value={stats?.averageDba ?? 68.4}
          unit="dBA"
          description="Across 12 smart nodes"
          trend={stats?.trendPercentage ?? -4.2}
          trendLabel="vs 24h avg"
          icon={Activity}
          accentColor="var(--accent-cyan)"
        />

        <StatCard
          title="Active Monitoring"
          value={`${stats?.activeStations ?? 11}/${stats?.totalStations ?? 12}`}
          unit="Nodes"
          description="91.6% network uptime"
          icon={Radio}
          accentColor="var(--severity-safe)"
        />

        <StatCard
          title="Critical Noise Zones"
          value={stats?.criticalZones ?? 2}
          unit="Zones"
          description="Levels exceeding 80 dBA"
          icon={Flame}
          accentColor="var(--severity-critical)"
        />

        <StatCard
          title="Open Complaints"
          value={stats?.openComplaints ?? 5}
          unit="Cases"
          description="Active citizen reports"
          icon={MessageSquareWarning}
          accentColor="var(--severity-moderate)"
        />

        <StatCard
          title="24h Violations"
          value={stats?.violations24h ?? 84}
          unit="Events"
          description="Day/Night limit breaches"
          icon={AlertTriangle}
          accentColor="var(--severity-high)"
        />

        <StatCard
          title="Urban Health Score"
          value={`${stats?.healthScore?.score ?? 74}/100`}
          unit={stats?.healthScore?.rating ?? 'MODERATE'}
          description="Composite acoustic health"
          icon={ShieldCheck}
          accentColor="var(--accent-indigo)"
        />
      </div>

      {/* Real-time Acoustic Audio Stream Visualizer Bar */}
      <div className="glass-card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="status-dot online pulsing" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-primary)' }}>
              Acoustic Pulse Live Spectrum — Active Audio Stream (Aggregate 68.4 dBA)
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            1,000 Hz Band Calibration • 8s interval
          </span>
        </div>
        <WaveformVisualizer dba={stats?.averageDba ?? 68} barCount={48} height={44} />
      </div>

      {/* Main Grid: GIS Noise Map + Health Score Gauge */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
        {/* Left: Spatial GIS Map */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Geospatial Noise Telemetry</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Interactive smart-city GIS mapping with live decibel beacon pins</p>
            </div>
            <button
              onClick={() => navigate('/map')}
              className="btn btn-secondary btn-sm"
            >
              <MapPin size={14} />
              Full Map
            </button>
          </div>

          <NoiseMap
            stations={stations}
            height="380px"
          />
        </div>

        {/* Right: Health Score Gauge + Anomaly Alerts Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Health Score Card */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Urban Noise Health Index</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>City-wide acoustic exposure & biological recovery score</p>
              </div>
              <span className="badge badge-safe">WHO Benchmark</span>
            </div>

            <HealthGauge
              score={stats?.healthScore?.score ?? 74}
              rating={stats?.healthScore?.rating ?? 'MODERATE'}
              details={stats?.healthScore}
            />
          </div>

          {/* Quick Anomaly Alerts */}
          <div className="glass-card" style={{ padding: '20px', flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BellRing size={18} style={{ color: 'var(--severity-critical)' }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Recent Acoustic Anomalies</h3>
              </div>
              <button onClick={() => navigate('/alerts')} className="btn btn-secondary btn-sm">
                All Alerts →
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {alerts.length === 0 ? (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>
                  No active anomaly alerts. All stations within threshold limits.
                </div>
              ) : (
                alerts.map(a => (
                  <div
                    key={a.id}
                    onClick={() => navigate('/alerts')}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-tertiary)',
                      borderLeft: `4px solid ${a.severity === 'CRITICAL' ? 'var(--severity-critical)' : 'var(--severity-high)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {a.location}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {a.message}
                      </div>
                    </div>
                    {a.dba && <NoiseBadge dba={a.dba} showLabel={false} size="sm" />}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 24-Hour Diurnal Diurnal Trend Line Chart */}
      <div className="glass-card" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>24-Hour Diurnal Noise Profile</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Actual decibels vs Morning rush (08:30), Evening rush (18:30) & Nighttime regulatory limits
            </p>
          </div>
          <button
            onClick={() => navigate('/analytics')}
            className="btn btn-secondary btn-sm"
          >
            Deep Analytics →
          </button>
        </div>

        <div style={{ height: '280px', width: '100%' }}>
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Recent Violations Table */}
      <div className="glass-card" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Recent Regulatory Violations</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Logged events exceeding prescribed zone dBA thresholds</p>
          </div>
          <button onClick={() => navigate('/monitoring')} className="btn btn-secondary btn-sm">
            View All Telemetry
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '10px 12px' }}>Station Code</th>
                <th style={{ padding: '10px 12px' }}>Location / Zone</th>
                <th style={{ padding: '10px 12px' }}>Measured Decibels</th>
                <th style={{ padding: '10px 12px' }}>Day/Night Limit</th>
                <th style={{ padding: '10px 12px' }}>Timestamp</th>
                <th style={{ padding: '10px 12px' }}>Severity</th>
              </tr>
            </thead>
            <tbody>
              {violations.map(v => (
                <tr key={v.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'var(--transition)' }}>
                  <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                    {v.station?.stationCode || 'AP-STN'}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{v.station?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{v.station?.zoneType}</div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <NoiseBadge dba={v.dba} size="sm" />
                  </td>
                  <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                    Day: {v.station?.dayThresholdDba} dBA • Night: {v.station?.nightThresholdDba} dBA
                  </td>
                  <td style={{ padding: '12px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {new Date(v.recordedAt).toLocaleTimeString()}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <StatusBadge status={v.dba >= 80 ? 'CRITICAL' : 'HIGH'} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
