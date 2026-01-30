# 🚀 Guia Rápido de Início

Siga estes passos para ter o projeto rodando em minutos!

## ⚡ Setup Rápido (5 minutos)

### 1. Instalar Dependências ✅
```bash
# Já está instalado! ✅
```

### 2. Criar Projeto no Supabase (2 min)
1. Acesse https://supabase.com/dashboard
2. Clique em "New Project"
3. Nome: `maf-community`
4. Região: South America
5. Aguarde criação (~2 min)

### 3. Executar Migrations (1 min)
No Supabase Dashboard:
1. SQL Editor > New Query
2. Copie e execute `supabase/migrations/001_initial_schema.sql`
3. Nova query > execute `supabase/migrations/002_rls_policies.sql`

### 4. Criar Buckets de Storage (1 min)
No Supabase Dashboard > Storage:
1. Criar bucket `certificates` (privado)
2. Criar bucket `avatars` (público)
3. Criar bucket `post-media` (privado)

### 5. Configurar Environment (1 min)
```bash
cp .env.local.example .env.local
```

Edite `.env.local` com suas credenciais do Supabase:
- Project URL (Settings > API > Project URL)
- anon key (Settings > API > Project API keys > anon/public)
- service_role key (Settings > API > Project API keys > service_role)

### 6. Rodar o Projeto ✅
```bash
npm run dev
# Já está rodando em http://localhost:3000 ✅
```

## 🎯 Testar o Fluxo

### Criar Primeiro Usuário
1. Acesse http://localhost:3000
2. Clique em "Criar Conta"
3. Use um email de teste: `teste@maf.com`
4. Senha: qualquer senha segura

### Completar Onboarding
1. Após registro, preencha o formulário
2. Faça upload de qualquer imagem/PDF como "certificado"
3. Use email Hotmart de teste
4. Envie

### Liberar Acesso Manualmente
No Supabase Dashboard > Table Editor > profiles:
1. Encontre o usuário criado
2. Edite a linha
3. Altere `status_access` para `ACTIVE`
4. Marque `verified_badge` como `true`
5. Save

### Acessar a Plataforma
1. Volte para http://localhost:3000/app/feed
2. Você deve ver o feed! 🎉

## 📋 Checklist Rápido

- [ ] Projeto Supabase criado
- [ ] Migrations executadas
- [ ] Buckets criados (certificates, avatars, post-media)
- [ ] .env.local configurado com credenciais
- [ ] Servidor rodando (http://localhost:3000)
- [ ] Usuário teste criado
- [ ] Status alterado para ACTIVE
- [ ] Feed acessível

## 🆘 Problemas Comuns

### "Invalid API key"
→ Verifique se copiou as chaves corretas no `.env.local`

### "Table does not exist"
→ Execute as migrations no SQL Editor do Supabase

### "Access denied" no feed
→ Certifique-se que `status_access = 'ACTIVE'` no banco

### Servidor não inicia
→ Rode `npm install` novamente e verifique a versão do Node (18+)

## 📚 Documentação Completa

Para configuração detalhada, consulte:
- [README.md](README.md) - Documentação completa
- [SUPABASE_SETUP.md](SUPABASE_SETUP.md) - Setup detalhado do Supabase

## 🎨 Próximos Passos

Após ter o básico funcionando:
1. Explore o código em `app/` para entender a estrutura
2. Veja os componentes UI em `components/ui/`
3. Analise as API routes em `app/api/`
4. Configure o webhook Hotmart para validação automática
5. Customize os estilos em `app/globals.css`

---

**Dúvidas?** Consulte a documentação ou abra uma issue!
