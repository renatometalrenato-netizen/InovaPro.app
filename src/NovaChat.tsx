import { FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, Loader2, RefreshCw, Send, Sparkles, UserRound } from 'lucide-react'
import { supabase } from './supabase'

type ChatMessage = {
  id?: string
  role: 'user' | 'assistant'
  body: string
  created_at?: string
}

export function NovaChat({
  businessName,
  onBack,
}: {
  businessName?: string
  onBack: () => void
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const loadHistory = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true)
    setError('')
    const { data, error } = await supabase.functions.invoke('nova-ai-web-chat', {
      body: { action: 'history' },
    })

    if (showLoading) setLoading(false)
    if (error) {
      setError('Não foi possível carregar a conversa da Nova AI.')
      return
    }

    const history = Array.isArray(data?.messages) ? data.messages : []
    setMessages(history)
  }, [])

  useEffect(() => {
    let mounted = true
    void (async () => {
      const { data, error } = await supabase.functions.invoke('nova-ai-web-chat', {
        body: { action: 'history' },
      })
      if (!mounted) return
      setLoading(false)
      if (error) {
        setError('Não foi possível carregar a conversa da Nova AI.')
        return
      }
      const history = Array.isArray(data?.messages) ? data.messages : []
      setMessages(history)
    })()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  async function send(e: FormEvent) {
    e.preventDefault()
    const message = input.trim()
    if (!message || sending) return

    setInput('')
    setError('')
    setSending(true)
    const optimistic: ChatMessage = { role: 'user', body: message }
    setMessages((previous) => [...previous, optimistic])

    const { data, error } = await supabase.functions.invoke('nova-ai-web-chat', {
      body: { action: 'message', message },
    })

    setSending(false)
    if (error || !data?.reply) {
      setError('A Nova AI não conseguiu responder agora. Sua mensagem não será fingida como atendida.')
      return
    }

    setMessages((previous) => [...previous, { role: 'assistant', body: String(data.reply) }])
  }

  return (
    <section className="novaChatPage">
      <div className="novaChatHeader">
        <div className="chatHeaderActions">
          <button className="link" onClick={onBack}><ArrowLeft aria-hidden="true" /> Voltar ao painel</button>
          <button className="secondary compactButton" onClick={() => void loadHistory(false)} disabled={sending}>
            <RefreshCw aria-hidden="true" /> Atualizar conversa
          </button>
        </div>
        <span className="tag"><Sparkles aria-hidden="true" /> NOVA AI</span>
        <h1>Consultora Digital da InovaPro Systems.</h1>
        <p>
          {businessName
            ? <>Ela recebe o contexto salvo de <strong>{businessName}</strong> e do diagnóstico mais recente.</>
            : 'Ela entende o contexto disponível antes de recomendar qualquer solução.'}
        </p>
      </div>

      <div className="chatWindow" aria-live="polite">
        {loading ? (
          <div className="chatLoading"><Loader2 className="spin" aria-hidden="true" /> Carregando conversa...</div>
        ) : messages.length === 0 ? (
          <div className="novaWelcome">
            <span className="infinity">∞</span>
            <div>
              <strong>Oi! Eu sou a Nova AI.</strong>
              <p>Sou uma inteligência artificial da InovaPro Systems. Conte o que está acontecendo no seu negócio e eu começo pelo problema.</p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div className={message.role === 'user' ? 'chatRow userMessage' : 'chatRow novaMessage'} key={message.id ?? index}>
              <span className="chatAvatar" aria-hidden="true">
                {message.role === 'user' ? <UserRound /> : '∞'}
              </span>
              <div className="chatBubble">{message.body}</div>
            </div>
          ))
        )}

        {sending && (
          <div className="chatRow novaMessage">
            <span className="chatAvatar" aria-hidden="true">∞</span>
            <div className="chatBubble typing">Analisando o contexto...</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && <p className="authError" role="alert">{error}</p>}

      <form className="chatComposer" onSubmit={send}>
        <textarea
          aria-label="Mensagem para Nova AI"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Explique o que está acontecendo no seu negócio..."
          rows={2}
          maxLength={6000}
        />
        <button className="primary" disabled={sending || !input.trim()} aria-label="Enviar mensagem">
          <Send aria-hidden="true" />
        </button>
      </form>
      <small className="diagnosticNote">A Nova AI é uma inteligência artificial. Para proposta formal, orçamento, reunião ou atendimento humano, ela registra o handoff para a equipe.</small>
    </section>
  )
}
