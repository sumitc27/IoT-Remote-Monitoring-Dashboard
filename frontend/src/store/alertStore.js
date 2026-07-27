import { create } from 'zustand';
import api from '../utils/api';

export const useAlertStore = create((set, get) => ({
  // --- State ---
  rules: [],
  events: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  showDropdown: false,
  toasts: [],

  // --- Alert Rules ---
  fetchRules: async (params = {}) => {
    set({ isLoading: true });
    try {
      const res = await api.get('/alerts/rules', { params });
      set({ rules: res.data, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  createRule: async (ruleData) => {
    try {
      const res = await api.post('/alerts/rules', ruleData);
      set((state) => ({ rules: [res.data, ...state.rules] }));
      return res.data;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  updateRule: async (ruleId, ruleData) => {
    try {
      const res = await api.put(`/alerts/rules/${ruleId}`, ruleData);
      set((state) => ({
        rules: state.rules.map((r) => (r.id === ruleId ? res.data : r)),
      }));
      return res.data;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  deleteRule: async (ruleId) => {
    try {
      await api.delete(`/alerts/rules/${ruleId}`);
      set((state) => ({
        rules: state.rules.filter((r) => r.id !== ruleId),
      }));
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  // --- Alert Events ---
  fetchEvents: async (params = {}) => {
    set({ isLoading: true });
    try {
      const res = await api.get('/alerts/events', { params });
      set({ events: res.data, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const res = await api.get('/alerts/stats');
      set({ unreadCount: res.data.unacknowledged });
    } catch (err) {
      console.error('Failed to fetch alert stats:', err);
    }
  },

  acknowledgeEvent: async (eventId) => {
    try {
      const res = await api.put(`/alerts/events/${eventId}/acknowledge`);
      set((state) => ({
        events: state.events.map((e) => (e.id === eventId ? res.data : e)),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (err) {
      set({ error: err.message });
    }
  },

  acknowledgeAll: async () => {
    try {
      await api.put('/alerts/events/acknowledge-all');
      set((state) => ({
        events: state.events.map((e) => ({ ...e, acknowledged: true })),
        unreadCount: 0,
      }));
    } catch (err) {
      set({ error: err.message });
    }
  },

  // --- Real-time alert from WebSocket ---
  addRealtimeAlert: (alertData) => {
    set((state) => ({
      events: [alertData, ...state.events].slice(0, 100),
      unreadCount: state.unreadCount + 1,
      toasts: [
        ...state.toasts,
        { id: alertData.id || Date.now(), ...alertData, createdAt: Date.now() },
      ],
    }));
  },

  // --- Toast Management ---
  removeToast: (toastId) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== toastId),
    }));
  },

  clearToasts: () => set({ toasts: [] }),

  // --- Dropdown Toggle ---
  toggleDropdown: () => set((state) => ({ showDropdown: !state.showDropdown })),
  closeDropdown: () => set({ showDropdown: false }),
}));
