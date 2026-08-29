import React from 'react';

export const LoadingSkeleton = ({ height = '120px', count = 1, style = {} }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            height,
            width: '100%',
            background: 'linear-gradient(90deg, var(--bg-tertiary) 25%, var(--bg-card-hover) 50%, var(--bg-tertiary) 75%)',
            backgroundSize: '200% 100%',
            animation: 'skeletonShimmer 1.5s infinite',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            ...style
          }}
        />
      ))}
      <style>{`
        @keyframes skeletonShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
};
