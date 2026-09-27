import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, Loader2, MessageCircle, RefreshCw, ShieldCheck } from 'lucide-react'
import { supabase } from './supabase'

type MetaStatus = {
  connected: boolean
  phone?: string | null
  verified_name?: string | null
  status?: string | null
  connected_at?: string | null
}

type MetaConfig = {
  configured: boolean
  app_id?: string | null
  config_id?: string | null
  graph_version?: string | null
  missing?: string[]
}

type EmbeddedSession = {
  waba_id?: string
  phone_number_id?: string
}

type EmbeddedSignupMessage = {
  type?: string
  event?: string
  data?: {
    waba_id?: string | number
    phone_number_id?: string | number
  }
}

type FacebookLoginResponse = {
  authResponse?: {
    code?: string
  }
  status?: string
}

type FacebookSdk = {
  init: (options: {
    appId: string
    cookie?: boolean
    xfbml?: boolean
    version: string
  }) => void
  login: (
    callback: (response: FacebookLoginResponse) => void,
    options: Record<string, unknown>,
  ) => void
}

declare global {
  interface Window {
    FB?: FacebookSdk
    fbAsyncInit?: () => void
  }
}

async function invokeOnboarding(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('nova-whatsapp-onboarding', { body })
  if (error) throw error
  if (data?.error) throw new Error(String(data.error))
  return data
}

async function loadFacebookSdk() {
  if (window.FB) return window.FB

  await new Promise<void>((resolve, reject) => {
    const existing = document.getElementById('facebook-jssdk') as HTMLScriptElement | null
    if (existing) {
      const timer = window.setInterval(() => {
        if (window.FB) {
          window.clearInterval(timer)
          resolve()
        }
      }, 100)
      window.setTimeout(() => {
        window.clearInterval(timer)
        if (!window.FB) reject(new Error('Não foi possível carregar a conexão da Meta.'))
      }, 10000)
      return
    }

    const script = document.createElement('script')
    script.id = 'facebook-jssdk'
    script.async = true
    script.defer = true
    script.crossOrigin = 'anonymous'
    script.src = 'https://connect.facebook.net/pt_BR/sdk.js'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Não foi possível carregar a conexão da Meta.'))
    document.body.appendChild(script)
  })

  if (!window.FB) throw new Error('SDK da Meta indisponível.')
  return window.FB
}

