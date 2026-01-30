-- Correção para recursão infinita nas políticas RLS
-- Execute este arquivo APÓS executar 001_initial_schema.sql e 002_rls_policies.sql

-- ============================================
-- FIX 1: Remover políticas recursivas de PROFILES
-- ============================================
DROP POLICY IF EXISTS "Users can view active profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Recriar políticas SEM recursão
CREATE POLICY "Users can view profiles"
  ON profiles FOR SELECT
  USING (
    status_access = 'ACTIVE' OR
    id = auth.uid()
  );

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (
    id = auth.uid() AND
    role = 'USER' AND
    status_access IN ('PENDING', 'UNDER_REVIEW')
  );

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid() AND
    -- Usuários comuns não podem mudar role ou status_access para ACTIVE
    (role = 'USER' OR role IS NULL) AND
    (status_access IN ('PENDING', 'UNDER_REVIEW') OR status_access IS NULL)
  );

-- ============================================
-- FIX 2: Corrigir política de HOTMART_CUSTOMERS
-- ============================================
DROP POLICY IF EXISTS "Users can view their own hotmart data" ON hotmart_customers;

CREATE POLICY "Users can view own hotmart data"
  ON hotmart_customers FOR SELECT
  USING (user_id = auth.uid());

-- ============================================
-- FIX 3: Corrigir política de CERTIFICATES
-- ============================================
DROP POLICY IF EXISTS "Users can view their own certificates" ON certificates;
DROP POLICY IF EXISTS "Admins can update certificates" ON certificates;

CREATE POLICY "Users can view own certificates"
  ON certificates FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own certificates"
  ON certificates FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================
-- NOTA IMPORTANTE
-- ============================================
-- Para operações administrativas (aprovar certificados, mudar status de usuários, etc.),
-- use o SUPABASE_SERVICE_ROLE_KEY no servidor (Next.js API routes).
-- O service_role key bypassa automaticamente todas as políticas RLS.
--
-- Exemplo no código:
-- const supabase = createClient(
--   process.env.NEXT_PUBLIC_SUPABASE_URL!,
--   process.env.SUPABASE_SERVICE_ROLE_KEY! // <-- Service role key
-- )
