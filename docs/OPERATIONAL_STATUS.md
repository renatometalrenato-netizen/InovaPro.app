# Estado operacional — InovaPro Systems / Nova AI

Atualizado em 25 de setembro de 2026.

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
- Páginas `/privacidade` e `/termos` criadas, com marketing opcional e recomendação de revisão jurídica.
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
- O progresso não concluído do questionário é preservado localmente por negócio para evitar perda ao navegar/recarregar; o rascunho é removido após conclusão bem-sucedida.
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
- `nova-ai-admin` está ativa na versão 4, com `verify_jwt=true`.
- `nova-ai-web-chat` está ativa na versão 3, com `verify_jwt=true` e carregamento server-side de credencial administrativa endurecido.
- A função administrativa agora aceita leitura via POST para o aplicativo, suporta resposta humana em conversas web e reativa a Nova AI quando um handoff é resolvido/cancelado.
- Advisor de segurança aponta somente **Leaked Password Protection Disabled**.
- Índices recém-criados marcados como não usados foram preservados; ainda não há tráfego suficiente para justificar remoção.

## Autenticação

- Login por e-mail e senha permanece ativo via Supabase Auth.
- Entrada por Google OAuth foi adicionada ao frontend usando `signInWithOAuth` e o `VITE_APP_URL` como redirect.
- Recuperação de senha por e-mail e definição de nova senha após evento `PASSWORD_RECOVERY` foram implementadas.
- Cadastro exige aceite explícito dos Termos de Uso e Aviso de Privacidade, sem acoplar consentimento de marketing.
- A ativação ponta a ponta ainda depende de validar o provider Google, Site URL e Redirect URLs no painel do Supabase.

## Integrações ainda não classificadas como produção

- Instagram: permissões aprovadas no setup, mas token, tester, conta conectada, assinatura de webhook e fluxo real ainda precisam de validação ponta a ponta.
- WhatsApp: número, coexistência/migração, token, permissões, webhook e templates ainda precisam de validação. Nenhuma migração irreversível foi executada.
- Follow-ups: processamento manual seguro foi exposto somente para administradores; scheduler automático e mensagens fora da janela segura continuam bloqueados até confirmação de política/template do provedor.
- Painel admin: interface restrita implementada no próprio InovaPro.app, com resumo operacional, fila de handoffs, contexto, histórico, assumir/resolver/cancelar e resposta humana.

## Atendimento humano

- Usuários presentes e ativos em `nova_admin_users` recebem a aba **Operação** dentro da área autenticada.
- Handoffs web podem ser assumidos e respondidos no app sem depender da API Meta.
- Ao assumir um handoff, respostas automáticas ficam desativadas; ao resolver ou cancelar, a Nova AI volta ao estado `AI_ACTIVE`.
- O cliente pode atualizar a conversa da Nova AI para receber mensagens humanas que chegaram durante o handoff.

## Bloqueios externos

- A configuração de Site URL e Redirect URLs no painel Supabase exige autenticação da conta.
- A proteção de senhas vazadas deve ter custo/disponibilidade do plano confirmados antes de ativação.
