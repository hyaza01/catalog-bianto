import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { AdminNav } from '@/components/admin/AdminNav';
import { QueryProvider } from '@/providers/query-provider';

export const metadata: Metadata = {
  title: 'Admin | Bianto Store',
  robots: {
    index: false,
    follow: false,
  },
};

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps): React.JSX.Element {
  return (
    <QueryProvider>
      <main className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="hidden w-72 lg:block">
          <AdminNav />
        </div>
        <div className="min-w-0 flex-1">{children}</div>
      </main>
    </QueryProvider>
  );
}

