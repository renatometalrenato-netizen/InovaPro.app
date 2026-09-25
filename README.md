# InovaPro.app

Aplicação **web oficial, mobile-first**, do ecossistema digital da **INOVAPRO SYSTEMS**.

> **Conectando você ao mundo.**

Princípios oficiais:

- **Entender primeiro. Vender depois.**
- **Problema primeiro. Tecnologia depois. Resultado sempre.**

## Papel deste repositório

Este repositório é a **fonte canônica da aplicação web** da INOVAPRO SYSTEMS.

Ele **não** é o projeto Android nativo do Google AI Studio e **não** deve receber código Kotlin/Jetpack Compose.

Mapa oficial dos repositórios: [docs/ECOSYSTEM.md](docs/ECOSYSTEM.md).

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

Credenciais privadas, chaves administrativas e segredos de provedores de IA devem permanecer exclusivamente no backend/Edge Functions.

## Integrações externas ainda dependentes de configuração

- Google OAuth: validação final de Site URL e Redirect URLs no painel Supabase
- Instagram/Meta: token, conta/tester, assinatura de webhook e teste ponta a ponta
- WhatsApp Business: credenciais, webhook, coexistência/migração e templates
- provedor de IA principal: segredo server-side do provedor escolhido
- proteção de senha vazada do Supabase: depende de disponibilidade/configuração do plano

O estado técnico detalhado está em [docs/OPERATIONAL_STATUS.md](docs/OPERATIONAL_STATUS.md).

## Governança

Para evitar divergência entre projetos:

1. mudanças da aplicação web entram neste repositório;
2. mudanças do Android nativo entram em `InovaPro-AIStudio-Google`;
3. artefatos Expo/React Native e empacotamento operacional permanecem nos repositórios auxiliares correspondentes;
4. nomes públicos da marca devem usar **INOVAPRO SYSTEMS** e **Nova AI**;
5. segredos nunca devem ser versionados.
