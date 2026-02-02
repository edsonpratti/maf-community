-- LIMPEZA COMPLETA: Remover TODAS as políticas de certificados e recriar do zero

-- 1. Remover todas as políticas relacionadas a certificados
DROP POLICY IF EXISTS "Users can upload certificates" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own certificates" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own certificates" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own certificates" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own certificates" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all certificates" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete certificates" ON storage.objects;

-- 2. RECRIAR políticas corretas do zero

-- 2.1. Usuários podem fazer upload de seus próprios certificados
-- O arquivo deve estar em uma pasta com o ID do usuário: {user_id}/arquivo.pdf
CREATE POLICY "Users upload own certificates"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'certificates' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 2.2. Usuários podem ver seus próprios certificados
CREATE POLICY "Users view own certificates"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'certificates' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 2.3. ADMINS podem ver TODOS os certificados (SEM restrição de folder)
CREATE POLICY "Admins view all certificates"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'certificates' AND
  EXISTS (
    SELECT 1 
    FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role IN ('ADMIN', 'MOD')
  )
);

-- 2.4. ADMINS podem deletar qualquer certificado
CREATE POLICY "Admins delete certificates"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'certificates' AND
  EXISTS (
    SELECT 1 
    FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role IN ('ADMIN', 'MOD')
  )
);

-- 3. Verificar políticas criadas
SELECT 
  policyname,
  cmd,
  roles,
  CASE 
    WHEN qual IS NOT NULL THEN 'USING: ' || qual::text
    WHEN with_check IS NOT NULL THEN 'CHECK: ' || with_check::text
    ELSE 'No condition'
  END as condition
FROM pg_policies
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%certificate%'
ORDER BY policyname;
