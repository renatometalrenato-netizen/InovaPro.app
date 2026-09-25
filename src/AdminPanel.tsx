import { FormEvent, useEffect, useState } from 'react'
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Loader2,
  MessageCircle,
  RefreshCw,
  Send,
  ShieldCheck,
  UserRoundCheck,
  UsersRound,
  XCircle,
} from 'lucide-react'
import { supabase } from './supabase'

type Summary = {
  contacts: number
  open_conversations: number
  qualified_leads: number
  opportunities: number
  active_handoffs: number
  due_followups: number
}

type Handoff = {
  id: string
  conversation_id: string
  reason: string
  priority: string
  status: 'open' | 'accepted' | 'resolved' | 'cancelled'
  assigned_to: string | null
  context_summary: string | null
  opened_at: string
  channel: string | null
  contact?: {
    display_name?: string | null
    company?: string | null
    phone_e164?: string | null
    instagram_username?: string | null
  } | null
}

type Detail = {
  conversation: {
    id: string
    channel: string
    status: string
    contact_name?: string | null
    summary?: string | null
  }
  messages: Array<{
    id: string
    role: 'assistant' | 'user'
    content: string
    created_at: string
  }>
  handoffs: Handoff[]
}

async function invokeAdmin(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('nova-ai-admin', { body })
  if (error) throw error
  if (data?.error) throw new Error(String(data.error))
  return data
}

