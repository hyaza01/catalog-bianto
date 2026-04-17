import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../api/supabase'

interface SiteSettingsRow {
  id: unknown
  whatsapp_number: unknown
  contact_phone: unknown
  contact_email: unknown
  instagram_url: unknown
  facebook_url: unknown
  linkedin_url: unknown
  youtube_url: unknown
  website_url: unknown
  support_link: unknown
  content: unknown
}

export interface SiteSettings {
  whatsappNumber: string
  contactPhone: string
  contactEmail: string
  instagramUrl: string
  facebookUrl: string
  linkedinUrl: string
  youtubeUrl: string
  websiteUrl: string
  supportLink: string
  content: Record<string, string>
}

interface UseSiteSettingsResult {
  settings: SiteSettings
  isLoading: boolean
  error: string | null
  reload: () => Promise<void>
  saveSettings: (nextSettings: SiteSettings) => Promise<void>
}

const defaultSettings: SiteSettings = {
  whatsappNumber: '',
  contactPhone: '',
  contactEmail: '',
  instagramUrl: '',
  facebookUrl: '',
  linkedinUrl: '',
  youtubeUrl: '',
  websiteUrl: '',
  supportLink: '',
  content: {
    heroBadge: 'Catalogo Premium',
    heroTitle: 'Bianto Store',
    heroSubtitle: 'Personalizados que marcam momentos',
    heroDescription: 'Canecas personalizadas e kits especiais com design sofisticado para presentes corporativos e datas memoraveis.',
    benefitsTitle1: 'Kits assinatura',
    benefitsDesc1: 'Monte kits elegantes combinando garrafas, canecas e brindes extras com personalizacao completa.',
    benefitsTitle2: 'Personalizacao total',
    benefitsDesc2: 'Selecione cores, rotulos e caixas sob medida para comunicar perfeitamente a sua marca.',
    benefitsTitle3: 'Acabamento premium',
    benefitsDesc3: 'Produtos testados e finalizados com rigor para entregar um material que dure anos.',
    navTitle: 'Navegacao rapida',
    categoriesTitle: 'Categorias em destaque',
    productsTitle: 'Produtos em destaque',
    buttonCatalog: 'Ver catalogo completo',
  },
}

const siteSettingsLocalStorageKey = 'bianto-site-settings-local'

export const siteSettingsQueryKey = ['site-settings'] as const

const readString = (value: unknown): string => (typeof value === 'string' ? value : '')

const normalizeSiteSettings = (row: SiteSettingsRow | null): SiteSettings => {
  if (!row) {
    return defaultSettings
  }

  let parsedContent = defaultSettings.content
  if (row.content && typeof row.content === 'object') {
    parsedContent = { ...defaultSettings.content, ...(row.content as Record<string, string>) }
  } else if (typeof row.content === 'string') {
    try {
      const parsed = JSON.parse(row.content)
      if (parsed && typeof parsed === 'object') {
        parsedContent = { ...defaultSettings.content, ...parsed }
      }
    } catch {
      // ignore
    }
  }

  return {
    whatsappNumber: readString(row.whatsapp_number),
    contactPhone: readString(row.contact_phone),
    contactEmail: readString(row.contact_email),
    instagramUrl: readString(row.instagram_url),
    facebookUrl: readString(row.facebook_url),
    linkedinUrl: readString(row.linkedin_url),
    youtubeUrl: readString(row.youtube_url),
    websiteUrl: readString(row.website_url),
    supportLink: readString(row.support_link),
    content: parsedContent,
  }
}

type SiteSettingsDbError = {
  code?: string | null
  message?: string | null
  details?: string | null
}

type SiteSettingsRowPayload = SiteSettingsRow | Record<string, unknown>

