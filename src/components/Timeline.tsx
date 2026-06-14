import { cn } from '@/utils';
import type { TimelineEntry } from '@/types';
import { formatDateTime } from '@/utils';
import {
  AlertTriangle,
  MessageSquare,
  CheckCircle,
  Wrench,
  Clock,
  Zap,
  Shield,
} from 'lucide-react';

const iconMap: Record<string, any> = {
  '事件创建': AlertTriangle,
  '视频检测告警': Zap,
  '预案触发': Shield,
  '动作执行': Wrench,
  '手动干预': MessageSquare,
  '事件关闭': CheckCircle,
};

const colorMap: Record<string, string> = {
  '事件创建': 'text-tunnel-accent bg-tunnel-accent/20',
  '视频检测告警': 'text-tunnel-warning bg-tunnel-warning/20',
  '预案触发': 'text-tunnel-info bg-tunnel-info/20',
  '动作执行': 'text-tunnel-success bg-tunnel-success/20',
  '手动干预': 'text-purple-400 bg-purple-500/20',
  '事件关闭': 'text-tunnel-text-dim bg-tunnel-text-dim/20',
};

interface TimelineProps {
  items: TimelineEntry[];
  className?: string;
}

export default function Timeline({ items, className }: TimelineProps) {
  return (
    <div className={cn('space-y-0', className)}>
      {items.map((item, index) => {
        const Icon = iconMap[item.event] || Clock;
        const color = colorMap[item.event] || 'text-tunnel-text-dim bg-tunnel-text-dim/20';
        const isLast = index === items.length - 1;
        return (
          <div key={item.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={cn('w-8 h-8 rounded-full flex items-center justify-center', color)}>
                <Icon className="w-4 h-4" />
              </div>
              {!isLast && <div className="flex-1 w-px bg-tunnel-border my-1" />}
            </div>
            <div className="flex-1 pb-5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-tunnel-text">{item.event}</span>
                <span className="text-xs text-tunnel-text-muted">{formatDateTime(item.timestamp)}</span>
              </div>
              <p className="text-sm text-tunnel-text-dim mt-1">{item.detail}</p>
              {item.operatorName && (
                <p className="text-xs text-tunnel-text-muted mt-1">操作人: {item.operatorName}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
