# Mapa oficial do ecossistema GitHub — INOVAPRO SYSTEMS

Este documento define a responsabilidade de cada repositório para evitar duplicidade, divergência e alterações no projeto errado.

## 1. `InovaPro.app` — aplicação web oficial

**Papel:** fonte canônica da plataforma web mobile-first.

**Tecnologias:** React 19, TypeScript, Vite, Supabase, GitHub Actions e GitHub Pages.

**Recebe:** interface web, autenticação web, diagnóstico, Nova AI web, painel operacional web e Edge Functions relacionadas ao app web.

**Não recebe:** código Android Kotlin/Jetpack Compose.

---

## 2. `InovaPro-AIStudio-Google` — aplicativo Android nativo

**Papel:** fonte canônica do aplicativo Android desenvolvido no ecossistema Google AI Studio.

**Tecnologias observadas no repositório:** Gradle, Kotlin/Android e estrutura `app/`.

**Recebe:** código Android nativo, configuração Gradle e integrações próprias do app Android.

**Não recebe:** código React/Vite da aplicação web.

---

## 3. `InovaPro-AIStudio` — integração e empacotamento Expo/React Native + backend

**Papel:** repositório operacional de integração, reconstrução e empacotamento de artefatos.

O repositório contém um bundle mobile e automações que:
- reconstroem o projeto mobile;
- executam testes;
- geram projeto Android via Expo prebuild;
- constroem APK;
- reconstroem o backend operacional empacotado para Railway.

**Importante:** este repositório não substitui o Android nativo em Kotlin e não é a fonte canônica da aplicação web.

---

## 4. `InovaPro.` — repositório auxiliar de bundles

**Papel:** repositório auxiliar contendo bundles mobile/backend e automação de build de APK.

O nome atual termina com um ponto. Isso é mantido por enquanto para não alterar URLs, integrações ou automações sem uma migração controlada.

**Importante:** não deve ser tratado como fonte canônica da web ou do Android nativo.

---

## Identidade oficial

- **Empresa:** INOVAPRO SYSTEMS
- **Aplicação:** InovaPro.app
- **Assistente oficial:** Nova AI
- **Slogan:** Conectando você ao mundo.
- **Princípio:** Entender primeiro. Vender depois.
- **Execução:** Problema primeiro. Tecnologia depois. Resultado sempre.

## Regra de decisão

Antes de qualquer alteração, identificar primeiro o destino:

- Web → `InovaPro.app`
- Android nativo → `InovaPro-AIStudio-Google`
- Expo/React Native / empacotamento → `InovaPro-AIStudio`
- Bundle auxiliar → `InovaPro.`

Quando houver dúvida, não duplicar implementação em mais de um repositório.
