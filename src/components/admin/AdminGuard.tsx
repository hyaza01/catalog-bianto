import type { PropsWithChildren } from 'react'
import { Navigate } from 'react-router-dom'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import { Button } from '../ui/Button'

export const AdminGuard = ({ children }: PropsWithChildren) => {
  const { user, isLoading, isAdmin, configuredAdminEmails, signOut } = useAdminAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper px-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <p className="font-medium text-navy">Validando acesso administrativo...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper px-4">
        <div className="w-full max-w-md space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="font-display text-3xl text-navy">Acesso negado</h1>
          <p className="text-sm text-slate-600">
            O usuário autenticado não possui permissão para acessar a área admin.
          </p>
          {configuredAdminEmails.length > 0 && (
            <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
              Emails admin esperados: {configuredAdminEmails.join(', ')}
            </p>
          )}
          <Button onClick={() => void signOut()} fullWidth aria-label="Sair da sessão atual">
            Sair desta conta
          </Button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
