import { Battery, Zap, Clock, MapPin, Edit, Trash2, Train, Power, Timer, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export const DeviceCard = ({ device, onEdit, onDelete, hideActions }) => {
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
            <Train size={18} />
            <span>{device.train_no ? `Train: ${device.train_no}` : 'No Train'}</span>
            <span style={{ margin: '0 4px', color: 'var(--text-muted)' }}>•</span>
            <span>{device.coach_no ? `Coach: ${device.coach_no}` : 'No Coach'}</span>
          </div>
          <h3 style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)', margin: '0' }}>
            {device.name || 'Unnamed Device'}
          </h3>
        </div>
        
        {/* Status Indicator and Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className={`status-dot ${isOnline ? 'online' : 'offline'}`} />
            <span style={{ fontSize: '12px', fontWeight: '600', color: statusColor }}>
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
          {!hideActions && (
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
          )}
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


        {/* Main MCB */}
        <div style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '8px' }}>
            <Power size={14} /> Main MCB
          </div>
          <div style={{ 
            fontSize: '14px', 
            fontWeight: '600',
            color: device.main_mcb_status === 'ON' ? 'var(--status-green)' : (device.main_mcb_status === 'OFF' ? 'var(--status-red)' : 'inherit')
          }}>
            {device.main_mcb_status || '--'}
          </div>
        </div>

        {/* FSDC MCB */}
        <div style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '8px' }}>
            <Power size={14} /> FSDC MCB
          </div>
          <div style={{ 
            fontSize: '14px', 
            fontWeight: '600',
            color: device.fsds_mcb_status === 'ON' ? 'var(--status-green)' : (device.fsds_mcb_status === 'OFF' ? 'var(--status-red)' : 'inherit')
          }}>
            {device.fsds_mcb_status || '--'}
          </div>
        </div>

        {/* Battery Status */}
        <div style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '8px' }}>
            <Activity size={14} /> Battery Status
          </div>
          <div style={{ 
            fontSize: '14px', 
            fontWeight: '600',
            color: device.battery_status === 'Charging' ? 'var(--status-green)' : 'inherit'
          }}>
            {device.battery_status || '--'}
          </div>
        </div>

        {/* Countdown Timer */}
        <div style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '8px' }}>
            <Timer size={14} /> Countdown
          </div>
          <div style={{ 
            fontSize: '18px', 
            fontWeight: '700',
            color: 'var(--status-red)'
          }}>
            {device.countdown_timer !== undefined && device.countdown_timer !== null ? `${device.countdown_timer}s` : '--'}
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
