import Link from 'next/link';
import env from '@/config/env';

type WhatsAppButtonProps = {
  text: string;
  className?: string;
};

export function WhatsAppButton({ text, className }: WhatsAppButtonProps): React.JSX.Element {
  const href = `https://wa.me/${env.whatsappNumber}?text=${encodeURIComponent(text)}`;

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={
        className ??
        'inline-flex h-11 items-center justify-center rounded-full bg-emerald-600 px-5 text-sm font-semibold text-white transition hover:bg-emerald-700'
      }
    >
      WhatsApp
    </Link>
  );
}

