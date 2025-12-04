BEGIN;

-- Function to get location-based analytics
CREATE OR REPLACE FUNCTION public.get_location_analytics()
RETURNS TABLE (
  location TEXT,
  total_cars INTEGER,
  available_cars INTEGER,
  total_bookings INTEGER,
  average_emission_rate DECIMAL,
  eco_score_potential DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.location,
    COUNT(*) as total_cars,
    COUNT(CASE WHEN c.available THEN 1 END) as available_cars,
    COALESCE(b.booking_count, 0) as total_bookings,
    AVG(c.emission_rate) as average_emission_rate,
    SUM(CASE WHEN c.type = 'EV' THEN 100 
             WHEN c.type = 'Hybrid' THEN 50 
             ELSE 10 END) as eco_score_potential
  FROM public.cars c
  LEFT JOIN (
    SELECT 
      car_id,
      COUNT(*) as booking_count
    FROM public.bookings
    GROUP BY car_id
  ) b ON c.id = b.car_id
  GROUP BY c.location
  ORDER BY total_bookings DESC, eco_score_potential DESC;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_location_analytics TO authenticated;

COMMIT;