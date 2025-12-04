BEGIN;

-- Function to get booking history for a user
CREATE OR REPLACE FUNCTION public.get_booking_history(
  user_id_param UUID,
  limit_count INTEGER DEFAULT 10,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  booking_id UUID,
  car_name TEXT,
  car_type TEXT,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  distance INTEGER,
  eco_savings DECIMAL,
  status TEXT,
  credits_earned INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id as booking_id,
    c.name as car_name,
    c.type as car_type,
    b.start_date,
    b.end_date,
    b.distance,
    b.eco_savings,
    b.status,
    CASE 
      WHEN u.green_tier = 'Gold' THEN ROUND(b.eco_savings * 1.5)
      WHEN u.green_tier = 'Silver' THEN ROUND(b.eco_savings * 1.2)
      ELSE ROUND(b.eco_savings)
    END as credits_earned
  FROM public.bookings b
  JOIN public.cars c ON b.car_id = c.id
  JOIN public.users u ON b.user_id = u.id
  WHERE b.user_id = user_id_param
  ORDER BY b.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_booking_history TO authenticated;

COMMIT;