const mapSiteSettingsError = (errorLike: SiteSettingsDbError | null | undefined): string => {
  const code = errorLike?.code ?? ''
  const message = errorLike?.message ?? 'Nao foi possivel carregar as configuracoes do site.'
  const details = errorLike?.details ?? ''
  const combined = `${message} ${details}`.toLowerCase()

  if (code === '42P01' || /relation|does not exist|site_settings/.test(combined)) {
    return 'Tabela site_settings nao encontrada. Rode o SQL em supabase/policies/site_settings_rls.sql para habilitar as configuracoes do site. Sem essa tabela, as alteracoes do Admin nao sincronizam entre dispositivos.'
  }

  if (code === '42501' || /row-level security|permission denied|policy/.test(combined)) {
    return 'Sem permissao para alterar configuracoes do site (RLS). Rode o SQL em supabase/policies/site_settings_rls.sql. Sem essa permissao, as alteracoes nao serao compartilhadas para outros dispositivos.'
  }

  return message
}

const isMissingSiteSettingsTable = (errorLike: SiteSettingsDbError | null | undefined): boolean => {
  const code = errorLike?.code ?? ''
  const message = errorLike?.message ?? ''
  const details = errorLike?.details ?? ''
  const combined = `${message} ${details}`.toLowerCase()

  return code === '42P01' || /relation|does not exist|site_settings|schema cache|could not find/.test(combined)
}

const readLocalSettings = (): SiteSettings => {
  if (typeof window === 'undefined') {
    return defaultSettings
  }

  try {
    const raw = window.localStorage.getItem(siteSettingsLocalStorageKey)

    if (!raw) {
      return defaultSettings
    }

    const parsed = JSON.parse(raw)

    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return defaultSettings
    }

    let parsedContent = defaultSettings.content
    const rawContent = (parsed as Record<string, unknown>).content
    if (rawContent && typeof rawContent === 'object') {
      parsedContent = { ...defaultSettings.content, ...(rawContent as Record<string, string>) }
    }

    return {
      whatsappNumber: readString((parsed as Record<string, unknown>).whatsappNumber),
      contactPhone: readString((parsed as Record<string, unknown>).contactPhone),
      contactEmail: readString((parsed as Record<string, unknown>).contactEmail),
      instagramUrl: readString((parsed as Record<string, unknown>).instagramUrl),
      facebookUrl: readString((parsed as Record<string, unknown>).facebookUrl),
      linkedinUrl: readString((parsed as Record<string, unknown>).linkedinUrl),
      youtubeUrl: readString((parsed as Record<string, unknown>).youtubeUrl),
      websiteUrl: readString((parsed as Record<string, unknown>).websiteUrl),
      supportLink: readString((parsed as Record<string, unknown>).supportLink),
      content: parsedContent,
    }
  } catch {
    return defaultSettings
  }
}

const writeLocalSettings = (settings: SiteSettings) => {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(siteSettingsLocalStorageKey, JSON.stringify(settings))
  } catch {
    // noop
  }
}

const hasAnySiteSettingValue = (settings: SiteSettings): boolean => {
  return Object.values(settings).some((value) => value.trim().length > 0)
}

const readSettingsInvalidationWebhookUrl = (): string =>
  readString(import.meta.env.VITE_CONFIG_INVALIDATION_WEBHOOK_URL).trim()

const triggerSettingsCacheInvalidationWebhook = async (): Promise<void> => {
  const webhookUrl = readSettingsInvalidationWebhookUrl()

  if (!webhookUrl) {
    return
  }

  try {
    const { data: authData } = await supabase.auth.getSession()

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, max-age=0, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    }

    if (authData.session?.access_token) {
      headers.Authorization = `Bearer ${authData.session.access_token}`
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        source: 'admin-site-settings',
        cacheTag: 'site-settings',
        paths: ['/', '/catalogo', '/sobre'],
        timestamp: new Date().toISOString(),
      }),
    })

    if (!response.ok) {
      console.warn(
        `Webhook de invalidacao de cache respondeu com status ${response.status}. Verifique a integracao de purge na infraestrutura.`,
      )
    }
  } catch {
    console.warn('Falha ao chamar webhook de invalidacao de cache. Verifique a infraestrutura CDN/SSR.')
  }
}

