-- Add email column to profiles if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, status_access)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Novo Usuário'),
    NEW.email,
    'USER',
    'PENDING'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Sync existing users who might have no profile
INSERT INTO public.profiles (id, full_name, email, role, status_access)
SELECT 
  id, 
  COALESCE(raw_user_meta_data->>'full_name', 'Usuário Existente'), 
  email, 
  'USER', 
  'PENDING'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);

-- Update emails for existing profiles if null
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;
