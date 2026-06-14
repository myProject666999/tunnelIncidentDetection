import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { IncidentSeverity, IncidentStatus, IncidentType, IncidentSource } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} 秒`;
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (minutes < 60) return secs > 0 ? `${minutes} 分 ${secs} 秒` : `${minutes} 分钟`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours} 小时 ${mins} 分` : `${hours} 小时`;
}

export const severityConfig: Record<IncidentSeverity, { label: string; color: string; bgColor: string }> = {
  critical: { label: '特别重大', color: 'text-tunnel-danger', bgColor: 'bg-red-500/10 border-red-500/30' },
  major: { label: '重大', color: 'text-tunnel-accent', bgColor: 'bg-orange-500/10 border-orange-500/30' },
  moderate: { label: '较大', color: 'text-tunnel-warning', bgColor: 'bg-yellow-500/10 border-yellow-500/30' },
  minor: { label: '一般', color: 'text-tunnel-info', bgColor: 'bg-cyan-500/10 border-cyan-500/30' },
};

export const statusConfig: Record<IncidentStatus, { label: string; color: string; bgColor: string }> = {
  pending: { label: '待处置', color: 'text-tunnel-accent', bgColor: 'bg-orange-500/10 border-orange-500/30' },
  responding: { label: '处置中', color: 'text-tunnel-info', bgColor: 'bg-cyan-500/10 border-cyan-500/30' },
  resolved: { label: '已解决', color: 'text-tunnel-success', bgColor: 'bg-green-500/10 border-green-500/30' },
  closed: { label: '已关闭', color: 'text-tunnel-text-dim', bgColor: 'bg-gray-500/10 border-gray-500/30' },
};

export const typeConfig: Record<IncidentType, { label: string; icon: string }> = {
  breakdown: { label: '车辆抛锚', icon: 'Car' },
  rear_end: { label: '追尾事故', icon: 'CarFront' },
  intrusion: { label: '人员闯入', icon: 'PersonStanding' },
  fire: { label: '火灾', icon: 'Flame' },
  wrong_way: { label: '车辆逆行', icon: 'ArrowLeft' },
  debris: { label: '物品散落', icon: 'Package' },
};

export const sourceConfig: Record<IncidentSource, { label: string; icon: string }> = {
  manual: { label: '手工上报', icon: 'User' },
  video_detection: { label: '视频检测', icon: 'Camera' },
  public_report: { label: '公众报警', icon: 'Phone' },
};

export function getTimeAgo(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} 天前`;
  if (hours > 0) return `${hours} 小时前`;
  if (minutes > 0) return `${minutes} 分钟前`;
  return '刚刚';
}
