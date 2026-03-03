
-- Ride type enum
CREATE TYPE public.ride_type AS ENUM ('offer', 'request');
CREATE TYPE public.ride_status AS ENUM ('active', 'in_progress', 'completed', 'cancelled');
CREATE TYPE public.ride_request_status AS ENUM ('pending', 'accepted', 'rejected', 'cancelled');

-- Rides table (supports both offers and requests)
CREATE TABLE public.rides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type ride_type NOT NULL DEFAULT 'offer',
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  origin_lat DOUBLE PRECISION,
  origin_lng DOUBLE PRECISION,
  destination_lat DOUBLE PRECISION,
  destination_lng DOUBLE PRECISION,
  departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
  seats_available INTEGER NOT NULL DEFAULT 1,
  price NUMERIC(10,2),
  notes TEXT,
  status ride_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can see active rides
CREATE POLICY "Authenticated users can view active rides"
  ON public.rides FOR SELECT TO authenticated
  USING (status = 'active' OR user_id = auth.uid());

-- Users can create their own rides
CREATE POLICY "Users can create their own rides"
  ON public.rides FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own rides
CREATE POLICY "Users can update their own rides"
  ON public.rides FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Users can delete their own rides
CREATE POLICY "Users can delete their own rides"
  ON public.rides FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_rides_updated_at
  BEFORE UPDATE ON public.rides
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.rides;

-- Ride requests table (someone wants to join a ride offer, or a driver accepts a ride request)
CREATE TABLE public.ride_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ride_id UUID NOT NULL REFERENCES public.rides(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seats_requested INTEGER NOT NULL DEFAULT 1,
  message TEXT,
  status ride_request_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ride_requests ENABLE ROW LEVEL SECURITY;

-- Ride owner can see requests on their rides; requester can see their own requests
CREATE POLICY "Ride owner and requester can view requests"
  ON public.ride_requests FOR SELECT TO authenticated
  USING (
    requester_id = auth.uid()
    OR ride_id IN (SELECT id FROM public.rides WHERE user_id = auth.uid())
  );

-- Users can create requests on rides they don't own
CREATE POLICY "Users can request rides"
  ON public.ride_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = requester_id);

-- Ride owner can accept/reject; requester can cancel
CREATE POLICY "Ride owner or requester can update request"
  ON public.ride_requests FOR UPDATE TO authenticated
  USING (
    requester_id = auth.uid()
    OR ride_id IN (SELECT id FROM public.rides WHERE user_id = auth.uid())
  );

CREATE TRIGGER update_ride_requests_updated_at
  BEFORE UPDATE ON public.ride_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  read BOOLEAN NOT NULL DEFAULT false,
  ride_id UUID REFERENCES public.rides(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- System (edge functions) inserts via service role; users can't insert
CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Enable realtime for notifications too
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
