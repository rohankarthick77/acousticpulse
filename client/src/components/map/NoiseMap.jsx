import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useTheme } from '../../context/ThemeContext.jsx';
import { NoiseBadge } from '../common/NoiseBadge.jsx';
import { StatusBadge } from '../common/StatusBadge.jsx';
import { Radio, Volume2, ShieldAlert, Eye, Maximize2, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Center map controller
function SetMapCenter({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && Array.isArray(center) && center.length === 2) {
      map.setView(center, zoom || 13);
    }
  }, [center, zoom, map]);
  return null;
}

// Invalidate size on mount to ensure tiles render immediately
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

// Create custom SVG marker pins
function createCustomMarker(dba, isViolating) {
  let color = '#10b981'; // safe
  if (dba >= 80) color = '#ef4444'; // critical
  else if (dba >= 70) color = '#f97316'; // high
  else if (dba >= 55) color = '#f59e0b'; // moderate

  const pulseHtml = (dba >= 75 || isViolating) ? `
    <div style="
      position: absolute;
      width: 44px;
      height: 44px;
      top: -6px;
      left: -6px;
      border-radius: 50%;
      border: 2px solid ${color};
      animation: mapPinPulse 1.8s infinite ease-out;
      pointer-events: none;
    "></div>
  ` : '';

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="position: relative; width: 32px; height: 32px;">
        ${pulseHtml}
        <div style="
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: ${color};
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 16px ${color}, 0 2px 8px rgba(0,0,0,0.6);
          border: 2.5px solid #ffffff;
          color: #ffffff;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 800;
          cursor: pointer;
          transition: transform 0.2s;
        ">
          ${Math.round(dba)}
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18]
  });
}

// Available free tile layers with zero API keys required
const TILE_PROVIDERS = {
  carto_dark: {
    name: 'Dark Cyberpunk',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap'
  },
  carto_voyager: {
    name: 'Carto Clean Light',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap'
  },
  arcgis_streets: {
    name: 'ArcGIS Streets',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri &copy; OpenStreetMap'
  },
  arcgis_dark: {
    name: 'ArcGIS Dark Canvas',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri &copy; OpenStreetMap'
  },
  osm_standard: {
    name: 'OpenStreetMap FR',
    url: 'https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors'
  }
};

export const NoiseMap = ({
  stations = [],
  selectedStation = null,
  onSelectStation = null,
  showHeatCircles = true,
  height = '560px',
  center = [11.5034, 77.2444], // Sathyamangalam coordinates
  zoom = 13
}) => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [selectedLayerKey, setSelectedLayerKey] = useState(isDark ? 'carto_dark' : 'carto_voyager');

  useEffect(() => {
    setSelectedLayerKey(isDark ? 'carto_dark' : 'carto_voyager');
  }, [isDark]);

  const activeTile = TILE_PROVIDERS[selectedLayerKey] || (isDark ? TILE_PROVIDERS.carto_dark : TILE_PROVIDERS.carto_voyager);

  return (
    <div
      style={{
        height,
        width: '100%',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        position: 'relative',
        border: '1px solid var(--border-medium)',
        boxShadow: 'var(--shadow-lg)'
      }}
    >
      <style>{`
        @keyframes mapPinPulse {
          0% { transform: scale(0.7); opacity: 1; }
          100% { transform: scale(1.6); opacity: 0; }
        }
      `}</style>

      {/* Layer Switcher Pill */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          zIndex: 1000,
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '8px',
          padding: '4px 8px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.75rem',
          color: '#e2e8f0'
        }}
      >
        <Layers size={13} style={{ color: 'var(--accent-cyan)' }} />
        <select
          value={selectedLayerKey}
          onChange={(e) => setSelectedLayerKey(e.target.value)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#e2e8f0',
            fontSize: '0.75rem',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="carto_dark" style={{ background: '#0f172a' }}>Carto Dark (Default)</option>
          <option value="carto_voyager" style={{ background: '#0f172a' }}>Carto Voyager Light</option>
          <option value="arcgis_dark" style={{ background: '#0f172a' }}>ArcGIS Dark Canvas</option>
          <option value="arcgis_streets" style={{ background: '#0f172a' }}>ArcGIS Street Map</option>
          <option value="osm_standard" style={{ background: '#0f172a' }}>OpenStreetMap</option>
        </select>
      </div>

      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          key={activeTile.url}
          url={activeTile.url}
          attribution={activeTile.attribution}
          maxZoom={19}
        />
        <SetMapCenter center={center} zoom={zoom} />
        <MapResizer />

        {stations.map(st => {
          const dba = st.lastReadingDba || st.currentDba || 50;
          let circleColor = '#10b981';
          if (dba >= 80) circleColor = '#ef4444';
          else if (dba >= 70) circleColor = '#f97316';
          else if (dba >= 55) circleColor = '#f59e0b';

          return (
            <React.Fragment key={st.id}>
              {/* Density Noise Radius Circle */}
              {showHeatCircles && (
                <Circle
                  center={[st.latitude, st.longitude]}
                  radius={dba * 8}
                  pathOptions={{
                    color: circleColor,
                    fillColor: circleColor,
                    fillOpacity: 0.22,
                    weight: 1.5,
                    dashArray: dba > (st.dayThresholdDba || 65) ? '4, 4' : null
                  }}
                />
              )}

              {/* Station Pin Marker */}
              <Marker
                position={[st.latitude, st.longitude]}
                icon={createCustomMarker(dba, dba > (st.dayThresholdDba || 65))}
                eventHandlers={{
                  click: () => {
                    if (onSelectStation) onSelectStation(st);
                  }
                }}
              >
                <Popup className="acoustic-map-popup">
                  <div style={{ padding: '16px', minWidth: '240px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        {st.stationCode}
                      </span>
                      <StatusBadge status={st.status} />
                    </div>

                    <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
                      {st.name}
                    </h4>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                      {st.address}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-tertiary)', padding: '8px 12px', borderRadius: 'var(--radius-md)', marginBottom: '12px' }}>
                      <div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Telemetry</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: circleColor }}>
                          {dba.toFixed(1)} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>dBA</span>
                        </div>
                      </div>
                      <NoiseBadge dba={dba} showLabel={false} size="sm" />
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ flex: 1 }}
                        onClick={() => navigate('/stations')}
                      >
                        <Eye size={14} />
                        Telemetry
                      </button>
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ flex: 1 }}
                        onClick={() => navigate(`/analytics`)}
                      >
                        Analytics
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
};
