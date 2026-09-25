import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, CheckCircle2, ChevronRight, RotateCcw, Sparkles } from 'lucide-react'
import { supabase } from './supabase'

type BusinessRef = { id?: string; name: string }

type PillarId =
  | 'strategy'
  | 'brand_communication'
  | 'marketing'
  | 'sales'
  | 'processes'
  | 'technology_ai'
  | 'management_growth'

type Question = {
  id: string
  pillar: PillarId
  text: string
}

type DiagnosticRecord = {
  id: string
  overall_score: number
  primary_pillar: PillarId
  scores: Record<PillarId, number>
  created_at: string
}

const pillarLabels: Record<PillarId, string> = {
  strategy: 'Estratégia',
  brand_communication: 'Marca & Comunicação',
  marketing: 'Marketing',
  sales: 'Vendas',
  processes: 'Processos',
  technology_ai: 'Tecnologia & IA',
  management_growth: 'Gestão & Crescimento',
}

const questions: Question[] = [
  { id: 'strategy_goal', pillar: 'strategy', text: 'Seu negócio tem prioridades e objetivos claros para os próximos meses?' },
  { id: 'strategy_customer', pillar: 'strategy', text: 'Você sabe claramente para quem vende e por que o cliente escolheria sua empresa?' },
  { id: 'brand_message', pillar: 'brand_communication', text: 'Sua comunicação transmite uma mensagem consistente nos principais canais?' },
  { id: 'brand_difference', pillar: 'brand_communication', text: 'Seu posicionamento deixa claro o que diferencia seu negócio?' },
  { id: 'marketing_channels', pillar: 'marketing', text: 'Você tem canais previsíveis para gerar atenção, contatos ou oportunidades?' },
  { id: 'marketing_measure', pillar: 'marketing', text: 'Você acompanha de onde vêm seus contatos e quais ações realmente funcionam?' },
  { id: 'sales_followup', pillar: 'sales', text: 'As oportunidades recebidas são acompanhadas até uma definição?' },
  { id: 'sales_process', pillar: 'sales', text: 'Existe um processo comercial claro, do primeiro contato ao fechamento?' },
  { id: 'processes_routine', pillar: 'processes', text: 'As rotinas mais importantes estão organizadas e podem ser repetidas sem improviso?' },
  { id: 'processes_rework', pillar: 'processes', text: 'Seu negócio consegue operar sem excesso de retrabalho, perda de informação ou tarefas esquecidas?' },
  { id: 'technology_fit', pillar: 'technology_ai', text: 'As ferramentas usadas hoje ajudam o processo em vez de aumentar a complexidade?' },
  { id: 'technology_data', pillar: 'technology_ai', text: 'Dados, integrações, automações ou IA são usados onde realmente fazem sentido?' },
  { id: 'management_numbers', pillar: 'management_growth', text: 'Você acompanha indicadores suficientes para saber o que precisa melhorar?' },
  { id: 'management_scale', pillar: 'management_growth', text: 'Seu negócio consegue crescer sem depender de você para absolutamente tudo?' },
]

const options = [
  ['Ainda não', 0],
  ['Pouco', 1],
  ['Parcialmente', 2],
  ['Bem', 3],
  ['Muito bem', 4],
] as const

const recommendations: Record<PillarId, { priority: string; next: string }> = {
  strategy: {
    priority: 'Dar clareza à direção do negócio.',
    next: 'Defina uma prioridade central, o público que ela atende e o resultado que precisa mudar primeiro.',
  },
  brand_communication: {
    priority: 'Alinhar posicionamento e comunicação.',
    next: 'Organize a mensagem principal da marca antes de ampliar canais ou produção de conteúdo.',
  },
  marketing: {
    priority: 'Entender quais canais realmente geram oportunidades.',
    next: 'Mapeie origem dos contatos e acompanhe o caminho até a conversa comercial.',
  },
  sales: {
    priority: 'Reduzir perdas no processo comercial.',
    next: 'Estruture etapas, responsáveis e acompanhamento das oportunidades que já chegam.',
  },
  processes: {
    priority: 'Organizar o fluxo antes de automatizar.',
    next: 'Escolha um processo crítico, documente as etapas e remova perdas antes de adicionar tecnologia.',
  },
  technology_ai: {
    priority: 'Fazer a tecnologia trabalhar para o processo.',
    next: 'Revise ferramentas atuais, integrações e tarefas repetitivas antes de contratar novas soluções.',
  },
  management_growth: {
    priority: 'Criar visibilidade para decidir e crescer.',
    next: 'Escolha poucos indicadores essenciais e uma rotina simples de acompanhamento e ajuste.',
  },
}

