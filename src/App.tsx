import { FormEvent, KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react'
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  Instagram,
  Menu,
  MessageCircle,
  Sparkles,
  TrendingUp,
  Workflow,
  X,
} from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import { Dashboard } from './Dashboard'
import { supabase } from './supabase'
import { publicConfig } from './config'

type Section = 'inicio' | 'solucoes' | 'conteudos' | 'quem-somos' | 'faq'
type AuthMode = 'login' | 'signup'
type SessionUser = { id: string; email?: string; fullName?: string; avatarUrl?: string }
const services = [
  [
    Instagram,
    'Redes sociais e presença digital',
    'Posicionamento, conteúdo e presença digital com propósito.',
  ],
  [
    TrendingUp,
    'Marketing e vendas',
    'Estratégias para atrair, atender e transformar oportunidades em clientes.',
  ],
  [
    Workflow,
    'Gestão e processos',
    'Mais clareza, organização e eficiência para a rotina do negócio.',
  ],
  [BrainCircuit, 'IA e automação', 'Tecnologia aplicada quando ela realmente resolve um problema.'],
  [
    MessageCircle,
    'WhatsApp e atendimento',
    'Organização da comunicação e da experiência do cliente.',
  ],
  [
    BarChart3,
    'Indicadores do negócio',
    'Ferramentas para entender custos, margem, CMV e outros números importantes.',
  ],
] as const
const faqs = [
  [
    'A InovaPro atende apenas empresas grandes?',
    'Não. A proposta é atender desde quem está começando a empreender até negócios mais estruturados, considerando o momento e a necessidade real de cada negócio.',
  ],
  [
    'Preciso saber qual serviço contratar?',
    'Não. Você pode começar explicando o problema. A Nova AI foi pensada para ajudar a organizar o contexto antes de recomendar um próximo passo.',
  ],
  [
    'A Nova AI substitui o atendimento humano?',
    'Não. A Nova AI apoia diagnóstico, orientação e organização. Quando necessário, o atendimento pode ser encaminhado com o contexto já reunido.',
  ],
  [
    'Tudo no aplicativo já está funcionando?',
    'Esta é uma versão em desenvolvimento. Recursos ainda não conectados são apresentados como demonstração.',
  ],
] as const
function InfinityMark() {
  return <span className="infinity">∞</span>
}
function Brand() {
  return (
    <div className="brand">
      <InfinityMark />
      <div>
        <strong>inovapro</strong>
        <span>SYSTEMS</span>
        <small>Conectando você ao mundo.</small>
      </div>
    </div>
  )
}
function Header({
  section,
  setSection,
  auth,
}: {
  section: Section
  setSection: (x: Section) => void
  auth: (x: AuthMode) => void
}) {
  const [open, setOpen] = useState(false)
  const nav = (id: Section, label: string) => (
    <button
      className={section === id ? 'active' : ''}
      onClick={() => {
        setSection(id)
        setOpen(false)
        scrollTo(0, 0)
      }}
    >
      {label}
    </button>
  )
  return (
    <header>
      <button
        className="brandBtn"
        aria-label="Ir para o início"
        onClick={() => setSection('inicio')}
      >
        <Brand />
      </button>
      <div className="desktop">
        {nav('inicio', 'Início')}
        {nav('solucoes', 'Soluções')}
        {nav('conteudos', 'Conteúdos')}
        {nav('quem-somos', 'Quem somos')}
        {nav('faq', 'FAQ')}
      </div>
      <div className="actions">
        <button className="login" onClick={() => auth('login')}>
          Iniciar sessão
        </button>
        <button className="create desktopCreate" onClick={() => auth('signup')}>
          Criar conta
        </button>
        <button
          className="menu"
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          onClick={() => setOpen(!open)}
        >
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>
      {open && (
        <div className="mobile" id="mobile-navigation">
          {nav('inicio', 'Início')}
          {nav('solucoes', 'Soluções')}
          {nav('conteudos', 'Conteúdos')}
          {nav('quem-somos', 'Quem somos')}
          {nav('faq', 'FAQ')}
          <button className="create" onClick={() => auth('signup')}>
            Criar conta
          </button>
        </div>
      )}
    </header>
  )
}
function Home({
  setSection,
  auth,
}: {
  setSection: (x: Section) => void
  auth: (x: 'signup') => void
}) {
  return (
    <>
      <section className="hero">
        <div>
          <span className="tag">
            <Sparkles aria-hidden="true" /> ESTRATÉGIA • DIGITAL • TECNOLOGIA
          </span>
          <h1>
            Seu negócio conectado a <em>novas possibilidades.</em>
          </h1>
          <p>
            A InovaPro Systems conecta estratégia, comunicação, marketing, gestão e tecnologia para
            ajudar negócios a entender problemas, encontrar oportunidades e evoluir com mais
            clareza.
          </p>
          <div className="buttons">
            <button className="primary" onClick={() => auth('signup')}>
              Conversar com a Nova AI <ArrowRight aria-hidden="true" />
            </button>
            <button className="secondary" onClick={() => setSection('solucoes')}>
              Conhecer soluções
            </button>
          </div>
          <small className="slogan">Conectando você ao mundo.</small>
        </div>
        <div className="nova">
          <InfinityMark />
          <strong>Nova AI</strong>
          <span>Consultora digital da InovaPro</span>
          <p>Conte o que está acontecendo. Eu começo pelo problema.</p>
        </div>
      </section>
      <section className="what">
        <span className="tag">O QUE FAZEMOS</span>
        <h2>Um ecossistema para diferentes momentos do negócio.</h2>
        <p>
          Da presença nas redes sociais à organização de processos, automação e inteligência
          artificial. A tecnologia entra como meio — não como ponto de partida.
        </p>
        <div className="strip">
          {services.slice(0, 4).map(([I, t]) => (
            <article key={t}>
              <I aria-hidden="true" />
              <strong>{t}</strong>
            </article>
          ))}
        </div>
        <button className="link" onClick={() => setSection('solucoes')}>
          Ver todas as áreas <ArrowRight aria-hidden="true" />
        </button>
      </section>
      <section className="novaIntro">
        <div className="novaMark">
          <InfinityMark />
        </div>
        <div>
          <span className="tag">CONHEÇA A NOVA AI</span>
          <h2>Você não precisa chegar sabendo o nome da solução.</h2>
          <p>
            A Nova AI foi criada para entender o contexto primeiro. Em vez de começar oferecendo uma
            ferramenta, ela ajuda a identificar o que realmente precisa de atenção e qual pode ser o
            próximo passo.
          </p>
          <button className="secondary" onClick={() => auth('signup')}>
            Falar com a Nova AI
          </button>
        </div>
      </section>
    </>
  )
}
function Solutions() {
  return (
    <section className="page">
      <span className="tag">SOLUÇÕES</span>
      <h1>
        O problema vem antes da <em>ferramenta.</em>
      </h1>
      <p className="lead">
        A InovaPro reúne diferentes competências para construir uma resposta proporcional à
        necessidade e ao momento de cada negócio.
      </p>
      <div className="grid">
        {services.map(([I, t, d]) => (
          <article key={t}>
            <I />
            <h3>{t}</h3>
            <p>{d}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
function Contents() {
  return (
    <section className="page">
      <span className="tag">CONTEÚDOS</span>
      <h1>
        Aprender para <em>decidir melhor.</em>
      </h1>
      <p className="lead">
        Conteúdos objetivos para traduzir gestão, marketing, vendas e tecnologia para a realidade do
        negócio.
      </p>
      <div className="grid">
        <article>
          <h3>CRM: eu realmente preciso de um?</h3>
          <p>Entenda quando um CRM ajuda e quando ele só adiciona complexidade.</p>
        </article>
        <article>
          <h3>Instagram bonito vende?</h3>
          <p>A diferença entre estética, posicionamento, conteúdo e conversão.</p>
        </article>
        <article>
          <h3>CMV sem complicação</h3>
          <p>Por que vender bastante não significa necessariamente ter lucro.</p>
        </article>
      </div>
      <small className="notice">Biblioteca em desenvolvimento.</small>
    </section>
  )
}
function About() {
  return (
    <section className="page">
      <span className="tag">QUEM SOMOS</span>
      <h1>
        Estratégia e tecnologia com <em>propósito.</em>
      </h1>
      <p className="lead">
        A InovaPro Systems é uma empresa de soluções estratégicas, digitais, comerciais e
        tecnológicas. O trabalho parte da compreensão do negócio e do problema antes da escolha de
        ferramentas.
      </p>
      <div className="principle">
        <InfinityMark />
        <div>
          <span className="tag">PRINCÍPIO</span>
          <h2>
            Entender primeiro.
            <br />
            Recomendar depois.
          </h2>
          <p>
            Comunicação, presença digital, vendas, atendimento, gestão, processos, automação e
            inteligência artificial podem trabalhar de forma conectada.
          </p>
        </div>
      </div>
    </section>
  )
}
function Privacy() {
  return (
    <main className="main">
      <section className="page privacy">
        <span className="tag">PRIVACIDADE E LGPD</span>
        <h1>
          Como tratamos seus <em>dados pessoais.</em>
        </h1>
        <p className="lead">
          Este aviso explica, de forma transparente, como a InovaPro Systems trata dados no
          aplicativo e no relacionamento comercial.
        </p>
        <h2>Dados e finalidades</h2>
        <p>
          Podemos tratar nome, e-mail, telefone/WhatsApp e informações sobre seu negócio para
          autenticar sua conta, prestar atendimento, realizar diagnóstico, manter segurança,
          registrar solicitações e cumprir obrigações legais.
        </p>
        <h2>Bases legais</h2>
        <p>
          O tratamento pode se apoiar na execução de contrato ou procedimentos preliminares,
          cumprimento de obrigação legal, legítimo interesse — após avaliação aplicável — e
          consentimento quando essa for a base adequada. O consentimento não é a única base legal.
        </p>
        <h2>Comunicação de marketing</h2>
        <p>
          O recebimento de comunicações promocionais é opcional, separado do cadastro e pode ser
          revogado a qualquer momento. A recusa não impede o uso das funções essenciais.
        </p>
        <h2>Compartilhamento e segurança</h2>
        <p>
          Dados podem ser processados por fornecedores necessários à operação, sob medidas
          contratuais e técnicas de segurança. Não vendemos dados pessoais.
        </p>
        <h2>Seus direitos</h2>
        <p>
          Você pode solicitar confirmação, acesso, correção, portabilidade quando aplicável,
          informação sobre compartilhamento, oposição, eliminação ou revogação de consentimento,
          observados os limites legais.
        </p>
        <h2>Atualizações e contato</h2>
        <p>
          Versão 1.0 — 21 de setembro de 2026. Solicitações de privacidade serão direcionadas pelos
          canais oficiais da InovaPro Systems.
        </p>
        <p className="legalReview">
          Este texto é informativo e deve passar por revisão jurídica especializada antes da
          expansão comercial ou de tratamentos de maior risco.
        </p>
        <a className="secondary" href="./">
          Voltar ao início
        </a>
      </section>
    </main>
  )
}
function Terms() {
  return (
    <main className="main">
      <section className="page privacy">
        <span className="tag">TERMOS DE USO</span>
        <h1>
          Regras para usar o <em>InovaPro.app.</em>
        </h1>
        <p className="lead">
          Estes termos descrevem as condições básicas de uso da plataforma, da Nova AI e dos
          recursos digitais da InovaPro Systems.
        </p>
        <h2>Uso da plataforma</h2>
        <p>
          O usuário deve fornecer informações verdadeiras, proteger suas credenciais e utilizar o
          aplicativo de forma lícita. Recursos podem evoluir, ser ajustados ou ficar temporariamente
          indisponíveis durante desenvolvimento e manutenção.
        </p>
        <h2>Nova AI</h2>
        <p>
          A Nova AI é uma inteligência artificial de apoio consultivo. Suas respostas servem para
          organizar contexto, diagnóstico e próximos passos e não representam garantia de resultado
          comercial, financeiro ou operacional.
        </p>
        <h2>Diagnóstico e decisões</h2>
        <p>
          O Diagnóstico InovaPro 360° utiliza regras definidas pela plataforma e as respostas
          fornecidas pelo usuário. A interpretação deve ser considerada em conjunto com o contexto
          real do negócio.
        </p>
        <h2>Conteúdo e propriedade intelectual</h2>
        <p>
          Marca, identidade, interfaces, materiais e conteúdos próprios da InovaPro Systems não
          podem ser copiados ou explorados comercialmente sem autorização, ressalvados os usos
          permitidos por lei.
        </p>
        <h2>Privacidade</h2>
        <p>
          O tratamento de dados pessoais segue o Aviso de Privacidade e a legislação aplicável. A
          criação de conta não implica consentimento automático para comunicações promocionais.
        </p>
        <h2>Atualizações</h2>
        <p>
          Versão 1.0 — 25 de setembro de 2026. Mudanças relevantes deverão ser apresentadas de forma
          adequada antes de produzirem efeitos quando a legislação exigir.
        </p>
        <p className="legalReview">
          Este texto é uma base operacional e deve passar por revisão jurídica especializada antes
          da expansão comercial ou de operações contratuais de maior risco.
        </p>
        <div className="legalLinks">
          <a className="secondary" href="./privacidade">Ver privacidade</a>
          <a className="secondary" href="./">Voltar ao início</a>
        </div>
      </section>
    </main>
  )
}

function PasswordRecovery({ close }: { close: () => void }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function requestPasswordReset() {
    setMessage('')
    setError('')
    if (!email.trim()) {
      setError('Informe seu e-mail para receber o link de recuperação.')
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: publicConfig.appUrl,
      })
      if (error) throw error
      setMessage('Se este e-mail estiver cadastrado, você receberá um link para redefinir a senha.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível solicitar a recuperação.')
    } finally {
      setLoading(false)
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')
    if (password.length < 8) {
      setError('Use uma senha com pelo menos 8 caracteres.')
      return
    }
    if (password !== confirm) {
      setError('As senhas não coincidem.')
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setMessage('Senha atualizada com sucesso.')
      window.setTimeout(close, 900)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível atualizar sua senha.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="back">
      <form className="modal" role="dialog" aria-modal="true" aria-labelledby="recovery-title" onSubmit={submit}>
        <Brand />
        <span className="tag">NOVA SENHA</span>
        <h2 id="recovery-title">Proteja novamente sua conta.</h2>
        <input
          aria-label="Nova senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Nova senha"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <input
          aria-label="Confirmar nova senha"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Confirmar nova senha"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        {error && <p className="authError" role="alert">{error}</p>}
        {message && <p className="authSuccess" role="status">{message}</p>}
        <button className="primary full" disabled={loading}>
          {loading ? 'Atualizando...' : 'Atualizar senha'}
        </button>
      </form>
    </div>
  )
}

function FAQ() {
  const [o, setO] = useState(0)
  return (
    <section className="page">
      <span className="tag">FAQ</span>
      <h1>
        Perguntas <em>frequentes.</em>
      </h1>
      <div className="faq">
        {faqs.map(([q, a], i) => {
          const panelId = `faq-panel-${i}`
          return (
            <div className="faqItem" key={q}>
              <button
                aria-expanded={o === i}
                aria-controls={panelId}
                onClick={() => setO(o === i ? -1 : i)}
              >
                <strong>
                  {q}
                  <b aria-hidden="true">{o === i ? '−' : '+'}</b>
                </strong>
              </button>
              {o === i && <p id={panelId}>{a}</p>}
            </div>
          )
        })}
      </div>
    </section>
  )
}

function Auth({ mode, close }: { mode: AuthMode; close: () => void }) {
  const modalRef = useRef<HTMLFormElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [legalAccepted, setLegalAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    return () => previous?.focus()
  }, [])
  function modalKeys(e: KeyboardEvent<HTMLFormElement>) {
    if (e.key === 'Escape') {
      close()
      return
    }
    if (e.key !== 'Tab' || !modalRef.current) return
    const focusable = Array.from(
      modalRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]),input:not([disabled]),a[href]',
      ),
    )
    const first = focusable[0],
      last = focusable[focusable.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last?.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first?.focus()
    }
  }
  async function signInWithGoogle() {
    setLoading(true)
    setMessage('')
    setError('')
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: publicConfig.appUrl },
      })
      if (error) throw error
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar com o Google.')
      setLoading(false)
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')
    try {
      if (mode === 'signup') {
        if (!name.trim() || !phone.trim()) {
          setError('Preencha seu nome e celular / WhatsApp.')
          return
        }
        if (!legalAccepted) {
          setError('Para criar a conta, confirme que leu os Termos de Uso e o Aviso de Privacidade.')
          return
        }
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: publicConfig.appUrl,
            data: {
              full_name: name.trim(),
              phone: phone.trim(),
              accepted_terms_version: '1.0',
              accepted_privacy_version: '1.0',
            },
          },
        })
        if (error) throw error
        if (data.session) close()
        else
          setMessage(
            'Conta criada. Enviamos um link de confirmação para o seu e-mail. Confirme o endereço antes de entrar.',
          )
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
        if (error) throw error
        close()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível concluir. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }
  return (
    <div
      className="back"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close()
      }}
    >
      <form
        ref={modalRef}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        onKeyDown={modalKeys}
        onSubmit={submit}
      >
        <button ref={closeRef} type="button" className="x" aria-label="Fechar" onClick={close}>
          <X aria-hidden="true" />
        </button>
        <Brand />
        <span className="tag">{mode === 'login' ? 'INICIAR SESSÃO' : 'CRIAR CONTA'}</span>
        <h2 id="auth-title">
          {mode === 'login' ? 'Bem-vindo de volta.' : 'Comece sua jornada na InovaPro.'}
        </h2>
        <button
          type="button"
          className="oauth"
          onClick={signInWithGoogle}
          disabled={loading}
        >
          <span aria-hidden="true">G</span>
          Continuar com Google
        </button>
        <div className="authDivider" aria-hidden="true">
          <span>ou</span>
        </div>
        {mode === 'signup' && (
          <input
            aria-label="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome"
            autoComplete="name"
            required
          />
        )}
        <input
          aria-label="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail"
          type="email"
          autoComplete="email"
          required
        />
        {mode === 'signup' && (
          <input
            aria-label="Celular ou WhatsApp"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Celular / WhatsApp"
            type="tel"
            autoComplete="tel"
            required
          />
        )}
        <input
          aria-label="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Senha"
          type="password"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          minLength={6}
          required
        />
        {mode === 'login' && (
          <button type="button" className="authTextButton" onClick={requestPasswordReset} disabled={loading}>
            Esqueci minha senha
          </button>
        )}
        {mode === 'signup' && (
          <label className="legalCheck">
            <input
              type="checkbox"
              checked={legalAccepted}
              onChange={(e) => setLegalAccepted(e.target.checked)}
            />
            <span>
              Li e concordo com os <a href="./termos" target="_blank" rel="noreferrer">Termos de Uso</a> e o{' '}
              <a href="./privacidade" target="_blank" rel="noreferrer">Aviso de Privacidade</a>.
            </span>
          </label>
        )}
        {error && (
          <p className="authError" role="alert">
            {error}
          </p>
        )}
        {message && (
          <p className="authSuccess" role="status">
            {message}
          </p>
        )}
        <button className="primary full" disabled={loading}>
          {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}{' '}
          {!loading && <ArrowRight aria-hidden="true" />}
        </button>
        {mode === 'signup' && (
          <small className="authLegal">
            Ao criar a conta, seus dados serão usados para autenticação e funcionamento do
            aplicativo. Preferências de comunicação comercial serão tratadas separadamente.
          </small>
        )}
      </form>
    </div>
  )
}

