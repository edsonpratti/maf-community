-- Add 'UNDER_REVIEW' to status_access check constraint if not properly set

-- Re-apply constraints to be sure
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_status_access_check;

ALTER TABLE profiles ADD CONSTRAINT profiles_status_access_check 
  CHECK (status_access IN ('PENDING', 'UNDER_REVIEW', 'ACTIVE', 'SUSPENDED', 'REVOKED', 'EXPIRED'));
