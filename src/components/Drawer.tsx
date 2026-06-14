import { cn } from '@/utils';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  width?: string;
  footer?: ReactNode;
}

export default function Drawer({
  open,
  onClose,
  title,
  children,
  width = 'w-96',
  footer,
}: DrawerProps) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}
      <div
        className={cn(
          'fixed top-0 right-0 h-full bg-tunnel-surface border-l border-tunnel-border z-50 shadow-2xl transition-transform duration-300',
          width,
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="h-14 flex items-center justify-between px-5 border-b border-tunnel-border">
          <h3 className="text-lg font-semibold text-tunnel-text">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-tunnel-border-light text-tunnel-text-dim hover:text-tunnel-text transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="h-[calc(100%-3.5rem-3.5rem)] overflow-y-auto p-5">
          {children}
        </div>
        {footer && (
          <div className="absolute bottom-0 left-0 right-0 h-14 px-5 border-t border-tunnel-border flex items-center justify-end gap-3 bg-tunnel-surface">
            {footer}
          </div>
        )}
      </div>
    </>
  );
}
