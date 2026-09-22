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
    })
  })
  it('rejeita configuração incompleta', () => {
    expect(() => getPublicConfig({})).toThrow('Configuração pública')
  })
})
