import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import {
  Sliders,
  RotateCcw,
  Sparkles,
  TrendingDown,
  ShieldCheck,
  Users,
  AlertCircle,
  BarChart3,
  Layers
} from 'lucide-react';
import { NoiseBadge } from '../components/common/NoiseBadge.jsx';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton.jsx';

// Chart.js
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const SimulatorPage = () => {
  const [params, setParams] = useState({
    trafficRestriction: 25,
    heavyVehicleNightCurfew: 40,
    constructionBarriers: 30,
    industrialThrottling: 15,
    eventDecibelCap: 20
  });

  const [result, setResult] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const toast = useToast();

  const runSimulation = async (currentParams) => {
    setCalculating(true);
    try {
      const res = await api.simulator.run(currentParams);
      setResult(res);
    } catch (err) {
      console.error('Simulation error:', err);
      toast.error('Failed to compute policy simulation');
    } finally {
      setCalculating(false);
    }
  };

  useEffect(() => {
    runSimulation(params);
  }, [params]);

  const handleSliderChange = (key, value) => {
    setParams(prev => ({ ...prev, [key]: Number(value) }));
  };

  const handleReset = () => {
    const defaultParams = {
      trafficRestriction: 0,
      heavyVehicleNightCurfew: 0,
      constructionBarriers: 0,
      industrialThrottling: 0,
      eventDecibelCap: 0
    };
    setParams(defaultParams);
    toast.info('Reset simulator variables to baseline');
  };

  const barComparisonData = result ? {
    labels: ['Average dBA', 'Peak Spike dBA', 'Violations Count', 'Health Score'],
    datasets: [
      {
        label: 'Baseline Scenario',
        data: [result.baseline.averageDba, result.baseline.peakDba, result.baseline.violations, result.baseline.healthScore],
        backgroundColor: 'rgba(239, 68, 68, 0.75)',
        borderRadius: 4
      },
      {
        label: 'Simulated Scenario',
        data: [result.simulated.averageDba, result.simulated.peakDba, result.simulated.violations, result.simulated.healthScore],
        backgroundColor: 'rgba(0, 242, 254, 0.85)',
        borderRadius: 4
      }
    ]
  } : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Noise Mitigation Policy Sandbox</h1>
            <span className="badge badge-safe">Predictive Simulator</span>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Simulate municipal policy restrictions and evaluate decibel relief, health score gains, and citizen impact.
          </p>
        </div>

        <button onClick={handleReset} className="btn btn-secondary btn-sm">
          <RotateCcw size={15} />
          <span>Reset to Baseline</span>
        </button>
      </div>

      {/* Model Disclaimer Alert */}
      <div
        style={{
          background: 'rgba(0, 242, 254, 0.08)',
          border: '1px solid var(--border-active)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '0.82rem',
          color: 'var(--text-secondary)'
        }}
      >
        <Sparkles size={18} style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />
        <span>
          <strong>Acoustic Dispersion Algorithm:</strong> Adjust regulatory sliders below to project synthesized real-time acoustic attenuation across 12 urban monitoring zones.
        </span>
      </div>

      {/* Main Grid: Control Sliders + Impact Gauges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
        {/* Left Column: Interactive Policy Sliders */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Intervention Variables</h3>
            <Sliders size={18} style={{ color: 'var(--accent-cyan)' }} />
          </div>

          {/* Slider 1: Traffic */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
              <span style={{ fontWeight: 600 }}>Traffic Flow Restriction / Speed Cap</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)' }}>{params.trafficRestriction}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={params.trafficRestriction}
              onChange={(e) => handleSliderChange('trafficRestriction', e.target.value)}
              style={{ width: '100%', accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
            />
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Reduces acceleration tire rumble and stop-and-go honking.
            </div>
          </div>

          {/* Slider 2: Heavy Vehicles */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
              <span style={{ fontWeight: 600 }}>Heavy Vehicle Night Transit Curfew</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)' }}>{params.heavyVehicleNightCurfew}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={params.heavyVehicleNightCurfew}
              onChange={(e) => handleSliderChange('heavyVehicleNightCurfew', e.target.value)}
              style={{ width: '100%', accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
            />
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Diverts inter-state logistics trailers to outer bypass roads (10 PM – 6 AM).
            </div>
          </div>

          {/* Slider 3: Construction Barriers */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
              <span style={{ fontWeight: 600 }}>Construction Acoustic Barrier Mandate</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)' }}>{params.constructionBarriers}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={params.constructionBarriers}
              onChange={(e) => handleSliderChange('constructionBarriers', e.target.value)}
              style={{ width: '100%', accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
            />
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Mandates acoustic sound curtains and vibration dampening on piling sites.
            </div>
          </div>

          {/* Slider 4: Industrial Throttling */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
              <span style={{ fontWeight: 600 }}>Industrial Heavy Machining Throttling</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)' }}>{params.industrialThrottling}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={params.industrialThrottling}
              onChange={(e) => handleSliderChange('industrialThrottling', e.target.value)}
              style={{ width: '100%', accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
            />
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Enforces silencer retrofitting and noise caps on fabrication plants.
            </div>
          </div>

          {/* Slider 5: Public Event Cap */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
              <span style={{ fontWeight: 600 }}>Public Event & Loudspeaker Decibel Cap</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)' }}>{params.eventDecibelCap}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={params.eventDecibelCap}
              onChange={(e) => handleSliderChange('eventDecibelCap', e.target.value)}
              style={{ width: '100%', accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
            />
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Caps outdoor cone loudspeakers and enforces automated volume cutoff.
            </div>
          </div>
        </div>

        {/* Right Column: Comparative Metrics & Simulation Output */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {result && (
            <>
              {/* Top Delta Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                {/* Total Decibel Attenuation */}
                <div className="glass-card" style={{ padding: '18px', textAlign: 'center', borderTop: '3px solid var(--severity-safe)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Projected Noise Reduction</div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--severity-safe)', margin: '4px 0' }}>
                    -{result.simulated.totalDbaReduction} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>dBA</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    {result.baseline.averageDba} dBA → <strong style={{ color: 'var(--text-primary)' }}>{result.simulated.averageDba} dBA</strong>
                  </div>
                </div>

                {/* Health Score Gain */}
                <div className="glass-card" style={{ padding: '18px', textAlign: 'center', borderTop: '3px solid var(--accent-cyan)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Health Score Improvement</div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', margin: '4px 0' }}>
                    +{result.simulated.healthScore - result.baseline.healthScore} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Pts</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    {result.baseline.healthScore} → <strong style={{ color: 'var(--text-primary)' }}>{result.simulated.healthScore}/100</strong>
                  </div>
                </div>

                {/* Violations Drop */}
                <div className="glass-card" style={{ padding: '18px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Projected Violations Drop</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--severity-safe)', margin: '4px 0' }}>
                    {result.simulated.violations} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>cases/day</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Down from {result.baseline.violations} baseline events
                  </div>
                </div>

                {/* Relieved Population */}
                <div className="glass-card" style={{ padding: '18px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Citizens Relieved from Noise</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', margin: '4px 0' }}>
                    ~{(result.simulated.relievedPopulation / 1000).toFixed(0)}k <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Residents</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Protected from chronic sleep disruption
                  </div>
                </div>
              </div>

              {/* Comparative Chart */}
              <div className="glass-card" style={{ padding: '20px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '10px' }}>
                  Baseline vs Simulated Scenario Comparison
                </div>
                <div style={{ height: '200px', width: '100%' }}>
                  <Bar
                    data={barComparisonData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { labels: { color: '#94a3b8', font: { size: 10 } } } },
                      scales: {
                        x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b' } },
                        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b' } }
                      }
                    }}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Per-Station Projected Impacts Table */}
      {result && result.stationProjections && (
        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '14px' }}>
            Station-by-Station Projected Decibel Attenuation
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '10px 12px' }}>Station Name</th>
                  <th style={{ padding: '10px 12px' }}>Zone Type</th>
                  <th style={{ padding: '10px 12px' }}>Current Telemetry</th>
                  <th style={{ padding: '10px 12px' }}>Projected Decibels</th>
                  <th style={{ padding: '10px 12px' }}>Net Attenuation</th>
                </tr>
              </thead>
              <tbody>
                {result.stationProjections.map(st => (
                  <tr key={st.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {st.name}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span className="badge badge-neutral">{st.zoneType}</span>
                    </td>
                    <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)' }}>
                      {st.currentDba} dBA
                    </td>
                    <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                      {st.projectedDba} dBA
                    </td>
                    <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--severity-safe)' }}>
                      -{st.reductionDba} dBA
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
