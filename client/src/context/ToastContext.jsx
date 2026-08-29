import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4500) => {
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    setToasts(prev => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur),
    warning: (msg, dur) => addToast(msg, 'warning', dur),
    info: (msg, dur) => addToast(msg, 'info', dur)
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container">
        {toasts.map(t => {
          let Icon = Info;
          let borderClass = 'var(--accent-blue)';
          let iconColor = 'var(--accent-blue)';

          if (t.type === 'success') {
            Icon = CheckCircle2;
            borderClass = 'var(--severity-safe)';
            iconColor = 'var(--severity-safe)';
          } else if (t.type === 'error') {
            Icon = AlertCircle;
            borderClass = 'var(--severity-critical)';
            iconColor = 'var(--severity-critical)';
          } else if (t.type === 'warning') {
            Icon = AlertTriangle;
            borderClass = 'var(--severity-moderate)';
            iconColor = 'var(--severity-moderate)';
          }

          return (
            <div
              key={t.id}
              className="glass-card animate-fade-in"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderLeft: `4px solid ${borderClass}`,
                minWidth: '280px',
                boxShadow: 'var(--shadow-lg)'
              }}
            >
              <Icon size={20} style={{ color: iconColor, flexShrink: 0 }} />
              <div style={{ flex: 1, fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                {t.message}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
