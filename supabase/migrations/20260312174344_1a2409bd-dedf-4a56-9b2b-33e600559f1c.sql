
-- Add department to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS department text;

-- Add college and department to rides for filtering
ALTER TABLE public.rides ADD COLUMN IF NOT EXISTS driver_college text;
ALTER TABLE public.rides ADD COLUMN IF NOT EXISTS driver_department text;

-- Campus league table for department rankings
CREATE TABLE public.campus_league (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  college text NOT NULL,
  department text NOT NULL,
  total_rides integer NOT NULL DEFAULT 0,
  total_co2_saved numeric NOT NULL DEFAULT 0,
  total_distance numeric NOT NULL DEFAULT 0,
  member_count integer NOT NULL DEFAULT 0,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(college, department)
);

ALTER TABLE public.campus_league ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view campus league" ON public.campus_league
  FOR SELECT TO public USING (true);

-- User tiers/badges table
CREATE TABLE public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  badge_type text NOT NULL DEFAULT 'rookie',
  rides_count integer NOT NULL DEFAULT 0,
  co2_saved numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all badges" ON public.user_badges
  FOR SELECT TO public USING (true);

CREATE POLICY "Users can upsert own badge" ON public.user_badges
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own badge" ON public.user_badges
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Guardian share links table
CREATE TABLE public.guardian_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  ride_id uuid REFERENCES public.rides(id) ON DELETE CASCADE,
  guardian_name text NOT NULL,
  guardian_phone text NOT NULL,
  share_token text NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.guardian_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own guardian shares" ON public.guardian_shares
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Public read for guardian shares via token (no auth needed)
CREATE POLICY "Anyone can view shares by token" ON public.guardian_shares
  FOR SELECT TO public USING (true);

-- Enable realtime on campus_league
ALTER PUBLICATION supabase_realtime ADD TABLE public.campus_league;
