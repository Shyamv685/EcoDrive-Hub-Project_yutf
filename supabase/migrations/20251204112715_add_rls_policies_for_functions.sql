BEGIN;

-- Grant execute permissions on functions to authenticated users
GRANT EXECUTE ON FUNCTION public.signup_user TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_eco_score TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_eco_savings TO authenticated;
GRANT EXECUTE ON FUNCTION public.award_credits TO authenticated;

-- Allow public access for signup function
GRANT EXECUTE ON FUNCTION public.signup_user TO anon;

COMMIT;