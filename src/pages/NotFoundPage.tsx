import { Link } from 'react-router-dom'

export const NotFoundPage = () => {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-4xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8">
      <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Erro 404</p>
      <h1 className="mt-2 font-display text-5xl text-navy">Pagina nao encontrada</h1>
      <p className="mt-3 max-w-xl text-sm text-slate-600">
        O conteudo que voce tentou acessar nao existe ou foi movido.
      </p>
      <Link
        to="/"
        aria-label="Voltar para home"
        className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-crimson px-5 text-sm font-semibold text-white transition hover:bg-sage focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson"
      >
        Voltar para Home
      </Link>
    </div>
  )
}
