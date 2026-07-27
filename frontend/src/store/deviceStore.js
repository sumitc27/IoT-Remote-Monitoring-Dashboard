import { create } from 'zustand';
import api from '../utils/api';

export const useDeviceStore = create((set, get) => ({
  devices: [],
  isLoading: false,
  error: null,
  wsConnected: false,
  currentDevice: null,
  deviceTelemetry: [],

  setWsStatus: (status) => set({ wsConnected: status }),

  fetchDevices: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/devices');
      set({ devices: res.data, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchDevice: async (id) => {
    set({ isLoading: true });
    try {
      const res = await api.get(`/devices/${id}`);
      set({ currentDevice: res.data, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchTelemetry: async (id, params = {}) => {
    try {
      const res = await api.get(`/devices/${id}/telemetry`, { params });
      // Reverse array so chronological order
      set({ deviceTelemetry: res.data.reverse() });
    } catch (err) {
      console.error(err);
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
      }),
      // Also update currentDevice if it matches
      currentDevice: state.currentDevice && state.currentDevice.mac_address === telemetry.mac_address
        ? {
            ...state.currentDevice,
            ...telemetry,
            is_online: true,
            last_seen: new Date().toISOString()
          }
        : state.currentDevice,
      // And append to deviceTelemetry if viewing this device
      deviceTelemetry: state.currentDevice && state.currentDevice.mac_address === telemetry.mac_address
        ? [...state.deviceTelemetry, { time: new Date().toISOString(), ...telemetry }].slice(-1000) // keep last 1000 points
        : state.deviceTelemetry
    }));
  }
}));
