# Núcleo Ventures - Todo List

## Melhorias Sugeridas (QA)

- [x] Implementar Loading Skeleton para Admin Dashboard
- [x] Implementar Email Notifications para Pagamentos
- [x] Adicionar Exportação de Relatórios em PDF
- [x] Criar Página FAQ para Troubleshooting
- [x] Implementar Analytics para Rastrear Conversões

## Melhorias Estratégicas (Retenção & Growth)

- [x] Expandir Schema do Banco de Dados (user_segments, onboarding_progress, churn_predictions)
- [x] Implementar Onboarding Interativo com Vídeos (Quick Wins Checklist)
- [ ] Implementar Segmentação de Usuários (Free Trial, Starter, Pro, Enterprise, Churned)
- [ ] Implementar Cohort Analysis (retenção por data de signup, plano inicial)
- [ ] Implementar Predictive Churn (ML model, at-risk dashboard)
- [ ] Implementar Email Sequence de Onboarding (dias 1, 3, 7, 14)

## CEO ↔ CTO Agent System (Nova Feature)

- [x] Expandir Schema para CEO Directives, CTO Proposals, Executions
- [x] Criar CEO Chat Interface (texto + áudio)
- [x] Implementar CTO Agent com LLM (análise e proposta)
- [x] Criar Code Generation Engine
- [x] Implementar Testing & Deployment Automation
- [x] Criar Monitoring Dashboard em Tempo Real
- [x] Implementar Rollback Automático
- [x] Integrar e Testar End-to-End

## LLM Router Inteligente (Nova Feature)

- [x] Expandir Schema para LLM Routing e Analytics
- [x] Criar LLM Router Engine com Seleção Inteligente de Modelo
- [x] Implementar Cost & Performance Tracking (tRPC router)
- [x] Criar LLM Router Dashboard
- [ ] Testar e Publicar

## Features Concluídas

- [x] Autenticação OAuth com Manus
- [x] Landing Page com Pricing
- [x] Dashboard V1 (Premium Design)
- [x] Dashboard V2 (Ousado Design)
- [x] Onboarding Wizard (6 passos)
- [x] Integração Stripe (Checkout, Webhooks, Payments Page)
- [x] Admin Dashboard com Métricas (MRR, ARR, Churn, CAC, LTV)
- [x] Gráficos de Receita, Assinaturas, Churn, Distribuição
- [x] Controle de Acesso por Role (Admin/User)
- [x] Banco de Dados com Drizzle ORM
- [x] tRPC API com Procedures
- [x] GitHub Repository com v1.0.0 Release
- [x] QA Testing (43 testes, 100% sucesso)
- [x] Documentação Completa (Guias, API, Testes)


## Limpeza e QA (Prioridade Alta)

- [x] Remover dados mockados de todas as páginas (LLMRouterDashboard)
- [x] Corrigir botões que não funcionam (LandingPage footer links)
- [ ] Testar fluxos de navegação
- [ ] Validar formulários e inputs
- [ ] Testar integração com backend
- [ ] Verificar tratamento de erros

## Auto-Refresh ExecutionMonitor (Em Progresso)

- [x] Criar Hook Custom useExecutionMonitor com Polling
- [x] Implementar WebSocket Server para Execuções
- [x] Atualizar ExecutionMonitor com Auto-Refresh
- [x] Adicionar Indicadores de Status em Tempo Real (ExecutionStatusIndicator)
- [x] Criar Timeline Visual para Fases (ExecutionTimeline)
- [x] Escrever Testes Unitários (useExecutionMonitor, ExecutionStatusIndicator, ExecutionTimeline)
- [ ] Testar WebSocket em Produção
- [ ] Testar Polling Fallback
- [ ] Publicar

## Bug Fixes (Prioridade Alta)

- [x] Remover dados mockados do AdminDashboard (HeroBlock e DashboardV2)
- [x] Substituir por dados reais do banco de dados
- [ ] Testar dados com transações reais no banco de dados
