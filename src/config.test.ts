import { describe, expect, it } from 'vitest'
import { getPublicConfig } from './config'

describe('getPublicConfig', () => {
  it('aceita somente a configuração pública completa', () => {
    expect(
      getPublicConfig({
        VITE_APP_URL: 'http://localhost:5173/',
        VITE_SUPABASE_URL: 'https://example.supabase.co',
        VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test',
      }),
    ).toEqual({
      appUrl: 'http://localhost:5173/',
      supabaseUrl: 'https://example.supabase.co',
      supabasePublishableKey: 'sb_publishable_test',
      metaAppId: undefined,
      metaWhatsAppConfigId: undefined,
    })
  })
  it('expõe configuração pública da Meta quando informada', () => {
    expect(
      getPublicConfig({
        VITE_APP_URL: 'http://localhost:5173/',
        VITE_SUPABASE_URL: 'https://example.supabase.co',
        VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test',
        VITE_META_APP_ID: '123',
        VITE_META_WHATSAPP_CONFIG_ID: '456',
      }),
    ).toMatchObject({
      metaAppId: '123',
      metaWhatsAppConfigId: '456',
    })
  })
  it('rejeita configuração incompleta', () => {
    expect(() => getPublicConfig({})).toThrow('Configuração pública')
  })
})
