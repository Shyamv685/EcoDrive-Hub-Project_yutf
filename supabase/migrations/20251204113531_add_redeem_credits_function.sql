BEGIN;

-- Function to redeem credits
CREATE OR REPLACE FUNCTION public.redeem_credits(
  user_id_param UUID,
  credits_to_redeem INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_credits INTEGER;
BEGIN
  -- Get current credits
  SELECT credits INTO current_credits 
  FROM public.users 
  WHERE id = user_id_param;
  
  -- Check if user has enough credits
  IF current_credits < credits_to_redeem THEN
    RETURN false;
  END IF;
  
  -- Deduct credits
  UPDATE public.users 
  SET credits = credits - credits_to_redeem,
      updated_at = NOW()
  WHERE id = user_id_param;
  
  RETURN true;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.redeem_credits TO authenticated;

COMMIT;