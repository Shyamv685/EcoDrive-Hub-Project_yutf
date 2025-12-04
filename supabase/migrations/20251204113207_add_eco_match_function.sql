BEGIN;

-- Function for AI-based eco matching
CREATE OR REPLACE FUNCTION public.eco_match(
  location_param TEXT DEFAULT NULL,
  car_type_param TEXT DEFAULT NULL,
  distance_param INTEGER DEFAULT 100
)
RETURNS TABLE (
  car_id UUID,
  car_name TEXT,
  car_type TEXT,
  emission_rate DECIMAL,
  location TEXT,
  available BOOLEAN,
  image_url TEXT,
  eco_savings DECIMAL,
  credits_potential INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  avg_emission DECIMAL := 150; -- Average gas car emission
  tier_multiplier DECIMAL := 1.0; -- Default multiplier
BEGIN
  -- Return available cars sorted by lowest emission rate
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.type,
    c.emission_rate,
    c.location,
    c.available,
    c.image_url,
    public.calculate_eco_savings(c.emission_rate, distance_param) as eco_savings,
    ROUND(public.calculate_eco_savings(c.emission_rate, distance_param) * tier_multiplier) as credits_potential
  FROM public.cars c
  WHERE c.available = true
    AND (location_param IS NULL OR c.location = location_param)
    AND (car_type_param IS NULL OR c.type = car_type_param)
  ORDER BY c.emission_rate ASC;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.eco_match TO authenticated;
GRANT EXECUTE ON FUNCTION public.eco_match TO anon;

COMMIT;