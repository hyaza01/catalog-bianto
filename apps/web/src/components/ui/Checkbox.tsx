import { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type CheckboxProps = InputHTMLAttributes<HTMLInputElement>;

export function Checkbox({ className, ...props }: CheckboxProps): React.JSX.Element {
  return (
    <input
      type="checkbox"
      className={cn(
        'h-4 w-4 rounded border-[var(--brand-300)] text-[var(--brand-600)] focus:ring-[var(--brand-500)]',
        className,
      )}
      {...props}
    />
  );
}

