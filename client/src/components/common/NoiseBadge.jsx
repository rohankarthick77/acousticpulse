import React from 'react';

export const NoiseBadge = ({ dba, showLabel = true, size = 'md' }) => {
  const val = typeof dba === 'number' ? dba : parseFloat(dba) || 0;

  let severity = 'safe';
  let label = 'Low / Safe';

  if (val >= 80) {
    severity = 'critical';
    label = 'Critical Noise';
  } else if (val >= 70) {
    severity = 'high';
    label = 'High Noise';
  } else if (val >= 55) {
    severity = 'moderate';
    label = 'Moderate';
  }

  const paddingMap = {
    sm: '2px 7px',
    md: '3px 10px',
    lg: '6px 14px'
  };

  const fontMap = {
    sm: '0.7rem',
    md: '0.78rem',
    lg: '0.9rem'
  };

  return (
    <span
      className={`badge badge-${severity}`}
      style={{
        padding: paddingMap[size] || paddingMap.md,
        fontSize: fontMap[size] || fontMap.md
      }}
    >
      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
        {val.toFixed(1)} dBA
      </span>
      {showLabel && <span style={{ opacity: 0.85 }}>• {label}</span>}
    </span>
  );
};
