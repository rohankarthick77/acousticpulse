import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  MapPin,
  User,
  Shield,
  Send,
  MessageSquareWarning,
  Volume2,
  FileCheck,
  AlertTriangle
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge.jsx';
import { NoiseBadge } from '../components/common/NoiseBadge.jsx';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton.jsx';

export const ComplaintDetailPage = () => {
  const { identifier } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [officers, setOfficers] = useState([]);

  // Authority Action Form State
  const [newStatus, setNewStatus] = useState('');
  const [assignedOfficerId, setAssignedOfficerId] = useState('');
  const [actionNote, setActionNote] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [beforeDba, setBeforeDba] = useState('');
  const [afterDba, setAfterDba] = useState('');
  const [updating, setUpdating] = useState(false);

  const { isAuthority, user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const loadComplaint = async () => {
    try {
      const res = await api.complaints.getByIdOrTracking(identifier);
      setComplaint(res.complaint);
      setNewStatus(res.complaint.status);
      setAssignedOfficerId(res.complaint.assignedOfficerId || '');
      setBeforeDba(res.complaint.beforeDba || '');
      setAfterDba(res.complaint.afterDba || '');
      setResolutionNotes(res.complaint.resolutionNotes || '');
    } catch (err) {
      console.error('Failed to load complaint detail:', err);
      toast.error('Complaint not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaint();
    // Load officers if authority
    if (isAuthority) {
      api.users.getAll('AUTHORITY')
        .then(res => setOfficers(res.users || []))
        .catch(() => {});
    }
  }, [identifier, isAuthority]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await api.complaints.updateStatus(complaint.id, {
        status: newStatus,
        assignedOfficerId,
        actionNote: actionNote || `Officer updated case status to ${newStatus}`,
        resolutionNotes,
        beforeDba: beforeDba ? parseFloat(beforeDba) : undefined,
        afterDba: afterDba ? parseFloat(afterDba) : undefined
      });
      toast.success('Investigation log & status updated');
      setActionNote('');
      await loadComplaint();
    } catch (err) {
      toast.error(err.message || 'Failed to update complaint');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <LoadingSkeleton height="80px" count={1} />
        <LoadingSkeleton height="350px" count={1} />
      </div>
    );
  }

  if (!complaint) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Complaint Record Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Tracking ID or Complaint record could not be located in database.</p>
        <button onClick={() => navigate('/complaints')} className="btn btn-secondary btn-sm" style={{ marginTop: '16px' }}>
          ← Back to Complaints
        </button>
      </div>
    );
  }

  const steps = [
    { key: 'SUBMITTED', label: 'Submitted' },
    { key: 'UNDER_REVIEW', label: 'Under Review' },
    { key: 'ASSIGNED', label: 'Assigned' },
    { key: 'IN_PROGRESS', label: 'In Progress' },
    { key: 'RESOLVED', label: 'Resolved' }
  ];

  const currentStepIndex = steps.findIndex(s => s.key === complaint.status);
  const activeStep = currentStepIndex >= 0 ? currentStepIndex : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Back Button & Top Status Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <button
          onClick={() => navigate('/complaints')}
          className="btn btn-secondary btn-sm"
        >
          <ArrowLeft size={16} />
          <span>Back to Complaints</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)' }}>
            Tracking ID: {complaint.trackingId}
          </span>
          <StatusBadge status={complaint.status} />
        </div>
      </div>

      {/* Progress Stepper Banner */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '18px', letterSpacing: '0.06em' }}>
          Lifecycle Investigation Progress
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          {/* Background Connecting Line */}
          <div
            style={{
              position: 'absolute',
              top: '16px',
              left: '30px',
              right: '30px',
              height: '3px',
              background: 'var(--border-medium)',
              zIndex: 1
            }}
          />
          {/* Active Colored Progress Line */}
          <div
            style={{
              position: 'absolute',
              top: '16px',
              left: '30px',
              width: `${(activeStep / (steps.length - 1)) * 90}%`,
              height: '3px',
              background: 'var(--accent-cyan)',
              zIndex: 2,
              transition: 'width 0.5s ease'
            }}
          />

          {steps.map((step, idx) => {
            const isCompleted = idx <= activeStep;
            const isCurrent = idx === activeStep;

            return (
              <div
                key={step.key}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  zIndex: 3,
                  position: 'relative'
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: isCompleted ? 'var(--accent-cyan)' : 'var(--bg-tertiary)',
                    border: isCompleted ? '2px solid #ffffff' : '2px solid var(--border-medium)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isCompleted ? '#050a14' : 'var(--text-muted)',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    boxShadow: isCurrent ? '0 0 14px var(--accent-cyan)' : 'none'
                  }}
                >
                  {isCompleted ? <CheckCircle2 size={16} /> : idx + 1}
                </div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: isCurrent ? 800 : 500,
                    color: isCompleted ? 'var(--text-primary)' : 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main 2-Column Split: Complaint Specs + Investigation Timeline */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '20px' }}>
        {/* Left Column: Complaint Details & Verification Decibels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div>
                <span className="badge badge-neutral" style={{ marginBottom: '8px' }}>
                  {complaint.sourceCategory}
                </span>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {complaint.title}
                </h2>
              </div>
              <StatusBadge status={complaint.severity} />
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
              <MapPin size={14} style={{ color: 'var(--accent-cyan)' }} />
              {complaint.locationAddress}
            </div>

            <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '18px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Citizen Description
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {complaint.description}
              </p>
            </div>

            {/* Before / After Calibration Measurements */}
            {(complaint.beforeDba || complaint.afterDba) && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
                <div style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Before Intervention</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--severity-critical)' }}>
                    {complaint.beforeDba} dBA
                  </div>
                </div>

                <div style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>After Mitigation</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--severity-safe)' }}>
                    {complaint.afterDba || '--'} dBA
                  </div>
                </div>
              </div>
            )}

            {/* Complainant Metadata */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <div>
                Reported by: <strong style={{ color: 'var(--text-primary)' }}>{complaint.citizenName || 'Resident'}</strong>
              </div>
              <div>
                Assigned: <strong style={{ color: 'var(--accent-cyan)' }}>{complaint.assignedOfficer?.name || 'Pending assignment'}</strong>
              </div>
            </div>
          </div>

          {/* Authority Control Workflow Panel */}
          {isAuthority && (
            <div className="glass-card" style={{ padding: '24px', borderTop: '3px solid var(--accent-cyan)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Shield size={18} style={{ color: 'var(--accent-cyan)' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Authority Action Console</h3>
              </div>

              <form onSubmit={handleUpdateStatus}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Update Case Status</label>
                    <select
                      className="select"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                    >
                      <option value="SUBMITTED">Submitted</option>
                      <option value="UNDER_REVIEW">Under Review</option>
                      <option value="VERIFIED">Verified</option>
                      <option value="ASSIGNED">Assigned</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Assign Field Officer</label>
                    <select
                      className="select"
                      value={assignedOfficerId}
                      onChange={(e) => setAssignedOfficerId(e.target.value)}
                    >
                      <option value="">-- Unassigned --</option>
                      {officers.map(off => (
                        <option key={off.id} value={off.id}>{off.name} ({off.badgeNumber || 'Officer'})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Site Measured dBA (Before)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="input"
                      placeholder="e.g. 84.5"
                      value={beforeDba}
                      onChange={(e) => setBeforeDba(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Site Measured dBA (After)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="input"
                      placeholder="e.g. 58.2"
                      value={afterDba}
                      onChange={(e) => setAfterDba(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Official Investigation Action Note</label>
                  <textarea
                    className="textarea"
                    rows={2}
                    placeholder="Enter audit log note (e.g. Patrol dispatched, violation notice served)..."
                    value={actionNote}
                    onChange={(e) => setActionNote(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={updating}>
                    <Send size={14} />
                    {updating ? 'Saving...' : 'Save & Append Timeline'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Right Column: Step-by-Step Investigation Timeline */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Investigation Audit Log</h3>
            <Clock size={16} style={{ color: 'var(--text-muted)' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
            {/* Timeline Vertical Line */}
            <div
              style={{
                position: 'absolute',
                top: '12px',
                bottom: '12px',
                left: '15px',
                width: '2px',
                background: 'var(--border-subtle)'
              }}
            />

            {complaint.timeline && complaint.timeline.map((entry, index) => (
              <div
                key={entry.id}
                style={{
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'flex-start',
                  position: 'relative',
                  zIndex: 2
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'var(--bg-tertiary)',
                    border: '2px solid var(--accent-cyan)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-cyan)',
                    flexShrink: 0
                  }}
                >
                  <FileCheck size={16} />
                </div>

                <div
                  style={{
                    flex: 1,
                    background: 'var(--bg-input)',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {entry.author?.name || 'System / Citizen'}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(entry.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {entry.actionNote}
                  </p>

                  <div style={{ marginTop: '6px', fontSize: '0.7rem', color: 'var(--accent-cyan)' }}>
                    State: {entry.fromStatus} → {entry.toStatus}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
