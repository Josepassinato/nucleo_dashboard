# QA Test Plan - User Journey

## Fase 1: Autenticação e Login

### Teste 1.1: Página de Login
- [ ] Página carrega sem erros
- [ ] Botão "Login com Manus" está visível
- [ ] Botão redireciona para OAuth
- [ ] Redirecionamento funciona
- [ ] Usuário consegue fazer login

### Teste 1.2: Após Login
- [ ] Usuário é redirecionado para dashboard
- [ ] Nome do usuário aparece no header
- [ ] Botão de logout está visível
- [ ] Logout funciona e redireciona para login

## Fase 2: Navegação e Layout

### Teste 2.1: Header/Navigation
- [ ] Logo está visível
- [ ] Título do app aparece
- [ ] Menu de navegação funciona
- [ ] Links de navegação funcionam
- [ ] Responsive em mobile

### Teste 2.2: Sidebar (se existir)
- [ ] Sidebar carrega
- [ ] Itens de menu são clicáveis
- [ ] Ativo/inativo está correto
- [ ] Collapse/expand funciona

### Teste 2.3: Footer
- [ ] Footer carrega sem erros
- [ ] Links funcionam
- [ ] Responsivo em mobile

## Fase 3: Dashboard e Métricas

### Teste 3.1: HeroBlock
- [ ] Componente carrega
- [ ] Receita exibe corretamente (R$ 0 ou valor real)
- [ ] Crescimento exibe corretamente
- [ ] Assinaturas exibem corretamente
- [ ] Ícone de tendência aparece

### Teste 3.2: StatusCards
- [ ] Card 1 (MRR) carrega e exibe dados
- [ ] Card 2 (Saúde do Negócio) carrega e exibe dados
- [ ] Card 3 (Status do Sistema) carrega e exibe dados
- [ ] Valores formatados corretamente
- [ ] Loading states funcionam

### Teste 3.3: Gráficos (se existirem)
- [ ] Gráficos carregam
- [ ] Dados exibem corretamente
- [ ] Legendas aparecem
- [ ] Responsivo em mobile

## Fase 4: Funcionalidades de Agentes e Ações

### Teste 4.1: OrganizationalChart
- [ ] Componente carrega
- [ ] Exibe placeholder ou dados reais
- [ ] Sem erros no console
- [ ] Responsivo

### Teste 4.2: ActionTimeline
- [ ] Componente carrega
- [ ] Exibe placeholder ou dados reais
- [ ] Sem erros no console
- [ ] Responsivo

### Teste 4.3: ExecutionMonitor (se existir)
- [ ] Componente carrega
- [ ] Auto-refresh funciona
- [ ] WebSocket/Polling funciona
- [ ] Status atualiza em tempo real

## Fase 5: Formulários e Inputs

### Teste 5.1: Onboarding (se existir)
- [ ] Formulário carrega
- [ ] Campos aceitam input
- [ ] Validação funciona
- [ ] Submit funciona
- [ ] Mensagens de sucesso/erro aparecem

### Teste 5.2: Outros Formulários
- [ ] Todos os formulários carregam
- [ ] Inputs funcionam
- [ ] Validação funciona
- [ ] Submit funciona

## Fase 6: Integração com Backend

### Teste 6.1: API Calls
- [ ] Chamadas tRPC funcionam
- [ ] Dados carregam corretamente
- [ ] Erros são tratados
- [ ] Loading states aparecem
- [ ] Sem erros 404 ou 500

### Teste 6.2: Autenticação na API
- [ ] Usuário autenticado consegue acessar endpoints protegidos
- [ ] Usuário não autenticado é redirecionado
- [ ] Token JWT funciona

## Fase 7: Erros e Edge Cases

### Teste 7.1: Tratamento de Erros
- [ ] Erros de rede são tratados
- [ ] Erros de validação são mostrados
- [ ] Erros 500 são tratados
- [ ] Mensagens de erro são claras

### Teste 7.2: Edge Cases
- [ ] Página funciona com dados vazios
- [ ] Página funciona com muitos dados
- [ ] Timeout é tratado
- [ ] Sem dados duplicados

## Fase 8: Performance e UX

### Teste 8.1: Performance
- [ ] Página carrega em < 3 segundos
- [ ] Interações são responsivas
- [ ] Sem lag ou jank
- [ ] Sem memory leaks

### Teste 8.2: UX
- [ ] Botões têm feedback visual
- [ ] Hover states funcionam
- [ ] Focus states visíveis
- [ ] Acessibilidade básica OK

## Fase 9: Mobile e Responsividade

### Teste 9.1: Mobile (375px)
- [ ] Layout adapta corretamente
- [ ] Texto legível
- [ ] Botões clicáveis
- [ ] Sem scroll horizontal

### Teste 9.2: Tablet (768px)
- [ ] Layout adapta corretamente
- [ ] Sem problemas de espaçamento

### Teste 9.3: Desktop (1920px)
- [ ] Layout adapta corretamente
- [ ] Sem elementos muito espaçados

## Fase 10: Browser Compatibility

### Teste 10.1: Chrome/Edge
- [ ] Funciona sem erros
- [ ] Sem warnings no console

### Teste 10.2: Firefox
- [ ] Funciona sem erros
- [ ] Sem warnings no console

### Teste 10.3: Safari
- [ ] Funciona sem erros
- [ ] Sem warnings no console

## Bugs Encontrados

| ID | Descrição | Severidade | Status |
|---|---|---|---|
| BUG-001 | [Descrever] | [ ] | [ ] |
| BUG-002 | [Descrever] | [ ] | [ ] |

## Notas

- [ ] Todos os testes completados
- [ ] Todos os bugs corrigidos
- [ ] Pronto para deploy
