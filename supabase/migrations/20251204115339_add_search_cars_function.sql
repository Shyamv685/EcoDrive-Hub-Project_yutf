BEGIN;

-- Function to search cars with advanced filters
CREATE OR REPLACE FUNCTION public.search_cars(
  search_term TEXT DEFAULT NULL,
  car_type_param TEXT DEFAULT NULL,
  location_param TEXT DEFAULT NULL,
  min_emission_rate DECIMAL DEFAULT NULL,
  max_emission_rate DECIMAL DEFAULT NULL,
  available_only BOOLEAN DEFAULT true,
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  car_id UUID,
  car_name TEXT,
  car_type TEXT,
  emission_rate DECIMAL,
  location TEXT,
  available BOOLEAN,
  image_url TEXT,
  eco_rating INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as car_id,
    c.name as car_name,
    c.type as car_type,
    c.emission_rate,
    c.location,
    c.available,
    c.image_url,
    CASE 
      WHEN c.emission_rate = 0 THEN 100
      WHEN c.emission_rate <= 50 THEN 80
      WHEN c.emission_rate <= 100 THEN 60
      WHEN c.emission_rate <= 150 THEN 40
      ELSE 20
    END as eco_rating
  FROM public.cars c
  WHERE 
    (search_term IS NULL OR 
     LOWER(c.name) LIKE LOWER('%' || search_term || '%') OR
     LOWER(c.type) LIKE LOWER('%' || search_term || '%') OR
     LOWER(c.location) LIKE LOWER('%' || search_term || '%'))
    AND (car_type_param IS NULL OR c.type = car_type_param)
    AND (location_param IS NULL OR c.location = location_param)
    AND (min_emission_rate IS NULL OR c.emission_rate >= min_emission_rate)
    AND (max_emission_rate IS NULL OR c.emission_rate <= max_emission_rate)
    AND (NOT available_only OR c.available = true)
  ORDER BY 
    CASE 
      WHEN c.emission_rate = 0 THEN 1
      WHEN c.type = 'Hybrid' THEN 2
      ELSE 3
    END,
    c.name
  LIMIT limit_count
  OFFSET offset_count;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.search_cars TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_cars TO anon;

COMMIT;