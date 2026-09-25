import { FormEvent, useEffect, useMemo, useState } from 'react'
import {
  Building2,
  CheckCircle2,
  ChevronRight,
  Loader2,
  MessageCircle,
  PencilLine,
  Sparkles,
  Target,
  UserRound,
} from 'lucide-react'
import { supabase } from './supabase'

export type DashboardUser = {
  id: string
  email?: string
  fullName?: string
  avatarUrl?: string
}

type Profile = {
  id: string
  full_name: string | null
  phone: string | null
}

type BusinessStage = 'idea' | 'starting' | 'operating' | 'growing'

type Business = {
  id?: string
  user_id: string
  name: string
  segment: string | null
  city: string | null
  stage: BusinessStage | null
  main_goal: string | null
}

type View = 'inicio' | 'negocio'

const stageLabels: Record<BusinessStage, string> = {
  idea: 'Ainda é uma ideia',
  starting: 'Estou começando',
  operating: 'Já está operando',
  growing: 'Está crescendo',
}

function initials(name?: string, email?: string) {
  const source = name?.trim() || email?.split('@')[0] || 'IP'
  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export function Dashboard({ user, exit }: { user: DashboardUser; exit: () => void }) {
  const [view, setView] = useState<View>('inicio')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [business, setBusiness] = useState<Business | null>(null)
  const [fullName, setFullName] = useState(user.fullName ?? '')
  const [phone, setPhone] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [segment, setSegment] = useState('')
  const [city, setCity] = useState('')
  const [stage, setStage] = useState<BusinessStage>('starting')
  const [mainGoal, setMainGoal] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const displayName = useMemo(
    () => profile?.full_name?.trim() || user.fullName?.trim() || user.email?.split('@')[0] || 'empreendedor',
    [profile?.full_name, user.email, user.fullName],
  )

  useEffect(() => {
    let mounted = true
    void (async () => {
      try {
        const [profileResult, businessResult] = await Promise.all([
          supabase
            .from('profiles')
            .select('id, full_name, phone')
            .eq('id', user.id)
            .maybeSingle(),
          supabase
            .from('businesses')
            .select('id, user_id, name, segment, city, stage, main_goal')
            .eq('user_id', user.id)
            .maybeSingle(),
        ])
        if (profileResult.error) throw profileResult.error
        if (businessResult.error) throw businessResult.error
        if (!mounted) return

        const loadedProfile = profileResult.data as Profile | null
        const loadedBusiness = businessResult.data as Business | null
        setProfile(loadedProfile)
        setBusiness(loadedBusiness)
        setFullName(loadedProfile?.full_name ?? user.fullName ?? '')
        setPhone(loadedProfile?.phone ?? '')
        setBusinessName(loadedBusiness?.name ?? '')
        setSegment(loadedBusiness?.segment ?? '')
        setCity(loadedBusiness?.city ?? '')
        setStage(loadedBusiness?.stage ?? 'starting')
        setMainGoal(loadedBusiness?.main_goal ?? '')
        if (!loadedBusiness) setView('negocio')
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Não foi possível carregar seu negócio.')
        }
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [user.fullName, user.id])

  async function saveAccount(e: FormEvent) {
    e.preventDefault()
    if (businessName.trim().length < 2) {
      setError('Informe o nome do seu negócio.')
      return
    }
    setSaving(true)
    setSaved(false)
    setError('')
    try {
      const profileResult = await supabase
        .from('profiles')
        .upsert(
          {
            id: user.id,
            full_name: fullName.trim() || null,
            phone: phone.trim() || null,
          },
          { onConflict: 'id' },
        )
        .select('id, full_name, phone')
        .single()

      if (profileResult.error) throw profileResult.error

      const businessResult = await supabase
        .from('businesses')
        .upsert(
          {
            user_id: user.id,
            name: businessName.trim(),
            segment: segment.trim() || null,
            city: city.trim() || null,
            stage,
            main_goal: mainGoal.trim() || null,
          },
          { onConflict: 'user_id' },
        )
        .select('id, user_id, name, segment, city, stage, main_goal')
        .single()

      if (businessResult.error) throw businessResult.error
      setProfile(profileResult.data as Profile)
      setBusiness(businessResult.data as Business)
      setSaved(true)
      setView('inicio')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar seus dados.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="boot">
        <Loader2 className="spin" aria-hidden="true" />
        <span>Preparando seu espaço na InovaPro...</span>
      </div>
    )
  }

  return (
    <div className="appShell">
      <header className="appHeader">
        <button className="brandBtn appBrand" onClick={() => setView('inicio')} aria-label="Ir para o painel">
          <span className="infinity">∞</span>
          <div>
            <strong>inovapro</strong>
            <span>SYSTEMS</span>
          </div>
        </button>
        <div className="accountHeader">
          {user.avatarUrl ? (
            <img className="avatar" src={user.avatarUrl} alt="" referrerPolicy="no-referrer" />
          ) : (
            <span className="avatar avatarFallback">{initials(displayName, user.email)}</span>
          )}
          <div className="accountIdentity">
            <strong>{displayName}</strong>
            <small>{user.email}</small>
          </div>
          <button className="login" onClick={exit}>Sair</button>
        </div>
      </header>

      <main className="dashboard">
        <nav className="appNav" aria-label="Área do cliente">
          <button className={view === 'inicio' ? 'active' : ''} onClick={() => setView('inicio')}>
            Início
          </button>
          <button className={view === 'negocio' ? 'active' : ''} onClick={() => setView('negocio')}>
            Meu negócio
          </button>
        </nav>

        {view === 'negocio' ? (
          <section className="accountPanel">
            <div className="panelIntro">
              <span className="tag"><Building2 aria-hidden="true" /> MEU NEGÓCIO</span>
              <h1>{business ? 'Mantenha o contexto do seu negócio atualizado.' : 'Conte um pouco sobre seu negócio.'}</h1>
              <p>
                A Nova AI usa este contexto para evitar perguntas repetidas e tornar diagnósticos e orientações mais relevantes.
              </p>
            </div>

            <form className="businessForm" onSubmit={saveAccount}>
              <div className="formSection">
                <span className="formSectionTitle"><UserRound aria-hidden="true" /> Seu perfil</span>
                <label>
                  Seu nome
                  <input value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" />
                </label>
                <label>
                  Celular / WhatsApp
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" inputMode="tel" />
                </label>
              </div>

              <div className="formSection">
                <span className="formSectionTitle"><Building2 aria-hidden="true" /> Negócio</span>
                <label>
                  Nome do negócio
                  <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} required minLength={2} />
                </label>
                <div className="formRow">
                  <label>
                    Segmento
                    <input value={segment} onChange={(e) => setSegment(e.target.value)} placeholder="Ex.: alimentação, serviços, varejo" />
                  </label>
                  <label>
                    Cidade
                    <input value={city} onChange={(e) => setCity(e.target.value)} autoComplete="address-level2" />
                  </label>
                </div>
                <label>
                  Momento atual
                  <select value={stage} onChange={(e) => setStage(e.target.value as BusinessStage)}>
                    {Object.entries(stageLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </label>
                <label>
                  O que você quer melhorar primeiro?
                  <textarea
                    value={mainGoal}
                    onChange={(e) => setMainGoal(e.target.value)}
                    placeholder="Descreva seu objetivo principal em poucas palavras."
                    rows={4}
                  />
                </label>
              </div>

              {error && <p className="authError" role="alert">{error}</p>}
              {saved && <p className="authSuccess" role="status">Dados atualizados com sucesso.</p>}

              <div className="formActions">
                {business && (
                  <button type="button" className="secondary" onClick={() => setView('inicio')}>
                    Voltar
                  </button>
                )}
                <button className="primary" disabled={saving}>
                  {saving ? 'Salvando...' : business ? 'Salvar alterações' : 'Concluir meu perfil'}
                  {!saving && <ChevronRight aria-hidden="true" />}
                </button>
              </div>
            </form>
          </section>
        ) : (
          <>
            <section className="dashboardHero">
              <div>
                <span className="tag"><Sparkles aria-hidden="true" /> SEU PAINEL</span>
                <h1>Olá, {displayName}.</h1>
                <p>
                  {business
                    ? <>Vamos continuar a partir do contexto de <strong>{business.name}</strong>.</>
                    : 'Vamos começar entendendo seu negócio.'}
                </p>
              </div>
              <button className="secondary" onClick={() => setView('negocio')}>
                <PencilLine aria-hidden="true" /> Atualizar contexto
              </button>
            </section>

            <section className="dashboardGrid">
              <article className="businessSummary">
                <span className="tag">MEU NEGÓCIO</span>
                <h2>{business?.name ?? 'Complete seu cadastro'}</h2>
                <dl>
                  <div><dt>Segmento</dt><dd>{business?.segment || 'Ainda não informado'}</dd></div>
                  <div><dt>Momento</dt><dd>{business?.stage ? stageLabels[business.stage] : 'Ainda não informado'}</dd></div>
                  <div><dt>Objetivo</dt><dd>{business?.main_goal || 'Ainda não informado'}</dd></div>
                </dl>
                <button className="link" onClick={() => setView('negocio')}>
                  Editar meu negócio <ChevronRight aria-hidden="true" />
                </button>
              </article>

              <article className="novaCard">
                <span className="infinity">∞</span>
                <div>
                  <span className="tag">NOVA AI</span>
                  <h2>Vamos entender antes de recomendar.</h2>
                  <p>
                    A próxima etapa conecta este contexto ao atendimento da Nova AI. Nenhuma solução será empurrada sem diagnóstico.
                  </p>
                  <span className="statusChip"><MessageCircle aria-hidden="true" /> Integração em evolução</span>
                </div>
              </article>

              <article className="nextStepCard">
                <Target aria-hidden="true" />
                <span className="tag">PRÓXIMO PASSO</span>
                <h2>Diagnóstico InovaPro 360°</h2>
                <p>
                  Estratégia, Marca & Comunicação, Marketing, Vendas, Processos, Tecnologia & IA e Gestão & Crescimento.
                </p>
                <span className="statusChip"><CheckCircle2 aria-hidden="true" /> Estrutura de dados preparada</span>
              </article>
            </section>
          </>
        )}
      </main>
    </div>
  )
}
