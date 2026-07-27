import { Battery, Zap, Clock, MapPin, Edit, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export const DeviceCard = ({ device, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const isOnline = device.is_online;
  const statusColor = isOnline ? 'var(--status-green)' : 'var(--status-gray)';
  
  // Format last seen time
  let lastSeenText = 'Never';
  if (device.last_seen) {
    try {
      lastSeenText = formatDistanceToNow(new Date(device.last_seen), { addSuffix: true });
    } catch (e) {
      lastSeenText = 'Unknown';
    }
  }

  // Calculate battery percentage roughly based on Li-ion voltage (3.0V - 4.2V)
  const getBatteryPercent = (voltage) => {
    if (!voltage) return 0;
    const v = Math.min(Math.max(voltage, 3.0), 4.2);
    return Math.round(((v - 3.0) / 1.2) * 100);
  };

  const bat1Percent = getBatteryPercent(device.battery_1_voltage);
  const bat2Percent = getBatteryPercent(device.battery_2_voltage);

  return (
    <div 
      className="card" 
      onClick={() => navigate(`/device/${device.id}`)}
      style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer' }}
    >
      {/* Top Accent Line */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        backgroundColor: statusColor,
        opacity: isOnline ? 1 : 0.5
      }} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 4px 0' }}>
            {device.name || 'Unnamed Device'}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '12px' }}>
            <MapPin size={12} />
            <span>{device.location || 'Unknown Location'}</span>
            <span style={{ margin: '0 4px' }}>•</span>
            <span style={{ fontFamily: 'monospace' }}>{device.mac_address}</span>
          </div>
        </div>
        
        {/* Status Indicator and Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className={`status-dot ${isOnline ? 'online' : 'offline'}`} />
            <span style={{ fontSize: '12px', fontWeight: '600', color: statusColor }}>
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
            >
              <Edit size={16} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--status-red)' }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Telemetry Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        
        {/* Battery 1 */}
        <div style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '8px' }}>
            <Battery size={14} /> Battery 1
          </div>
          <div style={{ fontSize: '20px', fontWeight: '700' }}>
            {device.battery_1_voltage ? `${device.battery_1_voltage.toFixed(2)}V` : '--'}
          </div>
          {device.battery_1_voltage && (
            <div style={{ height: '4px', background: '#ddd', borderRadius: '2px', marginTop: '8px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${bat1Percent}%`, background: bat1Percent > 20 ? 'var(--status-green)' : 'var(--status-red)' }} />
            </div>
          )}
        </div>

        {/* Battery 2 */}
        <div style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '8px' }}>
            <Battery size={14} /> Battery 2
          </div>
          <div style={{ fontSize: '20px', fontWeight: '700' }}>
            {device.battery_2_voltage ? `${device.battery_2_voltage.toFixed(2)}V` : '--'}
          </div>
          {device.battery_2_voltage && (
            <div style={{ height: '4px', background: '#ddd', borderRadius: '2px', marginTop: '8px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${bat2Percent}%`, background: bat2Percent > 20 ? 'var(--status-green)' : 'var(--status-red)' }} />
            </div>
          )}
        </div>

        {/* AC 1 */}
        <div style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '8px' }}>
            <Zap size={14} /> Mains 1
          </div>
          <div style={{ 
            fontSize: '14px', 
            fontWeight: '600',
            color: device.ac_1_status === 'ON' ? 'var(--status-green)' : (device.ac_1_status === 'OFF' ? 'var(--status-red)' : 'inherit')
          }}>
            {device.ac_1_status || '--'}
          </div>
        </div>

        {/* AC 2 */}
        <div style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '8px' }}>
            <Zap size={14} /> Mains 2
          </div>
          <div style={{ 
            fontSize: '14px', 
            fontWeight: '600',
            color: device.ac_2_status === 'ON' ? 'var(--status-green)' : (device.ac_2_status === 'OFF' ? 'var(--status-red)' : 'inherit')
          }}>
            {device.ac_2_status || '--'}
          </div>
        </div>

      </div>

      {/* Footer / Last Updated */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '12px', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '16px' }}>
        <Clock size={12} />
        <span>Updated {lastSeenText}</span>
      </div>

    </div>
  );
};
