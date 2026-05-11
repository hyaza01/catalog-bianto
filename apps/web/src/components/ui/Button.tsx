import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  fullWidth?: boolean;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--brand-600)] text-white hover:bg-[var(--brand-700)] focus-visible:ring-[var(--brand-500)]',
  secondary:
    'bg-white text-[var(--brand-700)] border border-[var(--brand-200)] hover:bg-[var(--brand-50)] focus-visible:ring-[var(--brand-400)]',
  ghost:
    'bg-transparent text-[var(--brand-700)] hover:bg-[var(--brand-50)] focus-visible:ring-[var(--brand-300)]',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', fullWidth = false, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    />
  );
});

