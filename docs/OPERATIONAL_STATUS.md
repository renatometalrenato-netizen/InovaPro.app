# Estado operacional — InovaPro Systems / Nova AI

Atualizado em 21 de setembro de 2026.

## Aplicativo web

- Área autenticada agora carrega perfil e negócio reais do Supabase, respeitando RLS por usuário.
- Onboarding de perfil/negócio criado sobre as tabelas existentes `profiles` e `businesses`, sem novo schema.
- Dashboard autenticado exibe contexto do negócio, estágio, objetivo e entrada para atualização.
- Dashboard também carrega o diagnóstico mais recente, mostra pontuação/pilar prioritário e deixa esse contexto explícito antes de abrir a Nova AI.
- Foto e nome do provedor OAuth são aproveitados quando disponíveis nos metadados autorizados do usuário.

- Boot de autenticação tolerante a falhas, com encerramento garantido do carregamento e retry.
- URL pública do app e configuração pública do Supabase via variáveis `VITE_*`.
- Error Boundary global e recuperação amigável em produção.
- Modal de autenticação com foco inicial, Escape, retorno de foco e focus trap.
- Menu e FAQ com estados ARIA.
- Nome visível padronizado como **Nova AI**; identificadores técnicos não foram alterados.
- Página `/privacidade` criada com marketing opcional e recomendação de revisão jurídica.
- Metadados básicos de SEO e compartilhamento adicionados. `og:image`, `twitter:image` e favicon aguardam ativo oficial para não criar uma marca não aprovada.

## Qualidade e CI

- Node 22 definido em `.nvmrc` e `package.json`.
- ESLint, TypeScript ESLint, React Hooks, Prettier, Vitest e Testing Library configurados.
- PR valida instalação, tipos, lint, testes, build e segredos.
- Deploy e validação padronizados nas versões oficiais atuais das GitHub Actions.
- Bundle medido em 456,44 kB (132,36 kB gzip). Otimização adiada até existirem rotas/componentes com ganho claro de divisão.

## Diagnóstico InovaPro 360°

- Motor determinístico implementado no aplicativo com os 7 pilares oficiais: Estratégia, Marca & Comunicação, Marketing, Vendas, Processos, Tecnologia & IA e Gestão & Crescimento.
- Resultado calculado exclusivamente a partir das respostas do usuário; a Nova AI não inventa pontuação.
- Histórico persistido por negócio em `business_diagnostics`, com RLS por usuário.
- Resultado destaca um pilar prioritário e um próximo passo, sem paywall na interpretação básica.

## Nova AI no aplicativo

- Chat web autenticado conectado por Edge Function `nova-ai-web-chat`.
- Contexto do perfil, negócio e diagnóstico mais recente é carregado no backend.
- Histórico de conversa é persistido nas tabelas Nova existentes.
- Pedidos de proposta, orçamento, reunião, contratação ou atendimento humano abrem handoff para a equipe.
- Quando um provedor de IA server-side não estiver configurado/disponível, a função responde com fallback consultivo explícito e seguro.

## Supabase

- Projeto `tygksrzhqqjsltmycvxp` está `ACTIVE_HEALTHY` na região `sa-east-1`.
- As tabelas públicas operacionais estão presentes e com RLS ativo.
- `nova-ai-meta-webhook` está ativa na versão 5, com `verify_jwt=false` intencional.
- `nova-ai-admin` está ativa na versão 3, com `verify_jwt=true`.
- Advisor de segurança aponta somente **Leaked Password Protection Disabled**.
- Índices recém-criados marcados como não usados foram preservados; ainda não há tráfego suficiente para justificar remoção.

## Autenticação

- Login por e-mail e senha permanece ativo via Supabase Auth.
- Entrada por Google OAuth foi adicionada ao frontend usando `signInWithOAuth` e o `VITE_APP_URL` como redirect.
- A ativação ponta a ponta ainda depende de validar o provider Google, Site URL e Redirect URLs no painel do Supabase.

## Integrações ainda não classificadas como produção

- Instagram: permissões aprovadas no setup, mas token, tester, conta conectada, assinatura de webhook e fluxo real ainda precisam de validação ponta a ponta.
- WhatsApp: número, coexistência/migração, token, permissões, webhook e templates ainda precisam de validação. Nenhuma migração irreversível foi executada.
- Follow-ups: infraestrutura existe, mas scheduler e conformidade de janela/template precisam ser confirmados antes da ativação.
- Painel admin: Edge Function existe; interface Lovable/GitHub ainda precisa de comparação antes de sincronização.

## Bloqueios externos

- A configuração de Site URL e Redirect URLs no painel Supabase exige autenticação da conta.
- A proteção de senhas vazadas deve ter custo/disponibilidade do plano confirmados antes de ativação.
