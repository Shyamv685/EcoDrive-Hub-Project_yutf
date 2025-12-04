BEGIN;

-- Function to get booking summary for dashboard
CREATE OR REPLACE FUNCTION public.get_booking_summary(
  user_id_param UUID,
  days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
  total_bookings INTEGER,
  active_bookings INTEGER,
  completed_bookings INTEGER,
  total_distance INTEGER,
  total_eco_savings DECIMAL,
  average_trip_length DECIMAL,
  favorite_car_type TEXT,
  next_booking_date TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_bookings,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_bookings,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_bookings,
    COALESCE(SUM(distance), 0) as total_distance,
    COALESCE(SUM(eco_savings), 0) as total_eco_savings,
    COALESCE(AVG(distance), 0) as average_trip_length,
    (SELECT c.type FROM public.bookings b2 
     JOIN public.cars c ON b2.car_id = c.id 
     WHERE b2.user_id = user_id_param 
     GROUP BY c.type 
     ORDER BY COUNT(*) DESC 
     LIMIT 1) as favorite_car_type,
    (SELECT MIN(start_date) FROM public.bookings 
     WHERE user_id = user_id_param 
     AND start_date > NOW() 
     AND status = 'active') as next_booking_date
  FROM public.bookings 
  WHERE user_id = user_id_param
    AND created_at >= NOW() - INTERVAL '1 day' * days_back;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_booking_summary TO authenticated;

COMMIT;