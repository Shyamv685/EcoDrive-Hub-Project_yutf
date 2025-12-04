BEGIN;

-- Function to get eco trends for analytics
CREATE OR REPLACE FUNCTION public.get_eco_trends(
  days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
  date_bucket TIMESTAMP WITH TIME ZONE,
  total_bookings INTEGER,
  total_eco_savings DECIMAL,
  average_emission_rate DECIMAL,
  ev_bookings INTEGER,
  hybrid_bookings INTEGER,
  gas_bookings INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE_TRUNC('day', b.created_at) as date_bucket,
    COUNT(*) as total_bookings,
    SUM(b.eco_savings) as total_eco_savings,
    AVG(c.emission_rate) as average_emission_rate,
    COUNT(CASE WHEN c.type = 'EV' THEN 1 END) as ev_bookings,
    COUNT(CASE WHEN c.type = 'Hybrid' THEN 1 END) as hybrid_bookings,
    COUNT(CASE WHEN c.type = 'Gas' THEN 1 END) as gas_bookings
  FROM public.bookings b
  JOIN public.cars c ON b.car_id = c.id
  WHERE b.created_at >= NOW() - INTERVAL '1 day' * days_back
  GROUP BY DATE_TRUNC('day', b.created_at)
  ORDER BY date_bucket DESC;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_eco_trends TO authenticated;

COMMIT;