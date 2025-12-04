BEGIN;

-- Function to get leaderboard for admin
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
    u.eco_score,
    u.green_tier,
    u.credits,
    COALESCE(b.booking_count, 0) as total_bookings,
    COALESCE(b.total_savings, 0) as total_eco_savings
  FROM public.users u
  LEFT JOIN (
    SELECT 
      user_id,
      COUNT(*) as booking_count,
      SUM(eco_savings) as total_savings
    FROM public.bookings
    GROUP BY user_id
  ) b ON u.id = b.user_id
  ORDER BY u.eco_score DESC, u.credits DESC;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_leaderboard TO authenticated;

COMMIT;