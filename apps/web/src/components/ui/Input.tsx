import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        'h-11 w-full rounded-xl border border-[var(--brand-200)] bg-white px-3 text-sm text-[var(--neutral-900)] shadow-sm outline-none transition placeholder:text-[var(--neutral-500)] focus:border-[var(--brand-500)] focus:ring-2 focus:ring-[var(--brand-100)]',
        className,
      )}
      {...props}
    />
  );
});

