# WhatsApp Business + Nova AI — Coexistência

## Objetivo

Conectar o número oficial da INOVAPRO SYSTEMS à Nova AI sem remover o número do aplicativo WhatsApp Business.

Modo esperado:

- WhatsApp Business App continua ativo no celular;
- o mesmo número é conectado à WhatsApp Cloud API;
- Nova AI recebe mensagens pelo webhook;
- conversas, contatos, leads e handoffs são registrados no Supabase;
- mensagens enviadas manualmente pelo app são reconhecidas por `smb_message_echoes` para evitar duplicidade de resposta da IA.

## Estado atual

### Meta

- App: **Nova AI — InovaPro Systems**
- Caso de uso WhatsApp adicionado.
- Webhook validado.
- Callback:
  `https://tygksrzhqqjsltmycvxp.supabase.co/functions/v1/nova-ai-meta-webhook`
- O fluxo tradicional de adicionar o número não deve ser usado porque o número já está ativo no WhatsApp Business App.
- A ativação final depende do **WhatsApp Embedded Signup / coexistência**.
- Pendências públicas de configuração:
  - Meta App ID
  - Embedded Signup Configuration ID

Nunca versionar ou registrar em documentação:

- Meta App Secret;
- Access Token;
- System User Token;
- chave administrativa do backend;
- segredos de ambiente.

## Supabase

Projeto:

`tygksrzhqqjsltmycvxp`

### Edge Functions

#### nova-ai-meta-webhook

Responsabilidades:

- handshake do webhook da Meta;
- validação de assinatura Meta;
- WhatsApp inbound;
- Instagram inbound;
- criação/atualização de contato;
- criação de conversa;
- lead scoring;
- diagnóstico;
- resposta da Nova AI;
- outbox;
- handoff;
- follow-up;
- suporte a `smb_message_echoes` para coexistência.

#### nova-whatsapp-onboarding

Responsabilidades:

- receber o código temporário do Meta Embedded Signup;
- validar a sessão autenticada do usuário;
- trocar o código por credencial no backend;
- identificar WABA e Phone Number ID;
- inscrever o app na WABA;
- salvar a conexão em `nova_meta_connections`.

O frontend nunca deve receber o App Secret nem o token persistente.

### Tabela nova

`public.nova_meta_connections`

Armazena o vínculo técnico da Meta/WhatsApp para uso exclusivo do backend.

- RLS habilitado;
- acesso de `anon` e `authenticated` negado;
- índice de `user_id`;
- credencial usada somente pelo backend/service role.

## Frontend

Branch:

`feat/whatsapp-coexistence`

PR:

`#5`

Foi criado o componente:

`src/WhatsAppConnect.tsx`

Ele:

- carrega o SDK oficial da Meta;
- inicia Embedded Signup;
- usa `featureType: whatsapp_business_app_onboarding`;
- envia o código temporário ao backend;
- mostra sucesso/erro ao usuário;
- não contém segredos.

Variáveis públicas necessárias no build:

```
VITE_META_APP_ID=
VITE_META_WHATSAPP_CONFIG_ID=
```

Esses dois IDs são públicos. Não confundir com App Secret.

## Critérios para conclusão

Antes do merge definitivo:

1. WhatsApp Embedded Signup disponível na Meta.
2. App ID configurado.
3. Configuration ID configurado.
4. Número oficial conectado em coexistência.
5. WhatsApp Business App continua funcional no celular.
6. Mensagem de outro número chega ao webhook.
7. Nova AI responde pela Cloud API.
8. Contato é criado/atualizado em `nova_contacts`.
9. Conversa aparece em `nova_conversations`.
10. Mensagem aparece em `nova_messages`.
11. Lead aparece/atualiza em `nova_leads`.
12. Mensagem manual enviada pelo WhatsApp Business App é capturada como echo e não gera resposta duplicada.
13. Pedido de humano cria handoff.
14. Opt-out cancela follow-ups.
15. TypeScript, lint, testes, build e secret scan verdes.
16. Só então fazer merge do PR.

## Regra operacional

ANALISAR → CONFIGURAR → TESTAR → VALIDAR → CORRIGIR → DOCUMENTAR → MERGE

Não migrar o número pelo fluxo tradicional e não desconectar o WhatsApp Business App.