function draftKey(businessId?: string) {
  return businessId ? `inovapro:diagnostic360:${businessId}` : ''
}

function readDraft(businessId?: string) {
  const key = draftKey(businessId)
  if (!key || typeof window === 'undefined') return { answers: {} as Record<string, number>, index: 0 }
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return { answers: {} as Record<string, number>, index: 0 }
    const parsed = JSON.parse(raw) as { answers?: Record<string, number>; index?: number }
    const answers = parsed.answers && typeof parsed.answers === 'object' ? parsed.answers : {}
    const index = Number.isInteger(parsed.index)
      ? Math.min(Math.max(Number(parsed.index), 0), questions.length - 1)
      : 0
    return { answers, index }
  } catch {
    return { answers: {} as Record<string, number>, index: 0 }
  }
}

function writeDraft(businessId: string | undefined, answers: Record<string, number>, index: number) {
  const key = draftKey(businessId)
  if (!key || typeof window === 'undefined') return
  window.localStorage.setItem(key, JSON.stringify({ answers, index }))
}

function clearDraft(businessId?: string) {
  const key = draftKey(businessId)
  if (!key || typeof window === 'undefined') return
  window.localStorage.removeItem(key)
}

function calculate(answers: Record<string, number>) {
  const grouped = Object.keys(pillarLabels).reduce(
    (acc, key) => ({ ...acc, [key]: [] as number[] }),
    {} as Record<PillarId, number[]>,
  )

  for (const question of questions) {
    const value = answers[question.id]
    if (typeof value === 'number') grouped[question.pillar].push(value)
  }

  const scores = Object.keys(pillarLabels).reduce((acc, key) => {
    const pillar = key as PillarId
    const values = grouped[pillar]
    const average = values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0
    acc[pillar] = Math.round(average * 25)
    return acc
  }, {} as Record<PillarId, number>)

  const scoreValues = Object.values(scores)
  const overall = Math.round(scoreValues.reduce((sum, value) => sum + value, 0) / scoreValues.length)
  const primary = (Object.keys(scores) as PillarId[]).sort((a, b) => scores[a] - scores[b])[0]

  return { scores, overall, primary }
}

