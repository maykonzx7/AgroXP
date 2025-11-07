# Plano de Desenvolvimento - AgroXP

Este arquivo organiza as tasks necessárias para transformar o repositório em um projeto full e funcional (frontend ⇄ backend ⇄ banco). Inclui milestones, tarefas prioritárias, estimativas e critérios de aceitação.

## Visão geral

- Stack: Frontend (Vite, React, TypeScript, Tailwind), Backend (Node, Express, Sequelize, Postgres), API Gateway (Express + http-proxy-middleware).
- Objetivo: remover dados estáticos do frontend, conectar todos os módulos ao backend, adicionar infração mínima (Docker Compose), migrations/seeders, autenticação, testes e CI.

---

## Milestone A — Preparação e infra mínima (1-2 dias)

Tarefa A1: Adicionar `.env.example` para frontend, backend e api-gateway

- Descrição: Criar arquivos `.env.example` com variáveis de ambiente padrão seguras para cada módulo (frontend, backend, api-gateway).
- Owner: dev
- Estimativa: 1h
- Critério de aceitação: 
  - Arquivos `.env.example` presentes em cada pacote com variáveis necessárias listadas
  - Valores default seguros e explicativos
  - README atualizado com instruções de cópia e preenchimento dos arquivos `.env`

Tarefa A2: Criar `docker-compose.yml` básico

- Descrição: Compose com Postgres, backend, api-gateway e frontend (serve em dev). Volumes para DB, rede interna, health checks.
- Owner: dev
- Estimativa: 4h
- Critério de aceitação: 
  - `docker compose up --build` inicia todos os serviços
  - Backend conecta ao Postgres com sucesso
  - Frontend acessa backend via api-gateway
  - Volumes persistentes para dados do Postgres
  - Serviços configurados com redes internas apropriadas

Tarefa A3: Documentação de execução local

- Descrição: README com comandos para rodar com e sem Docker, incluindo setup de ambiente e execução de testes.
- Estimativa: 1h
- Critério de aceitação:
  - README atualizado com instruções detalhadas para execução local (sem Docker)
  - README com instruções detalhadas para execução com Docker
  - Inclusão de comandos para setup de ambiente, build, execução e testes
  - Informações sobre portas utilizadas e como acessar cada serviço

---

## Milestone B — Integração Frontend ⇄ Backend (3-5 dias)

Tarefa B1: Padronizar API Base URL

- Descrição: Garantir `VITE_API_BASE_URL` no frontend e `API_BASE_URL` exportado por `src/lib/api.js`. Centralizar chamadas HTTP em um módulo comum.
- Estimativa: 1h
- Critério de aceitação:
  - Nenhum componente usa URL hardcoded
  - Todas as chamadas usam helpers em `src/lib/api.js`
  - Variável de ambiente VITE_API_BASE_URL configurada e utilizada corretamente
  - Módulo de API centralizado com interceptors para adicionar headers (como autorização) se necessário

Tarefa B2: Criar hooks consumindo API (react-query)

- Itens: `useParcels`, `useCrops`, `useLivestock`, `useInventory`, `useFinance`, `useUsers`, `useReports`.
- Estimativa: 1-2 dias
- Critério de aceitação:
  - Cada hook implementa loading/error states corretamente
  - Hooks utilizam caching, refetch e staleTime adequados
  - Cada hook é usado nas páginas correspondentes
  - Configuração inicial do react-query com QueryClient e QueryClientProvider
  - Manipulação apropriada de erros de rede e cache

Tarefa B3: Migrar `use-crm-context` para usar hooks dinâmicos

- Descrição: Em vez de dados estáticos, o contexto deve orquestrar fetches via react-query ou delegar aos hooks.
- Estimativa: 1 dia
- Critério de aceitação:
  - Ao abrir uma página, dados reais do backend são exibidos (testar Parcels/Livestock/Crops)
  - Contexto delega chamadas aos hooks apropriados
  - Estado global é gerenciado de forma apropriada via react-query
  - Dados em cache são utilizados para evitar chamadas desnecessárias

Tarefa B4: Implementar tratamento de erros de rede

- Descrição: Criar componente de erro global e tratamento de erros de rede nas chamadas à API.
- Estimativa: 1 dia
- Critério de aceitação:
  - Componente de exibição de erros de rede implementado
  - Feedback adequado ao usuário em caso de falhas de conexão
  - Tentativas de retry configuradas para falhas temporárias
  - Logs adequados para debug em ambiente de desenvolvimento

---

## Milestone C — Banco de Dados e Deploy seguro (2-4 dias)

Tarefa C1: Introduzir Migrations & Seeders (Sequelize)

