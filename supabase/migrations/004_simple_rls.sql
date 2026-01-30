-- Solução SIMPLIFICADA para RLS - Use esta se continuar com erros
-- Esta versão é mais permissiva e garante que o registro funcione

-- ============================================
-- REMOVER TODAS AS POLÍTICAS EXISTENTES
-- ============================================
DROP POLICY IF EXISTS "Users can view active profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

DROP POLICY IF EXISTS "Users can view their own hotmart data" ON hotmart_customers;
DROP POLICY IF EXISTS "Users can view own hotmart data" ON hotmart_customers;
DROP POLICY IF EXISTS "Users can insert their own hotmart data" ON hotmart_customers;

DROP POLICY IF EXISTS "Users can view their own certificates" ON certificates;
DROP POLICY IF EXISTS "Users can view own certificates" ON certificates;
DROP POLICY IF EXISTS "Users can insert their own certificates" ON certificates;
DROP POLICY IF EXISTS "Admins can update certificates" ON certificates;
DROP POLICY IF EXISTS "Users can update own certificates" ON certificates;

-- ============================================
-- POLÍTICAS SIMPLIFICADAS - PROFILES
-- ============================================

-- SELECT: Ver perfis ACTIVE ou o próprio
CREATE POLICY "profiles_select_policy"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    status_access = 'ACTIVE' OR
    id = auth.uid()
  );

-- INSERT: Qualquer usuário autenticado pode criar seu perfil (SEM RESTRIÇÕES)
CREATE POLICY "profiles_insert_policy"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- UPDATE: Usuários podem atualizar seu próprio perfil
CREATE POLICY "profiles_update_policy"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ============================================
-- POLÍTICAS SIMPLIFICADAS - HOTMART_CUSTOMERS
-- ============================================

CREATE POLICY "hotmart_customers_select_policy"
  ON hotmart_customers FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "hotmart_customers_insert_policy"
  ON hotmart_customers FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================
-- POLÍTICAS SIMPLIFICADAS - CERTIFICATES
-- ============================================

CREATE POLICY "certificates_select_policy"
  ON certificates FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "certificates_insert_policy"
  ON certificates FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "certificates_update_policy"
  ON certificates FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================
-- POLÍTICAS SIMPLIFICADAS - POSTS
-- ============================================

DROP POLICY IF EXISTS "Active users can view published posts" ON posts;
DROP POLICY IF EXISTS "Active users can create posts" ON posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON posts;

CREATE POLICY "posts_select_policy"
  ON posts FOR SELECT
  TO authenticated
  USING (status = 'PUBLISHED');

CREATE POLICY "posts_insert_policy"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "posts_update_policy"
  ON posts FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "posts_delete_policy"
  ON posts FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================
-- POLÍTICAS SIMPLIFICADAS - COMMENTS
-- ============================================

DROP POLICY IF EXISTS "Active users can view published comments" ON comments;
DROP POLICY IF EXISTS "Active users can create comments" ON comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON comments;

CREATE POLICY "comments_select_policy"
  ON comments FOR SELECT
  TO authenticated
  USING (status = 'PUBLISHED');

CREATE POLICY "comments_insert_policy"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "comments_update_policy"
  ON comments FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================
-- POLÍTICAS SIMPLIFICADAS - REACTIONS
-- ============================================

DROP POLICY IF EXISTS "Active users can view reactions" ON reactions;
DROP POLICY IF EXISTS "Active users can create reactions" ON reactions;
DROP POLICY IF EXISTS "Users can delete their own reactions" ON reactions;

CREATE POLICY "reactions_select_policy"
  ON reactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "reactions_insert_policy"
  ON reactions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "reactions_delete_policy"
  ON reactions FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================
-- POLÍTICAS SIMPLIFICADAS - MATERIALS
-- ============================================

DROP POLICY IF EXISTS "Active users can view materials" ON materials;
DROP POLICY IF EXISTS "Admins can manage materials" ON materials;

CREATE POLICY "materials_select_policy"
  ON materials FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- POLÍTICAS SIMPLIFICADAS - REPORTS
-- ============================================

DROP POLICY IF EXISTS "Users can view their own reports" ON reports;
DROP POLICY IF EXISTS "Active users can create reports" ON reports;
DROP POLICY IF EXISTS "Admins can update reports" ON reports;

CREATE POLICY "reports_select_policy"
  ON reports FOR SELECT
  TO authenticated
  USING (reporter_id = auth.uid());

CREATE POLICY "reports_insert_policy"
  ON reports FOR INSERT
  TO authenticated
  WITH CHECK (reporter_id = auth.uid());

-- ============================================
-- NOTAS
-- ============================================
-- Esta configuração é mais permissiva e NÃO verifica status_access='ACTIVE'
-- A verificação de acesso deve ser feita na aplicação (middleware)
-- Use service_role key para operações administrativas
