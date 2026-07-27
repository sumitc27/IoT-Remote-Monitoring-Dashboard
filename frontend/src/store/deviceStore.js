import { create } from 'zustand';

export const useDeviceStore = create((set, get) => ({
  devices: [],
  isLoading: false,
  error: null,
  wsConnected: false,

  setWsStatus: (status) => set({ wsConnected: status }),

  fetchDevices: async () => {
    set({ isLoading: true });
    try {
      // In development, you would proxy to backend
      const res = await fetch('http://localhost:8000/api/devices');
      if (!res.ok) throw new Error('Failed to fetch devices');
      const data = await res.json();
      set({ devices: data, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  updateDeviceTelemetry: (telemetry) => {
    set((state) => ({
      devices: state.devices.map((device) => {
        if (device.mac_address === telemetry.mac_address) {
          return {
            ...device,
            ...telemetry, // Update with new telemetry
            is_online: true, // If we get data, it's online
            last_seen: new Date().toISOString()
          };
        }
        return device;
      })
    }));
  }
}));
