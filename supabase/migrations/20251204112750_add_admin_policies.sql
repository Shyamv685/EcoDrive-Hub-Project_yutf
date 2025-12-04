BEGIN;

-- Create admin role function
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- For now, we'll consider the first user as admin
  -- In production, you'd have a proper admin role system
  RETURN user_id = (SELECT id FROM public.users ORDER BY created_at ASC LIMIT 1);
END;
$$;

-- Update RLS policies to allow admin access
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid()::text = id::text OR public.is_admin(auth.uid()::uuid));

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text OR public.is_admin(auth.uid()::uuid));

DROP POLICY IF EXISTS "Everyone can view cars" ON cars;
CREATE POLICY "Everyone can view cars" ON cars FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can book cars" ON cars;
CREATE POLICY "Authenticated users can book cars" ON cars FOR UPDATE USING (auth.role() = 'authenticated' OR public.is_admin(auth.uid()::uuid));

-- Admin can insert/update/delete cars
CREATE POLICY "Admins can insert cars" ON cars FOR INSERT WITH CHECK (public.is_admin(auth.uid()::uuid));
CREATE POLICY "Admins can delete cars" ON cars FOR DELETE USING (public.is_admin(auth.uid()::uuid));

-- Admin can view all bookings
DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
CREATE POLICY "Users can view own bookings" ON bookings FOR SELECT USING (auth.uid()::text = user_id::text OR public.is_admin(auth.uid()::uuid));

DROP POLICY IF EXISTS "Users can create own bookings" ON bookings;
CREATE POLICY "Users can create own bookings" ON bookings FOR INSERT WITH CHECK (auth.uid()::text = user_id::text OR public.is_admin(auth.uid()::uuid));

DROP POLICY IF EXISTS "Users can update own bookings" ON bookings;
CREATE POLICY "Users can update own bookings" ON bookings FOR UPDATE USING (auth.uid()::text = user_id::text OR public.is_admin(auth.uid()::uuid));

-- Admin can delete bookings
CREATE POLICY "Admins can delete bookings" ON bookings FOR DELETE USING (public.is_admin(auth.uid()::uuid));

-- Admin can view all services
DROP POLICY IF EXISTS "Users can view services for booked cars" ON services;
CREATE POLICY "Users can view services for booked cars" ON services FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM bookings 
    WHERE bookings.car_id = services.car_id 
    AND bookings.user_id::text = auth.uid()::text
  ) OR public.is_admin(auth.uid()::uuid)
);

-- Admin can insert/update/delete services
CREATE POLICY "Admins can insert services" ON services FOR INSERT WITH CHECK (public.is_admin(auth.uid()::uuid));
CREATE POLICY "Admins can update services" ON services FOR UPDATE USING (public.is_admin(auth.uid()::uuid));
CREATE POLICY "Admins can delete services" ON services FOR DELETE USING (public.is_admin(auth.uid()::uuid));

-- Grant execute permission for admin function
GRANT EXECUTE ON FUNCTION public.is_admin TO authenticated;

COMMIT;