import { useState } from 'react'
import {
  Home, Compass, Sparkles, BriefcaseBusiness, Building2, ArrowRight,
  TrendingUp, Workflow, Instagram, Calculator, Rocket, CircleHelp,
  BookOpen, Bot, ChevronRight, Search, CheckCircle2, MessageCircle
} from 'lucide-react'

type Page = 'inicio' | 'explorar' | 'nova' | 'solucoes' | 'negocio'

const goals = [
  { icon: TrendingUp, title: 'Quero vender mais', text: 'Encontre gargalos e próximos passos para transformar atenção em vendas.' },
  { icon: Workflow, title: 'Quero organizar meu negócio', text: 'Processos, atendimento, clientes e rotina mais claros.' },
  { icon: Instagram, title: 'Quero melhorar minhas redes', text: 'Posicionamento, conteúdo, consistência e conversão.' },
  { icon: Calculator, title: 'Quero entender meus números', text: 'CMV, margem, preço e capital de giro em linguagem simples.' },
  { icon: Rocket, title: 'Estou começando', text: 'Descubra o que realmente precisa agora — sem gastar à toa.' },
  { icon: CircleHelp, title: 'Não sei do que preciso', text: 'A NOVA faz perguntas e ajuda a identificar o problema primeiro.' },
]

const explore = [
  ['Marketing & Vendas', 'Descubra como atrair, converter e acompanhar clientes.'],
  ['Redes Sociais', 'Instagram, conteúdo, posicionamento e presença digital.'],
  ['Gestão & Processos', 'Organize o que hoje depende da memória e da correria.'],
  ['Financeiro', 'Entenda custos, margem, CMV e capital de giro.'],
  ['WhatsApp & Atendimento', 'Melhore conversas, organização e experiência do cliente.'],
  ['Automação & IA', 'Use tecnologia quando ela realmente resolver um problema.'],
]

function InfinityMark({small=false}:{small?:boolean}) {
  return <span className={small ? 'infinity small' : 'infinity'}>∞</span>
}

function Header() {
  return <header>
    <div className="brand">
      <InfinityMark small />
      <div><strong>inovapro</strong><span>SYSTEMS</span></div>
    </div>
    <button className="iconBtn" aria-label="Pesquisar"><Search size={20}/></button>
  </header>
}

function HomePage({go}:{go:(p:Page)=>void}) {
  return <>
    <section className="hero">
      <div className="eyebrow"><Sparkles size={15}/> Inteligência para negócios reais</div>
      <h1>O que você quer <span>melhorar</span> no seu negócio?</h1>
      <p>Você não precisa saber o nome da ferramenta. Comece pelo problema e a InovaPro ajuda a encontrar o próximo passo.</p>
      <button className="primary" onClick={()=>go('nova')}>Conversar com a NOVA <ArrowRight size={18}/></button>
      <div className="hero-orbit orbit-a"></div><div className="hero-orbit orbit-b"></div>
    </section>

    <section>
      <div className="sectionHead"><div><span className="kicker">COMECE POR AQUI</span><h2>Qual situação parece com a sua?</h2></div></div>
      <div className="goalGrid">
        {goals.map(({icon:Icon,title,text})=><button className="goalCard" key={title} onClick={()=>go(title.includes('Não sei')?'nova':'explorar')}>
          <span className="goalIcon"><Icon size={21}/></span><strong>{title}</strong><p>{text}</p><ChevronRight size={18} className="chev"/>
        </button>)}
      </div>
    </section>

    <section className="learnCard">
      <div className="learnIcon"><BookOpen/></div>
      <div><span className="kicker">APRENDA E APLIQUE</span><h3>Conhecimento que termina em ação</h3>
      <p>Conteúdos curtos explicam o conceito. Depois você pode testar no seu próprio negócio com ferramentas e diagnósticos.</p></div>
      <button onClick={()=>go('explorar')}>Explorar conteúdos <ArrowRight size={17}/></button>
    </section>

    <section className="novaBanner">
      <InfinityMark/>
      <div><span className="kicker">NOVA • ASSISTENTE ESTRATÉGICA</span><h3>Não sabe por onde começar?</h3>
      <p>Conte o que está acontecendo. A NOVA procura entender antes de recomendar qualquer solução.</p></div>
      <button onClick={()=>go('nova')}>Falar com a NOVA</button>
    </section>
  </>
}

function ExplorePage(){
  return <section className="page">
    <span className="kicker">EXPLORAR</span><h1>Encontre pelo <span>problema</span>, não pelo jargão.</h1>
    <p className="lead">Escolha uma área ou descreva o que está acontecendo no seu negócio.</p>
    <div className="searchBox"><Search size={19}/><span>Ex.: “vendo, mas não sobra dinheiro”</span></div>
    <div className="listGrid">{explore.map(([t,d])=><article className="listCard" key={t}><div><h3>{t}</h3><p>{d}</p></div><ChevronRight/></article>)}</div>
  </section>
}

