BEGIN;

-- Function to update car availability when booking is created
CREATE OR REPLACE FUNCTION public.update_car_availability_on_booking()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update car availability to false when booking is created
  UPDATE public.cars 
  SET available = false, updated_at = NOW()
  WHERE id = NEW.car_id;
  
  RETURN NEW;
END;
$$;

-- Function to update car availability when booking is completed/cancelled
CREATE OR REPLACE FUNCTION public.restore_car_availability_on_booking()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update car availability to true when booking is completed or cancelled
  IF NEW.status IN ('completed', 'cancelled') THEN
    UPDATE public.cars 
    SET available = true, updated_at = NOW()
    WHERE id = NEW.car_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Function to update user eco score and credits after booking
CREATE OR REPLACE FUNCTION public.update_user_eco_after_booking()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  tier_multiplier DECIMAL;
BEGIN
  -- Calculate tier multiplier
  IF (SELECT green_tier FROM public.users WHERE id = NEW.user_id) = 'Gold' THEN
    tier_multiplier := 1.5;
  ELSIF (SELECT green_tier FROM public.users WHERE id = NEW.user_id) = 'Silver' THEN
    tier_multiplier := 1.2;
  ELSE
    tier_multiplier := 1.0;
  END IF;
  
  -- Update eco score
  PERFORM public.update_eco_score(NEW.user_id, NEW.distance);
  
  -- Award credits
  PERFORM public.award_credits(NEW.user_id, NEW.eco_savings, tier_multiplier);
  
  RETURN NEW;
END;
$$;

-- Create triggers
CREATE TRIGGER trigger_update_car_availability_on_booking
  AFTER INSERT ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_car_availability_on_booking();

CREATE TRIGGER trigger_restore_car_availability_on_booking
  AFTER UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.restore_car_availability_on_booking();

CREATE TRIGGER trigger_update_user_eco_after_booking
  AFTER INSERT ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_user_eco_after_booking();

COMMIT;