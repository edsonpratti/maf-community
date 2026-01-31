-- Allow Admins to update profiles
-- Currently, the policy only allows users to update their own profile
-- We need to add a policy for admins to update ANY profile

DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;

CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  USING (public.is_admin());
