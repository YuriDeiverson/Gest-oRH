# 🚀 Guia Rápido de Instalação e Execução

Este guia irá te ajudar a configurar e executar o projeto completo em poucos minutos.

## ✅ Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** versão 18 ou superior ([Download](https://nodejs.org/))
- **npm** (geralmente vem com Node.js)
- **Git** ([Download](https://git-scm.com/))

Verifique as versões instaladas:

```bash
node --version  # Deve ser v18.x ou superior
npm --version   # Qualquer versão recente
```

---

## 📥 Passo 1: Clonar o Repositório

```bash
# Clone o repositório (substitua pela URL correta)
git clone <url-do-repositorio>

# Entre na pasta do projeto
cd "Plataforma de Gestão para Grupos de Networking"
```

---

## 🔧 Passo 2: Configurar e Executar o Backend

### 2.1 - Instalar Dependências

```bash
cd backend
npm install
```

⏱️ **Tempo estimado:** 1-2 minutos

### 2.2 - Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env
```

O arquivo `.env` já vem com valores padrão funcionais. **Não precisa alterar nada para desenvolvimento local!**

### 2.3 - Configurar Banco de Dados

```bash
# Gerar Prisma Client
npm run prisma:generate

# Executar migrações (cria as tabelas)
npm run prisma:migrate
```

Quando solicitado, dê um nome para a migração, por exemplo: `init`

⏱️ **Tempo estimado:** 30 segundos

### 2.4 - Iniciar o Servidor

```bash
npm run dev
```

✅ **Servidor rodando em:** `http://localhost:3001`

Você verá a mensagem: `🚀 Server running on port 3001`

---

## 🎨 Passo 3: Configurar e Executar o Frontend

**Abra um NOVO terminal** (mantenha o backend rodando!)

### 3.1 - Instalar Dependências

```bash
cd frontend
npm install
```

⏱️ **Tempo estimado:** 1-2 minutos

### 3.2 - Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env
```

O arquivo `.env` já vem configurado para conectar no backend local. **Não precisa alterar!**

### 3.3 - Iniciar o Frontend

```bash
npm run dev
```

✅ **Frontend rodando em:** `http://localhost:5173`

Você verá algo como:

```
VITE vX.X.X  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## 🎉 Passo 4: Testar a Aplicação

Abra seu navegador em `http://localhost:5173`

### Fluxo Completo de Teste:

#### 1️⃣ **Criar uma Intenção** (Página Inicial)

- Preencha o formulário com seus dados
- Clique em "Enviar Intenção"
- ✅ Você verá uma mensagem de sucesso

#### 2️⃣ **Aprovar como Admin** (Painel Admin)

- Acesse: `http://localhost:5173/admin`
- Você verá sua intenção na lista
- Clique em **"✅ Aprovar"**
- ✅ Um token será gerado e exibido

#### 3️⃣ **Completar Cadastro** (Com Token)

- Copie o link de cadastro exibido
- Ou acesse: `http://localhost:5173/register/{token}`
- Preencha os dados adicionais (telefone, profissão, etc.)
- Clique em "Finalizar Cadastro"
- ✅ Você será redirecionado para a página de sucesso

#### 4️⃣ **Testar Sistema de Indicações**

- Acesse: `http://localhost:5173/referrals`
- Clique em "+ Nova Indicação"
- Preencha os dados da indicação
- Selecione um membro e veja suas indicações
- Atualize o status das indicações

---

## 🧪 Passo 5: Executar os Testes (Opcional)

### Testes do Backend

Em um terminal no diretório `backend/`:

```bash
# Executar todos os testes
npm test

# Ver cobertura
npm test -- --coverage
```

Você verá algo como:

```
 PASS  src/__tests__/intention.test.ts
 PASS  src/__tests__/member.test.ts
 PASS  src/__tests__/referral.test.ts

Tests:       XX passed, XX total
Time:        X.XXs
```

### Testes do Frontend

Em um terminal no diretório `frontend/`:

```bash
# Executar testes
npm test

# Interface gráfica de testes
npm run test:ui
```

---

## 🔍 Verificar se Está Funcionando

### Backend (API)

Teste com curl ou abra no navegador:

```bash
# Health check
curl http://localhost:3001/health

# Resposta esperada:
# {"status":"ok","timestamp":"2024-01-XX..."}
```

### Frontend

Abra `http://localhost:5173` e você deve ver a página de intenção com um gradiente roxo.

---

## 🛠️ Ferramentas Úteis

### Visualizar o Banco de Dados

```bash
cd backend
npm run prisma:studio
```

Abrirá uma interface web em `http://localhost:5555` onde você pode:

- Ver todas as tabelas
- Editar dados manualmente
- Visualizar relacionamentos

### Resetar o Banco de Dados

```bash
cd backend

# Deletar banco e recriar
rm prisma/dev.db
npm run prisma:migrate
```

---

## ❓ Problemas Comuns

### "Port 3001 is already in use"

Outro processo está usando a porta. Mate o processo ou altere a porta no `.env`:

```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3001
kill -9 <PID>
```

### "Cannot find module 'X'"

As dependências não foram instaladas:

```bash
# No backend
cd backend
rm -rf node_modules package-lock.json
npm install

# No frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Erro ao executar migrações

```bash
cd backend

# Deletar banco e recriar
rm prisma/dev.db
rm -rf prisma/migrations

# Recriar
npx prisma migrate dev --name init
```

### Frontend não conecta no backend

Verifique se:

1. Backend está rodando (`http://localhost:3001/health`)
2. Arquivo `.env` do frontend tem `VITE_API_URL=http://localhost:3001/api`
3. Reinicie o frontend após alterar `.env`

---

## 📚 Próximos Passos

Após executar com sucesso:

1. 📖 Leia o [README.md](./README.md) principal
2. 🏗️ Estude a [ARCHITECTURE.md](./ARCHITECTURE.md) para entender a arquitetura
3. 🔍 Explore o código-fonte
4. 🧪 Execute e estude os testes
5. 🎨 Personalize e adicione novas funcionalidades

---

## 🆘 Precisa de Ajuda?

- Revise a documentação em [README.md](./README.md)
- Leia o documento de arquitetura completo
- Verifique os logs de erro no terminal
- Consulte a documentação oficial das tecnologias:
  - [Node.js](https://nodejs.org/)
  - [React](https://react.dev/)
  - [Prisma](https://www.prisma.io/)
  - [Express](https://expressjs.com/)

---

## ✅ Checklist de Sucesso

- [ ] Node.js 18+ instalado
- [ ] Backend instalado e rodando (porta 3001)
- [ ] Banco de dados criado e migrado
- [ ] Frontend instalado e rodando (porta 5173)
- [ ] Formulário de intenção funcionando
- [ ] Painel admin acessível
- [ ] Cadastro completo com token funcionando
- [ ] Sistema de indicações operacional
- [ ] Testes executando com sucesso

---

**🎉 Parabéns!** Se todos os itens acima estão marcados, seu ambiente está 100% funcional!

Divirta-se explorando o projeto! 🚀
