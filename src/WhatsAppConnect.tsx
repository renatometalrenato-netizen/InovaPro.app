import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, Loader2, MessageCircle, ShieldCheck } from 'lucide-react'
import { publicConfig } from './config'
import { supabase } from './supabase'

type FacebookLoginResponse = {
  authResponse?: {
    code?: string
  }
  status?: string
}

type FacebookSdk = {
  init: (options: Record<string, unknown>) => void
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

type ConnectState = 'idle' | 'loading-sdk' | 'ready' | 'connecting' | 'connected' | 'error'

export function WhatsAppConnect() {
  const [state, setState] = useState<ConnectState>('idle')
  const [message, setMessage] = useState('')
  const sessionInfoRef = useRef<Record<string, unknown>>({})
  const pendingCodeRef = useRef<string | null>(null)
  const completingRef = useRef(false)

  const appId = publicConfig.metaAppId
  const configId = publicConfig.metaWhatsAppConfigId
  const configured = Boolean(appId && configId)

  useEffect(() => {
    if (!configured || !appId) return

    let mounted = true
    const markReady = () => {
      if (mounted) {
        setState('ready')
        setMessage('')
      }
    }

    if (window.FB) {
      window.FB.init({
        appId,
        cookie: true,
        xfbml: false,
        version: 'v25.0',
      })
      markReady()
    } else {
      setState('loading-sdk')
      window.fbAsyncInit = () => {
        window.FB?.init({
          appId,
          cookie: true,
          xfbml: false,
          version: 'v25.0',
        })
        markReady()
      }

      const existing = document.getElementById('facebook-jssdk')
      if (!existing) {
        const script = document.createElement('script')
        script.id = 'facebook-jssdk'
        script.async = true
        script.defer = true
        script.crossOrigin = 'anonymous'
        script.src = 'https://connect.facebook.net/pt_BR/sdk.js'
        script.onerror = () => {
          if (mounted) {
            setState('error')
            setMessage('Não foi possível carregar a conexão segura da Meta.')
          }
        }
        document.body.appendChild(script)
      }
    }

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://www.facebook.com' && event.origin !== 'https://web.facebook.com') {
        return
      }

      let data = event.data
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data)
        } catch {
          return
        }
      }

      if (data?.type !== 'WA_EMBEDDED_SIGNUP') return

      const eventName = String(data?.event || '')
      const info =
        data?.data && typeof data.data === 'object'
          ? (data.data as Record<string, unknown>)
          : {}

      if (
        eventName === 'FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING' ||
        eventName === 'FINISH'
      ) {
        sessionInfoRef.current = info
        if (pendingCodeRef.current) {
          void completeConnection(pendingCodeRef.current)
        }
      } else if (eventName === 'CANCEL') {
        setState('ready')
        setMessage('Conexão cancelada. Seu WhatsApp Business continua funcionando normalmente.')
      } else if (eventName === 'ERROR') {
        setState('error')
        setMessage('A Meta informou um erro no onboarding. Tente novamente.')
      }
    }

    window.addEventListener('message', onMessage)

    return () => {
      mounted = false
      window.removeEventListener('message', onMessage)
    }
  }, [appId, configured])

  async function completeConnection(code: string) {
    if (completingRef.current) return
    completingRef.current = true
    setState('connecting')
    setMessage('Finalizando a conexão segura com a Meta...')

    try {
      const { data, error } = await supabase.functions.invoke('nova-whatsapp-onboarding', {
        body: {
          code,
          sessionInfo: sessionInfoRef.current,
        },
      })
      if (error) throw error
      if (!data?.ok) throw new Error(data?.error || 'A Meta não concluiu a conexão.')

      setState('connected')
      const phone = data?.phone ? ` (${data.phone})` : ''
      setMessage(`WhatsApp Business conectado à Nova AI${phone}.`)
    } catch (error) {
      setState('error')
      setMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível concluir a conexão com o WhatsApp.',
      )
    } finally {
      completingRef.current = false
      pendingCodeRef.current = null
    }
  }

  function connect() {
    if (!configured || !appId || !configId) {
      setState('error')
      setMessage('A configuração do Meta Embedded Signup ainda não foi informada.')
      return
    }

    if (!window.FB) {
      setState('loading-sdk')
      setMessage('Carregando a conexão da Meta. Tente novamente em alguns segundos.')
      return
    }

    setState('connecting')
    setMessage('Abrindo o onboarding oficial da Meta...')

    window.FB.login(
      (response) => {
        const code = response?.authResponse?.code
        if (!code) {
          setState('ready')
          setMessage('A conexão não foi autorizada. Nenhuma alteração foi feita no WhatsApp.')
          return
        }

        pendingCodeRef.current = code

        // O evento de sessão da Meta costuma chegar junto do callback. Se ele demorar,
        // o backend também consegue descobrir a WABA a partir do token trocado.
        window.setTimeout(() => {
          if (pendingCodeRef.current === code) {
            void completeConnection(code)
          }
        }, 700)
      },
      {
        config_id: configId,
        response_type: 'code',
        override_default_response_type: true,
        extras: {
          setup: {},
          featureType: 'whatsapp_business_app_onboarding',
        },
      },
    )
  }

  const busy = state === 'loading-sdk' || state === 'connecting'

  return (
    <section className="whatsappConnect" aria-labelledby="whatsapp-connect-title">
      <div className="whatsappConnectIcon">
        <MessageCircle aria-hidden="true" />
      </div>
      <div className="whatsappConnectBody">
        <span className="tag">WHATSAPP BUSINESS + NOVA AI</span>
        <h2 id="whatsapp-connect-title">Conecte sem perder o WhatsApp do celular.</h2>
        <p>
          A coexistência mantém o WhatsApp Business funcionando no aplicativo e conecta o mesmo
          número à Nova AI para automação, histórico, qualificação e handoff humano.
        </p>

        {!configured && (
          <p className="whatsappConnectNotice">
            Integração técnica preparada. Falta informar o App ID e o Configuration ID do Embedded
            Signup da Meta.
          </p>
        )}

        {message && (
          <p
            className={state === 'error' ? 'whatsappConnectError' : 'whatsappConnectStatus'}
            role={state === 'error' ? 'alert' : 'status'}
          >
            {state === 'connected' && <CheckCircle2 aria-hidden="true" />}
            {busy && <Loader2 className="spin" aria-hidden="true" />}
            {message}
          </p>
        )}

        <div className="whatsappConnectActions">
          <button className="primary" onClick={connect} disabled={busy || state === 'connected'}>
            {state === 'connected' ? 'WhatsApp conectado' : 'Conectar WhatsApp Business'}
          </button>
          <span>
            <ShieldCheck aria-hidden="true" />
            Fluxo oficial da Meta. Não desconecta o aplicativo.
          </span>
        </div>
      </div>
    </section>
  )
}
