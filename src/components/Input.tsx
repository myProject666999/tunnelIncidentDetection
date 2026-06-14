import { cn } from '@/utils';
import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="text-sm font-medium text-tunnel-text-dim">{label}</label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-3 py-2.5 bg-tunnel-bg border border-tunnel-border rounded-lg',
            'text-tunnel-text placeholder-tunnel-text-muted text-sm',
            'focus:outline-none focus:border-tunnel-info focus:ring-1 focus:ring-tunnel-info/50',
            'transition-all duration-200',
            error && 'border-tunnel-danger focus:border-tunnel-danger focus:ring-tunnel-danger/50',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-tunnel-danger">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
