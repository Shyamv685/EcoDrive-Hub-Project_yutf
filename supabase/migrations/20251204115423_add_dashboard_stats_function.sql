BEGIN;

-- Function to get overall dashboard statistics for admin
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS TABLE (
  total_users INTEGER,
  total_cars INTEGER,
  total_bookings INTEGER,
  active_bookings INTEGER,
  total_eco_savings DECIMAL,
  total_credits_awarded INTEGER,
  average_eco_score DECIMAL,
  most_popular_location TEXT,
  ev_percentage DECIMAL,
  revenue_this_month DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.users) as total_users,
    (SELECT COUNT(*) FROM public.cars) as total_cars,
    (SELECT COUNT(*) FROM public.bookings) as total_bookings,
    (SELECT COUNT(*) FROM public.bookings WHERE status = 'active') as active_bookings,
    COALESCE((SELECT SUM(eco_savings) FROM public.bookings), 0) as total_eco_savings,
    COALESCE((SELECT SUM(credits) FROM public.users), 0) as total_credits_awarded,
    COALESCE((SELECT AVG(eco_score) FROM public.users), 0) as average_eco_score,
    (SELECT location FROM public.cars c 
     JOIN public.bookings b ON c.id = b.car_id 
     GROUP BY c.location 
     ORDER BY COUNT(*) DESC 
     LIMIT 1) as most_popular_location,
    ROUND((SELECT COUNT(*) FROM public.cars WHERE type = 'EV') * 100.0 / 
          NULLIF((SELECT COUNT(*) FROM public.cars), 0), 2) as ev_percentage,
    COALESCE((SELECT SUM(distance * 10) FROM public.bookings 
              WHERE created_at >= DATE_TRUNC('month', NOW())), 0) as revenue_this_month
  FROM public.users 
  LIMIT 1;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_dashboard_stats TO authenticated;

COMMIT;