-- TESTE: Verificar acesso do admin aos certificados

-- 1. Listar todos os admins
SELECT 
  id,
  full_name,
  email,
  role,
  status_access,
  created_at
FROM profiles
WHERE role IN ('ADMIN', 'MOD')
ORDER BY created_at;

-- 2. Verificar se as políticas de storage estão ativas
SELECT 
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%certificate%'
ORDER BY policyname;

-- 3. Simular query do admin para buscar usuários com certificados
-- (isso é o que o código Next.js está fazendo)
SELECT 
  p.*,
  json_agg(
    json_build_object(
      'id', c.id,
      'file_path', c.file_path,
      'review_status', c.review_status,
      'created_at', c.created_at
    )
  ) FILTER (WHERE c.id IS NOT NULL) as certificates
FROM profiles p
LEFT JOIN certificates c ON c.user_id = p.id
GROUP BY p.id
ORDER BY p.created_at DESC
LIMIT 10;

-- 4. Verificar se o admin específico pode ver certificados via RLS
-- IMPORTANTE: Substitua 'SEU_ADMIN_ID' pelo ID real do admin
-- Para descobrir seu ID, veja o resultado da query 1 acima

-- Exemplo de como testar (descomente e substitua o ID):
-- SET LOCAL role TO authenticated;
-- SET LOCAL request.jwt.claims TO '{"sub": "96b62fe8-42eb-41c2-abec-b74380034d85"}';
-- 
-- SELECT * FROM certificates;
-- SELECT * FROM storage.objects WHERE bucket_id = 'certificates';

-- 5. Teste direto: um admin consegue ver certificados na tabela?
SELECT 
  c.id,
  c.user_id,
  c.file_path,
  c.review_status,
  p.full_name,
  p.role
FROM certificates c
JOIN profiles p ON c.user_id = p.id
ORDER BY c.created_at DESC;
