import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-[var(--brand-100)] bg-white p-5 shadow-[0_10px_40px_rgba(15,23,42,0.08)]',
        className,
      )}
      {...props}
    />
  );
}

