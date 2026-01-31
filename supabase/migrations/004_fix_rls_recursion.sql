-- Create a security definer function to check admin role
-- This avoids infinite recursion in RLS policies
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid() 
    AND role IN ('ADMIN', 'MOD')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the profiles policy to use the non-recursive function
DROP POLICY IF EXISTS "Users can view active profiles" ON profiles;

CREATE POLICY "Users can view active profiles"
  ON profiles FOR SELECT
  USING (
    status_access = 'ACTIVE' OR
    id = auth.uid() OR
    public.is_admin()
  );
