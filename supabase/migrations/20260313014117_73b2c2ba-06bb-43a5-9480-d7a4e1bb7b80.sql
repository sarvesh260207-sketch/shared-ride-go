
-- Virtual Bus Stops (predefined pickup/drop points)
CREATE TABLE public.virtual_bus_stops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  zone TEXT NOT NULL DEFAULT 'general',
  stop_type TEXT NOT NULL DEFAULT 'pickup',
  popularity INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.virtual_bus_stops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view bus stops" ON public.virtual_bus_stops
  FOR SELECT TO public USING (true);

-- MRV Carbon Ledger (append-only, hash-chained)
CREATE TABLE public.carbon_ledger (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ride_id UUID REFERENCES public.rides(id),
  user_id UUID NOT NULL,
  distance_km NUMERIC NOT NULL DEFAULT 0,
  occupancy INTEGER NOT NULL DEFAULT 1,
  bau_emissions_g NUMERIC NOT NULL DEFAULT 0,
  actual_emissions_g NUMERIC NOT NULL DEFAULT 0,
  delta_g NUMERIC NOT NULL DEFAULT 0,
  vehicle_type TEXT NOT NULL DEFAULT 'car',
  previous_hash TEXT,
  entry_hash TEXT NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.carbon_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ledger entries" ON public.carbon_ledger
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Ledger entries viewable for auditors" ON public.carbon_ledger
  FOR SELECT TO public USING (true);

-- Insert predefined Chennai virtual bus stops
INSERT INTO public.virtual_bus_stops (name, description, lat, lng, zone, stop_type) VALUES
  ('Guindy Metro Exit 3', 'Near IITM back gate', 13.0067, 80.2206, 'guindy', 'metro'),
  ('Anna University Gate 2', 'Main entrance on Sardar Patel Rd', 13.0108, 80.2354, 'guindy', 'college'),
  ('DLF IT Park Main Gate', 'OMR Thoraipakkam', 12.9352, 80.2332, 'omr', 'corporate'),
  ('Tidel Park Bus Stop', 'Taramani OMR', 12.9584, 80.2428, 'omr', 'corporate'),
  ('Tambaram Railway Station East', 'Auto stand side', 12.9249, 80.1178, 'tambaram', 'transit'),
  ('Chrompet Bus Stand', 'Near GST Rd junction', 12.9516, 80.1443, 'chrompet', 'transit'),
  ('Velachery MRTS Station', 'Platform 1 exit', 12.9815, 80.2210, 'velachery', 'transit'),
  ('Adyar Signal', 'Near Adyar Gate', 13.0063, 80.2574, 'adyar', 'landmark'),
  ('T Nagar Pondy Bazaar', 'Near Panagal Park', 13.0418, 80.2341, 'tnagar', 'landmark'),
  ('Porur Junction', 'Near Ramachandra Hospital', 13.0382, 80.1568, 'porur', 'junction');
