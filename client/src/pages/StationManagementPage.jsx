import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import {
  Server,
  PlusCircle,
  Edit2,
  Trash2,
  MapPin,
  Radio,
  Search,
  CheckCircle2,
  X,
  AlertCircle
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge.jsx';
import { NoiseBadge } from '../components/common/NoiseBadge.jsx';
import { Modal } from '../components/common/Modal.jsx';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton.jsx';

export const StationManagementPage = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Station Modal Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStation, setEditingStation] = useState(null);
  const [formData, setFormData] = useState({
    stationCode: '',
    name: '',
    zoneType: 'COMMERCIAL',
    latitude: 13.045,
    longitude: 80.235,
    dayThresholdDba: 65.0,
    nightThresholdDba: 55.0,
    address: '',
    description: '',
    status: 'ONLINE'
  });
  const [saving, setSaving] = useState(false);

  const { isAdmin } = useAuth();
  const toast = useToast();

  const loadStations = async () => {
    try {
      const res = await api.stations.getAll();
      setStations(res.stations || []);
    } catch (err) {
      console.error('Failed to load stations:', err);
      toast.error('Failed to load stations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStations();
  }, []);

  const handleOpenAddModal = () => {
    setEditingStation(null);
    setFormData({
      stationCode: `AP-STN-${(stations.length + 1).toString().padStart(2, '0')}`,
      name: '',
      zoneType: 'COMMERCIAL',
      latitude: 13.045,
      longitude: 80.235,
      dayThresholdDba: 65.0,
      nightThresholdDba: 55.0,
      address: '',
      description: '',
      status: 'ONLINE'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (station) => {
    setEditingStation(station);
    setFormData({
      stationCode: station.stationCode,
      name: station.name,
      zoneType: station.zoneType,
      latitude: station.latitude,
      longitude: station.longitude,
      dayThresholdDba: station.dayThresholdDba,
      nightThresholdDba: station.nightThresholdDba,
      address: station.address,
      description: station.description || '',
      status: station.status
    });
    setIsModalOpen(true);
  };

  const handleSubmitStation = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingStation) {
        await api.stations.update(editingStation.id, formData);
        toast.success(`Station ${formData.stationCode} updated successfully`);
      } else {
        await api.stations.create(formData);
        toast.success(`Station ${formData.stationCode} added to network`);
      }
      setIsModalOpen(false);
      await loadStations();
    } catch (err) {
      toast.error(err.message || 'Failed to save station');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStation = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete station "${name}"?`)) return;
    try {
      await api.stations.delete(id);
      toast.success(`Station removed from network`);
      await loadStations();
    } catch (err) {
      toast.error(err.message || 'Failed to delete station');
    }
  };

  const filteredStations = stations.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.stationCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>IoT Monitoring Stations Inventory</h1>
            <span className="badge badge-safe">Admin Console</span>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Configure IoT telemetry hardware, coordinate geolocations, and adjust regulatory dBA thresholds.
          </p>
        </div>

        {isAdmin && (
          <button onClick={handleOpenAddModal} className="btn btn-primary btn-sm">
            <PlusCircle size={16} />
            <span>Add New Station</span>
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="glass-card" style={{ padding: '14px 18px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input"
            placeholder="Search stations by name, code, or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '38px' }}
          />
        </div>
      </div>

      {/* Stations Table */}
      {loading ? (
        <LoadingSkeleton height="320px" count={1} />
      ) : (
        <div className="glass-card" style={{ padding: '20px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '10px 12px' }}>Code</th>
                <th style={{ padding: '10px 12px' }}>Station Name & Address</th>
                <th style={{ padding: '10px 12px' }}>Zone</th>
                <th style={{ padding: '10px 12px' }}>Coordinates (Lat, Lng)</th>
                <th style={{ padding: '10px 12px' }}>Day / Night Limit</th>
                <th style={{ padding: '10px 12px' }}>Current dBA</th>
                <th style={{ padding: '10px 12px' }}>Status</th>
                {isAdmin && <th style={{ padding: '10px 12px' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredStations.map(st => (
                <tr key={st.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                    {st.stationCode}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{st.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{st.address}</div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span className="badge badge-neutral">{st.zoneType}</span>
                  </td>
                  <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {st.latitude.toFixed(4)}, {st.longitude.toFixed(4)}
                  </td>
                  <td style={{ padding: '12px', fontFamily: 'var(--font-mono)' }}>
                    {st.dayThresholdDba} / {st.nightThresholdDba} dBA
                  </td>
                  <td style={{ padding: '12px' }}>
                    <NoiseBadge dba={st.currentDba} size="sm" />
                  </td>
                  <td style={{ padding: '12px' }}>
                    <StatusBadge status={st.status} />
                  </td>
                  {isAdmin && (
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleOpenEditModal(st)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '6px 8px' }}
                          title="Edit Station"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteStation(st.id, st.name)}
                          className="btn btn-outline btn-sm"
                          style={{ padding: '6px 8px', color: 'var(--severity-critical)' }}
                          title="Delete Station"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Station Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStation ? `Edit Station: ${editingStation.stationCode}` : 'Register New IoT Monitoring Station'}
        subtitle="Configure geolocation coordinates and regulatory decibel thresholds"
        maxWidth="580px"
      >
        <form onSubmit={handleSubmitStation}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Station Code</label>
              <input
                type="text"
                className="input"
                value={formData.stationCode}
                onChange={(e) => setFormData({ ...formData, stationCode: e.target.value })}
                disabled={!!editingStation}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Station Name</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Marina Beach North"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Urban Zone Type</label>
              <select
                className="select"
                value={formData.zoneType}
                onChange={(e) => setFormData({ ...formData, zoneType: e.target.value })}
              >
                <option value="COMMERCIAL">Commercial Hub</option>
                <option value="RESIDENTIAL">Residential Zone</option>
                <option value="INDUSTRIAL">Industrial Zone</option>
                <option value="SILENCE_ZONE">Hospital / Silence Zone</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Operating Status</label>
              <select
                className="select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="ONLINE">ONLINE (Streaming)</option>
                <option value="OFFLINE">OFFLINE</option>
                <option value="MAINTENANCE">MAINTENANCE (Calibration)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Latitude</label>
              <input
                type="number"
                step="0.0001"
                className="input"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Longitude</label>
              <input
                type="number"
                step="0.0001"
                className="input"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Day Limit Threshold (dBA)</label>
              <input
                type="number"
                step="1"
                className="input"
                value={formData.dayThresholdDba}
                onChange={(e) => setFormData({ ...formData, dayThresholdDba: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Night Limit Threshold (dBA)</label>
              <input
                type="number"
                step="1"
                className="input"
                value={formData.nightThresholdDba}
                onChange={(e) => setFormData({ ...formData, nightThresholdDba: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Physical Address</label>
            <input
              type="text"
              className="input"
              placeholder="Full location address..."
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description / Equipment Details</label>
            <textarea
              className="textarea"
              rows={2}
              placeholder="Sensor hardware specifications..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn btn-secondary btn-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={saving}
            >
              {saving ? 'Saving...' : editingStation ? 'Save Changes' : 'Deploy Station'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
