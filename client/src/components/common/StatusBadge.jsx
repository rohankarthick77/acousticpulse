import React from 'react';

export const StatusBadge = ({ status, type = 'general' }) => {
  if (!status) return null;

  const normalized = status.toUpperCase();

  let badgeClass = 'badge-neutral';
  let label = normalized.replace(/_/g, ' ');

  // Station status
  if (normalized === 'ONLINE' || normalized === 'RESOLVED' || normalized === 'CLOSED') {
    badgeClass = 'badge-safe';
  } else if (normalized === 'IN_PROGRESS' || normalized === 'UNDER_REVIEW' || normalized === 'ASSIGNED' || normalized === 'VERIFIED') {
    badgeClass = 'badge-moderate';
  } else if (normalized === 'CRITICAL' || normalized === 'OFFLINE' || normalized === 'REJECTED') {
    badgeClass = 'badge-critical';
  } else if (normalized === 'HIGH' || normalized === 'WARNING') {
    badgeClass = 'badge-high';
  } else if (normalized === 'SUBMITTED' || normalized === 'MAINTENANCE' || normalized === 'INFO') {
    badgeClass = 'badge-neutral';
  }

  return (
    <span className={`badge ${badgeClass}`}>
      {normalized === 'ONLINE' && <span className="status-dot online pulsing" style={{ width: 6, height: 6 }} />}
      {label}
    </span>
  );
};
