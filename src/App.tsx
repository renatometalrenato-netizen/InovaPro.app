import { FormEvent, useEffect, useState } from 'react'
import { ArrowRight, BarChart3, BrainCircuit, BriefcaseBusiness, Building2, ChevronRight, CircleHelp, Instagram, Menu, MessageCircle, Rocket, Search, Sparkles, TrendingUp, Workflow, X } from 'lucide-react'
import { supabase } from './supabase'

type Section='inicio'|'solucoes'|'conteudos'|'quem-somos'|'faq'
type AuthMode='login'|'signup'
type SessionUser={id:string,email?:string}
const services=[
 [Instagram,'Redes sociais e presença digital','Posicionamento, conteúdo e presença digital com propósito.'],
 [TrendingUp,'Marketing e vendas','Estratégias para atrair, atender e transformar oportunidades em clientes.'],
 [Workflow,'Gestão e processos','Mais clareza, organização e eficiência para a rotina do negócio.'],
 [BrainCircuit,'IA e automação','Tecnologia aplicada quando ela realmente resolve um problema.'],
 [MessageCircle,'WhatsApp e atendimento','Organização da comunicação e da experiência do cliente.'],
 [BarChart3,'Indicadores do negócio','Ferramentas para entender custos, margem, CMV e outros números importantes.'],
] as const
const faqs=[
 ['A InovaPro atende apenas empresas grandes?','Não. A proposta é atender desde quem está começando a empreender até negócios mais estruturados, considerando o momento e a necessidade real de cada negócio.'],
 ['Preciso saber qual serviço contratar?','Não. Você pode começar explicando o problema. A NOVA foi pensada para ajudar a organizar o contexto antes de recomendar um próximo passo.'],
 ['A NOVA substitui o atendimento humano?','Não. A NOVA apoia diagnóstico, orientação e organização. Quando necessário, o atendimento pode ser encaminhado com o contexto já reunido.'],
 ['Tudo no aplicativo já está funcionando?','Esta é uma versão em desenvolvimento. Recursos ainda não conectados são apresentados como demonstração.'],
] as const
function InfinityMark(){return <span className="infinity">∞</span>}
function Brand(){return <div className="brand"><InfinityMark/><div><strong>inovapro</strong><span>SYSTEMS</span><small>Conectando você ao mundo.</small></div></div>}
function Header({section,setSection,auth}:{section:Section,setSection:(x:Section)=>void,auth:(x:AuthMode)=>void}){
 const [open,setOpen]=useState(false)
 const nav=(id:Section,label:string)=><button className={section===id?'active':''} onClick={()=>{setSection(id);setOpen(false);scrollTo(0,0)}}>{label}</button>
 return <header><button className="brandBtn" onClick={()=>setSection('inicio')}><Brand/></button><div className="desktop">{nav('inicio','Início')}{nav('solucoes','Soluções')}{nav('conteudos','Conteúdos')}{nav('quem-somos','Quem somos')}{nav('faq','FAQ')}</div><div className="actions"><button className="login" onClick={()=>auth('login')}>Iniciar sessão</button><button className="create desktopCreate" onClick={()=>auth('signup')}>Criar conta</button><button className="menu" onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button></div>{open&&<div className="mobile">{nav('inicio','Início')}{nav('solucoes','Soluções')}{nav('conteudos','Conteúdos')}{nav('quem-somos','Quem somos')}{nav('faq','FAQ')}<button className="create" onClick={()=>auth('signup')}>Criar conta</button></div>}</header>
}
function Home({setSection,auth}:{setSection:(x:Section)=>void,auth:(x:'signup')=>void}){
 return <><section className="hero"><div><span className="tag"><Sparkles/> ESTRATÉGIA • DIGITAL • TECNOLOGIA</span><h1>Seu negócio conectado a <em>novas possibilidades.</em></h1><p>A InovaPro Systems conecta estratégia, comunicação, marketing, gestão e tecnologia para ajudar negócios a entender problemas, encontrar oportunidades e evoluir com mais clareza.</p><div className="buttons"><button className="primary" onClick={()=>auth('signup')}>Conversar com a NOVA <ArrowRight/></button><button className="secondary" onClick={()=>setSection('solucoes')}>Conhecer soluções</button></div><small className="slogan">Conectando você ao mundo.</small></div><div className="nova"><InfinityMark/><strong>NOVA</strong><span>Assistente estratégica da InovaPro</span><p>Conte o que está acontecendo. Eu começo pelo problema.</p></div></section><section className="what"><span className="tag">O QUE FAZEMOS</span><h2>Um ecossistema para diferentes momentos do negócio.</h2><p>Da presença nas redes sociais à organização de processos, automação e inteligência artificial. A tecnologia entra como meio — não como ponto de partida.</p><div className="strip">{services.slice(0,4).map(([I,t])=><article key={t}><I/><strong>{t}</strong></article>)}</div><button className="link" onClick={()=>setSection('solucoes')}>Ver todas as áreas <ArrowRight/></button></section><section className="novaIntro"><div className="novaMark"><InfinityMark/></div><div><span className="tag">CONHEÇA A NOVA</span><h2>Você não precisa chegar sabendo o nome da solução.</h2><p>A NOVA foi criada para entender o contexto primeiro. Em vez de começar oferecendo uma ferramenta, ela ajuda a identificar o que realmente precisa de atenção e qual pode ser o próximo passo.</p><button className="secondary" onClick={()=>auth('signup')}>Falar com a NOVA</button></div></section></>
}
function Solutions(){return <section className="page"><span className="tag">SOLUÇÕES</span><h1>O problema vem antes da <em>ferramenta.</em></h1><p className="lead">A InovaPro reúne diferentes competências para construir uma resposta proporcional à necessidade e ao momento de cada negócio.</p><div className="grid">{services.map(([I,t,d])=><article key={t}><I/><h3>{t}</h3><p>{d}</p></article>)}</div></section>}
function Contents(){return <section className="page"><span className="tag">CONTEÚDOS</span><h1>Aprender para <em>decidir melhor.</em></h1><p className="lead">Conteúdos objetivos para traduzir gestão, marketing, vendas e tecnologia para a realidade do negócio.</p><div className="grid"><article><h3>CRM: eu realmente preciso de um?</h3><p>Entenda quando um CRM ajuda e quando ele só adiciona complexidade.</p></article><article><h3>Instagram bonito vende?</h3><p>A diferença entre estética, posicionamento, conteúdo e conversão.</p></article><article><h3>CMV sem complicação</h3><p>Por que vender bastante não significa necessariamente ter lucro.</p></article></div><small className="notice">Biblioteca em desenvolvimento.</small></section>}
function About(){return <section className="page"><span className="tag">QUEM SOMOS</span><h1>Estratégia e tecnologia com <em>propósito.</em></h1><p className="lead">A InovaPro Systems é uma empresa de soluções estratégicas, digitais, comerciais e tecnológicas. O trabalho parte da compreensão do negócio e do problema antes da escolha de ferramentas.</p><div className="principle"><InfinityMark/><div><span className="tag">PRINCÍPIO</span><h2>Entender primeiro.<br/>Recomendar depois.</h2><p>Comunicação, presença digital, vendas, atendimento, gestão, processos, automação e inteligência artificial podem trabalhar de forma conectada.</p></div></div></section>}
function FAQ(){const [o,setO]=useState(0);return <section className="page"><span className="tag">FAQ</span><h1>Perguntas <em>frequentes.</em></h1><div className="faq">{faqs.map(([q,a],i)=><button key={q} onClick={()=>setO(o===i?-1:i)}><strong>{q}<b>{o===i?'−':'+'}</b></strong>{o===i&&<p>{a}</p>}</button>)}</div></section>}

