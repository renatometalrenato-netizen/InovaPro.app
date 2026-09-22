export type PublicEnv = {
  VITE_APP_URL?: string
  VITE_SUPABASE_URL?: string
  VITE_SUPABASE_PUBLISHABLE_KEY?: string
  VITE_META_APP_ID?: string
  VITE_META_WHATSAPP_CONFIG_ID?: string
}

export function getPublicConfig(env: PublicEnv) {
  const appUrl = env.VITE_APP_URL?.trim()
  const supabaseUrl = env.VITE_SUPABASE_URL?.trim()
  const supabasePublishableKey = env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()
  const metaAppId = env.VITE_META_APP_ID?.trim()
  const metaWhatsAppConfigId = env.VITE_META_WHATSAPP_CONFIG_ID?.trim()

  if (!appUrl || !supabaseUrl || !supabasePublishableKey) {
    throw new Error('Configuração pública do aplicativo incompleta.')
  }

  return { appUrl, supabaseUrl, supabasePublishableKey, metaAppId, metaWhatsAppConfigId }
}

export const publicConfig = getPublicConfig({
  VITE_APP_URL: import.meta.env.VITE_APP_URL,
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  VITE_META_APP_ID: import.meta.env.VITE_META_APP_ID,
  VITE_META_WHATSAPP_CONFIG_ID: import.meta.env.VITE_META_WHATSAPP_CONFIG_ID,
})
