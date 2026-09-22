#!/usr/bin/env bash
# Barreira simples contra vazamento de credenciais e artefatos binarios.
# Roda sobre os arquivos versionados, ignorando node_modules e dist.
set -uo pipefail

falhas=0

arquivos=$(git ls-files | grep -vE '^(node_modules|dist)/' || true)

reprovar() {
  echo "::error::$1"
  falhas=1
}

# 1. Arquivos que nunca devem ser versionados
while IFS= read -r f; do
  case "$f" in
    .env.example|*/.env.example)
      # Template documentado, sem credenciais reais.
      ;;
    .env|.env.*|*/.env|*/.env.*)
      reprovar "Arquivo de ambiente versionado: $f" ;;
    *.zip|*.tar|*.tar.gz|*.tgz|*.rar|*.7z)
      reprovar "Artefato binario versionado: $f" ;;
    *.pem|*.key|*.p12|*.pfx)
      reprovar "Arquivo de chave versionado: $f" ;;
  esac
done <<< "$arquivos"

# 2. Padroes de credencial dentro do codigo
padroes=(
  'service_role'
  'sb_secret_'
  'SUPABASE_SERVICE_ROLE'
  'eyJhbGciOi'
  'EAA[A-Za-z0-9]\{30,\}'
  'ghp_[A-Za-z0-9]\{30,\}'
  'github_pat_[A-Za-z0-9_]\{30,\}'
)

textuais=$(echo "$arquivos" | grep -iE '\.(ts|tsx|js|jsx|json|html|css|md|yml|yaml|sh|toml|sql)$' || true)

for p in "${padroes[@]}"; do
  if [ -n "$textuais" ]; then
    achados=$(echo "$textuais" | xargs -r grep -nI -- "$p" 2>/dev/null \
      | grep -v 'verificar-segredos.sh' || true)
    if [ -n "$achados" ]; then
      reprovar "Possivel credencial exposta (padrao: $p)"
      echo "$achados" | head -5
    fi
  fi
done

if [ "$falhas" -ne 0 ]; then
  echo ""
  echo "Validacao de segredos reprovada. Remova o item apontado e, se um segredo"
  echo "real foi exposto, rotacione a credencial antes de seguir."
  exit 1
fi

echo "Validacao de segredos aprovada: nenhum arquivo proibido e nenhum padrao de credencial encontrado."