- Descrição: Configurar `sequelize-cli` / scripts e criar migrations iniciais para Parcel, Crop, Livestock, Inventory, Finance.
- Estimativa: 1-2 dias
- Critério de aceitação:
  - `sequelize-cli` instalado e configurado corretamente
  - Arquivo de configuração do Sequelize criado (`config/config.json` ou equivalente)
  - Migrations criadas para todas as entidades principais (Parcel, Crop, Livestock, Inventory, Finance, User)
  - Seeders criados com dados de exemplo realistas
  - `npx sequelize db:migrate` cria as tabelas com sucesso
  - `npx sequelize db:seed:all` popula dados de exemplo corretamente
  - Estrutura de diretórios apropriada para migrations e seeders implementada

Tarefa C2: Reavaliar `sequelize.sync({ alter: true })`

- Descrição: Remover em produção; manter apenas em dev com variável `NODE_ENV`.
- Estimativa: 1h
- Critério de aceitação:
  - Método `sequelize.sync()` removido ou condicionalmente usado apenas em ambiente de desenvolvimento
  - Sistema de migrations usado em produção em vez de sync
  - Variável de ambiente NODE_ENV usada para controlar o comportamento de sincronização

Tarefa C3: Criar modelos Sequelize com relacionamentos

- Descrição: Implementar modelos do Sequelize com validações, associações e hooks necessários.
- Estimativa: 1 dia
- Critério de aceitação:
  - Modelos criados para todas as entidades com tipagem adequada
  - Relacionamentos definidos entre as entidades (um para muitos, muitos para muitos)
  - Validações implementadas nos modelos para garantir integridade dos dados
  - Hooks implementados para operações especiais (criptografia de senha, por exemplo)
  - Modelos consistentes com as migrations correspondentes

Tarefa C4: Configurar ambiente de desenvolvimento do banco de dados

- Descrição: Certificar-se que o ambiente de desenvolvimento tem as configurações adequadas para o banco de dados.
- Estimativa: 1h
- Critério de aceitação:
  - Configurações de ambiente diferentes para desenvolvimento, teste e produção
  - Scripts de setup para criar o banco de dados local
  - Processo documentado para inicialização do banco em diferentes ambientes

---

## Milestone D — Autenticação, Segurança e Observabilidade (2-4 dias)

Tarefa D1: Implementar autenticação JWT

- Descrição: Endpoints de login, registro, refresh token e middleware `authenticate`. Gateway ou cada serviço valida token.
- Estimativa: 1-2 dias
- Critério de aceitação:
  - Endpoints de autenticação criados (login, registro, logout, refresh token)
  - Middleware de autenticação implementado para proteger rotas
  - Tokens JWT assinados com segredo seguro e tempo de expiração adequado
  - Refresh token com mecanismo de rotação e armazenamento seguro
  - Rotas protegidas retornam 401 sem token e 200 com token válido
  - Implementação de blacklist para refresh tokens em logout
  - Armazenamento seguro de tokens no frontend (httpOnly cookies ou localStorage com precauções)

Tarefa D2: Implementar autorização e controle de acesso

- Descrição: Criar sistema de papéis e permissões para controlar o acesso às funcionalidades.
- Estimativa: 1 dia
- Critério de aceitação:
  - Modelos de User, Role e Permission criados
  - Middleware de autorização baseado em papéis/permissões
  - Verificação de permissões em endpoints críticos
  - Implementação de controle de acesso em nível de recurso (por usuário ou organização)

Tarefa D3: Harden CORS, rate limiting e validação

- Descrição: Configurar políticas de segurança para proteger contra ataques comuns.
- Estimativa: 1 dia
- Critério de aceitação:
  - Configuração de CORS com origens específicas permitidas
  - Rate limiting implementado para prevenir abusos
  - Validação de entrada de dados em todos os endpoints
  - Sanitização de entradas para prevenir injeção de SQL e XSS
  - Headers de segurança adicionados (Helmet.js ou similar)

Tarefa D4: Logs estruturados e health checks

- Descrição: Implementar sistema de logging estruturado e endpoints de health check.
- Estimativa: 1 dia
- Critério de aceitação:
  - Sistema de logging estruturado com biblioteca apropriada (Winston, Pino, etc.)
  - Log de eventos importantes (autenticação, operações críticas, erros)
  - Endpoint de health check para monitoramento de disponibilidade
  - Logs separados por níveis (info, warn, error)
  - Configuração de logging para diferentes ambientes

---

## Milestone E — Testes e CI/CD (2-3 dias)

Tarefa E1: Testes backend (Jest + supertest)

