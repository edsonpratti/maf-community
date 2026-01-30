# MAF Community - Área de Membros + Rede Social Fechada

Plataforma web full-stack com acesso restrito a membros habilitados, validação via Hotmart + upload de certificado, e comunidade estilo timeline (feed) para posts, comentários e reações.

## 🚀 Stack Tecnológico

### Frontend
- **Next.js 14+** (App Router) + TypeScript
- **TailwindCSS** + **shadcn/ui** para componentes
- **React Hook Form** + **Zod** para validação
- **Lucide React** para ícones

### Backend & Database
- **Supabase** (Postgres + Auth + Storage + RLS)
- **Next.js API Routes** (Route Handlers)
- **Webhooks Hotmart** para validação automática

### Deploy
- **Vercel** (Frontend + API)
- **Supabase Cloud** (Database + Auth + Storage)

## 📋 Funcionalidades

### Autenticação e Acesso
- ✅ Registro de usuários com email/senha
- ✅ Login com autenticação Supabase
- ✅ Sistema de validação multi-camadas:
  - Upload de certificado de compra
  - Verificação automática via API Hotmart
  - Aprovação manual por administradores
- ✅ 5 estados de usuário: PENDING, UNDER_REVIEW, ACTIVE, SUSPENDED, REVOKED

### Rede Social (Feed)
- ✅ Timeline de posts (apenas membros ACTIVE)
- ✅ Criação de posts com texto e mídia
- ✅ Comentários em posts
- ✅ Reações (LIKE, LOVE, CLAP)
- ✅ Sistema de denúncias

### Biblioteca de Materiais
- ✅ Acesso a PDFs, vídeos, documentos e links
- ✅ Organização por tags
- ✅ Controle de acesso (apenas ACTIVE)

### Administração
- ✅ Dashboard administrativo
- ✅ Gerenciamento de usuários
- ✅ Aprovação/rejeição de certificados
- ✅ Moderação de posts e comentários
- ✅ Gestão de denúncias

## 🗄️ Modelo de Dados

```
profiles
├── id (uuid, pk)
├── full_name
├── avatar_url
├── bio
├── role (USER | ADMIN | MOD)
├── status_access (PENDING | UNDER_REVIEW | ACTIVE | SUSPENDED | REVOKED)
└── verified_badge

hotmart_customers
├── id (uuid, pk)
├── user_id (fk)
├── hotmart_email
├── hotmart_customer_id
└── last_verified_at

hotmart_orders
├── id (uuid, pk)
├── user_id (fk)
├── order_id (unique)
├── product_id
├── purchase_status
├── purchase_type
├── subscription_status
└── raw_payload (jsonb)

certificates
├── id (uuid, pk)
├── user_id (fk)
├── file_path
├── file_hash
├── review_status
├── reviewed_by
└── reviewed_at

posts
├── id (uuid, pk)
├── user_id (fk)
├── content
├── media (jsonb)
├── visibility
└── status

comments
├── id (uuid, pk)
├── post_id (fk)
├── user_id (fk)
├── content
└── status

reactions
├── id (uuid, pk)
├── post_id (fk)
├── user_id (fk)
└── type (LIKE | LOVE | CLAP)

materials
├── id (uuid, pk)
├── title
├── description
├── type (PDF | VIDEO | LINK | DOC)
├── path_or_url
└── tags
```

## 🛠️ Configuração do Projeto

### 1. Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Conta Supabase (gratuita)
- Conta Hotmart com acesso a webhooks (Client ID, Secret, Webhook Secret)

### 2. Instalação

```bash
# Clone o repositório
git clone <seu-repositorio>
cd maf-community

# Instale as dependências
npm install

# O projeto já está instalado e pronto para configuração
```
:

```bash
cp .env.local.example .env.local
```

Preencha com suas credenciais:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key

# Hotmart
HOTMART_CLIENT_ID=seu-client-id
HOTMART_CLIENT_SECRET=seu-client-secret
HOTMART_WEBHOOK_SECRET=seu-webhook-secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
> 📖 **Guia completo**: Consulte [SUPABASE_SETUP.md](SUPABASE_SETUP.md) para instruções passo a passo detalhadas.

#### 4.1. Execute as migrations SQL

No Supabase Dashboard > SQL Editor, execute os arquivos na ordem:

1. `supabase/migrations/001_initial_schema.sql` - Cria tabelas e estrutura
2. `supabase/migrations/002_rls_policies.sql` - Configura políticas de segurança
### 4. Configuração do Supabase

#### 4.1. Execute as migrations SQL

