# InovaPro.app

Aplicativo mobile-first do ecossistema digital da **InovaPro Systems**.

**Conectando você ao mundo.**

Princípios:

- **Entender primeiro. Vender depois.**
- **Problema primeiro. Tecnologia depois. Resultado sempre.**

## Stack oficial

- React 19
- TypeScript
- Vite 7
- Supabase Auth
- Supabase PostgreSQL + RLS
- Supabase Edge Functions
- GitHub Actions
- GitHub Pages

## Recursos já implementados

- site institucional mobile-first
- cadastro e login por e-mail/senha
- entrada com Google via Supabase Auth
- recuperação e redefinição de senha
- perfil e Meu Negócio persistidos no Supabase
- onboarding contextual
- Diagnóstico InovaPro 360° determinístico com 7 pilares
- histórico de diagnósticos e progresso salvo
- Nova AI autenticada com contexto de perfil, negócio e diagnóstico
- histórico de conversa
- handoff para atendimento humano
- painel restrito de operação para administradores
- processamento manual seguro de follow-ups
- páginas de Privacidade e Termos de Uso
- testes, lint, typecheck, build e verificação de segredos em Pull Requests

## Desenvolvimento local

```bash
npm ci
npm run dev
```

Validação completa:

```bash
npm run lint
npm test -- --run
npm run build
npx tsc --noEmit
```

## Configuração pública

O frontend utiliza somente configurações publicáveis:

- `VITE_APP_URL`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Credenciais privadas e chaves de provedores de IA permanecem no backend/Edge Functions.

## Integrações externas ainda dependentes de configuração

- Google OAuth: validação final de Site URL e Redirect URLs no painel Supabase
- Instagram/Meta: token, conta/tester, assinatura de webhook e teste ponta a ponta
- WhatsApp Business: credenciais, webhook, coexistência/migração e templates
- provedor de IA principal: segredo server-side do provedor escolhido
- proteção de senha vazada do Supabase: depende de disponibilidade/configuração do plano

O estado técnico detalhado está em `docs/OPERATIONAL_STATUS.md`.
