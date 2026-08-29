import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import {
  MessageSquareWarning,
  PlusCircle,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  User,
  MapPin,
  FileText,
  Radio,
  Sliders,
  Send,
  AlertCircle,
  LayoutGrid,
  List
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge.jsx';
import { NoiseBadge } from '../components/common/NoiseBadge.jsx';
import { Modal } from '../components/common/Modal.jsx';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';

export const ComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('TABLE'); // 'TABLE' or 'KANBAN'

  // Submission Modal State
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    sourceCategory: 'TRAFFIC',
    locationAddress: '',
    severity: 'MODERATE',
    description: '',
    citizenName: '',
    citizenEmail: '',
    citizenPhone: ''
  });

  // Tracking Lookup State
  const [trackingSearch, setTrackingSearch] = useState('');

  const { user, isAuthority } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const loadComplaints = async () => {
    try {
      const res = await api.complaints.getAll({
        status: statusFilter,
        category: categoryFilter,
        search: searchQuery
      });
      setComplaints(res.complaints || []);
      setCounts(res.counts || {});
    } catch (err) {
      console.error('Failed to load complaints:', err);
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, [statusFilter, categoryFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadComplaints();
  };

  const handleTrackingLookup = (e) => {
    e.preventDefault();
    if (!trackingSearch.trim()) return;
    navigate(`/complaints/${trackingSearch.trim().toUpperCase()}`);
  };

  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.complaints.create(formData);
      toast.success(`Complaint registered! Tracking ID: ${res.trackingId}`, 6000);
      setIsSubmitModalOpen(false);
      setFormData({
        title: '',
        sourceCategory: 'TRAFFIC',
        locationAddress: '',
        severity: 'MODERATE',
        description: '',
        citizenName: '',
        citizenEmail: '',
        citizenPhone: ''
      });
      await loadComplaints();
      navigate(`/complaints/${res.trackingId}`);
    } catch (err) {
      toast.error(err.message || 'Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const kanbanColumns = [
    { key: 'SUBMITTED', title: 'New Submitted', color: 'var(--text-muted)' },
    { key: 'UNDER_REVIEW', title: 'Under Review', color: 'var(--severity-moderate)' },
    { key: 'ASSIGNED', title: 'Assigned', color: 'var(--accent-blue)' },
    { key: 'IN_PROGRESS', title: 'In Progress', color: 'var(--accent-cyan)' },
    { key: 'RESOLVED', title: 'Resolved', color: 'var(--severity-safe)' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Citizen Noise Complaint Management</h1>
            <span className="badge badge-safe">Public Grievance Portal</span>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Citizen acoustic incident intake, spatial investigation assignment, and resolution tracking.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {isAuthority && (
            <div style={{ display: 'flex', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: '3px', border: '1px solid var(--border-subtle)' }}>
              <button
                onClick={() => setViewMode('TABLE')}
                style={{
                  background: viewMode === 'TABLE' ? 'var(--bg-card-hover)' : 'transparent',
                  color: viewMode === 'TABLE' ? 'var(--accent-cyan)' : 'var(--text-muted)',
                  border: 'none',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer'
                }}
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setViewMode('KANBAN')}
                style={{
                  background: viewMode === 'KANBAN' ? 'var(--bg-card-hover)' : 'transparent',
                  color: viewMode === 'KANBAN' ? 'var(--accent-cyan)' : 'var(--text-muted)',
                  border: 'none',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer'
                }}
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          )}

          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="btn btn-primary btn-sm"
          >
            <PlusCircle size={16} />
            <span>Submit Noise Complaint</span>
          </button>
        </div>
      </div>

      {/* Citizen 1-Click Tracking Search Bar */}
      <div className="glass-card" style={{ padding: '18px 22px', background: 'linear-gradient(135deg, rgba(16,23,38,0.9) 0%, rgba(20,32,53,0.9) 100%)' }}>
        <form onSubmit={handleTrackingLookup} style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-cyan)', letterSpacing: '0.04em' }}>
              Citizen Tracking Portal
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Track live investigation timeline by entering your Tracking Reference ID:
            </span>
          </div>
          <div style={{ position: 'relative', flex: '1 1 280px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="input"
              placeholder="e.g. AP-2026-004281"
              value={trackingSearch}
              onChange={(e) => setTrackingSearch(e.target.value)}
              style={{ paddingLeft: '38px', fontFamily: 'var(--font-mono)' }}
            />
          </div>
          <button type="submit" className="btn btn-secondary btn-sm">
            Track Status →
          </button>
        </form>
      </div>

      {/* Status Counters Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
        {[
          { label: 'All', key: 'ALL', count: complaints.length },
          { label: 'Submitted', key: 'SUBMITTED', count: counts.SUBMITTED || 0 },
          { label: 'Under Review', key: 'UNDER_REVIEW', count: counts.UNDER_REVIEW || 0 },
          { label: 'Assigned', key: 'ASSIGNED', count: counts.ASSIGNED || 0 },
          { label: 'In Progress', key: 'IN_PROGRESS', count: counts.IN_PROGRESS || 0 },
          { label: 'Resolved', key: 'RESOLVED', count: counts.RESOLVED || 0 }
        ].map(item => (
          <button
            key={item.key}
            onClick={() => setStatusFilter(item.key)}
            style={{
              background: statusFilter === item.key ? 'var(--bg-card-hover)' : 'var(--bg-tertiary)',
              border: statusFilter === item.key ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 14px',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'var(--transition)'
            }}
          >
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{item.label}</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: statusFilter === item.key ? 'var(--accent-cyan)' : 'var(--text-primary)' }}>
              {item.count}
            </div>
          </button>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="glass-card" style={{ padding: '14px 18px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <form onSubmit={handleSearchSubmit} style={{ flex: '1 1 260px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input"
            placeholder="Search complaint title, address, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '38px' }}
          />
        </form>

        <select
          className="select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{ flex: '0 1 180px' }}
        >
          <option value="ALL">All Categories</option>
          <option value="TRAFFIC">Traffic & Horns</option>
          <option value="CONSTRUCTION">Construction & Piling</option>
          <option value="LOUDSPEAKER">Loudspeakers / Events</option>
          <option value="INDUSTRIAL">Industrial Noise</option>
          <option value="COMMERCIAL">Commercial / DG Gensets</option>
          <option value="RESIDENTIAL">Residential Neighborhood</option>
        </select>
      </div>

      {/* Main View: Table or Kanban */}
      {loading ? (
        <LoadingSkeleton height="280px" count={2} />
      ) : complaints.length === 0 ? (
        <EmptyState
          title="No Complaints Found"
          description="No citizen noise reports matching your current filter criteria."
          actionLabel="Submit First Report"
          onAction={() => setIsSubmitModalOpen(true)}
        />
      ) : viewMode === 'KANBAN' && isAuthority ? (
        /* Kanban Workflow Board */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', alignItems: 'start' }}>
          {kanbanColumns.map(col => {
            const colComplaints = complaints.filter(c => c.status === col.key);
            return (
              <div
                key={col.key}
                className="glass-card"
                style={{
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  minHeight: '420px',
                  background: 'var(--bg-secondary)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', color: col.color }}>
                    {col.title}
                  </span>
                  <span className="badge badge-neutral">{colComplaints.length}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {colComplaints.map(c => (
                    <div
                      key={c.id}
                      onClick={() => navigate(`/complaints/${c.id}`)}
                      style={{
                        background: 'var(--bg-tertiary)',
                        padding: '12px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        transition: 'var(--transition)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-cyan)'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                          {c.trackingId}
                        </span>
                        <StatusBadge status={c.severity} />
                      </div>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                        {c.title}
                      </h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                        {c.locationAddress}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '6px' }}>
                        <span>{c.sourceCategory}</span>
                        <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="glass-card" style={{ padding: '18px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px' }}>Tracking ID</th>
                <th style={{ padding: '12px' }}>Complaint Title & Location</th>
                <th style={{ padding: '12px' }}>Category</th>
                <th style={{ padding: '12px' }}>Severity</th>
                <th style={{ padding: '12px' }}>Reported By</th>
                <th style={{ padding: '12px' }}>Assigned Officer</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                    {c.trackingId}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{c.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} />
                      {c.locationAddress}
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span className="badge badge-neutral">{c.sourceCategory}</span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <StatusBadge status={c.severity} />
                  </td>
                  <td style={{ padding: '12px', fontSize: '0.8rem' }}>
                    {c.citizenName || 'Resident'}
                  </td>
                  <td style={{ padding: '12px', fontSize: '0.8rem', color: c.assignedOfficer ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {c.assignedOfficer?.name || 'Unassigned'}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <StatusBadge status={c.status} />
                  </td>
                  <td style={{ padding: '12px' }}>
                    <button
                      onClick={() => navigate(`/complaints/${c.id}`)}
                      className="btn btn-secondary btn-sm"
                    >
                      <Eye size={14} />
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Citizen Complaint Submission Modal */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title="Submit Urban Noise Grievance"
        subtitle="Report noise pollution violations directly to municipal acoustic enforcement"
        maxWidth="600px"
      >
        <form onSubmit={handleSubmitComplaint}>
          <div className="form-group">
            <label className="form-label">Incident Title</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Excessive Generator Noise past 11 PM"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Noise Source Category</label>
              <select
                className="select"
                value={formData.sourceCategory}
                onChange={(e) => setFormData({ ...formData, sourceCategory: e.target.value })}
                required
              >
                <option value="TRAFFIC">Traffic & Horns</option>
                <option value="CONSTRUCTION">Construction & Piling</option>
                <option value="LOUDSPEAKER">Loudspeaker / Public Address</option>
                <option value="INDUSTRIAL">Industrial Workshop</option>
                <option value="COMMERCIAL">Commercial DG Generator</option>
                <option value="RESIDENTIAL">Residential Disturbance</option>
                <option value="EVENT">Public Festival / Event</option>
                <option value="OTHER">Other Acoustic Source</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Perceived Severity</label>
              <select
                className="select"
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
              >
                <option value="LOW">Low (Mild Disturbance)</option>
                <option value="MODERATE">Moderate (Sleep Interrupted)</option>
                <option value="HIGH">High (Sustained Loud Volume)</option>
                <option value="CRITICAL">Critical (Extreme Acoustic Trauma)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Specific Location / Address</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. 14 Usman Road, T. Nagar, near Bus Depot"
              value={formData.locationAddress}
              onChange={(e) => setFormData({ ...formData, locationAddress: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Incident Description & Evidence Notes</label>
            <textarea
              className="textarea"
              rows={3}
              placeholder="Provide context regarding time of occurrence, frequency, sound characteristics..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          {!user && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Your Name</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Citizen Name"
                  value={formData.citizenName}
                  onChange={(e) => setFormData({ ...formData, citizenName: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Contact Phone / Email</label>
                <input
                  type="text"
                  className="input"
                  placeholder="+91 98400..."
                  value={formData.citizenPhone}
                  onChange={(e) => setFormData({ ...formData, citizenPhone: e.target.value })}
                />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button
              type="button"
              onClick={() => setIsSubmitModalOpen(false)}
              className="btn btn-secondary btn-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={submitting}
            >
              <Send size={15} />
              {submitting ? 'Submitting...' : 'Register Complaint'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
