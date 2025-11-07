# 🤝 Plataforma de Gestão para Grupos de Networking

Uma solução completa e moderna para digitalizar e otimizar a gestão de grupos de networking focados em geração de negócios, substituindo planilhas e controles manuais por um sistema centralizado e eficiente.

## 🎯 Sobre o Projeto

Este projeto foi desenvolvido como resposta a um desafio técnico real, demonstrando habilidades em:

- ✅ Arquitetura de sistemas fullstack
- ✅ Desenvolvimento Node.js/React com TypeScript
- ✅ Boas práticas de componentização
- ✅ Testes automatizados (unitários e integração)
- ✅ Design de APIs RESTful
- ✅ Modelagem de banco de dados relacional

## 📚 Documentação

- 📖 **[Documento de Arquitetura Completo](./ARCHITECTURE.md)** - Visão detalhada da arquitetura, diagramas, modelo de dados e especificação da API
- 📦 **[README do Backend](./backend/README.md)** - Documentação específica da API
- 🎨 **[README do Frontend](./frontend/README.md)** - Documentação da interface

## 🚀 Stack Tecnológica

### Backend

- **Node.js** 18+ com **TypeScript**
- **Express** - Framework web minimalista
- **Prisma ORM** - ORM moderno type-safe
- **SQLite** (dev) / **PostgreSQL** (prod)
- **Jest** + **Supertest** - Testes

### Frontend

- **React** 19 com **TypeScript**
- **Vite** - Build tool de nova geração
- **React Router** - Roteamento
- **Axios** - Cliente HTTP
- **Vitest** + **React Testing Library** - Testes

## ⚡ Quick Start

### Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn
- Git

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd "Plataforma de Gestão para Grupos de Networking"
```

### 2. Configure o Backend

```bash
cd backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env

# Gerar Prisma Client e executar migrações
npm run prisma:generate
npm run prisma:migrate

# Iniciar servidor de desenvolvimento
npm run dev
```

O backend estará rodando em `http://localhost:3001`

### 3. Configure o Frontend

Em outro terminal:

```bash
cd frontend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env

# Iniciar servidor de desenvolvimento
npm run dev
```

O frontend estará rodando em `http://localhost:5173`

## 🧪 Executar Testes

### Backend

```bash
cd backend

# Testes unitários e de integração
npm test

# Testes com cobertura
npm test -- --coverage

# Testes em modo watch
npm run test:watch
```

### Frontend

```bash
cd frontend

# Testes de componentes
npm test

# Testes com UI interativa
npm run test:ui

# Cobertura de testes
npm run test:coverage
```

## 📋 Funcionalidades Implementadas

### ✅ Módulo Obrigatório: Fluxo de Admissão de Membros

#### 1. Página de Intenção (Público)

- ✅ Formulário com nome, email, empresa e motivo
- ✅ Validação de campos
- ✅ Feedback visual de sucesso/erro
- ✅ Proteção contra duplicação de email

#### 2. Área do Administrador (Protegido)

- ✅ Listagem de todas as intenções
- ✅ Filtros por status (Pendente, Aprovada, Rejeitada)
- ✅ Ações de aprovar/rejeitar
- ✅ Geração automática de token de cadastro
- ✅ Simulação de envio de email com link

#### 3. Cadastro Completo (Token Protegido)

- ✅ Validação de token único
- ✅ Formulário completo (telefone, LinkedIn, profissão, segmento)
- ✅ Criação de membro após validação
- ✅ Página de sucesso após cadastro

### ✅ Módulo Opcional: Sistema de Indicações

- ✅ Criação de indicações de negócios entre membros
- ✅ Campos: membro indicado, empresa/contato, descrição
- ✅ Visualização de indicações dadas e recebidas
- ✅ Atualização de status (Nova, Em Contato, Negociando, Fechada, Recusada)
- ✅ Filtros e organização por membro

## 🗂️ Estrutura do Projeto

```
Plataforma de Gestão para Grupos de Networking/
│
├── backend/                  # API Node.js + Express
│   ├── prisma/              # Schema e migrações do banco
│   ├── src/
│   │   ├── __tests__/       # Testes automatizados
│   │   ├── controllers/     # Lógica de negócio
│   │   ├── routes/          # Rotas da API
│   │   ├── middleware/      # Autenticação, validação, erros
│   │   ├── lib/             # Configurações (Prisma)
│   │   └── server.ts        # Ponto de entrada
│   ├── .env.example
│   ├── package.json
│   └── README.md
│
├── frontend/                # Interface React
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   ├── services/        # Chamadas à API
│   │   ├── styles/          # CSS modular
│   │   ├── config/          # Configurações
│   │   ├── __tests__/       # Testes de componentes
│   │   ├── App.tsx          # Componente raiz
│   │   └── main.tsx         # Ponto de entrada
│   ├── .env.example
│   ├── package.json
│   └── vite.config.ts
│
├── ARCHITECTURE.md          # Documentação técnica completa
└── README.md                # Este arquivo
```

