BEGIN;

-- Function to get user statistics
CREATE OR REPLACE FUNCTION public.get_user_stats(
  user_id_param UUID
)
RETURNS TABLE (
  total_bookings INTEGER,
  total_distance INTEGER,
  total_eco_savings DECIMAL,
  current_credits INTEGER,
  current_eco_score INTEGER,
  current_tier TEXT,
  next_tier TEXT,
  points_to_next_tier INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record RECORD;
  booking_stats RECORD;
BEGIN
  -- Get user record
  SELECT * INTO user_record
  FROM public.users 
  WHERE id = user_id_param;
  
  -- Get booking statistics
  SELECT 
    COUNT(*) as booking_count,
    COALESCE(SUM(distance), 0) as total_distance,
    COALESCE(SUM(eco_savings), 0) as total_savings
  INTO booking_stats
  FROM public.bookings 
  WHERE user_id = user_id_param;
  
  -- Calculate next tier and points needed
  DECLARE
    next_tier_calc TEXT;
    points_needed INTEGER;
  BEGIN
    IF user_record.green_tier = 'Bronze' THEN
      next_tier_calc := 'Silver';
      points_needed := GREATEST(0, 101 - user_record.eco_score);
    ELSIF user_record.green_tier = 'Silver' THEN
      next_tier_calc := 'Gold';
      points_needed := GREATEST(0, 301 - user_record.eco_score);
    ELSE
      next_tier_calc := 'Max';
      points_needed := 0;
    END IF;
    
    RETURN QUERY
    SELECT 
      booking_stats.booking_count,
      booking_stats.total_distance,
      booking_stats.total_savings,
      user_record.credits,
      user_record.eco_score,
      user_record.green_tier,
      next_tier_calc,
      points_needed;
  END;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_user_stats TO authenticated;

COMMIT;