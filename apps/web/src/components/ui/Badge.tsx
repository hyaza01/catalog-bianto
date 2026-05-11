import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type BadgeProps = {
  children: ReactNode;
  className?: string;
};

export function Badge({ children, className }: BadgeProps): React.JSX.Element {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full bg-[var(--brand-100)] px-3 py-1 text-xs font-medium text-[var(--brand-700)]',
        className,
      )}
    >
      {children}
    </span>
  );
}