function Auth({mode,close}:{mode:AuthMode,close:()=>void}){
 const [name,setName]=useState('')
 const [phone,setPhone]=useState('')
 const [email,setEmail]=useState('')
 const [password,setPassword]=useState('')
 const [loading,setLoading]=useState(false)
 const [message,setMessage]=useState('')
 const [error,setError]=useState('')
 async function submit(e:FormEvent){
  e.preventDefault(); setLoading(true); setMessage(''); setError('')
  try{
   if(mode==='signup'){
    if(!name.trim()||!phone.trim()){setError('Preencha seu nome e celular / WhatsApp.');return}
    const {data,error}=await supabase.auth.signUp({
     email:email.trim(),password,
     options:{emailRedirectTo:window.location.origin+window.location.pathname,data:{full_name:name.trim(),phone:phone.trim()}}
    })
    if(error)throw error
    if(data.session) close()
    else setMessage('Conta criada. Enviamos um link de confirmação para o seu e-mail. Confirme o endereço antes de entrar.')
   }else{
    const {error}=await supabase.auth.signInWithPassword({email:email.trim(),password})
    if(error)throw error
    close()
   }
  }catch(err){setError(err instanceof Error?err.message:'Não foi possível concluir. Tente novamente.')}
  finally{setLoading(false)}
 }
 return <div className="back" onClick={close}><form className="modal" onSubmit={submit} onClick={e=>e.stopPropagation()}><button type="button" className="x" onClick={close}><X/></button><Brand/><span className="tag">{mode==='login'?'INICIAR SESSÃO':'CRIAR CONTA'}</span><h2>{mode==='login'?'Bem-vindo de volta.':'Comece sua jornada na InovaPro.'}</h2>{mode==='signup'&&<input value={name} onChange={e=>setName(e.target.value)} placeholder="Nome" autoComplete="name" required/>}<input value={email} onChange={e=>setEmail(e.target.value)} placeholder="E-mail" type="email" autoComplete="email" required/>{mode==='signup'&&<input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Celular / WhatsApp" type="tel" autoComplete="tel" required/>}<input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Senha" type="password" autoComplete={mode==='login'?'current-password':'new-password'} minLength={6} required/>{error&&<p className="authError">{error}</p>}{message&&<p className="authSuccess">{message}</p>}<button className="primary full" disabled={loading}>{loading?'Aguarde...':mode==='login'?'Entrar':'Criar conta'} {!loading&&<ArrowRight/>}</button>{mode==='signup'&&<small className="authLegal">Ao criar a conta, seus dados serão usados para autenticação e funcionamento do aplicativo. Preferências de comunicação comercial serão tratadas separadamente.</small>}</form></div>
}

function DemoApp({user,exit}:{user:SessionUser,exit:()=>void}){
 return <div className="demo"><header><Brand/><div className="sessionActions"><small>{user.email}</small><button className="login" onClick={exit}>Sair</button></div></header><main><span className="tag">INÍCIO</span><h1>O que você quer <em>melhorar</em> no seu negócio?</h1><p className="lead">Sua sessão está conectada ao Supabase. Agora podemos evoluir o perfil e o Meu Negócio sobre esta base.</p><div className="goals">{[[TrendingUp,'Quero vender mais'],[Workflow,'Quero organizar meu negócio'],[Instagram,'Quero melhorar minhas redes'],[BarChart3,'Quero entender meus números'],[Rocket,'Estou começando'],[CircleHelp,'Não sei do que preciso']].map(([I,t]:any)=><button key={t}><I/><strong>{t}</strong><ChevronRight/></button>)}</div><div className="demoNova"><InfinityMark/><div><span className="tag">NOVA</span><h2>Não sabe por onde começar?</h2><p>Conte o que está acontecendo. A NOVA começa pelo problema.</p></div></div></main></div>
}

export default function App(){
 const [section,setSection]=useState<Section>('inicio')
 const [auth,setAuth]=useState<null|AuthMode>(null)
 const [user,setUser]=useState<SessionUser|null>(null)
 const [checking,setChecking]=useState(true)
 useEffect(()=>{
  supabase.auth.getSession().then(({data})=>{const u=data.session?.user;setUser(u?{id:u.id,email:u.email}:null);setChecking(false)})
  const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>{const u=session?.user;setUser(u?{id:u.id,email:u.email}:null)})
  return ()=>subscription.unsubscribe()
 },[])
 async function exit(){await supabase.auth.signOut();setUser(null)}
 if(checking)return <div className="boot"><InfinityMark/><span>Carregando InovaPro...</span></div>
 if(user)return <DemoApp user={user} exit={exit}/>
 return <div><Header section={section} setSection={setSection} auth={setAuth}/><main className="main">{section==='inicio'&&<Home setSection={setSection} auth={setAuth}/>} {section==='solucoes'&&<Solutions/>}{section==='conteudos'&&<Contents/>}{section==='quem-somos'&&<About/>}{section==='faq'&&<FAQ/>}</main><footer><Brand/><small>© 2026 InovaPro Systems.</small></footer>{auth&&<Auth mode={auth} close={()=>setAuth(null)}/>}</div>
}
