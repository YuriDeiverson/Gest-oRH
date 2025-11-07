# Documento de Arquitetura - Plataforma de Gestão para Grupos de Networking

## 📋 Sumário Executivo

Este documento descreve a arquitetura completa de uma plataforma web para digitalização e otimização da gestão de grupos de networking focados em geração de negócios. O sistema substitui planilhas e controles manuais por uma solução centralizada, escalável e eficiente.

## 🎯 Visão Geral

A plataforma foi projetada seguindo uma arquitetura cliente-servidor moderna, com separação clara entre frontend e backend, utilizando tecnologias consolidadas do ecossistema JavaScript/TypeScript.

### Stack Tecnológica

**Frontend:**

- React 19 com TypeScript
- Vite (build tool)
- React Router (navegação)
- Axios (HTTP client)
- Vitest + React Testing Library (testes)

**Backend:**

- Node.js 18+
- Express (framework web)
- TypeScript
- Prisma ORM
- SQLite (desenvolvimento) / PostgreSQL (produção)
- Jest + Supertest (testes)

---

## 1. Diagrama da Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                        │
│                                                                 │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐   │
│  │  Páginas    │  │ Componentes  │  │    Services        │   │
│  │             │  │              │  │                    │   │
│  │ - Home      │  │ - Forms      │  │ - intentionService │   │
│  │ - Admin     │  │ - Tables     │  │ - memberService    │   │
│  │ - Register  │  │ - Cards      │  │ - referralService  │   │
│  │ - Referrals │  │ - Modals     │  │                    │   │
│  └─────────────┘  └──────────────┘  └────────────────────┘   │
│                                              │                  │
│                                              │ HTTP/REST        │
└──────────────────────────────────────────────┼──────────────────┘
                                               │
                                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND API (Node.js)                      │
│                                                                 │
│  ┌──────────────┐  ┌─────────────┐  ┌──────────────────────┐  │
│  │   Routes     │─▶│ Controllers │─▶│   Prisma ORM         │  │
│  │              │  │             │  │                      │  │
│  │ /intentions  │  │ Intention   │  │  ┌─────────────┐    │  │
│  │ /members     │  │ Member      │  │  │  Database   │    │  │
│  │ /referrals   │  │ Referral    │  │  │             │    │  │
│  │ /meetings    │  │ Meeting     │  │  │  SQLite/    │    │  │
│  │ /payments    │  │ Payment     │  │  │  PostgreSQL │    │  │
│  └──────────────┘  └─────────────┘  │  │             │    │  │
│                                      │  └─────────────┘    │  │
│  ┌──────────────────────────────┐  │                      │  │
│  │       Middleware             │  └──────────────────────┘  │
│  │  - Authentication            │                            │
│  │  - Error Handler             │                            │
│  │  - CORS                      │                            │
│  │  - Validation                │                            │
│  └──────────────────────────────┘                            │
└─────────────────────────────────────────────────────────────────┘
```

### Comunicação

- **Protocolo:** HTTP/HTTPS
- **Formato:** JSON (REST API)
- **Autenticação:** Bearer Token (JWT em produção)
- **CORS:** Configurado para aceitar requisições do frontend

---

## 2. Modelo de Dados

### Escolha do Banco de Dados

**Opção Selecionada:** PostgreSQL (produção) / SQLite (desenvolvimento)

**Justificativa:**

- **Relacional:** Os dados possuem relacionamentos complexos (membros ↔ indicações ↔ reuniões)
- **Transações ACID:** Garantem integridade em operações críticas (aprovações, pagamentos)
- **Prisma ORM:** Facilita migrações, queries type-safe e manutenção
- **SQLite:** Simplifica desenvolvimento local sem necessidade de servidor de banco
- **PostgreSQL:** Escalável, robusto e preparado para produção

### Esquema do Banco de Dados

```prisma
// INTENÇÕES DE PARTICIPAÇÃO
model Intention {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  company   String
  reason    String
  status    IntentionStatus @default(PENDING)
  token     String?  @unique  // Token para cadastro após aprovação
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  member    Member?  // Relação 1:1 após cadastro completo
}

enum IntentionStatus {
  PENDING   // Aguardando análise
  APPROVED  // Aprovada pelo admin
  REJECTED  // Rejeitada
}

