CREATE TABLE public.ride_locations (
  ride_id uuid PRIMARY KEY REFERENCES public.rides(id) ON DELETE CASCADE,
  driver_id uuid NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  heading double precision,
  speed double precision,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ride_locations TO authenticated;
GRANT ALL ON public.ride_locations TO service_role;
ALTER TABLE public.ride_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Driver writes own ride location" ON public.ride_locations FOR ALL TO authenticated
  USING (driver_id = auth.uid() AND EXISTS (SELECT 1 FROM public.rides r WHERE r.id = ride_id AND r.user_id = auth.uid()))
  WITH CHECK (driver_id = auth.uid() AND EXISTS (SELECT 1 FROM public.rides r WHERE r.id = ride_id AND r.user_id = auth.uid()));
CREATE POLICY "Accepted riders view location" ON public.ride_locations FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.ride_requests rr WHERE rr.ride_id = ride_locations.ride_id AND rr.requester_id = auth.uid() AND rr.status = 'accepted'));
ALTER TABLE public.rides ALTER COLUMN platform_fee SET DEFAULT 0;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ride_locations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ride_requests;