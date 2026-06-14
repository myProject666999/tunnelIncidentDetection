import { cn } from '@/utils';
import type { IncidentSeverity, IncidentStatus } from '@/types';
import { severityConfig, statusConfig } from '@/utils';

interface BadgeProps {
  variant?: 'severity' | 'status';
  value: IncidentSeverity | IncidentStatus;
  className?: string;
}

export default function Badge({ variant = 'severity', value, className }: BadgeProps) {
  const config = variant === 'severity' ? severityConfig[value as IncidentSeverity] : statusConfig[value as IncidentStatus];

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border',
        config.bgColor,
        config.color,
        className
      )}
    >
      {config.label}
    </span>
  );
}
