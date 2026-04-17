import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const hasSupabaseEnv = Boolean(supabaseUrl && supabaseAnonKey)
export const isSupabaseConfigured = hasSupabaseEnv

const fallbackSupabaseUrl = 'https://placeholder.supabase.co'
const fallbackSupabaseAnonKey = 'public-anon-key-placeholder'

const fetchWithoutCache: typeof fetch = async (input, init = {}) => {
  const headers = new Headers(init.headers ?? {})
  headers.set('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate')
  headers.set('Pragma', 'no-cache')
  headers.set('Expires', '0')

  return fetch(input, {
    ...init,
    cache: 'no-store',
    headers,
  })
}

if (!hasSupabaseEnv) {
  console.warn(
    'Variaveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY ausentes no build atual. A aplicacao carregara com cliente Supabase placeholder.',
  )
}

export const supabase = createClient(supabaseUrl || fallbackSupabaseUrl, supabaseAnonKey || fallbackSupabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    fetch: fetchWithoutCache,
    headers: {
      'X-Client-Info': 'bianto-store-web',
    },
  },
})
