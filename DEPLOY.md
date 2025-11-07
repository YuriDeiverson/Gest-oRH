# Deploy na Vercel - Configuração

## Backend

### Variáveis de Ambiente na Vercel

Adicione estas variáveis no painel da Vercel (Settings > Environment Variables):

```
DATABASE_URL=file:./dev.db
NODE_ENV=production
ADMIN_TOKEN=seu-token-seguro-aqui
FRONTEND_URL=https://gestaofrontendrh.vercel.app
```

### Importante

O backend já está configurado para aceitar requisições de:
- `https://gestaofrontendrh.vercel.app`
- `http://localhost:5173` (desenvolvimento)
- Qualquer origem configurada em `FRONTEND_URL`

## Frontend

### Variáveis de Ambiente na Vercel

```
VITE_API_URL=https://gestaobackendrh.vercel.app
VITE_ADMIN_TOKEN=mesmo-token-do-backend
```

## Após fazer deploy

1. Faça commit e push das alterações:
```bash
git add .
git commit -m "Configure CORS for Vercel deployment"
git push
```

2. No painel da Vercel, force um redeploy do backend após adicionar as variáveis de ambiente

3. Teste a aplicação no navegador

## Troubleshooting CORS

Se ainda tiver erros de CORS:
- Verifique se a variável `FRONTEND_URL` no backend está correta
- Verifique se o domínio está exatamente igual (com/sem www, http/https)
- Force um rebuild do backend na Vercel
