import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../api/supabase'
import { useAdminAuth } from '../hooks/useAdminAuth'
import { Button } from '../components/ui/Button'

const mapAuthErrorMessage = (rawMessage: string): string => {
  const normalized = rawMessage.trim().toLowerCase()

  if (normalized === 'failed to fetch' || normalized.includes('network') || normalized.includes('fetch')) {
    return 'Falha de conexão com o servidor de autenticação. Verifique internet e configuração do Supabase no deploy.'
  }

  return rawMessage
}

export const AdminLoginPage = () => {
  const navigate = useNavigate()
  const { user, isAdmin, isLoading, configuredAdminEmails, configuredAdminEmail, signOut } = useAdminAuth()

  const [email, setEmail] = useState(configuredAdminEmail ?? '')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isLoading && user && isAdmin) {
      navigate('/admin', { replace: true })
    }
  }, [isAdmin, isLoading, navigate, user])

  const handlePasswordLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setIsSubmitting(true)
    setError(null)
    setMessage(null)

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (loginError) {
      setError(mapAuthErrorMessage(loginError.message))
      setIsSubmitting(false)
      return
    }

    setMessage('Login realizado com sucesso. Redirecionando para o painel...')
    setIsSubmitting(false)
  }

  const handleMagicLinkLogin = async () => {
    if (!email.trim()) {
      setError('Informe um email para receber o link mágico.')
      setMessage(null)
      return
    }

    setIsSubmitting(true)
    setError(null)
    setMessage(null)

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/admin`,
      },
    })

    if (otpError) {
      setError(mapAuthErrorMessage(otpError.message))
      setIsSubmitting(false)
      return
    }

    setMessage('Link mágico enviado. Abra o email e conclua o acesso.')
    setIsSubmitting(false)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper px-4">
        <p className="text-sm text-slate-600">Carregando autenticação...</p>
      </div>
    )
  }

  if (user && !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper px-4">
        <div className="w-full max-w-md space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="font-display text-3xl text-navy">Sem permissão</h1>
          <p className="text-sm text-slate-600">Esta conta não possui acesso ao painel administrativo.</p>
          <Button onClick={() => void signOut()} fullWidth aria-label="Sair da conta atual">
            Sair da conta atual
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-paper px-4 py-10">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Área restrita</p>
          <h1 className="font-display text-4xl text-navy">Login Admin</h1>
          <p className="text-sm text-slate-600">Entre para acessar o painel de cadastro de produtos.</p>
          {configuredAdminEmails.length > 0 && (
            <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
              Emails admin esperados: {configuredAdminEmails.join(', ')}
            </p>
          )}
        </div>

        <form className="space-y-4" onSubmit={handlePasswordLogin}>
          <label className="grid gap-1 text-sm font-medium text-slate-700" htmlFor="admin-email">
            Email
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              aria-label="Email de acesso administrativo"
              className="h-11 rounded-xl border border-slate-200 px-3 text-sm text-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson"
            />
          </label>

          <label className="grid gap-1 text-sm font-medium text-slate-700" htmlFor="admin-password">
            Senha
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-label="Senha de acesso administrativo"
              className="h-11 rounded-xl border border-slate-200 px-3 text-sm text-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson"
            />
          </label>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          {message && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}

          <Button
            type="submit"
            fullWidth
            disabled={isSubmitting}
            aria-label="Entrar no painel com email e senha"
          >
            {isSubmitting ? 'Entrando...' : 'Entrar com senha'}
          </Button>

          <Button
            type="button"
            variant="outline"
            fullWidth
            disabled={isSubmitting}
            onClick={() => void handleMagicLinkLogin()}
            aria-label="Enviar link mágico de acesso"
          >
            Receber link mágico
          </Button>
        </form>

        <div className="mt-5 border-t border-slate-200 pt-4 text-sm text-slate-600">
          <Link
            to="/"
            className="font-medium text-crimson hover:text-sage focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson"
          >
            Voltar para o site
          </Link>
        </div>
      </div>
    </div>
  )
}
