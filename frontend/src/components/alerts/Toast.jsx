import { useEffect } from 'react';
import { useAlertStore } from '../../store/alertStore';
import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const SEVERITY_CONFIG = {
  critical: {
    icon: AlertCircle,
    color: '#e74c3c',
    bg: 'rgba(231, 76, 60, 0.12)',
    border: 'rgba(231, 76, 60, 0.3)',
    label: 'CRITICAL',
  },
  warning: {
    icon: AlertTriangle,
    color: '#f39c12',
    bg: 'rgba(243, 156, 18, 0.12)',
    border: 'rgba(243, 156, 18, 0.3)',
    label: 'WARNING',
  },
  info: {
    icon: Info,
    color: '#3498db',
    bg: 'rgba(52, 152, 219, 0.12)',
    border: 'rgba(52, 152, 219, 0.3)',
    label: 'INFO',
  },
};

const Toast = ({ toast, onDismiss }) => {
  const config = SEVERITY_CONFIG[toast.severity] || SEVERITY_CONFIG.warning;
  const Icon = config.icon;

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 8000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div
      className="toast-item"
      style={{
        background: config.bg,
        borderLeft: `4px solid ${config.color}`,
        borderColor: config.border,
      }}
    >
      <div className="toast-icon" style={{ color: config.color }}>
        <Icon size={20} />
      </div>
      <div className="toast-content">
        <div className="toast-header">
          <span className="toast-severity" style={{ color: config.color }}>
            {config.label}
          </span>
          <span className="toast-device">{toast.device_name || 'Unknown'}</span>
        </div>
        <p className="toast-message">{toast.message}</p>
      </div>
      <button className="toast-close" onClick={() => onDismiss(toast.id)}>
        <X size={16} />
      </button>
      <div className="toast-progress" style={{ background: config.color }} />
    </div>
  );
};

export const ToastContainer = () => {
  const { toasts, removeToast } = useAlertStore();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={removeToast} />
      ))}
    </div>
  );
};
