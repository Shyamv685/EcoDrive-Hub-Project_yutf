BEGIN;

-- Fix admin function to work with UUID properly
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- For demo purposes, we'll consider the first user as admin
  -- In production, you'd have a proper admin role system
  RETURN user_id = (SELECT id FROM public.users ORDER BY created_at ASC LIMIT 1);
END;
$$;

-- Ensure all required functions exist and work properly
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
    COALESCE((SELECT COUNT(*) FROM public.users), 0) as total_users,
    COALESCE((SELECT COUNT(*) FROM public.cars), 0) as total_cars,
    COALESCE((SELECT COUNT(*) FROM public.bookings), 0) as total_bookings,
    COALESCE((SELECT COUNT(*) FROM public.bookings WHERE status = 'active'), 0) as active_bookings,
    COALESCE((SELECT SUM(eco_savings) FROM public.bookings), 0) as total_eco_savings,
    COALESCE((SELECT SUM(credits) FROM public.users), 0) as total_credits_awarded,
    COALESCE((SELECT AVG(eco_score) FROM public.users), 0) as average_eco_score,
    COALESCE((SELECT location FROM public.cars c 
              JOIN public.bookings b ON c.id = b.car_id 
              GROUP BY c.location 
              ORDER BY COUNT(*) DESC 
              LIMIT 1), 'Unknown') as most_popular_location,
    COALESCE(ROUND((SELECT COUNT(*) FROM public.cars WHERE type = 'EV') * 100.0 / 
                   NULLIF((SELECT COUNT(*) FROM public.cars), 0), 2), 0) as ev_percentage,
    COALESCE((SELECT SUM(distance * 10) FROM public.bookings 
              WHERE created_at >= DATE_TRUNC('month', NOW())), 0) as revenue_this_month
  FROM public.users 
  LIMIT 1;
END;
$$;

-- Fix car analytics function
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
        COALESCE(ROUND((b.booking_count * 100.0) / GREATEST(b.booking_count + 1, 1), 2), 0)
      ELSE 
        COALESCE(ROUND((b.booking_count * 100.0) / GREATEST(b.booking_count + 1, 1), 2), 0)
    END as utilization_rate,
    COALESCE(b.total_savings, 0) as total_eco_savings
  FROM public.cars c
  LEFT JOIN (
    SELECT 
      car_id,
      COUNT(*) as booking_count,
      COALESCE(SUM(distance * 10), 0) as total_revenue, -- Assuming $10 per km
      COALESCE(AVG(distance), 0) as avg_distance,
      COALESCE(SUM(eco_savings), 0) as total_savings
    FROM public.bookings
    GROUP BY car_id
  ) b ON c.id = b.car_id
  ORDER BY total_bookings DESC, total_revenue DESC;
END;
$$;

-- Fix leaderboard function
CREATE OR REPLACE FUNCTION public.get_leaderboard()
RETURNS TABLE (
  user_id UUID,
  user_name TEXT,
  user_email TEXT,
  eco_score INTEGER,
  green_tier TEXT,
  credits INTEGER,
  total_bookings INTEGER,
  total_eco_savings DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.name,
    u.email,
    COALESCE(u.eco_score, 0) as eco_score,
    COALESCE(u.green_tier, 'Bronze') as green_tier,
    COALESCE(u.credits, 0) as credits,
    COALESCE(b.booking_count, 0) as total_bookings,
    COALESCE(b.total_savings, 0) as total_eco_savings
  FROM public.users u
  LEFT JOIN (
    SELECT 
      user_id,
      COUNT(*) as booking_count,
      COALESCE(SUM(eco_savings), 0) as total_savings
    FROM public.bookings
    GROUP BY user_id
  ) b ON u.id = b.user_id
  ORDER BY u.eco_score DESC, u.credits DESC;
END;
$$;

-- Grant execute permissions for all functions
GRANT EXECUTE ON FUNCTION public.is_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_dashboard_stats TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_car_analytics TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_leaderboard TO authenticated;

-- Ensure RLS policies are working correctly
DROP POLICY IF EXISTS "Admins can insert cars" ON cars;
CREATE POLICY "Admins can insert cars" ON cars FOR INSERT WITH CHECK (public.is_admin(auth.uid()::uuid));

DROP POLICY IF EXISTS "Admins can delete cars" ON cars;
CREATE POLICY "Admins can delete cars" ON cars FOR DELETE USING (public.is_admin(auth.uid()::uuid));

DROP POLICY IF EXISTS "Admins can insert services" ON services;
CREATE POLICY "Admins can insert services" ON services FOR INSERT WITH CHECK (public.is_admin(auth.uid()::uuid));

DROP POLICY IF EXISTS "Admins can delete services" ON services;
CREATE POLICY "Admins can delete services" ON services FOR DELETE USING (public.is_admin(auth.uid()::uuid));

COMMIT;