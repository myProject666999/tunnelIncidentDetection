import { cn } from '@/utils';
import { SelectHTMLAttributes, forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="text-sm font-medium text-tunnel-text-dim">{label}</label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={cn(
              'w-full px-3 py-2.5 bg-tunnel-bg border border-tunnel-border rounded-lg',
              'text-tunnel-text text-sm appearance-none pr-10',
              'focus:outline-none focus:border-tunnel-info focus:ring-1 focus:ring-tunnel-info/50',
              'transition-all duration-200 cursor-pointer',
              error && 'border-tunnel-danger focus:border-tunnel-danger focus:ring-tunnel-danger/50',
              className
            )}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tunnel-text-dim pointer-events-none" />
        </div>
        {error && <p className="text-xs text-tunnel-danger">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