// MEMBROS DO GRUPO
model Member {
  id          String   @id @default(uuid())
  intentionId String   @unique
  intention   Intention @relation(fields: [intentionId], references: [id])

  // Dados pessoais
  phone       String
  linkedin    String?
  profession  String
  segment     String
  companyDescription String?

  // Status
  isActive    Boolean  @default(true)
  joinedAt    DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relações
  indicationsGiven    Referral[] @relation("GivenReferrals")
  indicationsReceived Referral[] @relation("ReceivedReferrals")
  meetingsAsHost      OneToOneMeeting[] @relation("HostMeetings")
  meetingsAsGuest     OneToOneMeeting[] @relation("GuestMeetings")
  presences           Presence[]
  thanks              Thank[]
  payments            Payment[]
}

// INDICAÇÕES DE NEGÓCIOS
model Referral {
  id          String   @id @default(uuid())
  giverId     String
  giver       Member   @relation("GivenReferrals", fields: [giverId], references: [id])
  receiverId  String
  receiver    Member   @relation("ReceivedReferrals", fields: [receiverId], references: [id])

  companyName String
  contactName String
  contactInfo String
  opportunity String
  status      ReferralStatus @default(NEW)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum ReferralStatus {
  NEW         // Nova indicação
  IN_CONTACT  // Em contato inicial
  NEGOTIATING // Em negociação
  CLOSED      // Fechada com sucesso
  REJECTED    // Não convertida
}

// REUNIÕES 1 A 1
model OneToOneMeeting {
  id        String   @id @default(uuid())
  hostId    String
  host      Member   @relation("HostMeetings", fields: [hostId], references: [id])
  guestId   String
  guest     Member   @relation("GuestMeetings", fields: [guestId], references: [id])
  date      DateTime
  notes     String?
  createdAt DateTime @default(now())
}

// REUNIÕES DO GRUPO
model Meeting {
  id          String   @id @default(uuid())
  title       String
  description String?
  date        DateTime
  createdAt   DateTime @default(now())
  presences   Presence[]
}

// CONTROLE DE PRESENÇA
model Presence {
  id        String   @id @default(uuid())
  meetingId String
  meeting   Meeting  @relation(fields: [meetingId], references: [id])
  memberId  String
  member    Member   @relation(fields: [memberId], references: [id])
  checkedIn Boolean  @default(false)
  checkedAt DateTime?

  @@unique([meetingId, memberId])
}

// AGRADECIMENTOS PÚBLICOS
model Thank {
  id          String   @id @default(uuid())
  memberId    String
  member      Member   @relation(fields: [memberId], references: [id])
  description String
  value       Float?   // Valor do negócio (opcional)
  createdAt   DateTime @default(now())
}

// AVISOS E COMUNICADOS
model Announcement {
  id        String   @id @default(uuid())
  title     String
  content   String
  priority  AnnouncementPriority @default(NORMAL)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum AnnouncementPriority {
  LOW
  NORMAL
  HIGH
  URGENT
}

// CONTROLE FINANCEIRO
model Payment {
  id             String   @id @default(uuid())
  memberId       String
  amount         Float
  dueDate        DateTime
  paidAt         DateTime?
  status         PaymentStatus @default(PENDING)
  referenceMonth String    // "2024-01"
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@index([memberId, referenceMonth])
}

enum PaymentStatus {
  PENDING
  PAID
  OVERDUE
  CANCELLED
}
```

### Relacionamentos Principais

1. **Intention → Member (1:1):** Uma intenção aprovada gera um membro
2. **Member → Referral (1:N):** Um membro pode dar/receber múltiplas indicações
3. **Member → OneToOneMeeting (N:N):** Membros participam de reuniões bilaterais
4. **Meeting → Presence (1:N):** Cada reunião tem múltiplas presenças
5. **Member → Thank (1:N):** Um membro pode registrar múltiplos agradecimentos
6. **Member → Payment (1:N):** Um membro tem múltiplas mensalidades

---

## 3. Estrutura de Componentes (Frontend)

### Organização de Pastas

```
frontend/
├── src/
│   ├── components/           # Componentes reutilizáveis
│   │   ├── IntentionForm.tsx
│   │   ├── AdminDashboard.tsx
│   │   ├── MemberRegistration.tsx
│   │   ├── ReferralManagement.tsx
│   │   ├── MemberCard.tsx
│   │   ├── ReferralCard.tsx
│   │   ├── MeetingList.tsx
│   │   └── PaymentTracker.tsx
│   │
│   ├── pages/                # Páginas principais
│   │   ├── Home.tsx
│   │   ├── AdminPanel.tsx
│   │   ├── MemberArea.tsx
│   │   └── Dashboard.tsx
│   │
│   ├── services/             # Comunicação com API
│   │   ├── api.ts           # Cliente axios configurado
│   │   ├── intentionService.ts
│   │   ├── memberService.ts
│   │   ├── referralService.ts
│   │   └── meetingService.ts
│   │
│   ├── hooks/                # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useFetch.ts
│   │   └── useForm.ts
│   │
│   ├── context/              # Context API (estado global)
│   │   ├── AuthContext.tsx
│   │   └── MemberContext.tsx
│   │
│   ├── types/                # TypeScript types/interfaces
│   │   ├── intention.ts
│   │   ├── member.ts
│   │   └── referral.ts
│   │
│   ├── utils/                # Funções utilitárias
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── helpers.ts
│   │
│   ├── styles/               # Estilos CSS modulares
│   │   ├── IntentionForm.css
│   │   ├── AdminDashboard.css
│   │   └── globals.css
│   │
│   └── __tests__/            # Testes
│       ├── IntentionForm.test.tsx
│       ├── AdminDashboard.test.tsx
│       └── ReferralManagement.test.tsx
```

### Principais Componentes

#### 1. **IntentionForm** (Público)

- Formulário de intenção de participação
- Validação de campos
- Feedback de sucesso/erro
- **Props:** Nenhuma
- **Estado:** formData, loading, error, success

#### 2. **AdminDashboard** (Protegido)

- Lista de intenções pendentes
- Botões de aprovar/rejeitar
- Filtros por status
- **Props:** Nenhuma
- **Estado:** intentions, filter, loading, selectedIntention

#### 3. **MemberRegistration** (Público com token)

- Validação de token na URL
- Formulário de cadastro completo
- Navegação após sucesso
- **Props:** token (via URL)
- **Estado:** formData, tokenValid, loading, error

#### 4. **ReferralManagement** (Protegido)

- Criação de novas indicações
- Lista de indicações dadas/recebidas
- Atualização de status
- **Props:** memberId (opcional)
- **Estado:** referrals, members, selectedMember, formData

#### 5. **MemberCard** (Reutilizável)

- Exibe informações do membro
- Ações rápidas (editar, desativar)
- **Props:** member, onEdit, onDeactivate
- **Estado:** Nenhum (stateless)

### Gerenciamento de Estado

**Estado Local:**

- Formulários (useState)
- UI temporária (modals, tooltips)

**Estado Global (Context API):**

- Autenticação do usuário
- Dados do membro logado
- Configurações da aplicação

**Estado do Servidor:**

- React Query / SWR (cache e sincronização)
- Revalidação automática
- Otimistic updates

---

## 4. Definição da API (Backend)

### Padrão REST

**Base URL:** `http://localhost:3001/api`

### 4.1 Módulo: Gestão de Intenções

#### `POST /intentions`

Criar nova intenção de participação (público)

**Request:**

```json
{
  "name": "João Silva",
  "email": "joao@empresa.com",
  "company": "Empresa XYZ Ltda",
  "reason": "Quero expandir minha rede de contatos e gerar novos negócios"
}
```

**Response (201):**

```json
{
  "message": "Intenção de participação enviada com sucesso!",
  "data": {
    "id": "uuid-v4",
    "name": "João Silva",
    "email": "joao@empresa.com",
    "company": "Empresa XYZ Ltda",
    "reason": "Quero expandir...",
    "status": "PENDING",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Validações:**

- Todos os campos obrigatórios
- Email válido e único
- Tamanho mínimo para `reason` (50 caracteres)

---

#### `GET /intentions`

Listar intenções (requer autenticação admin)

**Headers:**

```
Authorization: Bearer {ADMIN_TOKEN}
```

**Query Params:**

- `status` (opcional): PENDING | APPROVED | REJECTED

**Response (200):**

```json
{
  "data": [
    {
      "id": "uuid-1",
      "name": "João Silva",
      "email": "joao@empresa.com",
      "company": "Empresa XYZ",
      "reason": "Networking...",
      "status": "PENDING",
      "createdAt": "2024-01-15T10:30:00Z",
      "member": null
    },
    {
      "id": "uuid-2",
      "name": "Maria Santos",
      "email": "maria@empresa.com",
      "company": "ABC Consultoria",
      "reason": "Geração de negócios...",
      "status": "APPROVED",
      "token": "token-secreto-32-chars",
      "member": {
        "id": "uuid-member",
        "isActive": true,
        "joinedAt": "2024-01-16T14:00:00Z"
      }
    }
  ]
}
```

---

#### `PATCH /intentions/:id/approve`

Aprovar intenção (admin)

**Headers:**

```
Authorization: Bearer {ADMIN_TOKEN}
```

**Response (200):**

```json
{
  "message": "Intenção aprovada com sucesso!",
  "data": {
    "id": "uuid-1",
    "status": "APPROVED",
    "token": "generated-token-32-chars",
    "updatedAt": "2024-01-16T09:00:00Z"
  },
  "registrationLink": "http://localhost:5173/register/generated-token-32-chars"
}
```

**Efeitos:**

1. Atualiza status para APPROVED
2. Gera token único de 32 caracteres
3. Simula envio de email (console.log)
4. Retorna link de cadastro

---

### 4.2 Módulo: Gestão de Membros

#### `POST /members/register/:token`

Completar cadastro de membro (público com token válido)

**Request:**

```json
{
  "phone": "+55 11 98765-4321",
  "linkedin": "https://linkedin.com/in/joaosilva",
  "profession": "Empresário",
  "segment": "Tecnologia",
  "companyDescription": "Empresa de desenvolvimento de software com 10 anos de mercado"
}
```

**Response (201):**

```json
{
  "message": "Cadastro completo realizado com sucesso!",
  "data": {
    "id": "uuid-member",
    "intentionId": "uuid-intention",
    "phone": "+55 11 98765-4321",
    "profession": "Empresário",
    "segment": "Tecnologia",
    "isActive": true,
    "joinedAt": "2024-01-16T14:00:00Z",
    "intention": {
      "name": "João Silva",
      "email": "joao@empresa.com",
      "company": "Empresa XYZ"
    }
  }
}
```

**Validações:**

- Token válido e não utilizado
- Intenção com status APPROVED
- Campos obrigatórios: phone, profession, segment

---

#### `GET /members`

Listar membros (admin)

**Headers:**

```
Authorization: Bearer {ADMIN_TOKEN}
```

**Query Params:**

- `isActive` (opcional): true | false

**Response (200):**

```json
{
  "data": [
    {
      "id": "uuid-1",
      "phone": "+55 11 98765-4321",
      "profession": "Empresário",
      "segment": "Tecnologia",
      "isActive": true,
      "joinedAt": "2024-01-16T14:00:00Z",
      "intention": {
        "name": "João Silva",
        "email": "joao@empresa.com",
        "company": "Empresa XYZ"
      },
      "_count": {
        "indicationsGiven": 5,
        "indicationsReceived": 3,
        "thanks": 2
      }
    }
  ]
}
```

---

#### `GET /members/stats`

Estatísticas gerais (admin)

**Response (200):**

```json
{
  "data": {
    "members": {
      "total": 45,
      "active": 42,
      "inactive": 3
    },
    "referrals": {
      "total": 128,
      "closed": 34
    },
    "thanks": {
      "total": 67
    }
  }
}
```

---

### 4.3 Módulo: Indicações de Negócios

#### `POST /referrals`

Criar indicação

**Request:**

```json
{
  "giverId": "uuid-member-1",
  "receiverId": "uuid-member-2",
  "companyName": "Empresa Indicada SA",
  "contactName": "Carlos Souza",
  "contactInfo": "carlos@empresa.com / (11) 99999-8888",
  "opportunity": "Oportunidade de venda de consultoria em TI"
}
```

**Response (201):**

```json
{
  "message": "Indicação criada com sucesso!",
  "data": {
    "id": "uuid-referral",
    "giverId": "uuid-member-1",
    "receiverId": "uuid-member-2",
    "companyName": "Empresa Indicada SA",
    "contactName": "Carlos Souza",
    "contactInfo": "carlos@empresa.com / (11) 99999-8888",
    "opportunity": "Oportunidade de venda...",
    "status": "NEW",
    "createdAt": "2024-01-17T10:00:00Z",
    "giver": {
      "intention": { "name": "João Silva" }
    },
    "receiver": {
      "intention": { "name": "Maria Santos" }
    }
  }
}
```

---

#### `GET /referrals/member/:memberId`

Listar indicações de um membro

**Query Params:**

- `type` (opcional): given | received

**Response (200):**

```json
{
  "data": [
    {
      "id": "uuid-1",
      "giverId": "uuid-member-1",
      "receiverId": "uuid-member-2",
      "companyName": "Empresa Indicada",
      "status": "IN_CONTACT",
      "createdAt": "2024-01-17T10:00:00Z",
      "giver": { "intention": { "name": "João Silva" } },
      "receiver": { "intention": { "name": "Maria Santos" } }
    }
  ]
}
```

---

#### `PATCH /referrals/:id/status`

Atualizar status de indicação

**Request:**

```json
{
  "status": "CLOSED"
}
```

**Response (200):**

```json
{
  "message": "Status atualizado com sucesso",
  "data": {
    "id": "uuid-referral",
    "status": "CLOSED",
    "updatedAt": "2024-01-20T15:30:00Z"
  }
}
```

**Estados Válidos:**

- NEW → IN_CONTACT → NEGOTIATING → CLOSED
- NEW → IN_CONTACT → REJECTED

---

## 5. Funcionalidades Futuras

### 5.1 Comunicação e Engajamento

**Avisos e Comunicados:**

- Criar/editar/deletar avisos
- Priorização (baixa, normal, alta, urgente)
- Notificações push
- Sistema de leitura/não lido

**Controle de Presença:**

- QR Code para check-in
- Dashboard de presença por reunião
- Relatórios de assiduidade
- Penalidades por ausência

### 5.2 Acompanhamento e Performance

**Dashboards:**

- Indicadores individuais (KPIs)
- Gráficos de evolução mensal
- Ranking de performance
- Comparativos do grupo

**Reuniões 1 a 1:**

- Agendamento integrado
- Registro de encontros
- Anotações privadas
- Meta mensal de reuniões

### 5.3 Módulo Financeiro

**Mensalidades:**

- Geração automática mensal
- Múltiplas formas de pagamento
- Webhooks de pagamento (Stripe/PagSeguro)
- Relatórios financeiros
- Envio de boletos por email

### 5.4 Melhorias Técnicas

**Autenticação Completa:**

- JWT com refresh tokens
- OAuth2 (Google, LinkedIn)
- Recuperação de senha
- 2FA (two-factor authentication)

**Notificações:**

- Email transacional (SendGrid, AWS SES)
- Push notifications (OneSignal)
- SMS (Twilio)
- Notificações in-app

**Analytics:**

- Google Analytics
- Mixpanel para eventos customizados
- Métricas de engajamento
- Funnels de conversão

---

## 6. Segurança

### Medidas Implementadas

1. **Validação de Dados:**

   - Sanitização de inputs
   - Validação de tipos com Zod
   - Proteção contra SQL Injection (Prisma)
   - XSS protection

2. **Autenticação:**

   - Bearer tokens
   - Variáveis de ambiente para secrets
   - Rate limiting (produção)

3. **CORS:**
   - Configuração restrita ao frontend
   - Credentials habilitados

### Melhorias Futuras

- HTTPS obrigatório
- Helmet.js para headers de segurança
- Rate limiting por IP
- Auditoria de ações críticas
- Backup automático de banco de dados
- Criptografia de dados sensíveis

---

## 7. Escalabilidade

### Estratégias de Crescimento

**Horizontal:**

- Load balancer (Nginx, AWS ALB)
- Múltiplas instâncias da API
- Cache distribuído (Redis)
- CDN para assets estáticos

**Vertical:**

- Otimização de queries (índices)
- Paginação em listas grandes
- Lazy loading de componentes
- Code splitting

**Banco de Dados:**

- Read replicas
- Connection pooling
- Índices estratégicos
- Arquivamento de dados antigos

---

## 8. Monitoramento e Observabilidade

**Logs:**

- Winston/Pino para logs estruturados
- Agregação em ELK Stack ou Datadog
- Níveis: error, warn, info, debug

**Métricas:**

- Tempo de resposta de APIs
- Taxa de erro
- Uso de CPU/memória
- Conexões de banco

**Alertas:**

- Erros críticos (Slack, PagerDuty)
- Performance degradada
- Uso excessivo de recursos

---

## 9. CI/CD

### Pipeline Sugerido

```yaml
# Exemplo: GitHub Actions

1. Commit → Push
↓
2. Testes Unitários (Jest)
↓
3. Testes de Integração
↓
4. Linting (ESLint)
↓
5. Type Checking (TSC)
↓
6. Build (Frontend + Backend)
↓
7. Deploy Staging
↓
8. Testes E2E (Cypress/Playwright)
↓
9. Deploy Production (aprovação manual)
```

**Ambientes:**

- Development (local)
- Staging (pré-produção)
- Production (clientes)

---

## 10. Conclusão

Esta arquitetura foi desenhada para ser:

- **Escalável:** Suporta crescimento do grupo
- **Manutenível:** Código limpo e bem organizado
- **Testável:** Cobertura de testes unitários e integração
- **Segura:** Boas práticas de segurança implementadas
- **Performática:** Otimizada para responsividade

A separação clara entre frontend e backend permite evolução independente, facilitando manutenção e adição de novas funcionalidades.

---

**Autor:** Desenvolvido como desafio técnico  
**Data:** Janeiro 2024  
**Versão:** 1.0
