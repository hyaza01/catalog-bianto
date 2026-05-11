import { forwardRef, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      className={cn(
        'min-h-28 w-full rounded-xl border border-[var(--brand-200)] bg-white px-3 py-2 text-sm text-[var(--neutral-900)] shadow-sm outline-none transition placeholder:text-[var(--neutral-500)] focus:border-[var(--brand-500)] focus:ring-2 focus:ring-[var(--brand-100)]',
        className,
      )}
      {...props}
    />
  );
});

