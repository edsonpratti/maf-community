-- Políticas RLS para Administradores
-- Permite que admins tenham acesso total para gerenciar o sistema

-- ============================================
-- ADICIONAR POLÍTICAS ADMIN - PROFILES
-- ============================================

-- Admins podem ver TODOS os perfis
CREATE POLICY "admins_can_view_all_profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.id IN (
        SELECT id FROM profiles WHERE role = 'ADMIN' AND status_access = 'ACTIVE'
      )
    )
  );

-- Admins podem atualizar qualquer perfil
CREATE POLICY "admins_can_update_any_profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.id IN (
        SELECT id FROM profiles WHERE role = 'ADMIN' AND status_access = 'ACTIVE'
      )
    )
  );

-- ============================================
-- ADICIONAR POLÍTICAS ADMIN - CERTIFICATES
-- ============================================

-- Admins podem ver TODOS os certificados
CREATE POLICY "admins_can_view_all_certificates"
  ON certificates FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.id IN (
        SELECT id FROM profiles WHERE role = 'ADMIN' AND status_access = 'ACTIVE'
      )
    )
  );

-- Admins podem atualizar qualquer certificado
CREATE POLICY "admins_can_update_any_certificate"
  ON certificates FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.id IN (
        SELECT id FROM profiles WHERE role = 'ADMIN' AND status_access = 'ACTIVE'
      )
    )
  );

-- ============================================
-- ADICIONAR POLÍTICAS ADMIN - HOTMART
-- ============================================

-- Admins podem ver todos os dados Hotmart
CREATE POLICY "admins_can_view_all_hotmart_customers"
  ON hotmart_customers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.id IN (
        SELECT id FROM profiles WHERE role = 'ADMIN' AND status_access = 'ACTIVE'
      )
    )
  );

CREATE POLICY "admins_can_view_all_hotmart_orders"
  ON hotmart_orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.id IN (
        SELECT id FROM profiles WHERE role = 'ADMIN' AND status_access = 'ACTIVE'
      )
    )
  );

-- ============================================
-- ADICIONAR POLÍTICAS ADMIN - POSTS & COMMENTS
-- ============================================

-- Admins podem ver todos os posts (incluindo rascunhos)
CREATE POLICY "admins_can_view_all_posts"
  ON posts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.id IN (
        SELECT id FROM profiles WHERE role = 'ADMIN' AND status_access = 'ACTIVE'
      )
    )
  );

-- Admins podem moderar posts
CREATE POLICY "admins_can_moderate_posts"
  ON posts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.id IN (
        SELECT id FROM profiles WHERE role = 'ADMIN' AND status_access = 'ACTIVE'
      )
    )
  );

-- Admins podem deletar posts
CREATE POLICY "admins_can_delete_posts"
  ON posts FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.id IN (
        SELECT id FROM profiles WHERE role = 'ADMIN' AND status_access = 'ACTIVE'
      )
    )
  );

-- Admins podem moderar comentários
CREATE POLICY "admins_can_moderate_comments"
  ON comments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.id IN (
        SELECT id FROM profiles WHERE role = 'ADMIN' AND status_access = 'ACTIVE'
      )
    )
  );

-- Admins podem deletar comentários
CREATE POLICY "admins_can_delete_comments"
  ON comments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.id IN (
        SELECT id FROM profiles WHERE role = 'ADMIN' AND status_access = 'ACTIVE'
      )
    )
  );

-- ============================================
-- ADICIONAR POLÍTICAS ADMIN - MATERIALS
-- ============================================

-- Admins podem gerenciar materiais
CREATE POLICY "admins_can_insert_materials"
  ON materials FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.id IN (
        SELECT id FROM profiles WHERE role = 'ADMIN' AND status_access = 'ACTIVE'
      )
    )
  );

CREATE POLICY "admins_can_update_materials"
  ON materials FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.id IN (
        SELECT id FROM profiles WHERE role = 'ADMIN' AND status_access = 'ACTIVE'
      )
    )
  );

CREATE POLICY "admins_can_delete_materials"
  ON materials FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.id IN (
        SELECT id FROM profiles WHERE role = 'ADMIN' AND status_access = 'ACTIVE'
      )
    )
  );

-- ============================================
-- ADICIONAR POLÍTICAS ADMIN - REPORTS
-- ============================================

-- Admins podem ver todas as denúncias
CREATE POLICY "admins_can_view_all_reports"
  ON reports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.id IN (
        SELECT id FROM profiles WHERE role = 'ADMIN' AND status_access = 'ACTIVE'
      )
    )
  );

-- Admins podem atualizar denúncias (resolver/rejeitar)
CREATE POLICY "admins_can_update_reports"
  ON reports FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.id IN (
        SELECT id FROM profiles WHERE role = 'ADMIN' AND status_access = 'ACTIVE'
      )
    )
  );

-- ============================================
-- STORAGE POLICIES - ADMIN
-- ============================================

-- Admins podem ver todos os certificados
CREATE POLICY "admins_can_view_all_certificates_storage"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'certificates' AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'ADMIN' 
      AND status_access = 'ACTIVE'
    )
  );

-- Admins podem baixar certificados
CREATE POLICY "admins_can_download_certificates"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'certificates' AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('ADMIN', 'MOD')
      AND status_access = 'ACTIVE'
    )
  );
