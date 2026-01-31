-- Update constraints for role and status_access

-- Drop existing constraints
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_status_access_check;

-- Add updated constraints
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('USER', 'ADMIN', 'MOD', 'SUPER_ADMIN'));

ALTER TABLE profiles ADD CONSTRAINT profiles_status_access_check 
  CHECK (status_access IN ('PENDING', 'UNDER_REVIEW', 'ACTIVE', 'SUSPENDED', 'REVOKED', 'EXPIRED'));