function mapSessionUser(user: User): SessionUser {
  const fullName =
    typeof user.user_metadata?.full_name === 'string'
      ? user.user_metadata.full_name
      : typeof user.user_metadata?.name === 'string'
        ? user.user_metadata.name
        : undefined
  const avatarUrl =
    typeof user.user_metadata?.avatar_url === 'string'
      ? user.user_metadata.avatar_url
      : typeof user.user_metadata?.picture === 'string'
        ? user.user_metadata.picture
        : undefined
  return { id: user.id, email: user.email, fullName, avatarUrl }
}

function WebsiteApp() {
  const [section, setSection] = useState<Section>('inicio')
  const [auth, setAuth] = useState<null | AuthMode>(null)
  const [user, setUser] = useState<SessionUser | null>(null)
  const [checking, setChecking] = useState(true)
  const [sessionError, setSessionError] = useState(false)
  const [sessionAttempt, setSessionAttempt] = useState(0)
  const [recoveringPassword, setRecoveringPassword] = useState(false)
  const retrySession = useCallback(() => {
    setChecking(true)
    setSessionError(false)
    setSessionAttempt((value) => value + 1)
  }, [])
  useEffect(() => {
    let mounted = true
    void (async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) throw error
        if (!mounted) return
        const u = data.session?.user
        setUser(u ? mapSessionUser(u) : null)
      } catch {
        if (mounted) {
          setUser(null)
          setSessionError(true)
        }
      } finally {
        if (mounted) setChecking(false)
      }
    })()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const u = session?.user
      setUser(u ? mapSessionUser(u) : null)
      if (event === 'PASSWORD_RECOVERY') setRecoveringPassword(true)
    })
    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [sessionAttempt])
  async function exit() {
    await supabase.auth.signOut()
    setUser(null)
  }
  if (checking)
    return (
      <div className="boot">
        <InfinityMark />
        <span>Carregando InovaPro...</span>
      </div>
    )
  if (sessionError)
    return (
      <div className="boot" role="alert">
        <InfinityMark />
        <strong>Não foi possível verificar sua sessão.</strong>
        <span>Confira sua conexão e tente novamente.</span>
        <button className="secondary" onClick={retrySession}>
          Tentar novamente
        </button>
      </div>
    )
  if (user)
    return (
      <>
        <Dashboard user={user} exit={exit} />
        {recoveringPassword && <PasswordRecovery close={() => setRecoveringPassword(false)} />}
      </>
    )
  return (
    <div>
      <Header section={section} setSection={setSection} auth={setAuth} />
      <main className="main">
        {section === 'inicio' && <Home setSection={setSection} auth={setAuth} />}{' '}
        {section === 'solucoes' && <Solutions />}
        {section === 'conteudos' && <Contents />}
        {section === 'quem-somos' && <About />}
        {section === 'faq' && <FAQ />}
      </main>
      <footer>
        <Brand />
        <div className="footerLinks">
          <a href="./privacidade">Privacidade</a>
          <a href="./termos">Termos</a>
          <small>© 2026 InovaPro Systems.</small>
        </div>
      </footer>
      {auth && <Auth mode={auth} close={() => setAuth(null)} />}
    </div>
  )
}

export default function App() {
  if (window.location.pathname.endsWith('/privacidade')) return <Privacy />
  if (window.location.pathname.endsWith('/termos')) return <Terms />
  return <WebsiteApp />
}
