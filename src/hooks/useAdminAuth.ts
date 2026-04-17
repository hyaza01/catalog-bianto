import type { Session, User } from '@supabase/supabase-js'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../api/supabase'

interface UseAdminAuthResult {
  session: Session | null
  user: User | null
  isLoading: boolean
  isAdmin: boolean
  configuredAdminEmails: string[]
  configuredAdminEmail: string | null
  signOut: () => Promise<void>
}

const normalizeEmail = (value: string | null | undefined): string => (value ?? '').trim().toLowerCase()

const parseEmailList = (rawValue: string | null | undefined): string[] => {
  const raw = (rawValue ?? '').trim()

  if (!raw) {
    return []
  }

  return raw
    .split(/[\s,;]+/)
    .map((email) => normalizeEmail(email))
    .filter((email, index, all) => email.length > 0 && all.indexOf(email) === index)
}

const getConfiguredAdminEmails = (): string[] => {
  const fromList = parseEmailList(import.meta.env.VITE_ADMIN_EMAILS)
  const fromLegacy = parseEmailList(import.meta.env.VITE_ADMIN_EMAIL)

  return [...fromList, ...fromLegacy].filter((email, index, all) => all.indexOf(email) === index)
}

const readRoleFromMetadata = (value: unknown): string | null => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return null
  }

  const directRole = (value as Record<string, unknown>).role

  if (typeof directRole === 'string' && directRole.trim().length > 0) {
    return directRole.trim().toLowerCase()
  }

  const claims = (value as Record<string, unknown>).claims

  if (typeof claims !== 'object' || claims === null || Array.isArray(claims)) {
    return null
  }

  const roleInClaims = (claims as Record<string, unknown>).role

  if (typeof roleInClaims === 'string' && roleInClaims.trim().length > 0) {
    return roleInClaims.trim().toLowerCase()
  }

  return null
}

const readIsAdminFromMetadata = (value: unknown): boolean => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false
  }

  const metadata = value as Record<string, unknown>

  if (metadata.is_admin === true || metadata.isAdmin === true) {
    return true
  }

  const claims = metadata.claims

  if (typeof claims !== 'object' || claims === null || Array.isArray(claims)) {
    return false
  }

  return (claims as Record<string, unknown>).is_admin === true || (claims as Record<string, unknown>).isAdmin === true
}

const hasAdminClaim = (user: User): boolean => {
  const appRole = readRoleFromMetadata(user.app_metadata)
  const userRole = readRoleFromMetadata(user.user_metadata)

  if (appRole === 'admin' || appRole === 'super_admin' || appRole === 'owner') {
    return true
  }

  if (userRole === 'admin' || userRole === 'super_admin' || userRole === 'owner') {
    return true
  }

  return readIsAdminFromMetadata(user.app_metadata) || readIsAdminFromMetadata(user.user_metadata)
}

export const useAdminAuth = (): UseAdminAuthResult => {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const configuredAdminEmails = getConfiguredAdminEmails()
  const configuredAdminEmail = configuredAdminEmails[0] ?? null

  useEffect(() => {
    let isMounted = true

    const bootSession = async () => {
      const { data } = await supabase.auth.getSession()

      if (!isMounted) {
        return
      }

      setSession(data.session)
      setUser(data.session?.user ?? null)
      setIsLoading(false)
    }

    void bootSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) {
        return
      }

      setSession(nextSession)
      setUser(nextSession?.user ?? null)
      setIsLoading(false)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const isAdmin = useMemo(() => {
    if (!user) {
      return false
    }

    if (hasAdminClaim(user)) {
      return true
    }

    if (configuredAdminEmails.length === 0) {
      return true
    }

    return configuredAdminEmails.includes(normalizeEmail(user.email))
  }, [configuredAdminEmails, user])

  const signOut = async (): Promise<void> => {
    await supabase.auth.signOut()
  }

  return {
    session,
    user,
    isLoading,
    isAdmin,
    configuredAdminEmails,
    configuredAdminEmail,
    signOut,
  }
}
