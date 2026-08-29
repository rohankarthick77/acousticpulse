import React from 'react';
import { Database, Plus } from 'lucide-react';

export const EmptyState = ({
  title = 'No Data Found',
  description = 'No matching acoustic telemetry records or complaints found for this criteria.',
  icon: Icon = Database,
  actionLabel,
  onAction
}) => {
  return (
    <div
      className="glass-card"
      style={{
        padding: '48px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        minHeight: '260px'
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-medium)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          marginBottom: '16px'
        }}
      >
        <Icon size={28} />
      </div>

      <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
        {title}
      </h4>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '420px', marginBottom: actionLabel ? '20px' : '0' }}>
        {description}
      </p>

      {actionLabel && (
        <button className="btn btn-primary btn-sm" onClick={onAction}>
          <Plus size={16} />
          {actionLabel}
        </button>
      )}
    </div>
  );
};
