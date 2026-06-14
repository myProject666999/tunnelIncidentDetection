export interface User {
  id: number;
  username: string;
  displayName: string;
  role: 'admin' | 'operator';
  createdAt?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export type IncidentType = 'breakdown' | 'rear_end' | 'intrusion' | 'fire' | 'wrong_way' | 'debris';
export type IncidentSeverity = 'minor' | 'moderate' | 'major' | 'critical';
export type IncidentStatus = 'pending' | 'responding' | 'resolved' | 'closed';
export type IncidentSource = 'manual' | 'video_detection' | 'public_report';

export interface Incident {
  id: number;
  incidentNo: string;
  tunnelId: number;
  tunnelName: string;
  mileage: number;
  type: IncidentType;
  severity: IncidentSeverity;
  source: IncidentSource;
  reporterName: string;
  description: string;
  status: IncidentStatus;
  planId: number | null;
  createdBy: number;
  creatorName: string;
  createdAt: string;
  closedAt: string | null;
}

export type ActionType = 'led_display' | 'light_full' | 'light_enhance' | 'tunnel_close' | 'tunnel_open' | 'notify_fire' | 'notify_medical' | 'speed_limit';
export type ActionExecutionStatus = 'pending' | 'executing' | 'completed' | 'skipped' | 'adjusted' | 'failed';

export interface PlanAction {
  id: number;
  step: number;
  actionType: ActionType;
  parameters: Record<string, any>;
  description: string;
}

export interface EmergencyPlan {
  id: number;
  name: string;
  incidentType: IncidentType;
  severity: IncidentSeverity;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  actions: PlanAction[];
}

export interface ActionExecution {
  id: number;
  actionId: number;
  step: number;
  actionType: ActionType;
  description: string;
  status: ActionExecutionStatus;
  parameters: Record<string, any> | null;
  operatorId: number | null;
  remark: string | null;
  startedAt: string | null;
  completedAt: string | null;
}

export interface PlanExecution {
  id: number;
  incidentId: number;
  planId: number;
  planName: string;
  status: 'executing' | 'completed' | 'interrupted';
  startedAt: string;
  completedAt: string | null;
  actions: ActionExecution[];
}

export interface TimelineEntry {
  id: number;
  incidentId: number;
  timestamp: string;
  event: string;
  operatorId: number | null;
  operatorName: string;
  detail: string;
}

export type DeviceType = 'led_screen' | 'light_group' | 'barrier' | 'camera';
export type DeviceStatusType = 'online' | 'offline' | 'malfunction';

export interface Device {
  id: number;
  tunnelId: number;
  type: DeviceType;
  name: string;
  location: string;
  mileage: number;
  status: DeviceStatusType;
  content: string | null;
  updatedAt?: string;
}

export interface Tunnel {
  id: number;
  name: string;
  code: string;
  length: number;
  directionCount: number;
  startLocation: string;
  endLocation: string;
}

export interface ReportItem {
  id: number;
  incidentNo: string;
  tunnelName: string;
  type: IncidentType;
  severity: IncidentSeverity;
  source: IncidentSource;
  description: string;
  createdAt: string;
  closedAt: string | null;
  responseDuration: number;
}

export interface ReportDetail extends ReportItem {
  tunnelCode: string;
  mileage: number;
  reporterName: string;
  status: IncidentStatus;
  creatorName: string;
  timeline: TimelineEntry[];
}

export interface Statistics {
  totalIncidents: number;
  pendingIncidents: number;
  resolvedIncidents: number;
  todayIncidents: number;
  avgResponseTime: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
