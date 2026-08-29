import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api.js';
import {
  Search,
  Radio,
  MapPin,
  MessageSquareWarning,
  BellRing,
  Sparkles,
  Sliders,
  FileText,
  X,
  CornerDownLeft
} from 'lucide-react';

export const CommandPalette = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const staticNavigation = [
    { type: 'NAV', title: 'Dashboard Overview', subtitle: 'Main smart-city command KPIs', link: '/', icon: Radio },
    { type: 'NAV', title: 'Live Monitoring Stations', subtitle: 'Real-time sensor telemetry cards', link: '/monitoring', icon: Radio },
    { type: 'NAV', title: 'Spatial Noise GIS Map', subtitle: 'Full-screen geospatial acoustic map', link: '/map', icon: MapPin },
    { type: 'NAV', title: 'Temporal Analytics & Trends', subtitle: 'Diurnal curves and station comparisons', link: '/analytics', icon: Radio },
    { type: 'NAV', title: 'Citizen Complaints Portal', subtitle: 'Submit, track and manage complaints', link: '/complaints', icon: MessageSquareWarning },
    { type: 'NAV', title: 'Alert & Anomaly Center', subtitle: 'Threshold breaches & critical spikes', link: '/alerts', icon: BellRing },
    { type: 'NAV', title: 'Policy Mitigation Simulator', subtitle: 'Simulate traffic & curfew interventions', link: '/simulator', icon: Sliders },
    { type: 'NAV', title: 'Acoustic Compliance Reports', subtitle: 'Generate PDF/CSV audit reports', link: '/reports', icon: FileText }
  ];

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Global shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose ? onClose(!isOpen) : null;
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Search debouncer
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { results: apiResults } = await api.search.query(query);
        const filteredNav = staticNavigation.filter(n =>
          n.title.toLowerCase().includes(query.toLowerCase()) ||
          n.subtitle.toLowerCase().includes(query.toLowerCase())
        );
        setResults([...filteredNav, ...(apiResults || [])]);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const activeList = results.length > 0 ? results : staticNavigation;

  const handleSelect = (item) => {
    navigate(item.link);
    onClose();
  };

  const handleKeyDownList = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % activeList.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + activeList.length) % activeList.length);
    } else if (e.key === 'Enter' && activeList[selectedIndex]) {
      e.preventDefault();
      handleSelect(activeList[selectedIndex]);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(4, 7, 13, 0.75)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '10vh'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="glass-card animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '580px',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          borderRadius: 'var(--radius-lg)'
        }}
      >
        {/* Search Header Input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-secondary)'
          }}
        >
          <Search size={20} style={{ color: 'var(--accent-cyan)' }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search stations, complaints, alerts, pages..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDownList}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              fontFamily: 'var(--font-main)'
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Results / Navigation List */}
        <div style={{ maxHeight: '380px', overflowY: 'auto', padding: '8px' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', padding: '6px 12px' }}>
            {query.length >= 2 ? 'Search Results' : 'Suggested Destinations'}
          </div>

          {activeList.map((item, index) => {
            const isSelected = index === selectedIndex;
            return (
              <div
                key={item.id || item.link || index}
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setSelectedIndex(index)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: isSelected ? 'var(--bg-tertiary)' : 'transparent',
                  border: isSelected ? '1px solid var(--border-active)' : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'var(--transition)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--radius-sm)',
                      background: isSelected ? 'rgba(0, 242, 254, 0.15)' : 'var(--bg-input)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isSelected ? 'var(--accent-cyan)' : 'var(--text-muted)'
                    }}
                  >
                    {item.type === 'COMPLAINT' ? <MessageSquareWarning size={16} /> :
                     item.type === 'ALERT' ? <BellRing size={16} /> :
                     item.type === 'STATION' ? <Radio size={16} /> :
                     <MapPin size={16} />}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {item.subtitle}
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-cyan)', fontSize: '0.75rem' }}>
                    <span>Open</span>
                    <CornerDownLeft size={14} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div
          style={{
            padding: '10px 16px',
            background: 'var(--bg-secondary)',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.72rem',
            color: 'var(--text-muted)'
          }}
        >
          <span>Use ↑ ↓ keys to navigate</span>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
};