No Supabase Dashboard > SQL Editor, execute os arquivos na ordem:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_rls_policies.sql`

#### 4.2. Configure o Storage

Crie os seguintes buckets no Supabase Storage:

- **certificates** (privado)
  - Acesso: apenas owner + admins
  - Max file size: 10MB
  - Allowed MIME types: `application/pdf`, `image/jpeg`, `image/png`

- **avatars** (público)
  - Max file size: 2MB
  - Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`

- **post-media** (privado)
  - Acesso: membros ACTIVE
  - Max file size: 50MB

#### 4.3. Configure as políticas de Storage

Execute no SQL Editor:

```sql
-- Políticas para bucket 'certificates'
CREATE POLICY "Users can upload their certificates"
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

-- Políticas para bucket 'avatars'
CREATE POLICY "Avatars are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Políticas para bucket 'post-media'
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

### 5. Configure o Webhook Hotmart

1. Acesse o painel Hotmart
2. Configure o webhook para apontar para: `https://seu-dominio.com/api/hotmart/webhook`
3. Selecione os eventos:
   - `PURCHASE_APPROVED`
   - `PURCHASE_CANCELLED`
   - `PURCHASE_REFUNDED`
   - `SUBSCRIPTION_CANCELLATION`

### 6. Execute o projeto localmente

```bash
npm run dev
```

Acesse: http://localhost:3000

## 🔐 Segurança

### Row Level Security (RLS)
Todas as tabelas possuem RLS habilitado com políticas específicas:

- **Profiles**: usuários veem apenas perfis ACTIVE (exceto o próprio e admins)
- **Posts**: apenas membros ACTIVE podem criar/visualizar
- **Comments**: apenas membros ACTIVE
- **Reactions**: apenas membros ACTIVE
- **Materials**: apenas membros ACTIVE
- **Certificates**: apenas o próprio usuário + admins

### Proteção de Rotas
- Middleware protege todas as rotas `/app/*`
- Redirecionamento automático para `/login` se não autenticado
- Validação de `status_access = 'ACTIVE'` antes de acessar feed

### Upload Seguro
- Signed URLs com expiração
- Validação de MIME types
- Limite de tamanho por tipo de arquivo
- Hash de arquivos para detecção de duplicatas

## 🚀 Deploy

### Vercel
1. Conecte o repositório no Vercel
2. Configure as variáveis de ambiente
3. Deploy automático

### Supabase
1. Crie um projeto no Supabase
2. Execute as migrations
3. Configure os buckets de storage
4. Copie as credenciais para `.env.local`

## 📚 Estrutura de Pastas

```
maf-community/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   └── auth/callback/
│   ├── app/
│   │   ├── feed/
│   │   ├── materials/
│   │   ├── profile/
│   │   └── layout.tsx
│   ├── admin/
│   ├── onboarding/
│   ├── status/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── ui/
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   └── utils.ts
├── types/
│   └── database.types.ts
├── supabase/
│   └── migrations/
└── middleware.ts
```

## 🔄 Fluxo de Validação

1. **Usuário se registra** → `status_access = PENDING`
2. **Completa onboarding** → Upload certificado + email Hotmart
3. **Sistema verifica** → API Hotmart ou revisão manual
4. **Se aprovado** → `status_access = ACTIVE`
5. ✅ Status do Projeto

### Implementado
- ✅ Autenticação completa (registro, login, logout)
- ✅ Sistema de onboarding com upload de certificado
- ✅ Validação de status de usuário (PENDING → ACTIVE)
- ✅ Feed de posts com profile de usuário
- ✅ Biblioteca de materiais
- ✅ Página de perfil
- ✅ API routes para posts, comentários e reações
- ✅ Webhook Hotmart para validação automática
- ✅ Row Level Security (RLS) completo
- ✅ Middleware de autenticação
- ✅ UI com shadcn/ui components

### Próximos Passos (Roadmap)

- [ ] Implementar criação de posts no frontend (form + upload mídia)
- [ ] Adicionar comentários e reações interativos no feed
- [ ] Implementar notificações em tempo real (Supabase Realtime)
- [ ] Criar dashboard administrativo completo
- [ ] Adicionar sistema de busca/filtros
- [ ] Implementar paginação infinita no feed
- [ ] Adicionar testes unitários e E2E (Jest + Playwright)
- [ ] Configurar CI/CD (GitHub Actions)
- [ ] Adicionar analytics (PostHog ou similar)
- [ ] Implementar Sentry para error tracking
- [ ] Adicionar notificações por email (Resend ou SendGrid)
- [ ] Adicionar analytics (PostHog)
- [ ] Implementar Sentry para error tracking

## 📄 Licença

Este projeto é proprietário e confidencial.

## 🤝 Suporte

Para dúvidas ou problemas, contate: suporte@maf.com
