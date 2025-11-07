# Backend - API de Gestão de Networking

Backend da plataforma de gestão para grupos de networking, desenvolvido com Node.js, Express, TypeScript e Prisma ORM.

## 🚀 Tecnologias

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **TypeScript** - Superset JavaScript com tipagem
- **Prisma ORM** - ORM moderno para Node.js
- **SQLite** - Banco de dados (desenvolvimento)
- **Jest** - Framework de testes
- **Supertest** - Testes de API HTTP

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn

## 🔧 Instalação

1. Instale as dependências:

```bash
npm install
```

2. Configure as variáveis de ambiente:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
DATABASE_URL="file:./dev.db"
PORT=3001
NODE_ENV=development
ADMIN_TOKEN=your-secret-admin-token-here
FRONTEND_URL=http://localhost:5173
```

3. Execute as migrações do banco de dados:

```bash
npm run prisma:generate
npm run prisma:migrate
```

## ▶️ Executando

### Desenvolvimento

```bash
npm run dev
```

O servidor estará rodando em `http://localhost:3001`

### Produção

```bash
npm run build
npm start
```

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch
npm run test:watch

# Executar testes com cobertura
npm test -- --coverage
```

## 📁 Estrutura do Projeto

```
backend/
├── prisma/
│   └── schema.prisma          # Schema do banco de dados
├── src/
│   ├── __tests__/             # Testes automatizados
│   │   ├── intention.test.ts
│   │   ├── member.test.ts
│   │   └── referral.test.ts
│   ├── controllers/           # Controladores da aplicação
│   │   ├── intention.controller.ts
│   │   ├── member.controller.ts
│   │   └── referral.controller.ts
│   ├── routes/                # Definição de rotas
│   │   ├── intention.routes.ts
│   │   ├── member.routes.ts
│   │   └── referral.routes.ts
│   ├── middleware/            # Middlewares
│   │   ├── auth.ts
│   │   └── errorHandler.ts
│   ├── lib/                   # Bibliotecas e utilitários
│   │   └── prisma.ts
│   └── server.ts              # Configuração do servidor Express
├── .env.example
├── .gitignore
├── jest.config.js
├── package.json
└── tsconfig.json
```

## 🔑 API Endpoints

### Intenções de Participação

#### Público

- `POST /api/intentions` - Criar nova intenção
- `GET /api/intentions/validate/:token` - Validar token de cadastro

#### Admin (requer `Authorization: Bearer {ADMIN_TOKEN}`)

- `GET /api/intentions` - Listar todas intenções
- `GET /api/intentions/:id` - Buscar intenção por ID
- `PATCH /api/intentions/:id/approve` - Aprovar intenção
- `PATCH /api/intentions/:id/reject` - Rejeitar intenção

### Membros

#### Público

- `POST /api/members/register/:token` - Completar cadastro com token

#### Admin

- `GET /api/members` - Listar todos membros
- `GET /api/members/stats` - Estatísticas gerais
- `GET /api/members/:id` - Buscar membro por ID
- `PATCH /api/members/:id` - Atualizar membro
- `PATCH /api/members/:id/deactivate` - Desativar membro

### Indicações/Referências

- `POST /api/referrals` - Criar indicação
- `GET /api/referrals/member/:memberId` - Listar indicações de um membro
- `GET /api/referrals/:id` - Buscar indicação por ID
- `PATCH /api/referrals/:id/status` - Atualizar status
- `PATCH /api/referrals/:id` - Atualizar indicação
- `DELETE /api/referrals/:id` - Deletar indicação

#### Admin

- `GET /api/referrals` - Listar todas indicações
- `GET /api/referrals/stats` - Estatísticas de indicações

## 📊 Modelo de Dados

### Principais Entidades

- **Intention** - Intenções de participação
- **Member** - Membros completos do grupo
- **Referral** - Indicações de negócios
- **OneToOneMeeting** - Reuniões 1 a 1
- **Meeting** - Reuniões do grupo
- **Presence** - Controle de presença
- **Thank** - Agradecimentos públicos
- **Announcement** - Avisos e comunicados
- **Payment** - Controle de mensalidades

## 🛡️ Autenticação

Atualmente, o sistema usa um token simples para autenticação de admin via variável de ambiente `ADMIN_TOKEN`.

Para acessar rotas protegidas, adicione o header:

```
Authorization: Bearer {seu-token-aqui}
```

## 🔄 Fluxo de Admissão

1. Usuário preenche formulário de intenção (público)
2. Admin revisa e aprova/rejeita na área administrativa
3. Se aprovado, sistema gera token único de cadastro
4. Usuário acessa link com token e completa cadastro
5. Membro é criado e fica ativo no sistema

## 📝 Variáveis de Ambiente

| Variável       | Descrição                   | Exemplo                 |
| -------------- | --------------------------- | ----------------------- |
| `DATABASE_URL` | URL de conexão do banco     | `file:./dev.db`         |
| `PORT`         | Porta do servidor           | `3001`                  |
| `NODE_ENV`     | Ambiente de execução        | `development`           |
| `ADMIN_TOKEN`  | Token de autenticação admin | `seu-token-secreto`     |
| `FRONTEND_URL` | URL do frontend             | `http://localhost:5173` |

## 🧪 Cobertura de Testes

Os testes cobrem:

- ✅ Criação de intenções
- ✅ Aprovação/rejeição de intenções
- ✅ Validação de tokens
- ✅ Cadastro completo de membros
- ✅ Listagem e filtros
- ✅ CRUD de indicações
- ✅ Atualização de status
- ✅ Estatísticas

## 📦 Scripts Disponíveis

- `npm run dev` - Inicia servidor em modo desenvolvimento
- `npm run build` - Compila TypeScript para JavaScript
- `npm start` - Inicia servidor de produção
- `npm test` - Executa testes
- `npm run test:watch` - Testes em modo watch
- `npm run prisma:generate` - Gera Prisma Client
- `npm run prisma:migrate` - Executa migrações
- `npm run prisma:studio` - Abre Prisma Studio (GUI do banco)

## 🤝 Contribuindo

Este é um projeto de demonstração para avaliação técnica.

## 📄 Licença

MIT
