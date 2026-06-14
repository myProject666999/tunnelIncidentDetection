import { create } from 'zustand';
import type { Tunnel, Device } from '@/types';
import { tunnelApi, deviceApi } from '@/api';

interface AppState {
  tunnels: Tunnel[];
  devices: Device[];
  loading: boolean;
  sidebarCollapsed: boolean;
  fetchTunnels: () => Promise<void>;
  fetchDevices: (tunnelId?: number) => Promise<void>;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  tunnels: [],
  devices: [],
  loading: false,
  sidebarCollapsed: false,
  fetchTunnels: async () => {
    set({ loading: true });
    try {
      const tunnels = await tunnelApi.getList();
      set({ tunnels });
    } catch (error) {
      console.error('Failed to fetch tunnels:', error);
    } finally {
      set({ loading: false });
    }
  },
  fetchDevices: async (tunnelId?: number) => {
    set({ loading: true });
    try {
      const devices = await deviceApi.getList({ tunnelId });
      set({ devices });
    } catch (error) {
      console.error('Failed to fetch devices:', error);
    } finally {
      set({ loading: false });
    }
  },
  toggleSidebar: () => {
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
  },
  setSidebarCollapsed: (collapsed: boolean) => {
    set({ sidebarCollapsed: collapsed });
  },
}));
