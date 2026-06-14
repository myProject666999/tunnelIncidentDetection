import { ReactNode } from 'react';
import { cn } from '@/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isUp: boolean;
  };
  color?: 'info' | 'success' | 'warning' | 'danger' | 'accent';
  suffix?: string;
}

const colorMap = {
  info: 'from-tunnel-info/20 to-tunnel-info/5 text-tunnel-info',
  success: 'from-tunnel-success/20 to-tunnel-success/5 text-tunnel-success',
  warning: 'from-tunnel-warning/20 to-tunnel-warning/5 text-tunnel-warning',
  danger: 'from-tunnel-danger/20 to-tunnel-danger/5 text-tunnel-danger',
  accent: 'from-tunnel-accent/20 to-tunnel-accent/5 text-tunnel-accent',
};

export default function StatCard({
  title,
  value,
  icon,
  trend,
  color = 'info',
  suffix,
}: StatCardProps) {
  return (
    <div className="bg-tunnel-surface border border-tunnel-border rounded-xl p-5 hover:border-tunnel-border-light transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-tunnel-text-dim text-sm mb-1">{title}</p>
          <div className="flex items-baseline gap-1">
            <span
              className={cn(
              'text-3xl font-bold font-din transition-all duration-300 group-hover:scale-105',
              colorMap[color].split(' ').pop()
            )}
            >
              {value}
            </span>
            {suffix && <span className="text-tunnel-text-muted text-sm">{suffix}</span>}
          </div>
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              <span
                className={cn(
                'text-xs font-medium',
                trend.isUp ? 'text-tunnel-success' : 'text-tunnel-danger'
              )}
              >
                {trend.isUp ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-tunnel-text-muted">较昨日</span>
            </div>
          )}
        </div>
        <div
          className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br',
          colorMap[color]
        )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
