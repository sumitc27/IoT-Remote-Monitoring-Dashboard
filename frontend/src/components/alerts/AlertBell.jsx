import { useEffect, useRef } from 'react';
import { useAlertStore } from '../../store/alertStore';
import { Bell, Check, CheckCheck, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const SEVERITY_ICONS = {
  critical: { icon: AlertCircle, color: '#e74c3c' },
  warning: { icon: AlertTriangle, color: '#f39c12' },
  info: { icon: Info, color: '#3498db' },
};

export const AlertBell = () => {
  const {
    unreadCount,
    showDropdown,
    toggleDropdown,
    closeDropdown,
    events,
    fetchEvents,
    fetchUnreadCount,
    acknowledgeEvent,
    acknowledgeAll,
  } = useAlertStore();

  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchUnreadCount();
    fetchEvents({ limit: 20 });
  }, [fetchUnreadCount, fetchEvents]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        closeDropdown();
      }
    };
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown, closeDropdown]);

  return (
    <div className="alert-bell-container" ref={dropdownRef}>
      <button
        className="alert-bell-btn"
        onClick={toggleDropdown}
        aria-label="Toggle alerts"
        id="alert-bell"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="alert-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="alert-dropdown">
          <div className="alert-dropdown-header">
            <h3>Alerts</h3>
            {unreadCount > 0 && (
              <button
                className="alert-ack-all-btn"
                onClick={acknowledgeAll}
                title="Acknowledge all"
              >
                <CheckCheck size={16} />
                Acknowledge All
              </button>
            )}
          </div>

          <div className="alert-dropdown-list">
            {events.length === 0 ? (
              <div className="alert-empty">
                <Bell size={32} style={{ opacity: 0.3 }} />
                <p>No alerts yet</p>
              </div>
            ) : (
              events.slice(0, 20).map((event) => {
                const severityConfig = SEVERITY_ICONS[event.severity] || SEVERITY_ICONS.warning;
                const SeverityIcon = severityConfig.icon;
                const timeAgo = event.triggered_at
                  ? formatDistanceToNow(new Date(event.triggered_at), { addSuffix: true })
                  : '';

                return (
                  <div
                    key={event.id}
                    className={`alert-item ${event.acknowledged ? 'acknowledged' : 'unread'}`}
                  >
                    <div className="alert-item-icon" style={{ color: severityConfig.color }}>
                      <SeverityIcon size={18} />
                    </div>
                    <div className="alert-item-content">
                      <div className="alert-item-header">
                        <span
                          className="alert-item-severity"
                          style={{ color: severityConfig.color }}
                        >
                          {event.severity.toUpperCase()}
                        </span>
                        <span className="alert-item-time">{timeAgo}</span>
                      </div>
                      <p className="alert-item-message">
                        {event.message || `${event.metric}: ${event.value}`}
                      </p>
                      <span className="alert-item-device">
                        {event.device_name || 'Unknown Device'}
                      </span>
                    </div>
                    {!event.acknowledged && (
                      <button
                        className="alert-item-ack"
                        onClick={(e) => {
                          e.stopPropagation();
                          acknowledgeEvent(event.id);
                        }}
                        title="Acknowledge"
                      >
                        <Check size={14} />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {events.length > 0 && (
            <div className="alert-dropdown-footer">
              <a href="/alerts" onClick={closeDropdown}>
                View all alerts →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
