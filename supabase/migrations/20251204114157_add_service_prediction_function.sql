BEGIN;

-- Function to predict service needs
CREATE OR REPLACE FUNCTION public.predict_service_needs(
  car_id_param UUID
)
RETURNS TABLE (
  needs_service BOOLEAN,
  service_type TEXT,
  urgency_level TEXT,
  last_service_date TIMESTAMP WITH TIME ZONE,
  distance_since_service INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  last_booking RECORD;
  distance_threshold INTEGER := 500; -- Service needed every 500km
BEGIN
  -- Get the most recent booking for this car
  SELECT * INTO last_booking
  FROM public.bookings 
  WHERE car_id = car_id_param 
  ORDER BY created_at DESC 
  LIMIT 1;
  
  -- If no bookings found, no service prediction needed
  IF last_booking IS NULL THEN
    RETURN QUERY SELECT false, NULL, NULL, NULL, 0;
    RETURN;
  END IF;
  
  -- Calculate distance since last service
  -- For simplicity, we'll use the distance from the last booking
  -- In a real app, you'd track cumulative distance
  
  -- Predict service needs based on distance
  IF last_booking.distance > distance_threshold THEN
    RETURN QUERY 
    SELECT 
      true as needs_service,
      CASE 
        WHEN (SELECT type FROM public.cars WHERE id = car_id_param) = 'EV' THEN 'Battery Check'
        WHEN (SELECT type FROM public.cars WHERE id = car_id_param) = 'Hybrid' THEN 'Hybrid System Service'
        ELSE 'Oil Change & Maintenance'
      END as service_type,
      'High' as urgency_level,
      last_booking.created_at as last_service_date,
      last_booking.distance as distance_since_service;
  ELSIF last_booking.distance > distance_threshold * 0.8 THEN
    RETURN QUERY 
    SELECT 
      true as needs_service,
      CASE 
        WHEN (SELECT type FROM public.cars WHERE id = car_id_param) = 'EV' THEN 'General Inspection'
        WHEN (SELECT type FROM public.cars WHERE id = car_id_param) = 'Hybrid' THEN 'Hybrid Inspection'
        ELSE 'General Maintenance'
      END as service_type,
      'Medium' as urgency_level,
      last_booking.created_at as last_service_date,
      last_booking.distance as distance_since_service;
  ELSE
    RETURN QUERY SELECT false, NULL, NULL, NULL, last_booking.distance;
  END IF;
  
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.predict_service_needs TO authenticated;
GRANT EXECUTE ON FUNCTION public.predict_service_needs TO anon;

COMMIT;