- Descrição: Cobrir endpoints CRUD críticos, testes unitários para modelos e serviços.
- Estimativa: 1-2 dias
- Critério de aceitação:
  - Testes unitários para todos os modelos do Sequelize
  - Testes de integração para endpoints CRUD (criação, leitura, atualização, deleção)
  - Testes de autenticação e autorização
  - Cobertura mínima de 70% para funcionalidades críticas
  - Testes de validação de entrada e tratamento de erros
  - Ambiente de teste configurado para não afetar banco de dados de desenvolvimento

Tarefa E2: Testes frontend (Vitest + React Testing Library)

- Descrição: Testes unitários para hooks, componentes e integração com API.
- Estimativa: 1 dia
- Critério de aceitação:
  - Testes unitários para hooks customizados (useParcels, useCrops, etc.)
  - Testes de renderização e interação para componentes principais
  - Testes de integração para fluxos de usuário
  - Mocking adequado de chamadas à API
  - Cobertura mínima de 70% para componentes críticos

Tarefa E3: Pipeline GitHub Actions

- Descrição: Configurar pipeline completo de CI com lint, build, test e deployment opcional.
- Estimativa: 1 dia
- Critério de aceitação:
  - Workflow de CI configurado para rodar testes em todos os PRs
  - Verificação de linting e formatação de código
  - Build e testes para frontend e backend
  - Opcionais: build de imagens Docker e deployment para staging
  - Notificações de status do pipeline
  - Cache de dependências para otimizar tempo de build

Tarefa E4: Configuração de ambiente de teste

- Descrição: Configurar bancos de dados e serviços separados para testes.
- Estimativa: 1h
- Critério de aceitação:
  - Banco de dados de teste separado para não afetar dados de desenvolvimento
  - Configurações de ambiente específicas para testes
  - Processo de setup e teardown automático para testes de integração
  - Scripts para execução de testes locais e em CI

---

## Tasks complementares e melhorias contínuas

- OpenAPI/Swagger: Documentar API com especificação OpenAPI e interface Swagger UI.
- Observability: Prometheus/Grafana/Tracing para produção.
- E2E: Playwright para fluxos críticos de usuário.
- Performance: caching, compressão, e análise de bundle do frontend.
- Documentação de API: Documentar endpoints da API com exemplos de requisição/resposta.
- Segurança: Auditoria de segurança e scanning de dependências.
- Estrutura de projetos: Padronizar estrutura de arquivos e convenções de nomenclatura.
- Gerenciamento de estado: Avaliar e implementar solução de gerenciamento de estado global se necessário (Redux, Zustand, etc.).
- Internacionalização (i18n): Implementar suporte a múltiplos idiomas.
- Acessibilidade: Verificar e implementar conformidade com padrões de acessibilidade (WCAG).
- Monitoramento: Implementar sistema de monitoramento e alertas para serviços críticos.

---

## Dependências e riscos

- Dependências: Postgres, Docker (para compose), variáveis env, credenciais.
- Riscos: Mudar schema em produção sem migrations; multimanifests sem sincronização entre microservices.

---

## Milestone F — Melhorias e otimizações (opcional)

Tarefa F1: Documentação da API com Swagger

- Descrição: Configurar Swagger/OpenAPI para documentar endpoints da API.
- Estimativa: 1 dia
- Critério de aceitação:
  - Documentação interativa disponível via Swagger UI
  - Todos os endpoints documentados com exemplos de requisição e resposta
  - Atualização automática com base nas implementações

Tarefa F2: Internacionalização (i18n)

- Descrição: Implementar sistema de internacionalização para suportar múltiplos idiomas.
- Estimativa: 1-2 dias
- Critério de aceitação:
  - Sistema de tradução configurado no frontend
  - Conteúdo internacionalizado em inglês e português
  - Detecção automática de idioma do usuário

Tarefa F3: Acessibilidade

- Descrição: Verificar e implementar conformidade com padrões de acessibilidade (WCAG).
- Estimativa: 1 dia
- Critério de aceitação:
  - Componentes verificados quanto à acessibilidade
  - Implementação de ARIA labels e roles onde necessário
  - Testes com leitores de tela

Tarefa F4: Performance e otimização

- Descrição: Implementar estratégias de otimização de performance no frontend e backend.
- Estimativa: 1-2 dias
- Critério de aceitação:
  - Lazy loading de componentes no frontend
  - Estratégias de caching configuradas (HTTP, Redis opcional)
  - Análise e otimização do bundle do frontend
  - Paginação e otimização de queries no backend

## Como eu posso ajudar agora

Escolha um item para eu implementar automaticamente:

- `A2` Criar `docker-compose.yml` mínimo
- `B2` Criar hooks react-query skeleton
- `B3` Migrar `use-crm-context` para usar hooks
- `C1` Escrever migrations + seeders iniciais

Indique qual prefere e eu começo imediatamente.
