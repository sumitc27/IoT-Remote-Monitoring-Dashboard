import React, { useEffect, useState, useMemo } from 'react';
import { useDeviceStore } from '../../store/deviceStore';
import { DeviceCard } from './DeviceCard';
import { useWebSocket } from '../../hooks/useWebSocket';
import { Filter, Plus, X, Train } from 'lucide-react';

export const DeviceGrid = () => {
  const { devices, isLoading, error, fetchDevices } = useDeviceStore();
  const [selectedTrain, setSelectedTrain] = useState('');
  const [selectedCoach, setSelectedCoach] = useState('All');
  const [activeFilters, setActiveFilters] = useState([]);

  // Initialize WebSocket connection for live updates
  useWebSocket();

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const uniqueTrains = useMemo(() => {
    const trains = new Set();
    devices.forEach(d => { if (d.train_no) trains.add(d.train_no); });
    return Array.from(trains).sort();
  }, [devices]);

  const uniqueCoaches = useMemo(() => {
    if (!selectedTrain) return [];
    const coaches = new Set();
    devices.forEach(d => {
      if (d.train_no === selectedTrain && d.coach_no) coaches.add(d.coach_no);
    });
    return Array.from(coaches).sort();
  }, [devices, selectedTrain]);

  // Reset coach when train changes
  useEffect(() => {
    setSelectedCoach('All');
  }, [selectedTrain]);

  const handleAddFilter = () => {
    if (!selectedTrain) return;
    
    // Check if filter already exists
    const exists = activeFilters.some(f => f.train === selectedTrain && f.coach === selectedCoach);
    if (!exists) {
      setActiveFilters([...activeFilters, { train: selectedTrain, coach: selectedCoach }]);
    }
    
    // Reset selection
    setSelectedTrain('');
    setSelectedCoach('All');
  };

  const removeFilter = (indexToRemove) => {
    setActiveFilters(activeFilters.filter((_, i) => i !== indexToRemove));
  };

  const filteredDevices = useMemo(() => {
    if (activeFilters.length === 0) return [];
    
    // Use a Map to ensure unique devices even if they match multiple filters
    const matchedDevices = new Map();
    
    devices.forEach(d => {
      const matches = activeFilters.some(filter => {
        if (d.train_no !== filter.train) return false;
        if (filter.coach !== 'All' && d.coach_no !== filter.coach) return false;
        return true;
      });
      if (matches) {
        matchedDevices.set(d.id || d.mac_address, d);
      }
    });
    
    return Array.from(matchedDevices.values());
  }, [devices, activeFilters]);

  const groupedFilteredDevices = useMemo(() => {
    const map = {};
    filteredDevices.forEach(d => {
      const train = d.train_no || 'Unassigned Train';
      const coach = d.coach_no || 'Unassigned Coach';
      if (!map[train]) map[train] = {};
      if (!map[train][coach]) map[train][coach] = [];
      map[train][coach].push(d);
    });
    return map;
  }, [filteredDevices]);

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--bg-card)', padding: '16px 24px', borderRadius: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
            <Filter size={20} />
            <span style={{ fontWeight: '600' }}>Filter Dashboard</span>
          </div>
          
          <div style={{ display: 'flex', gap: '16px', marginLeft: 'auto' }}>
            <select 
              value={selectedTrain}
              onChange={(e) => setSelectedTrain(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)', background: 'var(--bg-primary)' }}
            >
              <option value="">Select Train...</option>
              {uniqueTrains.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            
            <select
              value={selectedCoach}
              onChange={(e) => setSelectedCoach(e.target.value)}
              disabled={!selectedTrain}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)', background: 'var(--bg-primary)' }}
            >
              <option value="All">All Coaches</option>
              {uniqueCoaches.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            
            <button 
              onClick={handleAddFilter}
              disabled={!selectedTrain}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', background: selectedTrain ? 'var(--status-green)' : 'var(--status-gray)', color: 'white', border: 'none', cursor: selectedTrain ? 'pointer' : 'not-allowed', fontWeight: '600' }}
            >
              <Plus size={16} /> Add to Dashboard
            </button>
          </div>
        </div>
        
        {activeFilters.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', paddingTop: '16px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
            {activeFilters.map((filter, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-primary)', padding: '6px 12px', borderRadius: '20px', fontSize: '14px', border: '1px solid rgba(0,0,0,0.1)' }}>
                <span style={{ fontWeight: '600' }}>{filter.train}</span>
                <span style={{ color: 'var(--text-secondary)' }}>|</span>
                <span>{filter.coach === 'All' ? 'All Coaches' : `Coach: ${filter.coach}`}</span>
                <button 
                  onClick={() => removeFilter(idx)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.05)', border: 'none', borderRadius: '50%', padding: '2px', cursor: 'pointer', marginLeft: '4px', color: 'var(--text-secondary)' }}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {activeFilters.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)', borderRadius: '12px' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>No Trains Selected</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Please use the filter above to add trains to your dashboard view.</p>
        </div>
      ) : filteredDevices.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)', borderRadius: '12px' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>No Devices Found</h3>
          <p style={{ color: 'var(--text-secondary)' }}>No devices match your active filters.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {Object.entries(groupedFilteredDevices).sort((a,b) => a[0].localeCompare(b[0])).map(([trainName, coaches]) => (
            <div key={trainName} className="card" style={{ padding: '0', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.05)' }}>
              <div style={{ padding: '16px 20px', background: 'var(--bg-card)', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: 'rgba(46, 204, 113, 0.1)', borderRadius: '8px' }}>
                  <Train size={18} color="var(--status-green)" />
                </div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>Train: {trainName}</h3>
              </div>
              <div style={{ padding: '20px', background: 'var(--bg-primary)', display: 'flex', flexWrap: 'wrap', gap: '32px', alignItems: 'flex-start' }}>
                {Object.entries(coaches).sort((a,b) => a[0].localeCompare(b[0])).map(([coachName, coachDevices]) => (
                  <div key={coachName} style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '300px' }}>
                    <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '4px', height: '16px', background: 'var(--status-green)', borderRadius: '2px' }} />
                      Coach: {coachName}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
                      {coachDevices.map(device => (
                        <div key={device.id || device.mac_address} style={{ flex: '1 1 300px', maxWidth: '400px' }}>
                          <DeviceCard 
                            device={device} 
                            hideActions={true}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