export function WhatsAppConnection({ onBack }: { onBack: () => void }) {
  const [status, setStatus] = useState<MetaStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const sessionInfo = useRef<EmbeddedSession>({})

  async function refreshStatus() {
    setLoading(true)
    setError('')
    try {
      const data = await invokeOnboarding({ action: 'status' })
      setStatus({
        connected: Boolean(data?.connected),
        phone: data?.phone ?? null,
        verified_name: data?.verified_name ?? null,
        status: data?.status ?? null,
        connected_at: data?.connected_at ?? null,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível consultar a conexão.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true

    void (async () => {
      try {
        const data = await invokeOnboarding({ action: 'status' })
        if (!mounted) return
        setStatus({
          connected: Boolean(data?.connected),
          phone: data?.phone ?? null,
          verified_name: data?.verified_name ?? null,
          status: data?.status ?? null,
          connected_at: data?.connected_at ?? null,
        })
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Não foi possível consultar a conexão.')
        }
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    const receiveMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://www.facebook.com' && event.origin !== 'https://web.facebook.com') {
        return
      }

      let parsed: unknown = event.data
      if (typeof parsed === 'string') {
        try {
          parsed = JSON.parse(parsed)
        } catch {
          return
        }
      }

      if (!parsed || typeof parsed !== 'object') return
      const data = parsed as EmbeddedSignupMessage
      if (data.type !== 'WA_EMBEDDED_SIGNUP') return
      if (data.event === 'FINISH' && data.data) {
        sessionInfo.current = {
          waba_id: data.data.waba_id ? String(data.data.waba_id) : undefined,
          phone_number_id: data.data.phone_number_id ? String(data.data.phone_number_id) : undefined,
        }
      }
    }

    window.addEventListener('message', receiveMessage)
    return () => {
      mounted = false
      window.removeEventListener('message', receiveMessage)
    }
  }, [])

  async function connect() {
    setConnecting(true)
    setError('')
    setSuccess('')
    sessionInfo.current = {}

    try {
      const config = (await invokeOnboarding({ action: 'config' })) as MetaConfig
      if (!config.configured || !config.app_id || !config.config_id) {
        const missing = Array.isArray(config.missing) ? config.missing.join(', ') : 'configuração da Meta'
        throw new Error('Integração ainda não configurada no servidor: ' + missing)
      }

      const FB = await loadFacebookSdk()
      FB.init({
        appId: config.app_id,
        cookie: true,
        xfbml: false,
        version: config.graph_version || 'v25.0',
      })

      const response = await new Promise<FacebookLoginResponse>((resolve) => {
        FB.login(resolve, {
          config_id: config.config_id,
          response_type: 'code',
          override_default_response_type: true,
          extras: {
            setup: {},
            featureType: 'whatsapp_business_app_onboarding',
            sessionInfoVersion: '3',
          },
        })
      })

      const code = response.authResponse?.code
      if (!code) {
        if (response.status === 'unknown') throw new Error('A conexão foi cancelada antes de terminar.')
        throw new Error('A Meta não retornou o código de autorização.')
      }

      const connected = await invokeOnboarding({
        action: 'connect',
        code,
        sessionInfo: sessionInfo.current,
      })

      setStatus({
        connected: true,
        phone: connected?.phone ?? null,
        verified_name: connected?.verified_name ?? null,
        status: connected?.status ?? null,
        connected_at: new Date().toISOString(),
      })
      setSuccess('WhatsApp Business conectado. Agora podemos validar uma mensagem real com a Nova AI.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível conectar o WhatsApp Business.')
    } finally {
      setConnecting(false)
    }
  }

  return (
    <section className="integrationPage">
      <button className="link" onClick={onBack}>← Voltar ao painel</button>

      <div className="integrationHero">
        <span className="tag"><MessageCircle aria-hidden="true" /> WHATSAPP BUSINESS</span>
        <h1>Conectar o atendimento à Nova AI.</h1>
        <p>
          Esta conexão usa a autorização oficial da Meta. O objetivo do primeiro teste é receber uma
          mensagem real, reconhecer o contato e registrar a conversa sem criar duplicidade.
        </p>
      </div>

      <article className="integrationCard">
        {loading ? (
          <div className="adminLoading"><Loader2 className="spin" aria-hidden="true" /> Verificando conexão...</div>
        ) : status?.connected ? (
          <>
            <div className="integrationStatus connected">
              <CheckCircle2 aria-hidden="true" />
              <div>
                <strong>WhatsApp conectado</strong>
                <span>{status.verified_name || 'InovaPro Systems'}{status.phone ? ' · ' + status.phone : ''}</span>
              </div>
            </div>
            <p>
              O número já está registrado no backend da InovaPro. O próximo teste será enviar uma
              mensagem para esse WhatsApp e conferir o fluxo até a Nova AI.
            </p>
            <button className="secondary" onClick={() => void refreshStatus()}>
              <RefreshCw aria-hidden="true" /> Atualizar status
            </button>
          </>
        ) : (
          <>
            <div className="integrationStatus">
              <ShieldCheck aria-hidden="true" />
              <div>
                <strong>Aguardando autorização</strong>
                <span>Nenhum WhatsApp Business está vinculado a esta conta.</span>
              </div>
            </div>
            <p>
              Ao continuar, a Meta abrirá a tela oficial de autorização. Nenhuma senha do WhatsApp é
              armazenada no aplicativo.
            </p>
            <button className="primary" disabled={connecting} onClick={() => void connect()}>
              {connecting ? <Loader2 className="spin" aria-hidden="true" /> : <MessageCircle aria-hidden="true" />}
              {connecting ? 'Abrindo Meta...' : 'Conectar WhatsApp Business'}
            </button>
          </>
        )}

        {success && <p className="authSuccess" role="status">{success}</p>}
        {error && <p className="authError" role="alert">{error}</p>}
      </article>
    </section>
  )
}
