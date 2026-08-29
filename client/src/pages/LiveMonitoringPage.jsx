import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import {
  Radio,
  Search,
  Filter,
  RefreshCw,
  SlidersHorizontal,
  MapPin,
  TrendingUp,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  Sparkles,
  Layers,
  LayoutGrid,
  List
} from 'lucide-react';
import { NoiseBadge } from '../components/common/NoiseBadge.jsx';
import { StatusBadge } from '../components/common/StatusBadge.jsx';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { WaveformVisualizer } from '../components/common/WaveformVisualizer.jsx';

export const LiveMonitoringPage = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [selectedZone, setSelectedZone] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [viewMode, setViewMode] = useState('GRID'); // 'GRID' or 'LIST'

  const toast = useToast();
  const navigate = useNavigate();

  const loadStations = async () => {
    try {
      const res = await api.stations.getAll();
      setStations(res.stations || []);
    } catch (err) {
      console.error('Failed to load stations:', err);
      toast.error('Failed to load live monitoring grid');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStations();
    const interval = setInterval(loadStations, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleSyncTick = async () => {
    setRefreshing(true);
    try {
      await api.noise.triggerSimulateTick();
      await loadStations();
      toast.success('Triggered simulated sensor telemetry tick');
    } catch (err) {
      toast.error('Sync failed');
      setRefreshing(false);
    }
  };

  // Filter logic
  const filteredStations = stations.filter(st => {
    const matchesSearch = st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          st.stationCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          st.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = selectedSeverity === 'ALL' || st.severity === selectedSeverity;
    const matchesZone = selectedZone === 'ALL' || st.zoneType === selectedZone;
    const matchesStatus = selectedStatus === 'ALL' || st.status === selectedStatus;
    return matchesSearch && matchesSeverity && matchesZone && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Live Sensor Monitoring Grid</h1>
            <span className="badge badge-safe">Real-Time Polling (8s)</span>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Active acoustic IoT monitoring stations, decibel telemetry, and live frequency metrics.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ display: 'flex', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: '3px', border: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => setViewMode('GRID')}
              style={{
                background: viewMode === 'GRID' ? 'var(--bg-card-hover)' : 'transparent',
                color: viewMode === 'GRID' ? 'var(--accent-cyan)' : 'var(--text-muted)',
                border: 'none',
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('LIST')}
              style={{
                background: viewMode === 'LIST' ? 'var(--bg-card-hover)' : 'transparent',
                color: viewMode === 'LIST' ? 'var(--accent-cyan)' : 'var(--text-muted)',
                border: 'none',
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <List size={16} />
            </button>
          </div>

          <button
            onClick={handleSyncTick}
            className="btn btn-secondary btn-sm"
            disabled={refreshing}
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            <span>{refreshing ? 'Polling...' : 'Sync Sensor Telemetry'}</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flex: '1 1 260px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="input"
              placeholder="Search station, address or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '38px' }}
            />
          </div>

          {/* Severity Filter */}
          <select
            className="select"
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            style={{ flex: '0 1 160px' }}
          >
            <option value="ALL">All Severities</option>
            <option value="SAFE">Safe (&lt; 55 dBA)</option>
            <option value="MODERATE">Moderate (55–65 dBA)</option>
            <option value="HIGH">High (65–75 dBA)</option>
            <option value="CRITICAL">Critical (&gt; 75 dBA)</option>
          </select>

          {/* Zone Filter */}
          <select
            className="select"
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            style={{ flex: '0 1 160px' }}
          >
            <option value="ALL">All Zones</option>
            <option value="RESIDENTIAL">Residential</option>
            <option value="COMMERCIAL">Commercial</option>
            <option value="INDUSTRIAL">Industrial</option>
            <option value="SILENCE_ZONE">Silence Zone</option>
          </select>

          {/* Status Filter */}
          <select
            className="select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{ flex: '0 1 150px' }}
          >
            <option value="ALL">All Statuses</option>
            <option value="ONLINE">Online</option>
            <option value="OFFLINE">Offline</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>
        </div>
      </div>

      {/* Grid or List View */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          <LoadingSkeleton height="260px" count={6} />
        </div>
      ) : filteredStations.length === 0 ? (
        <EmptyState
          title="No Stations Found"
          description="Try adjusting your filters or search terms to see monitoring stations."
          actionLabel="Reset Filters"
          onAction={() => {
            setSearchQuery('');
            setSelectedSeverity('ALL');
            setSelectedZone('ALL');
            setSelectedStatus('ALL');
          }}
        />
      ) : viewMode === 'GRID' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
          {filteredStations.map(st => {
            const isCritical = st.currentDba >= 80;
            return (
              <div
                key={st.id}
                className="glass-card"
                style={{
                  padding: '22px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderTop: isCritical ? '3px solid var(--severity-critical)' : '1px solid var(--border-subtle)',
                  position: 'relative'
                }}
              >
                <div>
                  {/* Top Bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                        {st.stationCode}
                      </span>
                      <span className="badge badge-neutral" style={{ fontSize: '0.68rem' }}>
                        {st.zoneType}
                      </span>
                    </div>
                    <StatusBadge status={st.status} />
                  </div>

                  {/* Title & Address */}
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-primary)' }}>
                    {st.name}
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={13} />
                    {st.address}
                  </p>

                  {/* Decibel Display Card */}
                  <div
                    style={{
                      background: 'var(--bg-tertiary)',
                      borderRadius: 'var(--radius-md)',
                      padding: '14px 16px',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '16px'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Live Telemetry
                      </div>
                      <div style={{ fontSize: '1.9rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                        {st.currentDba.toFixed(1)}
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>dBA</span>
                      </div>
                    </div>
                    <NoiseBadge dba={st.currentDba} size="md" />
                  </div>

                  {/* Audio waveform */}
                  <div style={{ marginBottom: '16px' }}>
                    <WaveformVisualizer dba={st.currentDba} barCount={24} height={32} />
                  </div>

                  {/* 24h Summary Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px', textAlign: 'center' }}>
                    <div style={{ background: 'var(--bg-tertiary)', padding: '8px', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>24h Avg</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{st.stats24h?.avgDba ?? st.currentDba} dBA</div>
                    </div>
                    <div style={{ background: 'var(--bg-tertiary)', padding: '8px', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Peak Spike</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--severity-high)' }}>{st.stats24h?.maxDba ?? st.currentDba + 5} dBA</div>
                    </div>
                    <div style={{ background: 'var(--bg-tertiary)', padding: '8px', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Violations</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: st.stats24h?.violationsCount > 0 ? 'var(--severity-critical)' : 'var(--text-primary)' }}>
                        {st.stats24h?.violationsCount ?? 0}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>Limit: {st.isNight ? st.nightThresholdDba : st.dayThresholdDba} dBA ({st.isNight ? 'Night' : 'Day'})</span>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => navigate('/analytics')}
                  >
                    Deep Analytics →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="glass-card" style={{ padding: '16px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px' }}>Station Code</th>
                <th style={{ padding: '12px' }}>Name & Location</th>
                <th style={{ padding: '12px' }}>Zone</th>
                <th style={{ padding: '12px' }}>Current dBA</th>
                <th style={{ padding: '12px' }}>24h Avg / Peak</th>
                <th style={{ padding: '12px' }}>Day / Night Limit</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStations.map(st => (
                <tr key={st.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                    {st.stationCode}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{st.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{st.address}</div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span className="badge badge-neutral">{st.zoneType}</span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <NoiseBadge dba={st.currentDba} size="sm" />
                  </td>
                  <td style={{ padding: '12px', fontFamily: 'var(--font-mono)' }}>
                    {st.stats24h?.avgDba} / <span style={{ color: 'var(--severity-high)' }}>{st.stats24h?.maxDba} dBA</span>
                  </td>
                  <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    {st.dayThresholdDba} / {st.nightThresholdDba} dBA
                  </td>
                  <td style={{ padding: '12px' }}>
                    <StatusBadge status={st.status} />
                  </td>
                  <td style={{ padding: '12px' }}>
                    <button onClick={() => navigate('/analytics')} className="btn btn-secondary btn-sm">
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
