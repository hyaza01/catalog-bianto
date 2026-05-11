import Link from 'next/link';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  buildHref: (page: number) => string;
};

export function Pagination({
  currentPage,
  totalPages,
  buildHref,
}: PaginationProps): React.JSX.Element | null {
  if (totalPages <= 1) {
    return null;
  }

  const prevPage = Math.max(1, currentPage - 1);
  const nextPage = Math.min(totalPages, currentPage + 1);

  return (
    <nav aria-label="Paginacao" className="mt-8 flex items-center justify-center gap-3">
      <Link
        href={buildHref(prevPage)}
        aria-disabled={currentPage === 1}
        className="rounded-full border border-[var(--brand-200)] bg-white px-4 py-2 text-sm text-[var(--brand-700)] aria-disabled:pointer-events-none aria-disabled:opacity-50"
      >
        Anterior
      </Link>
      <span className="text-sm text-[var(--neutral-700)]">
        Pagina {currentPage} de {totalPages}
      </span>
      <Link
        href={buildHref(nextPage)}
        aria-disabled={currentPage === totalPages}
        className="rounded-full border border-[var(--brand-200)] bg-white px-4 py-2 text-sm text-[var(--brand-700)] aria-disabled:pointer-events-none aria-disabled:opacity-50"
      >
        Proxima
      </Link>
    </nav>
  );
}

