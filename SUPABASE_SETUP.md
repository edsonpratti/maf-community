# Configuração do Supabase

Este arquivo contém instruções detalhadas para configurar o projeto Supabase.

## 1. Criar Projeto no Supabase

1. Acesse https://supabase.com/dashboard
2. Clique em "New Project"
3. Escolha um nome para o projeto (ex: maf-community)
4. Defina uma senha segura para o banco de dados: 4NPdE7l3c0SotMl2
5. Escolha a região mais próxima (South America - São Paulo)
6. Aguarde a criação do projeto (~2 minutos)

## 2. Executar Migrations

No dashboard do Supabase:

1. Vá para **SQL Editor** no menu lateral
2. Clique em "New Query"
3. Cole o conteúdo de `supabase/migrations/001_initial_schema.sql`
4. Execute (RUN)
5. Aguarde confirmação de sucesso
6. Crie nova query e repita com `supabase/migrations/002_rls_policies.sql`

## 3. Configurar Storage

No dashboard do Supabase:

1. Vá para **Storage** no menu lateral
2. Clique em "Create a new bucket"

### Bucket: certificates (PRIVADO)
```
Name: certificates
Public: NO (deixe desmarcado)
File size limit: 10 MB
Allowed MIME types: application/pdf, image/jpeg, image/png
```

### Bucket: avatars (PÚBLICO)
```
Name: avatars
Public: YES (marque)
File size limit: 2 MB
Allowed MIME types: image/jpeg, image/png, image/webp
```

### Bucket: post-media (PRIVADO)
```
Name: post-media
Public: NO
File size limit: 50 MB
Allowed MIME types: image/*, video/mp4, video/webm
```

## 4. Configurar Políticas de Storage

No SQL Editor, execute:

```sql
-- Políticas para 'certificates'
CREATE POLICY "Users can upload their own certificates"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'certificates' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own certificates"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'certificates' AND (
      auth.uid()::text = (storage.foldername(name))[1] OR
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'MOD'))
    )
  );

-- Políticas para 'avatars'
CREATE POLICY "Avatars are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Políticas para 'post-media'
CREATE POLICY "Active users can view post media"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'post-media' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND status_access = 'ACTIVE')
  );

CREATE POLICY "Active users can upload post media"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'post-media' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND status_access = 'ACTIVE')
  );
```

## 5. Obter Credenciais

1. Vá para **Project Settings** > **API**
2. Copie as seguintes informações:

```
Project URL: https://xxxxxxxxxxxxx.supabase.co
anon/public key: eyJhbG...
service_role key: eyJhbG... (mantenha em segredo!)
```

## 6. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG... 

HOTMART_CLIENT_ID=seu-client-id
HOTMART_CLIENT_SECRET=seu-client-secret
HOTMART_WEBHOOK_SECRET=seu-webhook-secret

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 7. Configurar Autenticação

No dashboard do Supabase:

1. Vá para **Authentication** > **Settings**
2. Em **Email Auth**:
   - Enable Email provider: YES
   - Enable Email confirmations: NO (ou YES se quiser confirmação por email)
3. Em **Site URL**: `http://localhost:3000`
4. Em **Redirect URLs**: Adicione:
   - `http://localhost:3000/auth/callback`
   - `https://seu-dominio.com/auth/callback` (produção)

## 8. (Opcional) Criar Usuário Admin

No SQL Editor, execute:

```sql
-- Primeiro, crie um usuário no Auth manualmente via Supabase Dashboard
-- Authentication > Users > Add user
-- Email: admin@maf.com
-- Password: (sua senha segura)
-- Auto Confirm User: YES

-- Depois, atualize o perfil para Admin
-- Substitua 'USER_ID_AQUI' pelo ID do usuário criado
UPDATE profiles
SET role = 'ADMIN', status_access = 'ACTIVE', verified_badge = true
WHERE id = 'USER_ID_AQUI';
```

## 9. Testar Conexão

Execute o projeto:

```bash
npm run dev
```

Acesse http://localhost:3000 e:
1. Crie uma conta
2. Preencha o onboarding
3. Verifique se os dados aparecem nas tabelas do Supabase

## 10. Checklist de Verificação

- [ ] Projeto Supabase criado
- [ ] Migrations executadas com sucesso
- [ ] 3 buckets de storage criados
- [ ] Políticas de storage configuradas
- [ ] Credenciais copiadas para .env.local
- [ ] Autenticação configurada
- [ ] Site URL e Redirect URLs configurados
- [ ] Usuário de teste criado
- [ ] Conexão testada com sucesso

## Troubleshooting

### Erro: "Invalid JWT"
- Verifique se as chaves no `.env.local` estão corretas
- Certifique-se de que não há espaços extras nas variáveis

### Erro ao fazer upload
- Verifique se os buckets foram criados
- Confirme que as políticas de storage foram aplicadas

### RLS impede operações
- Verifique se as políticas RLS estão corretas
- Confirme que o usuário tem `status_access = 'ACTIVE'`

### Tabelas não aparecem
- Execute as migrations novamente
- Verifique erros no SQL Editor

## Recursos Adicionais

- [Documentação Supabase](https://supabase.com/docs)
- [RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage](https://supabase.com/docs/guides/storage)
- [Auth](https://supabase.com/docs/guides/auth)