export function Diagnostic360({
  userId,
  business,
  onBack,
}: {
  userId: string
  business: BusinessRef
  onBack: () => void
}) {
  const initialDraft = useMemo(() => readDraft(business.id), [business.id])
  const [answers, setAnswers] = useState<Record<string, number>>(() => initialDraft.answers)
  const [index, setIndex] = useState(() => initialDraft.index)
  const [result, setResult] = useState<DiagnosticRecord | null>(null)
  const [history, setHistory] = useState<DiagnosticRecord[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!business.id) return
    void (async () => {
      const { data, error } = await supabase
        .from('business_diagnostics')
        .select('id, overall_score, primary_pillar, scores, created_at')
        .eq('business_id', business.id)
        .order('created_at', { ascending: false })
        .limit(3)

      if (!error && data) {
        const rows = data as DiagnosticRecord[]
        setHistory(rows)
        if (rows[0]) setResult(rows[0])
      }
    })()
  }, [business.id])

  const current = questions[index]
  const progress = Math.round(((index + 1) / questions.length) * 100)
  const calculated = useMemo(() => calculate(answers), [answers])

  function answer(value: number) {
    const nextAnswers = { ...answers, [current.id]: value }
    const nextIndex = index < questions.length - 1 ? index + 1 : index
    setAnswers(nextAnswers)
    if (nextIndex !== index) setIndex(nextIndex)
    writeDraft(business.id, nextAnswers, nextIndex)
  }

  function previousQuestion() {
    const nextIndex = Math.max(0, index - 1)
    setIndex(nextIndex)
    writeDraft(business.id, answers, nextIndex)
  }

  async function finish() {
    if (!business.id) return
    if (Object.keys(answers).length !== questions.length) {
      setError('Responda todas as perguntas antes de concluir.')
      return
    }

    setSaving(true)
    setError('')
    const final = calculate(answers)
    const summary =
      `Pilar prioritário: ${pillarLabels[final.primary]}. ${recommendations[final.primary].priority} ${recommendations[final.primary].next}`

    const { data, error } = await supabase
      .from('business_diagnostics')
      .insert({
        user_id: userId,
        business_id: business.id,
        version: 1,
        answers,
        scores: final.scores,
        overall_score: final.overall,
        primary_pillar: final.primary,
        summary,
      })
      .select('id, overall_score, primary_pillar, scores, created_at')
      .single()

    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }

    const row = data as DiagnosticRecord
    clearDraft(business.id)
    setResult(row)
    setHistory((previous) => [row, ...previous].slice(0, 3))
  }

  function restart() {
    clearDraft(business.id)
    setAnswers({})
    setIndex(0)
    setResult(null)
    setError('')
  }

  if (!business.id) {
    return (
      <section className="accountPanel">
        <button className="link" onClick={onBack}><ArrowLeft aria-hidden="true" /> Voltar</button>
        <h1>Complete seu negócio antes do diagnóstico.</h1>
      </section>
    )
  }

  if (result) {
    const recommendation = recommendations[result.primary_pillar]
    return (
      <section className="diagnosticPage">
        <div className="diagnosticHeader">
          <button className="link" onClick={onBack}><ArrowLeft aria-hidden="true" /> Voltar ao painel</button>
          <span className="tag"><Sparkles aria-hidden="true" /> DIAGNÓSTICO INOVAPRO 360°</span>
          <h1>Seu negócio é um sistema.</h1>
          <p>O resultado não é uma nota inventada pela Nova AI. Ele vem das suas respostas e de uma regra determinística.</p>
        </div>

        <div className="resultHero">
          <div className="scoreRing"><strong>{result.overall_score}</strong><span>/100</span></div>
          <div>
            <span className="tag">PRIORIDADE ATUAL</span>
            <h2>{pillarLabels[result.primary_pillar]}</h2>
            <p>{recommendation.priority}</p>
          </div>
        </div>

        <div className="pillarGrid">
          {(Object.keys(pillarLabels) as PillarId[]).map((pillar) => (
            <article key={pillar}>
              <span>{pillarLabels[pillar]}</span>
              <strong>{result.scores[pillar] ?? 0}</strong>
              <div className="scoreTrack"><i style={{ width: `${result.scores[pillar] ?? 0}%` }} /></div>
            </article>
          ))}
        </div>

        <article className="priorityCard">
          <span className="tag">1 PROBLEMA → 1 PRIORIDADE → 1 PRÓXIMO PASSO</span>
          <h2>{recommendation.next}</h2>
          <p>A Nova AI pode usar este diagnóstico como contexto para continuar a conversa sem recomeçar do zero.</p>
        </article>

        <div className="diagnosticActions">
          <button className="secondary" onClick={restart}><RotateCcw aria-hidden="true" /> Refazer diagnóstico</button>
          <button className="primary" onClick={onBack}>Voltar ao painel <ChevronRight aria-hidden="true" /></button>
        </div>

        {history.length > 1 && (
          <div className="historyBlock">
            <span className="tag">HISTÓRICO RECENTE</span>
            {history.map((item) => (
              <div className="historyRow" key={item.id}>
                <span>{new Date(item.created_at).toLocaleDateString('pt-BR')}</span>
                <strong>{item.overall_score}/100</strong>
                <span>{pillarLabels[item.primary_pillar]}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    )
  }

  return (
    <section className="diagnosticPage">
      <div className="diagnosticHeader">
        <button className="link" onClick={onBack}><ArrowLeft aria-hidden="true" /> Voltar</button>
        <span className="tag"><Sparkles aria-hidden="true" /> DIAGNÓSTICO INOVAPRO 360°</span>
        <h1>Vamos entender antes de recomendar.</h1>
        <p>{business.name} será analisado em sete pilares. Uma pergunta por vez.</p>
      </div>

      <div className="progressMeta">
        <span>{index + 1} de {questions.length}</span>
        <strong>{progress}%</strong>
      </div>
      <div className="progressTrack"><i style={{ width: `${progress}%` }} /></div>

      <article className="questionCard">
        <span className="tag">{pillarLabels[current.pillar]}</span>
        <h2>{current.text}</h2>
        <div className="answerGrid">
          {options.map(([label, value]) => (
            <button key={label} onClick={() => answer(value)}>{label}</button>
          ))}
        </div>
      </article>

      <div className="diagnosticFooter">
        <button
          className="secondary"
          disabled={index === 0}
          onClick={previousQuestion}
        >
          <ArrowLeft aria-hidden="true" /> Anterior
        </button>
        {index === questions.length - 1 && Object.keys(answers).length === questions.length && (
          <button className="primary" onClick={finish} disabled={saving}>
            {saving ? 'Calculando...' : 'Ver resultado'} <CheckCircle2 aria-hidden="true" />
          </button>
        )}
      </div>

      {error && <p className="authError" role="alert">{error}</p>}
      <small className="diagnosticNote">
        Prévia atual: {calculated.overall}/100. Ela só é salva quando você conclui todas as respostas.
      </small>
    </section>
  )
}
