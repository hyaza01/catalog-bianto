import Link from 'next/link';

export function Header(): React.JSX.Element {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--brand-100)] bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-semibold tracking-tight text-[var(--neutral-950)]">
          Bianto Store
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-[var(--neutral-700)] md:flex">
          <Link href="/catalogo" className="hover:text-[var(--brand-700)]">
            Catalogo
          </Link>
          <Link href="/contato" className="hover:text-[var(--brand-700)]">
            Contato
          </Link>
          <Link href="/admin/login" className="hover:text-[var(--brand-700)]">
            Admin
          </Link>
        </nav>
        <div className="hidden md:block">
          <Link
            href="/catalogo"
            className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--brand-600)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--brand-700)]"
          >
            Ver produtos
          </Link>
        </div>
      </div>
    </header>
  );
}

