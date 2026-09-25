# Deploy oficial — INOVAPRO SYSTEMS

Este documento define como a aplicação web `InovaPro.app` deve ser publicada sem criar divergência entre GitHub Pages e Vercel.

## Fonte canônica

- Repositório: `renatometalrenato-netizen/InovaPro.app`
- Branch principal: `main`
- Stack: React 19 + TypeScript + Vite 7
- Backend/Auth: Supabase
- Assistente: Nova AI

## Estratégia de deploy

O projeto continua compatível com GitHub Pages e fica preparado para Vercel.

### GitHub Pages

Usa o script padrão:

```bash
npm run build
```

O `vite.config.ts` mantém o base path `/InovaPro.app/`, necessário para o deploy atual no GitHub Pages.

### Vercel

Usa:

```bash
npm run build:vercel
```

Esse script executa o mesmo TypeScript + Vite, mas força `--base=/`, evitando que o deploy na Vercel tente carregar assets em `/InovaPro.app/`.

O arquivo `vercel.json` também:

- fixa o framework como Vite;
- usa `dist` como diretório de saída;
- aplica fallback de SPA para `index.html`.

## Variáveis públicas esperadas

Na Vercel, configure apenas valores publicáveis no frontend:

- `VITE_APP_URL`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Nunca adicionar ao frontend:

- chaves administrativas do banco
- tokens privados
- chaves secretas de IA
- qualquer credencial com privilégio elevado

## Governança

1. Vercel publica somente a aplicação web `InovaPro.app`.
2. Android nativo não deve ser implantado pela Vercel.
3. Código Expo/React Native auxiliar não deve ser confundido com a aplicação web.
4. O GitHub continua sendo a fonte técnica canônica.
5. O Figma Design System Oficial continua sendo a fonte visual canônica.
6. Toda mudança de produção deve passar por validação de tipos, lint, testes, build e verificação de segredos antes do merge.
