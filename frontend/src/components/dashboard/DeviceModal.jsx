import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../../utils/api';
import { useDeviceStore } from '../../store/deviceStore';

export const DeviceModal = ({ isOpen, onClose, device = null }) => {
  const { fetchDevices } = useDeviceStore();
  const isEditing = !!device;

  const [formData, setFormData] = useState({
    mac_address: '',
    name: '',
    device_type: '',
    location: '',
    description: '',
    firmware_ver: '',
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (device) {
      setFormData({
        mac_address: device.mac_address || '',
        name: device.name || '',
        device_type: device.device_type || '',
        location: device.location || '',
        description: device.description || '',
        firmware_ver: device.firmware_ver || '',
      });
    } else {
      setFormData({
        mac_address: '',
        name: '',
        device_type: '',
        location: '',
        description: '',
        firmware_ver: '',
      });
    }
  }, [device, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (isEditing) {
        // Exclude mac_address from update if API doesn't support it or if it's restricted
        const { mac_address, ...updateData } = formData;
        await api.put(`/devices/${device.id}`, updateData);
      } else {
        await api.post('/devices', formData);
      }
      await fetchDevices();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '500px', margin: '20px', position: 'relative' }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
        >
          <X size={20} />
        </button>
        
        <h2 style={{ marginTop: 0, marginBottom: '24px' }}>{isEditing ? 'Edit Device' : 'Add Device'}</h2>
        
        {error && (
          <div style={{ padding: '12px', background: 'var(--status-red-bg)', color: 'var(--status-red)', borderRadius: '8px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>MAC Address *</label>
            <input 
              type="text" 
              name="mac_address"
              value={formData.mac_address} 
              onChange={handleChange} 
              disabled={isEditing}
              required
              placeholder="e.g. 00:1B:44:11:3A:B7"
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)', background: isEditing ? 'var(--bg-primary)' : 'var(--bg-card)', color: 'var(--text-primary)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Device Name</label>
            <input 
              type="text" 
              name="name"
              value={formData.name} 
              onChange={handleChange} 
              placeholder="e.g. Remote Node 1"
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Device Type</label>
              <input 
                type="text" 
                name="device_type"
                value={formData.device_type} 
                onChange={handleChange} 
                placeholder="e.g. ESP32-S3"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Location</label>
              <input 
                type="text" 
                name="location"
                value={formData.location} 
                onChange={handleChange} 
                placeholder="e.g. Server Room A"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Firmware Version</label>
            <input 
              type="text" 
              name="firmware_ver"
              value={formData.firmware_ver} 
              onChange={handleChange} 
              placeholder="e.g. v1.2.0"
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--text-muted)', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" disabled={isLoading} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: 'var(--status-green)', color: 'white', cursor: isLoading ? 'not-allowed' : 'pointer', fontWeight: '600' }}>
              {isLoading ? 'Saving...' : 'Save Device'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
