BEGIN;

-- Function to get car analytics for admin
CREATE OR REPLACE FUNCTION public.get_car_analytics()
RETURNS TABLE (
  car_id UUID,
  car_name TEXT,
  car_type TEXT,
  total_bookings INTEGER,
  total_revenue DECIMAL,
  average_booking_distance DECIMAL,
  utilization_rate DECIMAL,
  total_eco_savings DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.type,
    COALESCE(b.booking_count, 0) as total_bookings,
    COALESCE(b.total_revenue, 0) as total_revenue,
    COALESCE(b.avg_distance, 0) as average_booking_distance,
    CASE 
      WHEN c.available THEN 
        ROUND((COALESCE(b.booking_count, 0) * 100.0) / GREATEST(COALESCE(b.booking_count, 0) + 1, 1), 2)
      ELSE 
        ROUND((COALESCE(b.booking_count, 0) * 100.0) / GREATEST(COALESCE(b.booking_count, 0) + 1, 1), 2)
    END as utilization_rate,
    COALESCE(b.total_savings, 0) as total_eco_savings
  FROM public.cars c
  LEFT JOIN (
    SELECT 
      car_id,
      COUNT(*) as booking_count,
      SUM(distance * 10) as total_revenue, -- Assuming $10 per km
      AVG(distance) as avg_distance,
      SUM(eco_savings) as total_savings
    FROM public.bookings
    GROUP BY car_id
  ) b ON c.id = b.car_id
  ORDER BY total_bookings DESC, total_revenue DESC;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_car_analytics TO authenticated;

COMMIT;