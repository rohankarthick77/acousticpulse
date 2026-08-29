import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Layers,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Radio,
  FileCheck
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge.jsx';
import { NoiseBadge } from '../components/common/NoiseBadge.jsx';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton.jsx';

export const ReportsPage = () => {
  const [reportType, setReportType] = useState('DAILY_SUMMARY');
  const [timeRange, setTimeRange] = useState('30d');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const toast = useToast();

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const res = await api.reports.generate({ reportType, timeRange });
      setReportData(res);
      toast.success('Acoustic compliance report generated');
    } catch (err) {
      console.error('Report generation error:', err);
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGenerateReport();
  }, [reportType, timeRange]);

  const handleDownloadCsv = async () => {
    setDownloading(true);
    try {
      await api.reports.downloadCsv({ reportType, timeRange });
      toast.success('Downloaded acoustic CSV audit report');
    } catch (err) {
      toast.error('CSV export failed');
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Acoustic Compliance Reports</h1>
            <span className="badge badge-safe">Official Audit Engine</span>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Generate auditable smart-city environmental summaries, regulatory violation records, and export CSV/PDFs.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleDownloadCsv}
            className="btn btn-secondary btn-sm"
            disabled={downloading}
          >
            <Download size={15} />
            <span>{downloading ? 'Exporting...' : 'Export CSV'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="btn btn-primary btn-sm"
          >
            <Printer size={15} />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Report Parameter Controls Bar */}
      <div className="glass-card" style={{ padding: '18px 22px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: '1 1 240px' }}>
          <label className="form-label">Select Report Template</label>
          <select
            className="select"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="DAILY_SUMMARY">Daily Environmental Summary</option>
            <option value="WEEKLY_PERFORMANCE">Weekly Acoustic Performance</option>
            <option value="MONTHLY_AUDIT">Monthly Metropolis Audit</option>
            <option value="VIOLATIONS_REPORT">Regulatory Violations & Penalties</option>
            <option value="COMPLAINTS_REPORT">Citizen Complaints Audit</option>
          </select>
        </div>

        <div style={{ flex: '1 1 200px' }}>
          <label className="form-label">Audit Time Horizon</label>
          <select
            className="select"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button
            onClick={handleGenerateReport}
            className="btn btn-secondary btn-sm"
            style={{ height: '42px' }}
          >
            Regenerate Report
          </button>
        </div>
      </div>

      {/* Report Document Preview */}
      {loading ? (
        <LoadingSkeleton height="400px" count={1} />
      ) : reportData && (
        <div
          className="glass-card print-container"
          style={{
            padding: '36px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-medium)',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}
        >
          {/* Document Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid var(--border-subtle)', paddingBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-cyan)' }}>
                Government of Tamil Nadu • Smart City Command Division
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                {reportData.metadata.title}
              </h2>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Period: {reportData.metadata.period}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-muted)' }}>
                Report ID: {reportData.metadata.reportId}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Generated: {new Date(reportData.metadata.generatedAt).toLocaleString()}
              </div>
              <span className="badge badge-safe" style={{ marginTop: '6px' }}>
                Official Verification
              </span>
            </div>
          </div>

          {/* Executive Summary Metrics Strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
            <div style={{ background: 'var(--bg-tertiary)', padding: '14px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>City Average Noise</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                {reportData.metadata.overallCityAvgDba} dBA
              </div>
            </div>

            <div style={{ background: 'var(--bg-tertiary)', padding: '14px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Sensor Network Coverage</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                {reportData.metadata.stationCoverage}
              </div>
            </div>

            <div style={{ background: 'var(--bg-tertiary)', padding: '14px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Violations Logged</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--severity-critical)' }}>
                {reportData.metadata.totalViolationsRecorded}
              </div>
            </div>

            <div style={{ background: 'var(--bg-tertiary)', padding: '14px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Complaints Resolution Rate</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--severity-safe)' }}>
                {reportData.metadata.totalComplaintsReceived ? Math.round((reportData.metadata.resolvedComplaints / reportData.metadata.totalComplaintsReceived) * 100) : 100}%
              </div>
            </div>
          </div>

          {/* Station Status Inventory Table */}
          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '10px' }}>Station Telemetry Audit</h4>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '8px' }}>Station</th>
                    <th style={{ padding: '8px' }}>Zone</th>
                    <th style={{ padding: '8px' }}>Current dBA</th>
                    <th style={{ padding: '8px' }}>Day Limit</th>
                    <th style={{ padding: '8px' }}>Night Limit</th>
                    <th style={{ padding: '8px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.stations.map(st => (
                    <tr key={st.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '8px', fontWeight: 600 }}>{st.name}</td>
                      <td style={{ padding: '8px' }}><span className="badge badge-neutral">{st.zoneType}</span></td>
                      <td style={{ padding: '8px', fontFamily: 'var(--font-mono)' }}>{st.lastReadingDba} dBA</td>
                      <td style={{ padding: '8px', fontFamily: 'var(--font-mono)' }}>{st.dayThresholdDba} dBA</td>
                      <td style={{ padding: '8px', fontFamily: 'var(--font-mono)' }}>{st.nightThresholdDba} dBA</td>
                      <td style={{ padding: '8px' }}><StatusBadge status={st.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Signoff */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>AcousticPulse Municipal Engine v1.0 • Automated Environmental System</span>
            <span>Digitally Verified & Encrypted</span>
          </div>
        </div>
      )}
    </div>
  );
};
