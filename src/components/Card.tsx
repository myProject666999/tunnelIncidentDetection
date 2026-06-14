import { cn } from '@/utils';
import type { ReactNode } from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  headerRight?: ReactNode;
  footer?: ReactNode;
  padding?: 'default' | 'none';
}

export default function Card({
  title,
  subtitle,
  children,
  className,
  headerRight,
  footer,
  padding = 'default',
}: CardProps) {
  return (
    <div className={cn('bg-tunnel-surface border border-tunnel-border rounded-xl overflow-hidden', className)}>
      {(title || headerRight) && (
        <div className="px-5 py-4 border-b border-tunnel-border flex items-center justify-between">
          <div>
            {title && <h3 className="text-base font-semibold text-tunnel-text">{title}</h3>}
            {subtitle && <p className="text-xs text-tunnel-text-dim mt-0.5">{subtitle}</p>}
          </div>
          {headerRight}
        </div>
      )}
      <div className={padding === 'none' ? '' : 'p-5'}>{children}</div>
      {footer && <div className="px-5 py-3 border-t border-tunnel-border bg-tunnel-bg/30">{footer}</div>}
    </div>
  );
}