## 🔑 Variáveis de Ambiente

### Backend (.env)

```env
DATABASE_URL="file:./dev.db"
PORT=3001
NODE_ENV=development
ADMIN_TOKEN=secret-admin-token-123
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3001/api
VITE_ADMIN_TOKEN=secret-admin-token-123
```

⚠️ **Importante:** O `ADMIN_TOKEN` deve ser o mesmo no backend e frontend.

## 🎨 Screenshots

### Formulário de Intenção

Página pública onde interessados manifestam interesse em participar do grupo.

### Painel Administrativo

Área protegida para aprovação/rejeição de intenções com filtros e ações em lote.

### Cadastro de Membro

Formulário completo acessível apenas com token válido após aprovação.

### Sistema de Indicações

Gerenciamento completo de indicações de negócios com tracking de status.

## 🧪 Cobertura de Testes

O projeto possui testes automatizados cobrindo:

### Backend

- ✅ Criação de intenções
- ✅ Aprovação/rejeição de intenções
- ✅ Validação de tokens
- ✅ Cadastro completo de membros
- ✅ CRUD de indicações
- ✅ Atualização de status de indicações
- ✅ Estatísticas e dashboards

### Frontend

- ✅ Renderização de componentes
- ✅ Submissão de formulários
- ✅ Validação de campos
- ✅ Mensagens de erro/sucesso
- ✅ Integração com API (mocked)

## 📡 Endpoints da API

### Intenções

- `POST /api/intentions` - Criar intenção
- `GET /api/intentions` - Listar intenções (admin)
- `GET /api/intentions/validate/:token` - Validar token
- `PATCH /api/intentions/:id/approve` - Aprovar (admin)
- `PATCH /api/intentions/:id/reject` - Rejeitar (admin)

### Membros

- `POST /api/members/register/:token` - Completar cadastro
- `GET /api/members` - Listar membros (admin)
- `GET /api/members/stats` - Estatísticas (admin)
- `GET /api/members/:id` - Buscar membro (admin)

### Indicações

- `POST /api/referrals` - Criar indicação
- `GET /api/referrals/member/:memberId` - Listar por membro
- `GET /api/referrals/:id` - Buscar indicação
- `PATCH /api/referrals/:id/status` - Atualizar status
- `DELETE /api/referrals/:id` - Deletar indicação

Documentação completa em [ARCHITECTURE.md](./ARCHITECTURE.md#4-definição-da-api-backend)

## 🏗️ Arquitetura

O sistema segue uma arquitetura cliente-servidor moderna:

```
Frontend (React) ←→ HTTP/REST ←→ Backend (Express) ←→ Prisma ORM ←→ Database
```

- **Frontend:** SPA React com React Router para navegação
- **Backend:** API RESTful stateless
- **Banco:** Relacional com Prisma ORM (type-safe)
- **Autenticação:** Bearer token (admin) com planos para JWT

Ver [ARCHITECTURE.md](./ARCHITECTURE.md) para detalhes completos.

## 🔒 Segurança

- ✅ Validação de dados com Zod
- ✅ Proteção contra SQL Injection (Prisma)
- ✅ CORS configurado
- ✅ Variáveis de ambiente para secrets
- ✅ Sanitização de inputs
- 🔄 HTTPS (produção)
- 🔄 Rate limiting (produção)
- 🔄 JWT com refresh tokens (próxima versão)

## 🚢 Deploy

### Backend (Sugestões)

- **Railway** - Deploy automático com GitHub
- **Heroku** - Fácil configuração
- **AWS EC2** - Maior controle
- **DigitalOcean** - Custo-benefício

### Frontend (Sugestões)

- **Vercel** - Otimizado para React
- **Netlify** - Deploy contínuo
- **AWS S3 + CloudFront** - Escalável
- **GitHub Pages** - Gratuito

### Banco de Dados

- **Railway** - PostgreSQL gerenciado
- **Supabase** - PostgreSQL + Auth
- **AWS RDS** - Produção enterprise
- **Heroku Postgres** - Integração simples

## 📈 Próximos Passos

- [ ] Autenticação completa com JWT
- [ ] Sistema de permissões (roles)
- [ ] Dashboards de performance
- [ ] Controle de presença com QR Code
- [ ] Módulo financeiro (mensalidades)
- [ ] Notificações por email
- [ ] Aplicativo mobile (React Native)
- [ ] Exportação de relatórios (PDF/Excel)

## 🤝 Contribuindo

Este é um projeto de demonstração técnica. Sugestões e feedback são bem-vindos!

## 📝 Licença

MIT License - sinta-se livre para usar como referência.

---

**Desenvolvido com ❤️ como desafio técnico**

**Stack:** Node.js | React | TypeScript | Prisma | Express | Vite

**Contato:** [Seu Nome] | [seu@email.com] | [LinkedIn]
