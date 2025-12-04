BEGIN;

-- Function to handle user signup
CREATE OR REPLACE FUNCTION public.signup_user(
  user_name TEXT,
  user_email TEXT,
  user_password TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Insert new user
  INSERT INTO public.users (name, email, password, eco_score, green_tier, credits)
  VALUES (user_name, user_email, user_password, 0, 'Bronze', 0)
  RETURNING id INTO new_user_id;
  
  RETURN new_user_id;
END;
$$;

-- Function to update eco score and tier
CREATE OR REPLACE FUNCTION public.update_eco_score(
  user_id_param UUID,
  additional_score INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_score INTEGER;
  new_tier TEXT;
BEGIN
  -- Get current eco score
  SELECT eco_score INTO current_score 
  FROM public.users 
  WHERE id = user_id_param;
  
  -- Update eco score
  UPDATE public.users 
  SET eco_score = current_score + additional_score,
      updated_at = NOW()
  WHERE id = user_id_param;
  
  -- Update tier based on new score
  IF (current_score + additional_score) > 300 THEN
    new_tier := 'Gold';
  ELSIF (current_score + additional_score) > 100 THEN
    new_tier := 'Silver';
  ELSE
    new_tier := 'Bronze';
  END IF;
  
  UPDATE public.users 
  SET green_tier = new_tier
  WHERE id = user_id_param;
END;
$$;

-- Function to calculate eco savings
CREATE OR REPLACE FUNCTION public.calculate_eco_savings(
  car_emission_rate DECIMAL,
  distance_km INTEGER
)
RETURNS DECIMAL
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  avg_emission DECIMAL := 150; -- Average gas car emission
  savings DECIMAL;
BEGIN
  savings := (avg_emission - car_emission_rate) * distance_km / 1000; -- Convert to kg CO2
  RETURN GREATEST(savings, 0); -- Ensure non-negative
END;
$$;

-- Function to award credits
CREATE OR REPLACE FUNCTION public.award_credits(
  user_id_param UUID,
  eco_savings DECIMAL,
  tier_multiplier DECIMAL DEFAULT 1.0
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  credits_awarded INTEGER;
BEGIN
  credits_awarded := ROUND(eco_savings * tier_multiplier);
  
  UPDATE public.users 
  SET credits = credits + credits_awarded,
      updated_at = NOW()
  WHERE id = user_id_param;
  
  RETURN credits_awarded;
END;
$$;

COMMIT;