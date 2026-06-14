import { create } from 'zustand';
import type { Incident, IncidentSeverity, IncidentStatus, IncidentType } from '@/types';
import { incidentApi } from '@/api';

interface IncidentState {
  incidents: Incident[];
  currentIncident: Incident | null;
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  filters: {
    status?: IncidentStatus;
    severity?: IncidentSeverity;
    type?: IncidentType;
    keyword?: string;
  };
  fetchIncidents: (params?: {
    page?: number;
    pageSize?: number;
    status?: IncidentStatus;
    severity?: IncidentSeverity;
    type?: IncidentType;
    keyword?: string;
  }) => Promise<void>;
  fetchIncidentDetail: (id: string) => Promise<Incident | null>;
  createIncident: (data: Partial<Incident>) => Promise<Incident | null>;
  updateIncidentStatus: (id: string, status: IncidentStatus) => Promise<Incident | null>;
  setFilters: (filters: Partial<IncidentState['filters']>) => void;
  setCurrentIncident: (incident: Incident | null) => void;
  addIncident: (incident: Incident) => void;
}

export const useIncidentStore = create<IncidentState>((set, get) => ({
  incidents: [],
  currentIncident: null,
  total: 0,
  page: 1,
  pageSize: 20,
  loading: false,
  filters: {},
  fetchIncidents: async (params) => {
    set({ loading: true });
    try {
      const currentFilters = get().filters;
      const response = await incidentApi.getList({
        page: get().page,
        pageSize: get().pageSize,
        ...currentFilters,
        ...params,
      });
      set({
        incidents: response.items,
        total: response.total,
        page: response.page,
        pageSize: response.pageSize,
      });
    } catch (error) {
      console.error('Failed to fetch incidents:', error);
    } finally {
      set({ loading: false });
    }
  },
  fetchIncidentDetail: async (id: string) => {
    set({ loading: true });
    try {
      const incident = await incidentApi.getDetail(+id);
      set({ currentIncident: incident });
      return incident;
    } catch (error) {
      console.error('Failed to fetch incident detail:', error);
      return null;
    } finally {
      set({ loading: false });
    }
  },
  createIncident: async (data: Partial<Incident>) => {
    try {
      const incident = await incidentApi.create(data as any);
      set((state) => ({
        incidents: [incident, ...state.incidents],
        total: state.total + 1,
      }));
      return incident;
    } catch (error) {
      console.error('Failed to create incident:', error);
      return null;
    }
  },
  updateIncidentStatus: async (id: string, status: IncidentStatus) => {
    try {
      const incident = await incidentApi.updateStatus(+id, status);
      set((state) => ({
        incidents: state.incidents.map((item) => (item.id === +id ? incident : item)),
        currentIncident: state.currentIncident?.id === +id ? incident : state.currentIncident,
      }));
      return incident;
    } catch (error) {
      console.error('Failed to update incident status:', error);
      return null;
    }
  },
  setFilters: (filters: Partial<IncidentState['filters']>) => {
    set((state) => ({ filters: { ...state.filters, ...filters }, page: 1 }));
  },
  setCurrentIncident: (incident: Incident | null) => {
    set({ currentIncident: incident });
  },
  addIncident: (incident: Incident) => {
    set((state) => ({
      incidents: [incident, ...state.incidents],
      total: state.total + 1,
    }));
  },
}));
