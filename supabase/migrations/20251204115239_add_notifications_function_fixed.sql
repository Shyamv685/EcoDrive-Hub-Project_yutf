BEGIN;

-- Function to get user notifications
CREATE OR REPLACE FUNCTION public.get_user_notifications(
  user_id_param UUID,
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  notification_type TEXT,
  message TEXT,
  related_id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  is_read BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN s.needs_service AND s.urgency_level = 'High' THEN 'service_urgent'
      WHEN s.needs_service AND s.urgency_level = 'Medium' THEN 'service_reminder'
      WHEN b.status = 'completed' THEN 'booking_completed'
      WHEN b.status = 'active' AND b.end_date <= NOW() + INTERVAL '1 day' THEN 'booking_due'
      ELSE 'general'
    END as notification_type,
    CASE 
      WHEN s.needs_service AND s.urgency_level = 'High' THEN 
        'Urgent: ' || s.service_type || ' needed for your vehicle'
      WHEN s.needs_service AND s.urgency_level = 'Medium' THEN 
        'Reminder: ' || s.service_type || ' scheduled soon'
      WHEN b.status = 'completed' THEN 
        'Your rental has been completed. You earned credits!'
      WHEN b.status = 'active' AND b.end_date <= NOW() + INTERVAL '1 day' THEN 
        'Your rental is due tomorrow. Please return the vehicle on time.'
      ELSE 'Welcome to EcoDrive Hub!'
    END as message,
    COALESCE(b.car_id, s.car_id) as related_id,
    GREATEST(b.created_at, s.scheduled_date, NOW() - INTERVAL '1 day') as created_at,
    false as is_read
  FROM public.users u
  LEFT JOIN public.bookings b ON u.id = b.user_id AND b.created_at >= NOW() - INTERVAL '7 days'
  LEFT JOIN (
    SELECT car_id, true as needs_service, service_type, urgency_level, scheduled_date
    FROM public.services 
    WHERE status = 'scheduled' AND scheduled_date <= NOW() + INTERVAL '7 days'
  ) s ON EXISTS (
    SELECT 1 FROM public.bookings 
    WHERE bookings.car_id = s.car_id 
    AND bookings.user_id = u.id
  )
  WHERE u.id = user_id_param
    AND (b.id IS NOT NULL OR s.car_id IS NOT NULL)
  ORDER BY created_at DESC
  LIMIT limit_count;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_user_notifications TO authenticated;

COMMIT;