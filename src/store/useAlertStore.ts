import { create } from 'zustand';

interface Alert {
  id: number;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface AlertState {
  alerts: Alert[];
  unreadCount: number;
  total: number;
  loading: boolean;
  addAlert: (alert: Omit<Alert, 'id' | 'read' | 'createdAt'>) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  alerts: [
    { id: 1, title: '系统通知', message: '欢迎使用隧道事件检测系统', read: false, createdAt: new Date().toISOString() },
  ],
  unreadCount: 1,
  total: 1,
  loading: false,
  addAlert: (alert) => {
    const newAlert = {
      ...alert,
      id: Date.now(),
      read: false,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      alerts: [newAlert, ...state.alerts],
      total: state.total + 1,
      unreadCount: state.unreadCount + 1,
    }));
  },
  markAsRead: (id: number) => {
    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === id ? { ...a, read: true } : a)),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },
  markAllAsRead: () => {
    set((state) => ({
      alerts: state.alerts.map((a) => ({ ...a, read: true })),
      unreadCount: 0,
    }));
  },
}));
