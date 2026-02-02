-- Criar função auxiliar para verificar se usuário é admin (sem recursão)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles
    WHERE id = auth.uid() 
    AND role IN ('ADMIN', 'MOD')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Recriar política de SELECT para certificados usando a função
DROP POLICY IF EXISTS "Users can view their own certificates" ON certificates;

CREATE POLICY "Users can view their own certificates"
ON certificates FOR SELECT
USING (
  user_id = auth.uid() OR public.is_admin()
);

-- Verificar se a política foi criada
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename = 'certificates'
ORDER BY policyname;