export function AdminPanel({ onBack }: { onBack: () => void }) {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [handoffs, setHandoffs] = useState<Handoff[]>([])
  const [selected, setSelected] = useState<Handoff | null>(null)
  const [detail, setDetail] = useState<Detail | null>(null)
  const [reply, setReply] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')

  async function loadOverview() {
    setLoading(true)
    setError('')
    try {
      const [summaryData, handoffData] = await Promise.all([
        invokeAdmin({ action: 'summary' }),
        invokeAdmin({ action: 'handoffs', limit: 50 }),
      ])
      setSummary(summaryData as Summary)
      setHandoffs(Array.isArray(handoffData?.data) ? handoffData.data : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível carregar o painel administrativo.')
    } finally {
      setLoading(false)
    }
  }

  async function openHandoff(handoff: Handoff) {
    setSelected(handoff)
    setDetail(null)
    setError('')
    try {
      const data = await invokeAdmin({ action: 'conversation', id: handoff.conversation_id })
      setDetail(data as Detail)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível carregar a conversa.')
    }
  }

  async function updateHandoff(status: 'accepted' | 'resolved' | 'cancelled') {
    if (!selected) return
    setActionLoading(true)
    setError('')
    try {
      await invokeAdmin({ action: 'update_handoff', id: selected.id, status })
      await loadOverview()
      if (status === 'accepted') {
        const refreshed = { ...selected, status }
        setSelected(refreshed)
        await openHandoff(refreshed)
      } else {
        setSelected(null)
        setDetail(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível atualizar o atendimento.')
    } finally {
      setActionLoading(false)
    }
  }

  async function sendReply(e: FormEvent) {
    e.preventDefault()
    const text = reply.trim()
    if (!selected || !text) return
    setActionLoading(true)
    setError('')
    try {
      const response = await invokeAdmin({
        action: 'send_message',
        conversation_id: selected.conversation_id,
        body: text,
      })
      if (response?.data?.sent === false) {
        throw new Error(response.data.blocked || response.data.error || 'A mensagem não pôde ser enviada.')
      }
      setReply('')
      await openHandoff(selected)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível enviar a mensagem.')
    } finally {
      setActionLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true
    void (async () => {
      try {
        const [summaryData, handoffData] = await Promise.all([
          invokeAdmin({ action: 'summary' }),
          invokeAdmin({ action: 'handoffs', limit: 50 }),
        ])
        if (!mounted) return
        setSummary(summaryData as Summary)
        setHandoffs(Array.isArray(handoffData?.data) ? handoffData.data : [])
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Não foi possível carregar o painel administrativo.')
        }
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

  return (
    <section className="adminPage">
      <div className="adminHeader">
        <button className="link" onClick={onBack}><ArrowLeft aria-hidden="true" /> Voltar ao painel</button>
        <span className="tag"><ShieldCheck aria-hidden="true" /> OPERAÇÃO INOVAPRO</span>
        <h1>Atendimento e handoffs.</h1>
        <p>Área restrita aos usuários cadastrados como administradores da Nova AI.</p>
      </div>

      {loading ? (
        <div className="adminLoading"><Loader2 className="spin" aria-hidden="true" /> Carregando operação...</div>
      ) : (
        <>
          <div className="adminMetrics">
            <article><UsersRound aria-hidden="true" /><strong>{summary?.contacts ?? 0}</strong><span>Contatos</span></article>
            <article><MessageCircle aria-hidden="true" /><strong>{summary?.open_conversations ?? 0}</strong><span>Conversas abertas</span></article>
            <article><UserRoundCheck aria-hidden="true" /><strong>{summary?.qualified_leads ?? 0}</strong><span>Leads qualificados</span></article>
            <article><ShieldCheck aria-hidden="true" /><strong>{summary?.active_handoffs ?? 0}</strong><span>Handoffs ativos</span></article>
            <article><Clock3 aria-hidden="true" /><strong>{summary?.due_followups ?? 0}</strong><span>Follow-ups pendentes</span></article>
          </div>

          <div className="adminToolbar">
            <div>
              <span className="tag">FILA HUMANA</span>
              <h2>Solicitações que precisam de uma pessoa.</h2>
            </div>
            <button className="secondary" onClick={() => void loadOverview()}>
              <RefreshCw aria-hidden="true" /> Atualizar
            </button>
          </div>

          <div className="adminWorkspace">
            <div className="handoffList">
              {handoffs.length === 0 ? (
                <div className="emptyAdmin">Nenhum handoff registrado agora.</div>
              ) : handoffs.map((handoff) => {
                const name = handoff.contact?.display_name || handoff.contact?.company || 'Contato'
                return (
                  <button
                    key={handoff.id}
                    className={selected?.id === handoff.id ? 'handoffItem active' : 'handoffItem'}
                    onClick={() => void openHandoff(handoff)}
                  >
                    <div>
                      <strong>{name}</strong>
                      <span>{handoff.channel || 'canal'} · {handoff.priority}</span>
                    </div>
                    <small className={'handoffStatus ' + handoff.status}>{handoff.status}</small>
                    <p>{handoff.reason}</p>
                    <time>{new Date(handoff.opened_at).toLocaleString('pt-BR')}</time>
                  </button>
                )
              })}
            </div>

            <div className="handoffDetail">
              {!selected ? (
                <div className="emptyAdmin">Selecione uma solicitação para abrir o contexto completo.</div>
              ) : !detail ? (
                <div className="adminLoading"><Loader2 className="spin" aria-hidden="true" /> Abrindo conversa...</div>
              ) : (
                <>
                  <div className="detailHeader">
                    <div>
                      <span className="tag">{detail.conversation.channel}</span>
                      <h2>{detail.conversation.contact_name || 'Atendimento'}</h2>
                    </div>
                    <div className="detailActions">
                      {selected.status === 'open' && (
                        <button className="primary" disabled={actionLoading} onClick={() => void updateHandoff('accepted')}>
                          <CheckCircle2 aria-hidden="true" /> Assumir
                        </button>
                      )}
                      {selected.status === 'accepted' && (
                        <button className="primary" disabled={actionLoading} onClick={() => void updateHandoff('resolved')}>
                          <CheckCircle2 aria-hidden="true" /> Resolver
                        </button>
                      )}
                      {(selected.status === 'open' || selected.status === 'accepted') && (
                        <button className="secondary" disabled={actionLoading} onClick={() => void updateHandoff('cancelled')}>
                          <XCircle aria-hidden="true" /> Cancelar
                        </button>
                      )}
                    </div>
                  </div>

                  {selected.context_summary && (
                    <div className="contextBox">
                      <span className="tag">CONTEXTO ORGANIZADO PELA NOVA</span>
                      <p>{selected.context_summary}</p>
                    </div>
                  )}

                  <div className="adminMessages">
                    {detail.messages.map((message) => (
                      <div className={message.role === 'user' ? 'adminMessage inbound' : 'adminMessage outbound'} key={message.id}>
                        <small>{message.role === 'user' ? 'Cliente' : 'InovaPro / Nova'}</small>
                        <p>{message.content}</p>
                        <time>{new Date(message.created_at).toLocaleString('pt-BR')}</time>
                      </div>
                    ))}
                  </div>

                  {(selected.status === 'open' || selected.status === 'accepted') && (
                    <form className="adminReply" onSubmit={sendReply}>
                      <textarea
                        aria-label="Resposta humana"
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        placeholder="Responder como atendimento humano..."
                        rows={3}
                        maxLength={3000}
                      />
                      <button className="primary" disabled={actionLoading || !reply.trim()}>
                        <Send aria-hidden="true" /> Enviar
                      </button>
                    </form>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}

      {error && <p className="authError" role="alert">{error}</p>}
    </section>
  )
}
