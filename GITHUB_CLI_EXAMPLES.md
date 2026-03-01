# GitHub CLI - Exemplos Práticos de Uso

## 🚀 Comandos Essenciais

### 1. **Verificar Status do Repositório**

```bash
# Ver informações do repositório
gh repo view Josepassinato/nucleo_dashboard

# Saída esperada:
# Josepassinato/nucleo_dashboard
# Dashboard executivo interativo para monitoramento...
# https://github.com/Josepassinato/nucleo_dashboard
```

### 2. **Gerenciar Commits**

```bash
# Ver últimos 5 commits
gh api repos/Josepassinato/nucleo_dashboard/commits \
  -q '.[] | "\(.commit.author.date | split("T")[0]) | \(.commit.message | split("\n")[0])"' \
  | head -5

# Ver commit específico
gh api repos/Josepassinato/nucleo_dashboard/commits/6a6814e \
  -q '.commit | "\(.author.name) - \(.message)"'
```

### 3. **Gerenciar Branches**

```bash
# Listar branches
gh api repos/Josepassinato/nucleo_dashboard/branches \
  -q '.[] | .name'

# Criar novo branch
git checkout -b feature/nova-feature
git push user_github feature/nova-feature

# Deletar branch
git push user_github --delete feature/nova-feature
```

### 4. **Criar Pull Requests**

```bash
# Criar PR
gh pr create \
  --title "Implementar nova feature" \
  --body "Descrição detalhada da mudança" \
  --repo Josepassinato/nucleo_dashboard

# Listar PRs
gh pr list --repo Josepassinato/nucleo_dashboard

# Verificar status de PR específico
gh pr view 1 --repo Josepassinato/nucleo_dashboard
```

### 5. **Gerenciar Issues**

```bash
# Criar issue
gh issue create \
  --title "Bug: Logout não funciona" \
  --body "Descrição do problema" \
  --repo Josepassinato/nucleo_dashboard

# Listar issues abertas
gh issue list --repo Josepassinato/nucleo_dashboard --state open

# Fechar issue
gh issue close 1 --repo Josepassinato/nucleo_dashboard
```

### 6. **Criar Releases**

```bash
# Criar release
gh release create v1.0.0 \
  --title "Version 1.0.0" \
  --notes "Production release com todas as features" \
  --repo Josepassinato/nucleo_dashboard

# Listar releases
gh release list --repo Josepassinato/nucleo_dashboard

# Ver release específica
gh release view v1.0.0 --repo Josepassinato/nucleo_dashboard
```

### 7. **Gerenciar Colaboradores**

```bash
# Listar colaboradores
gh api repos/Josepassinato/nucleo_dashboard/collaborators \
  -q '.[] | "\(.login) - \(.role)"'

# Adicionar colaborador
gh api repos/Josepassinato/nucleo_dashboard/collaborators/username \
  -X PUT -f permission=maintain
```

---

## 📊 Exemplos de Dados Obtidos

### Informações do Repositório

```json
{
  "nameWithOwner": "Josepassinato/nucleo_dashboard",
  "description": "Dashboard executivo interativo...",
  "url": "https://github.com/Josepassinato/nucleo_dashboard",
  "stargazerCount": 0,
  "forkCount": 0,
  "pushedAt": "2026-03-01T04:37:56Z"
}
```

### Últimos Commits

```
2026-03-01 | Checkpoint: Completed QA testing...
2026-03-01 | Checkpoint: QA testing completed...
2026-02-28 | Checkpoint: Pre-deployment checkpoint...
2026-02-28 | Rollback to 528ce7a0
2026-02-28 | Checkpoint: Remoção completa de dados mockados...
```

### Estatísticas do Projeto

```
Total de Commits: 24
Linhas de Código: 22.623
Contribuidores: 1 (Manus)
Último Push: 2026-03-01 04:37:56 UTC
```

---

## 🔧 Configuração Avançada

### 1. **Criar Workflow de CI/CD**

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '22'
      - run: pnpm install
      - run: pnpm test
      - run: pnpm build
```

### 2. **Configurar Branch Protection**

```bash
# Exigir PR review
gh api repos/Josepassinato/nucleo_dashboard/branches/main/protection \
  -X PUT \
  -f required_pull_request_reviews='{"required_approving_review_count":1}' \
  -f enforce_admins=true
```

### 3. **Adicionar Secrets para CI/CD**

```bash
# Adicionar secret
gh secret set DATABASE_URL --body "mysql://..." \
  --repo Josepassinato/nucleo_dashboard

# Listar secrets
gh secret list --repo Josepassinato/nucleo_dashboard
```

---

## 📈 Monitoramento e Analytics

### 1. **Ver Estatísticas de Commits**

```bash
# Commits por autor
git shortlog -sn

# Commits por dia
git log --format="%ad" --date=short | sort | uniq -c

# Arquivos mais modificados
git log --pretty=format: --name-only | sort | uniq -c | sort -rn | head -10
```

### 2. **Análise de Código**

```bash
# Linhas de código por linguagem
find . -name "*.tsx" -o -name "*.ts" | xargs wc -l | tail -1

# Arquivos maiores
find . -name "*.tsx" -o -name "*.ts" | xargs wc -l | sort -rn | head -10
```

---

## 🚀 Deployment Automático

### Opção 1: GitHub Actions → Vercel

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

### Opção 2: GitHub Actions → Custom Server

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install && npm run build
      - uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_KEY }}
          script: |
            cd /app/nucleo_dashboard
            git pull
            npm install
            npm run build
            pm2 restart app
```

---

## 📚 Recursos Adicionais

- [GitHub CLI Documentation](https://cli.github.com/manual)
- [GitHub API Reference](https://docs.github.com/en/rest)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)

---

## ✅ Checklist de Boas Práticas

- [ ] Commits com mensagens descritivas
- [ ] Usar branches para novas features
- [ ] Criar PRs antes de mergear
- [ ] Adicionar testes antes de commitar
- [ ] Manter README.md atualizado
- [ ] Usar semantic versioning para releases
- [ ] Documentar breaking changes
- [ ] Revisar código antes de mergear
- [ ] Usar GitHub Actions para CI/CD
- [ ] Monitorar issues e PRs regularmente
