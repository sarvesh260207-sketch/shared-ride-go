
CREATE TYPE public.vehicle_status AS ENUM ('pending', 'verified', 'manual_review');
CREATE TYPE public.fuel_type AS ENUM ('petrol', 'diesel', 'ev', 'cng');

ALTER TABLE public.rides
  ADD COLUMN vehicle_id UUID,
  ADD COLUMN distance_km NUMERIC(8,2),
  ADD COLUMN live_distance_km NUMERIC(8,2),
  ADD COLUMN fuel_cost NUMERIC(10,2),
  ADD COLUMN platform_fee NUMERIC(10,2) NOT NULL DEFAULT 5;

CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  fuel_type public.fuel_type NOT NULL DEFAULT 'petrol',
  mileage_kmpl NUMERIC(5,2) NOT NULL,
  number_plate TEXT NOT NULL,
  vehicle_photo_url TEXT NOT NULL,
  plate_photo_url TEXT NOT NULL,
  status public.vehicle_status NOT NULL DEFAULT 'pending',
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.vehicles TO authenticated;
GRANT ALL ON public.vehicles TO service_role;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage their vehicles" ON public.vehicles
  FOR ALL TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Authenticated can view vehicles on rides" ON public.vehicles
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.rides r WHERE r.vehicle_id = vehicles.id));

CREATE TRIGGER vehicles_updated_at BEFORE UPDATE ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.rides
  ADD CONSTRAINT rides_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id) ON DELETE SET NULL;

CREATE TABLE public.vehicle_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  ride_id UUID NOT NULL REFERENCES public.rides(id) ON DELETE CASCADE,
  rider_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plate_match BOOLEAN NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.vehicle_verifications TO authenticated;
GRANT ALL ON public.vehicle_verifications TO service_role;
ALTER TABLE public.vehicle_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Rider submits verification for accepted ride" ON public.vehicle_verifications
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = rider_id AND
    EXISTS (
      SELECT 1 FROM public.ride_requests rr
      WHERE rr.ride_id = vehicle_verifications.ride_id
        AND rr.requester_id = auth.uid()
        AND rr.status = 'accepted'
    )
  );

CREATE POLICY "Host and rider view verification" ON public.vehicle_verifications
  FOR SELECT TO authenticated
  USING (
    rider_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.rides r WHERE r.id = vehicle_verifications.ride_id AND r.user_id = auth.uid())
  );

CREATE POLICY "Owner can upload vehicle photos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'vehicle-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Owner can update vehicle photos" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'vehicle-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Owner can read own vehicle photos" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'vehicle-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Owner can delete vehicle photos" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'vehicle-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
