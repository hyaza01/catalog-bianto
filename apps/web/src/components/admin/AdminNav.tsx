'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { adminFetch } from '@/lib/admin-client';

type NavItem = {
  href: string;
  label: string;
};

const navItems: NavItem[] = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/produtos', label: 'Produtos' },
  { href: '/admin/categorias', label: 'Categorias' },
  { href: '/admin/leads', label: 'Leads' },
  { href: '/admin/configuracoes', label: 'Configuracoes' },
];

export function AdminNav(): React.JSX.Element {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/admin/login') {
    return <></>;
  }

  const handleLogout = async (): Promise<void> => {
    try {
      await adminFetch<{ success: boolean }>('/auth/logout', {
        method: 'POST',
      });
    } finally {
      router.push('/admin/login');
      router.refresh();
    }
  };

  return (
    <aside className="rounded-2xl border border-[var(--brand-100)] bg-white p-4">
      <h2 className="mb-3 text-lg font-semibold text-[var(--neutral-900)]">Admin Bianto</h2>
      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block rounded-xl px-3 py-2 text-sm font-medium transition ${
              pathname.startsWith(item.href)
                ? 'bg-[var(--brand-100)] text-[var(--brand-700)]'
                : 'text-[var(--neutral-700)] hover:bg-[var(--brand-50)]'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <button
        type="button"
        onClick={handleLogout}
        className="mt-4 w-full rounded-xl border border-[var(--brand-200)] px-3 py-2 text-sm font-semibold text-[var(--brand-700)] transition hover:bg-[var(--brand-50)]"
      >
        Sair
      </button>
    </aside>
  );
}

