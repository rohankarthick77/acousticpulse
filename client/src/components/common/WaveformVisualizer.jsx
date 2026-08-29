import React, { useEffect, useState } from 'react';

export const WaveformVisualizer = ({ dba = 65, barCount = 32, height = 48 }) => {
  const [bars, setBars] = useState([]);

  useEffect(() => {
    // Generate initial dynamic heights based on current dBA
    const generateBars = () => {
      const normalizedDba = Math.max(30, Math.min(100, dba));
      const energyFactor = (normalizedDba - 30) / 70; // 0.0 to 1.0

      return Array.from({ length: barCount }, (_, i) => {
        const sineWave = Math.sin((i / barCount) * Math.PI);
        const randomSpike = Math.random() * 0.4 + 0.6;
        const barHeight = Math.max(12, Math.min(98, sineWave * energyFactor * 100 * randomSpike + (Math.random() * 18)));
        return barHeight;
      });
    };

    setBars(generateBars());

    const interval = setInterval(() => {
      setBars(generateBars());
    }, 450);

    return () => clearInterval(interval);
  }, [dba, barCount]);

  let barColor = 'var(--accent-cyan)';
  if (dba >= 80) barColor = 'var(--severity-critical)';
  else if (dba >= 70) barColor = 'var(--severity-high)';
  else if (dba >= 55) barColor = 'var(--severity-moderate)';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: `${height}px`,
        gap: '3px',
        padding: '6px 12px',
        background: 'var(--bg-tertiary)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        overflow: 'hidden'
      }}
    >
      {bars.map((h, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: `${h}%`,
            background: barColor,
            borderRadius: '2px',
            transition: 'height 0.35s ease, background 0.3s ease',
            opacity: 0.85
          }}
        />
      ))}
    </div>
  );
};
