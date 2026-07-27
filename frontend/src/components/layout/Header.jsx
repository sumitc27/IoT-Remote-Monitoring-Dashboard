import { useDeviceStore } from '../../store/deviceStore';
import { AlertBell } from '../alerts/AlertBell';
import { Wifi, WifiOff } from 'lucide-react';

export const Header = () => {
  const { wsConnected } = useDeviceStore();

  return (
    <header className="header">
      <div>
        <h1 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>Dashboard Overview</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '4px 0 0 0' }}>
          Real-time telemetry and status monitoring
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Alert Bell */}
        <AlertBell />

        {/* Connection Status Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          borderRadius: '20px',
          background: wsConnected ? 'var(--status-green-bg)' : 'var(--status-red-bg)',
          color: wsConnected ? 'var(--status-green)' : 'var(--status-red)',
          fontSize: '14px',
          fontWeight: '600'
        }}>
          {wsConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
          {wsConnected ? 'Live' : 'Disconnected'}
        </div>
      </div>
    </header>
  );
};
