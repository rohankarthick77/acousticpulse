import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import {
  MapPin,
  Layers,
  Flame,
  Radio,
  Sliders,
  Eye,
  RefreshCw,
  Maximize2,
  Minimize2,
  X,
  PlusCircle
} from 'lucide-react';
import { NoiseMap } from '../components/map/NoiseMap.jsx';
import { NoiseBadge } from '../components/common/NoiseBadge.jsx';
import { StatusBadge } from '../components/common/StatusBadge.jsx';
import { WaveformVisualizer } from '../components/common/WaveformVisualizer.jsx';
import { Drawer } from '../components/common/Drawer.jsx';

export const NoiseMapPage = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStation, setSelectedStation] = useState(null);
  const [selectedZoneFilter, setSelectedZoneFilter] = useState('ALL');
  const [showHeatCircles, setShowHeatCircles] = useState(true);
  const [mapCenter, setMapCenter] = useState([13.045, 80.235]);
  const [mapZoom, setMapZoom] = useState(12);

  const toast = useToast();
  const navigate = useNavigate();

  const loadStations = async () => {
    try {
      const res = await api.stations.getAll();
      setStations(res.stations || []);
    } catch (err) {
      console.error('Failed to load stations for map:', err);
      toast.error('Failed to load GIS stations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStations();
    const interval = setInterval(loadStations, 10000);
    return () => clearInterval(interval);
  }, []);

  const filteredStations = stations.filter(st => {
    if (selectedZoneFilter === 'ALL') return true;
    return st.zoneType === selectedZoneFilter;
  });

  const handleFocusHotspot = () => {
    if (!stations.length) return;
    const hotspot = [...stations].sort((a, b) => (b.lastReadingDba || 0) - (a.lastReadingDba || 0))[0];
    if (hotspot) {
      setMapCenter([hotspot.latitude, hotspot.longitude]);
      setMapZoom(15);
      setSelectedStation(hotspot);
      toast.info(`Focused on Top Hotspot: ${hotspot.name} (${hotspot.currentDba} dBA)`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', height: 'calc(100vh - 120px)' }}>
      {/* Top Map Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Spatial Noise GIS Intelligence</h1>
            <span className="badge badge-safe">Chennai Metropolis</span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Real-time geospatial acoustic contour radius, beacon telemetry, and zone classification.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* Zone filter */}
          <select
            className="select"
            value={selectedZoneFilter}
            onChange={(e) => setSelectedZoneFilter(e.target.value)}
            style={{ width: '160px', padding: '6px 10px', fontSize: '0.82rem' }}
          >
            <option value="ALL">All Zones</option>
            <option value="RESIDENTIAL">Residential</option>
            <option value="COMMERCIAL">Commercial</option>
            <option value="INDUSTRIAL">Industrial</option>
            <option value="SILENCE_ZONE">Silence Zone</option>
          </select>

          {/* Toggle Heat Radius */}
          <button
            onClick={() => setShowHeatCircles(!showHeatCircles)}
            className={`btn btn-sm ${showHeatCircles ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Layers size={15} />
            <span>{showHeatCircles ? 'Radius Rings Active' : 'Rings Hidden'}</span>
          </button>

          {/* Focus Top Hotspot */}
          <button
            onClick={handleFocusHotspot}
            className="btn btn-secondary btn-sm"
          >
            <Flame size={15} style={{ color: 'var(--severity-critical)' }} />
            <span>Focus Hotspot</span>
          </button>
        </div>
      </div>

      {/* Main Fullscreen GIS Map Shell */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '16px', flex: 1, minHeight: 0 }}>
        {/* Left: Map Container */}
        <div style={{ height: '100%', minHeight: '400px' }}>
          <NoiseMap
            stations={filteredStations}
            selectedStation={selectedStation}
            onSelectStation={(st) => setSelectedStation(st)}
            showHeatCircles={showHeatCircles}
            center={mapCenter}
            zoom={mapZoom}
            height="100%"
          />
        </div>

        {/* Right: Station Telemetry Stream & Hotspot Rankings */}
        <div
          className="glass-card"
          style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            padding: '16px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Telemetry Ranking</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{filteredStations.length} Active Nodes</span>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[...filteredStations]
              .sort((a, b) => (b.currentDba || 0) - (a.currentDba || 0))
              .map((st, idx) => {
                const isSelected = selectedStation?.id === st.id;
                return (
                  <div
                    key={st.id}
                    onClick={() => {
                      setSelectedStation(st);
                      setMapCenter([st.latitude, st.longitude]);
                      setMapZoom(14);
                    }}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? 'var(--bg-tertiary)' : 'var(--bg-input)',
                      border: isSelected ? '1px solid var(--border-active)' : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      transition: 'var(--transition)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        #{idx + 1} {st.stationCode}
                      </span>
                      <NoiseBadge dba={st.currentDba} showLabel={false} size="sm" />
                    </div>

                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>
                      {st.name}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      <span>{st.zoneType}</span>
                      <span>Limit: {st.isNight ? st.nightThresholdDba : st.dayThresholdDba} dBA</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Selected Station Inspection Drawer */}
      <Drawer
        isOpen={!!selectedStation}
        onClose={() => setSelectedStation(null)}
        title={selectedStation?.name || 'Station Inspection'}
        subtitle={`${selectedStation?.stationCode} • ${selectedStation?.zoneType}`}
      >
        {selectedStation && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <StatusBadge status={selectedStation.status} />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Coords: {selectedStation.latitude.toFixed(4)}, {selectedStation.longitude.toFixed(4)}
              </span>
            </div>

            {/* Decibel Metric Card */}
            <div style={{ background: 'var(--bg-tertiary)', padding: '18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Live Decibel Level</div>
              <div style={{ fontSize: '2.8rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', margin: '4px 0' }}>
                {selectedStation.currentDba.toFixed(1)} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>dBA</span>
              </div>
              <NoiseBadge dba={selectedStation.currentDba} size="md" />
            </div>

            {/* Audio Waveform */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Live Stream Spectrum
              </div>
              <WaveformVisualizer dba={selectedStation.currentDba} barCount={28} height={40} />
            </div>

            {/* 24h Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center' }}>
              <div style={{ background: 'var(--bg-tertiary)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>24h Avg</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{selectedStation.stats24h?.avgDba} dBA</div>
              </div>
              <div style={{ background: 'var(--bg-tertiary)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>24h Peak</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--severity-high)' }}>{selectedStation.stats24h?.maxDba} dBA</div>
              </div>
              <div style={{ background: 'var(--bg-tertiary)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Violations</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--severity-critical)' }}>{selectedStation.stats24h?.violationsCount}</div>
              </div>
            </div>

            {/* Description */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                Location Profile
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {selectedStation.description || 'Standard municipal IoT sensor calibrated for continuous urban ambient sound profiling.'}
              </p>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button
                onClick={() => navigate('/complaints')}
                className="btn btn-primary btn-sm"
                style={{ flex: 1 }}
              >
                <PlusCircle size={15} />
                Report Location
              </button>
              <button
                onClick={() => navigate('/analytics')}
                className="btn btn-secondary btn-sm"
                style={{ flex: 1 }}
              >
                Full Analytics
              </button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};
