import Link from 'next/link';
import siteConfig from '@/config/site';

export function Footer(): React.JSX.Element {
  return (
    <footer className="mt-20 border-t border-[var(--brand-100)] bg-[var(--brand-50)]">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div>
          <h3 className="text-base font-semibold text-[var(--neutral-900)]">{siteConfig.name}</h3>
          <p className="mt-2 text-sm text-[var(--neutral-600)]">{siteConfig.description}</p>
        </div>

        <div>
          <h3 className="text-base font-semibold text-[var(--neutral-900)]">Navegacao</h3>
          <ul className="mt-2 space-y-2 text-sm text-[var(--neutral-700)]">
            <li>
              <Link href="/catalogo" className="hover:text-[var(--brand-700)]">
                Catalogo
              </Link>
            </li>
            <li>
              <Link href="/contato" className="hover:text-[var(--brand-700)]">
                Contato
              </Link>
            </li>
            <li>
              <Link href="/admin/login" className="hover:text-[var(--brand-700)]">
                Admin
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-base font-semibold text-[var(--neutral-900)]">Atendimento</h3>
          <ul className="mt-2 space-y-2 text-sm text-[var(--neutral-700)]">
            <li>{siteConfig.contactEmail}</li>
            <li>
              <Link href={siteConfig.instagram} target="_blank" rel="noopener noreferrer">
                Instagram
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[var(--brand-100)] px-4 py-4 text-center text-xs text-[var(--neutral-500)]">
        {new Date().getFullYear()} {siteConfig.name}. Todos os direitos reservados.
      </div>
    </footer>
  );
}

