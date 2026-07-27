import { useEffect } from 'react';
import { useDeviceStore } from '../../store/deviceStore';
import { DeviceCard } from './DeviceCard';
import { useWebSocket } from '../../hooks/useWebSocket';

export const DeviceGrid = () => {
  const { devices, isLoading, error, fetchDevices } = useDeviceStore();

  // Initialize WebSocket connection for live updates
  useWebSocket();

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  if (isLoading && devices.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading devices...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px', background: 'var(--status-red-bg)', color: 'var(--status-red)', borderRadius: '12px' }}>
        <h3>Error loading devices</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (devices.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)', borderRadius: '12px' }}>
        <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>No devices found</h3>
        <p style={{ color: 'var(--text-secondary)' }}>Waiting for devices to connect and publish telemetry...</p>
      </div>
    );
  }

  return (
    <div className="device-grid">
      {devices.map((device) => (
        <DeviceCard key={device.id || device.mac_address} device={device} />
      ))}
    </div>
  );
};
