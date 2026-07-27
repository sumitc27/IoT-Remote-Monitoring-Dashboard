import { useEffect, useState } from 'react';
import { useDeviceStore } from '../../store/deviceStore';
import { DeviceCard } from './DeviceCard';
import { useWebSocket } from '../../hooks/useWebSocket';
import { Plus } from 'lucide-react';
import { DeviceModal } from './DeviceModal';
import api from '../../utils/api';

export const DeviceGrid = () => {
  const { devices, isLoading, error, fetchDevices } = useDeviceStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deviceToEdit, setDeviceToEdit] = useState(null);

  // Initialize WebSocket connection for live updates
  useWebSocket();

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const handleEdit = (device) => {
    setDeviceToEdit(device);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this device? This will also delete all its telemetry history.')) {
      try {
        await api.delete(`/devices/${id}`);
        fetchDevices();
      } catch (err) {
        console.error("Failed to delete device", err);
        alert("Failed to delete device");
      }
    }
  };

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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            onClick={() => { setDeviceToEdit(null); setIsModalOpen(true); }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', background: 'var(--status-green)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '600' }}
          >
            <Plus size={18} /> Add Device
          </button>
        </div>
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)', borderRadius: '12px' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>No devices found</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Waiting for devices to connect or add one manually.</p>
        </div>
        <DeviceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} device={deviceToEdit} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          onClick={() => { setDeviceToEdit(null); setIsModalOpen(true); }}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', background: 'var(--status-green)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '600' }}
        >
          <Plus size={18} /> Add Device
        </button>
      </div>

      <div className="device-grid">
        {devices.map((device) => (
          <DeviceCard 
            key={device.id || device.mac_address} 
            device={device} 
            onEdit={() => handleEdit(device)}
            onDelete={() => handleDelete(device.id)}
          />
        ))}
      </div>

      <DeviceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} device={deviceToEdit} />
    </div>
  );
};
