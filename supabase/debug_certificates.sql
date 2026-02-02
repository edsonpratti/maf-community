-- DEBUG: Verificar certificados e políticas

-- 1. Listar todos os certificados na tabela
SELECT 
  c.id,
  c.user_id,
  c.file_path,
  c.review_status,
  c.created_at,
  p.full_name,
  p.role,
  p.status_access
FROM certificates c
JOIN profiles p ON c.user_id = p.id
ORDER BY c.created_at DESC
LIMIT 10;

-- 2. Listar arquivos no storage.objects do bucket certificates
SELECT 
  id,
  name,
  bucket_id,
  owner,
  created_at
FROM storage.objects
WHERE bucket_id = 'certificates'
ORDER BY created_at DESC
LIMIT 10;

-- 3. Verificar políticas de RLS na tabela certificates
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'certificates';

-- 4. Verificar políticas de storage
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'objects' AND schemaname = 'storage';

-- 5. Verificar se existe algum admin no sistema
SELECT 
  id,
  full_name,
  email,
  role,
  status_access
FROM profiles
WHERE role IN ('ADMIN', 'MOD')
ORDER BY created_at ASC
LIMIT 5;

-- 6. Contar certificados por status
SELECT 
  review_status,
  COUNT(*) as total
FROM certificates
GROUP BY review_status;

-- 7. Verificar se há incompatibilidade entre certificados e storage
SELECT 
  'Certificados na tabela' as source,
  COUNT(*) as total
FROM certificates
UNION ALL
SELECT 
  'Arquivos no storage' as source,
  COUNT(*) as total
FROM storage.objects
WHERE bucket_id = 'certificates';