function NovaPage(){
  return <section className="page novaPage">
    <div className="novaCore"><InfinityMark/><span>NOVA</span></div>
    <span className="kicker">ENTENDER PRIMEIRO. RECOMENDAR DEPOIS.</span>
    <h1>O que está acontecendo no seu negócio?</h1>
    <div className="chat">
      <div className="bubble novaBubble"><strong>NOVA</strong><p>Você não precisa saber se precisa de CRM, automação ou marketing. Me conte o problema do seu jeito. Eu começo por aí.</p></div>
      <div className="quick">
        <button>Estou vendendo pouco</button><button>Meu negócio está desorganizado</button>
        <button>Quero melhorar meu Instagram</button><button>Não sei por onde começar</button>
      </div>
      <div className="inputFake"><span>Conte o que está acontecendo...</span><button><ArrowRight size={19}/></button></div>
      <small>Interface demonstrativa • A integração de IA será conectada em uma próxima etapa.</small>
    </div>
  </section>
}

function SolutionsPage(){
  return <section className="page">
    <span className="kicker">SOLUÇÕES</span><h1>Da necessidade à <span>solução certa.</span></h1>
    <p className="lead">Nem todo problema precisa de um projeto grande. A solução deve ser proporcional ao momento do negócio.</p>
    <div className="steps">
      <div><b>01</b><span>Entender</span><p>O problema vem antes da ferramenta.</p></div>
      <div><b>02</b><span>Diagnosticar</span><p>Dados e contexto ajudam a separar sintoma de causa.</p></div>
      <div><b>03</b><span>Resolver</span><p>Orientação, solução expressa ou projeto profissional.</p></div>
    </div>
    <div className="solutionCard"><div><span className="pill">COMEÇANDO</span><h3>InovaPro Express</h3><p>Soluções menores, objetivas e acessíveis para necessidades específicas.</p></div><ArrowRight/></div>
    <div className="solutionCard"><div><span className="pill">CRESCIMENTO</span><h3>Soluções profissionais</h3><p>Estratégia e execução para desafios que exigem mais profundidade.</p></div><ArrowRight/></div>
    <div className="solutionCard"><div><span className="pill">PERSONALIZADO</span><h3>Projetos integrados</h3><p>Processos, automação, IA e tecnologia trabalhando em conjunto.</p></div><ArrowRight/></div>
  </section>
}

function BusinessPage(){
  return <section className="page">
    <span className="kicker">MEU NEGÓCIO</span><h1>Seu negócio, visto como um <span>sistema.</span></h1>
    <p className="lead">Conforme você usa diagnósticos e projetos, esta área passa a reunir contexto, evolução e próximos passos.</p>
    <div className="xray">
      <div className="xrayHead"><div><h3>Raio-X do meu negócio</h3><p>Visão inicial das áreas analisadas.</p></div><Building2/></div>
      {['Marketing','Vendas','Financeiro','Atendimento','Processos','Presença digital'].map((x,i)=>
        <div className="status" key={x}><span>{x}</span><span className={i<2?'done':i===2?'attention':'pending'}>{i<2?<><CheckCircle2 size={15}/> Analisado</>:i===2?'Atenção':'Não analisado'}</span></div>
      )}
    </div>
    <div className="emptyProject"><BriefcaseBusiness/><h3>Seus projetos aparecerão aqui</h3><p>Compra, onboarding, arquivos, etapas, aprovações e entregas ficarão organizados em um só lugar.</p></div>
  </section>
}

const nav = [
  ['inicio','Início',Home],['explorar','Explorar',Compass],['nova','NOVA',Bot],['solucoes','Soluções',BriefcaseBusiness],['negocio','Meu Negócio',Building2]
] as const

export default function App(){
  const [page,setPage]=useState<Page>('inicio')
  return <div className="app">
    <Header/>
    <main>
      {page==='inicio'&&<HomePage go={setPage}/>}
      {page==='explorar'&&<ExplorePage/>}
      {page==='nova'&&<NovaPage/>}
      {page==='solucoes'&&<SolutionsPage/>}
      {page==='negocio'&&<BusinessPage/>}
    </main>
    {page!=='nova'&&<button className="floatingNova" onClick={()=>setPage('nova')} aria-label="Falar com a NOVA"><InfinityMark small/><span>Quer entender isso melhor?</span></button>}
    <nav>{nav.map(([id,label,Icon])=><button key={id} className={page===id?'active':''} onClick={()=>setPage(id as Page)}>
      <span className={id==='nova'?'novaNav':''}>{id==='nova'?<InfinityMark small/>:<Icon size={20}/>}</span><small>{label}</small>
    </button>)}</nav>
  </div>
}
