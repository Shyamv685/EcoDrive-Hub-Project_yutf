BEGIN;

-- Create function to hash password
CREATE OR REPLACE FUNCTION public.hash_password(password TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This is a simple hash - in production use bcrypt
  RETURN encode(sha256(password::bytea), 'hex');
END;
$$;

-- Create function to verify password
CREATE OR REPLACE FUNCTION public.verify_password(password TEXT, hash TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN public.hash_password(password) = hash;
END;
$$;

-- Create function to create user with auth
CREATE OR REPLACE FUNCTION public.create_user_with_auth(
  user_email TEXT,
  user_password TEXT,
  user_name TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Check if email already exists
  IF EXISTS (SELECT 1 FROM public.users WHERE email = user_email) THEN
    RAISE EXCEPTION 'Email already exists';
  END IF;
  
  -- Insert new user with hashed password
  INSERT INTO public.users (name, email, password, eco_score, green_tier, credits)
  VALUES (user_name, user_email, public.hash_password(user_password), 0, 'Bronze', 0)
  RETURNING id INTO new_user_id;
  
  RETURN new_user_id;
END;
$$;

-- Create function to authenticate user
CREATE OR REPLACE FUNCTION public.authenticate_user(
  email_param TEXT,
  password_param TEXT
)
RETURNS TABLE (
  user_id UUID,
  user_name TEXT,
  user_email TEXT,
  eco_score INTEGER,
  green_tier TEXT,
  credits INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Find user by email
  SELECT * INTO user_record
  FROM public.users 
  WHERE email = email_param;
  
  -- Check if user exists and password matches
  IF user_record IS NULL OR NOT public.verify_password(password_param, user_record.password) THEN
    RETURN;
  END IF;
  
  -- Return user info
  RETURN QUERY
  SELECT 
    user_record.id,
    user_record.name,
    user_record.email,
    user_record.eco_score,
    user_record.green_tier,
    user_record.credits;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.hash_password TO anon;
GRANT EXECUTE ON FUNCTION public.verify_password TO anon;
GRANT EXECUTE ON FUNCTION public.create_user_with_auth TO anon;
GRANT EXECUTE ON FUNCTION public.authenticate_user TO anon;

COMMIT;