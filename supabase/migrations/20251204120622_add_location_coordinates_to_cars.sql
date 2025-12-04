BEGIN;

-- Add latitude and longitude columns to cars table
ALTER TABLE public.cars 
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8);

-- Update existing cars with approximate coordinates for their locations
UPDATE public.cars SET 
  latitude = 37.7749, 
  longitude = -122.4194 
WHERE location = 'San Francisco';

UPDATE public.cars SET 
  latitude = 34.0522, 
  longitude = -118.2437 
WHERE location = 'Los Angeles';

UPDATE public.cars SET 
  latitude = 40.7128, 
  longitude = -74.0060 
WHERE location = 'New York';

UPDATE public.cars SET 
  latitude = 41.8781, 
  longitude = -87.6298 
WHERE location = 'Chicago';

UPDATE public.cars SET 
  latitude = 47.6062, 
  longitude = -122.3321 
WHERE location = 'Seattle';

-- Create function to search cars by location radius
CREATE OR REPLACE FUNCTION public.search_cars_by_location(
  lat_param DECIMAL,
  lng_param DECIMAL,
  radius_km INTEGER DEFAULT 10,
  car_type_param TEXT DEFAULT NULL,
  available_only BOOLEAN DEFAULT true,
  limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
  car_id UUID,
  car_name TEXT,
  car_type TEXT,
  emission_rate DECIMAL,
  location TEXT,
  available BOOLEAN,
  image_url TEXT,
  eco_rating INTEGER,
  latitude DECIMAL,
  longitude DECIMAL,
  distance_km DECIMAL
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
    END as eco_rating,
    c.latitude,
    c.longitude,
    -- Calculate distance using Haversine formula
    ROUND(
      6371 * ACOS(
        LEAST(1.0, 
          GREATEST(-1.0,
            COS(RADIANS(lat_param)) * COS(RADIANS(c.latitude)) * 
            COS(RADIANS(c.longitude) - RADIANS(lng_param)) + 
            SIN(RADIANS(lat_param)) * SIN(RADIANS(c.latitude))
          )
        )
      ), 2
    ) as distance_km
  FROM public.cars c
  WHERE 
    c.latitude IS NOT NULL 
    AND c.longitude IS NOT NULL
    AND (car_type_param IS NULL OR c.type = car_type_param)
    AND (NOT available_only OR c.available = true)
    AND 6371 * ACOS(
      LEAST(1.0, 
        GREATEST(-1.0,
          COS(RADIANS(lat_param)) * COS(RADIANS(c.latitude)) * 
          COS(RADIANS(c.longitude) - RADIANS(lng_param)) + 
          SIN(RADIANS(lat_param)) * SIN(RADIANS(c.latitude))
        )
      )
    ) <= radius_km
  ORDER BY distance_km ASC
  LIMIT limit_count;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.search_cars_by_location TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_cars_by_location TO anon;

COMMIT;