import { ArrowLeft, Search } from 'lucide-react'
import { Link } from 'react-router-dom'

export const NotFoundPage = () => {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-4xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8">
      <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
        <Search size={28} aria-hidden="true" />
      </span>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">Erro 404</p>
      <h1 className="mt-2 font-display text-4xl text-brand-text sm:text-5xl">Página não encontrada</h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-brand-primary">
        O conteúdo que você tentou acessar não existe ou foi movido. Volte para a página inicial e continue navegando.
      </p>
      <Link
        to="/"
        aria-label="Voltar para home"
        className="mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-primary px-6 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-brand-primary2 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Voltar para Home
      </Link>
    </div>
  )
}