const fetchSiteSettingsRow = async (): Promise<{ row: SiteSettingsRow | null; error: SiteSettingsDbError | null }> => {
  const directResult = await supabase.from('site_settings').select('*').eq('id', 1).maybeSingle()

  if (!directResult.error) {
    return {
      row: (directResult.data as SiteSettingsRow | null) ?? null,
      error: null,
    }
  }

  const rpcResult = await supabase.rpc('get_site_settings')

  if (!rpcResult.error) {
    const rpcRow = Array.isArray(rpcResult.data)
      ? ((rpcResult.data[0] as SiteSettingsRowPayload | undefined) ?? null)
      : null

    return {
      row: (rpcRow as SiteSettingsRow | null) ?? null,
      error: null,
    }
  }

  return {
    row: null,
    error: directResult.error || rpcResult.error,
  }
}

const fetchSiteSettings = async (): Promise<SiteSettings> => {
  const { row, error: queryError } = await fetchSiteSettingsRow()

  if (queryError) {
    if (isMissingSiteSettingsTable(queryError)) {
      const localSettings = readLocalSettings()

      if (hasAnySiteSettingValue(localSettings)) {
        return localSettings
      }
    }

    throw new Error(mapSiteSettingsError(queryError))
  }

  const normalized = normalizeSiteSettings(row)
  writeLocalSettings(normalized)
  return normalized
}

const upsertSiteSettings = async (nextSettings: SiteSettings): Promise<SiteSettings> => {
  const payload = {
    id: 1,
    whatsapp_number: nextSettings.whatsappNumber,
    contact_phone: nextSettings.contactPhone,
    contact_email: nextSettings.contactEmail,
    instagram_url: nextSettings.instagramUrl,
    facebook_url: nextSettings.facebookUrl,
    linkedin_url: nextSettings.linkedinUrl,
    youtube_url: nextSettings.youtubeUrl,
    website_url: nextSettings.websiteUrl,
    support_link: nextSettings.supportLink,
    content: nextSettings.content,
    updated_at: new Date().toISOString(),
  }

  const { error: upsertError } = await supabase.from('site_settings').upsert(payload, { onConflict: 'id' })

  if (upsertError) {
    if (isMissingSiteSettingsTable(upsertError)) {
      writeLocalSettings(nextSettings)
    }

    throw new Error(mapSiteSettingsError(upsertError))
  }

  writeLocalSettings(nextSettings)
  await triggerSettingsCacheInvalidationWebhook()
  return nextSettings
}

export const useSiteSettings = (): UseSiteSettingsResult => {
  const queryClient = useQueryClient()

  const settingsQuery = useQuery({
    queryKey: siteSettingsQueryKey,
    queryFn: fetchSiteSettings,
    initialData: readLocalSettings,
    refetchInterval: 30_000,
    refetchIntervalInBackground: true,
  })

  const saveSettingsMutation = useMutation({
    mutationFn: upsertSiteSettings,
    onSuccess: (savedSettings) => {
      queryClient.setQueryData(siteSettingsQueryKey, savedSettings)
    },
  })

  useEffect(() => {
    const channelName = `site-settings-${Math.random().toString(36).slice(2)}`

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'site_settings',
        },
        () => {
          void queryClient.invalidateQueries({ queryKey: siteSettingsQueryKey })
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [queryClient])

  const reload = async () => {
    await settingsQuery.refetch({ cancelRefetch: false })
  }

  const saveSettings = async (nextSettings: SiteSettings): Promise<void> => {
    await saveSettingsMutation.mutateAsync(nextSettings)
  }

  const queryError = settingsQuery.error instanceof Error ? settingsQuery.error.message : null

  return {
    settings: settingsQuery.data ?? defaultSettings,
    isLoading: settingsQuery.isLoading || settingsQuery.isFetching,
    error: queryError,
    reload,
    saveSettings,
  }
}
