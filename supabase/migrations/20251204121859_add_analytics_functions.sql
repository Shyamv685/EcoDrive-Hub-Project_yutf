BEGIN;

-- Function to get eco trends with date formatting
CREATE OR REPLACE FUNCTION public.get_eco_trends_formatted(
  days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
  date_bucket TEXT,
  total_bookings INTEGER,
  total_eco_savings DECIMAL,
  average_emission_rate DECIMAL,
  ev_bookings INTEGER,
  hybrid_bookings INTEGER,
  gas_bookings INTEGER,
  ev_percentage DECIMAL,
  hybrid_percentage DECIMAL,
  gas_percentage DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_bookings_count INTEGER;
BEGIN
  RETURN QUERY
  SELECT 
    TO_CHAR(DATE_TRUNC('day', b.created_at), 'MM/DD') as date_bucket,
    COUNT(*) as total_bookings,
    ROUND(SUM(b.eco_savings), 2) as total_eco_savings,
    ROUND(AVG(c.emission_rate), 2) as average_emission_rate,
    COUNT(CASE WHEN c.type = 'EV' THEN 1 END) as ev_bookings,
    COUNT(CASE WHEN c.type = 'Hybrid' THEN 1 END) as hybrid_bookings,
    COUNT(CASE WHEN c.type = 'Gas' THEN 1 END) as gas_bookings,
    ROUND(COUNT(CASE WHEN c.type = 'EV' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 2) as ev_percentage,
    ROUND(COUNT(CASE WHEN c.type = 'Hybrid' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 2) as hybrid_percentage,
    ROUND(COUNT(CASE WHEN c.type = 'Gas' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 2) as gas_percentage
  FROM public.bookings b
  JOIN public.cars c ON b.car_id = c.id
  WHERE b.created_at >= NOW() - INTERVAL '1 day' * days_back
  GROUP BY DATE_TRUNC('day', b.created_at)
  ORDER BY date_bucket DESC;
END;
$$;

-- Function to get monthly revenue trends
CREATE OR REPLACE FUNCTION public.get_revenue_trends(
  months_back INTEGER DEFAULT 12
)
RETURNS TABLE (
  month_bucket TEXT,
  total_revenue DECIMAL,
  total_bookings INTEGER,
  average_booking_value DECIMAL,
  eco_savings_bonus DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY') as month_bucket,
    ROUND(SUM(distance * 10), 2) as total_revenue, -- $10 per km
    COUNT(*) as total_bookings,
    ROUND(AVG(distance * 10), 2) as average_booking_value,
    ROUND(SUM(eco_savings) * 2, 2) as eco_savings_bonus -- $2 per kg CO2 saved
  FROM public.bookings
  WHERE created_at >= NOW() - INTERVAL '1 month' * months_back
  GROUP BY DATE_TRUNC('month', created_at)
  ORDER BY month_bucket DESC;
END;
$$;

-- Function to get user growth trends
CREATE OR REPLACE FUNCTION public.get_user_growth_trends(
  months_back INTEGER DEFAULT 12
)
RETURNS TABLE (
  month_bucket TEXT,
  new_users INTEGER,
  total_users INTEGER,
  active_users INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY') as month_bucket,
    COUNT(*) as new_users,
    (
      SELECT COUNT(*) 
      FROM public.users 
      WHERE created_at <= DATE_TRUNC('month', u.created_at) + INTERVAL '1 month' - INTERVAL '1 second'
    ) as total_users,
    (
      SELECT COUNT(DISTINCT user_id) 
      FROM public.bookings b
      WHERE b.created_at >= DATE_TRUNC('month', u.created_at) 
      AND b.created_at < DATE_TRUNC('month', u.created_at) + INTERVAL '1 month'
    ) as active_users
  FROM public.users u
  WHERE u.created_at >= NOW() - INTERVAL '1 month' * months_back
  GROUP BY DATE_TRUNC('month', u.created_at)
  ORDER BY month_bucket DESC;
END;
$$;

-- Function to get car utilization trends
CREATE OR REPLACE FUNCTION public.get_car_utilization_trends(
  days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
  date_bucket TEXT,
  total_cars INTEGER,
  available_cars INTEGER,
  booked_cars INTEGER,
  utilization_rate DECIMAL,
  ev_utilization DECIMAL,
  hybrid_utilization DECIMAL,
  gas_utilization DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    TO_CHAR(DATE_TRUNC('day', b.created_at), 'MM/DD') as date_bucket,
    (SELECT COUNT(*) FROM public.cars) as total_cars,
    COUNT(CASE WHEN c.available THEN 1 END) as available_cars,
    COUNT(CASE WHEN NOT c.available THEN 1 END) as booked_cars,
    ROUND(COUNT(CASE WHEN NOT c.available THEN 1 END) * 100.0 / NULLIF((SELECT COUNT(*) FROM public.cars), 0), 2) as utilization_rate,
    ROUND(COUNT(CASE WHEN c.type = 'EV' AND NOT c.available THEN 1 END) * 100.0 / NULLIF(COUNT(CASE WHEN c.type = 'EV' THEN 1 END), 0), 2) as ev_utilization,
    ROUND(COUNT(CASE WHEN c.type = 'Hybrid' AND NOT c.available THEN 1 END) * 100.0 / NULLIF(COUNT(CASE WHEN c.type = 'Hybrid' THEN 1 END), 0), 2) as hybrid_utilization,
    ROUND(COUNT(CASE WHEN c.type = 'Gas' AND NOT c.available THEN 1 END) * 100.0 / NULLIF(COUNT(CASE WHEN c.type = 'Gas' THEN 1 END), 0), 2) as gas_utilization
  FROM public.bookings b
  JOIN public.cars c ON b.car_id = c.id
  WHERE b.created_at >= NOW() - INTERVAL '1 day' * days_back
  GROUP BY DATE_TRUNC('day', b.created_at)
  ORDER BY date_bucket DESC;
END;
$$;

-- Grant permissions for all new functions
GRANT EXECUTE ON FUNCTION public.get_eco_trends_formatted TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_eco_trends_formatted TO anon;
GRANT EXECUTE ON FUNCTION public.get_revenue_trends TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_revenue_trends TO anon;
GRANT EXECUTE ON FUNCTION public.get_user_growth_trends TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_growth_trends TO anon;
GRANT EXECUTE ON FUNCTION public.get_car_utilization_trends TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_car_utilization_trends TO anon;

COMMIT;