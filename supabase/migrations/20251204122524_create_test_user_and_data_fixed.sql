BEGIN;

-- Create a test user to ensure admin access works
INSERT INTO public.users (name, email, password, eco_score, green_tier, credits)
VALUES ('Admin User', 'admin@ecodrive.com', 'admin123', 100, 'Gold', 500)
ON CONFLICT (email) DO NOTHING;

-- Create some test bookings to populate analytics
INSERT INTO public.bookings (user_id, car_id, start_date, end_date, distance, eco_savings, status)
SELECT 
  u.id,
  c.id,
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '12 hours',
  FLOOR(RANDOM() * 50 + 10)::INTEGER,
  ((150 - c.emission_rate) * FLOOR(RANDOM() * 50 + 10) / 1000)::DECIMAL(10,2),
  CASE WHEN RANDOM() > 0.3 THEN 'completed' ELSE 'active' END
FROM public.users u, public.cars c
WHERE u.email = 'admin@ecodrive.com'
LIMIT 5
ON CONFLICT DO NOTHING;

-- Create some test services
INSERT INTO public.services (car_id, type, scheduled_date, status, discount_applied)
SELECT 
  c.id,
  CASE 
    WHEN c.type = 'EV' THEN 'Battery Check'
    WHEN c.type = 'Hybrid' THEN 'Hybrid System Service'
    ELSE 'Oil Change & Maintenance'
  END,
  NOW() + INTERVAL '7 days',
  'scheduled',
  RANDOM() > 0.5
FROM public.cars c
LIMIT 3
ON CONFLICT DO NOTHING;

COMMIT;