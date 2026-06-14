import axios from 'axios';
import type {
  LoginRequest,
  LoginResponse,
  User,
  Incident,
  IncidentSeverity,
  IncidentStatus,
  IncidentType,
  IncidentSource,
  TimelineEntry,
  Device,
  DeviceType,
  DeviceStatusType,
  Tunnel,
  EmergencyPlan,
  PlanExecution,
  ReportItem,
  ReportDetail,
  Statistics,
  PaginatedResponse,
} from '@/types';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export const authApi = {
  login: (data: LoginRequest): Promise<LoginResponse> => api.post('/auth/login', data),
  getProfile: (): Promise<User> => api.get('/auth/profile'),
};

export const incidentApi = {
  getList: (params?: {
    page?: number;
    pageSize?: number;
    status?: IncidentStatus;
    severity?: IncidentSeverity;
    type?: IncidentType;
    tunnelId?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<PaginatedResponse<Incident>> => api.get('/incidents', { params }),
  getDetail: (id: number): Promise<Incident> => api.get(`/incidents/${id}`),
  create: (data: {
    tunnelId: number;
    mileage: number;
    type: IncidentType;
    severity: IncidentSeverity;
    source: IncidentSource;
    reporterName?: string;
    description: string;
  }): Promise<Incident> => api.post('/incidents', data),
  updateStatus: (id: number, status: IncidentStatus): Promise<Incident> =>
    api.patch(`/incidents/${id}/status`, { status }),
  simulate: (data: {
    tunnelId: number;
    mileage: number;
    type: IncidentType;
    severity: IncidentSeverity;
    description: string;
  }): Promise<Incident> => api.post('/incidents/simulate', data),
};

export const timelineApi = {
  getByIncident: (incidentId: number): Promise<TimelineEntry[]> =>
    api.get(`/timelines/incident/${incidentId}`),
};

export const deviceApi = {
  getList: (params?: { tunnelId?: number; type?: DeviceType; status?: DeviceStatusType }): Promise<Device[]> =>
    api.get('/devices', { params }),
  getDetail: (id: number): Promise<Device> => api.get(`/devices/${id}`),
  update: (id: number, data: { status?: DeviceStatusType; content?: string }): Promise<Device> =>
    api.patch(`/devices/${id}`, data),
  getByTunnel: (tunnelId: number): Promise<Device[]> =>
    api.get(`/devices/tunnel/${tunnelId}`),
};

export const tunnelApi = {
  getList: (): Promise<Tunnel[]> => api.get('/tunnels'),
  getDetail: (id: number): Promise<Tunnel> => api.get(`/tunnels/${id}`),
};

export const planApi = {
  getList: (params?: { incidentType?: IncidentType; severity?: IncidentSeverity }): Promise<EmergencyPlan[]> =>
    api.get('/plans', { params }),
  getDetail: (id: number): Promise<EmergencyPlan> => api.get(`/plans/${id}`),
  create: (data: any): Promise<EmergencyPlan> => api.post('/plans', data),
  update: (id: number, data: any): Promise<EmergencyPlan> => api.put(`/plans/${id}`, data),
  delete: (id: number): Promise<void> => api.delete(`/plans/${id}`),
};

export const executionApi = {
  execute: (data: { incidentId: number; planId?: number }): Promise<PlanExecution> =>
    api.post('/executions', data),
  getByIncident: (incidentId: number): Promise<PlanExecution | null> =>
    api.get(`/executions/incident/${incidentId}`),
  adjustAction: (executionId: number, actionId: number, data: {
    status: string;
    parameters?: Record<string, any>;
    remark?: string;
  }): Promise<PlanExecution> =>
    api.patch(`/executions/${executionId}/actions/${actionId}`, data),
};

export const reportApi = {
  getList: (params?: { page?: number; pageSize?: number; startDate?: string; endDate?: string }): Promise<PaginatedResponse<ReportItem>> =>
    api.get('/reports', { params }),
  getDetail: (id: number): Promise<ReportDetail> => api.get(`/reports/${id}`),
  getStats: (): Promise<Statistics> => api.get('/reports/stats'),
};

export default api;
