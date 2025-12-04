BEGIN;

-- Function to get service history for a car
CREATE OR REPLACE FUNCTION public.get_service_history(
  car_id_param UUID,
  limit_count INTEGER DEFAULT 10,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  service_id UUID,
  service_type TEXT,
  scheduled_date TIMESTAMP WITH TIME ZONE,
  status TEXT,
  discount_applied BOOLEAN,
  days_until_service INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id as service_id,
    s.type as service_type,
    s.scheduled_date,
    s.status,
    s.discount_applied,
    CASE 
      WHEN s.status = 'scheduled' THEN 
        GREATEST(0, EXTRACT(DAYS FROM s.scheduled_date - NOW()))
      ELSE 
        NULL
    END as days_until_service
  FROM public.services s
  WHERE s.car_id = car_id_param
  ORDER BY s.scheduled_date DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_service_history TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_service_history TO anon;

COMMIT;