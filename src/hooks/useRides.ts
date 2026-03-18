import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DbRide {
  id: string;
  user_id: string;
  origin: string;
  destination: string;
  origin_lat: number | null;
  origin_lng: number | null;
  destination_lat: number | null;
  destination_lng: number | null;
  departure_time: string;
  seats_available: number;
  price: number | null;
  type: "offer" | "request";
  status: "active" | "in_progress" | "completed" | "cancelled";
  notes: string | null;
  driver_college: string | null;
  driver_department: string | null;
  created_at: string;
  // joined profile
  profile?: {
    display_name: string;
    avatar_url: string | null;
    college: string | null;
    department: string | null;
    rating: number | null;
    verified: boolean | null;
  };
}

export function useActiveRides() {
  return useQuery({
    queryKey: ["rides", "active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rides")
        .select("*, profile:profiles!rides_user_id_fkey(display_name, avatar_url, college, department, rating, verified)")
        .eq("status", "active")
        .eq("type", "offer")
        .order("departure_time", { ascending: true });

      if (error) {
        // If FK join fails, fetch without profile
        const { data: fallback, error: err2 } = await supabase
          .from("rides")
          .select("*")
          .eq("status", "active")
          .eq("type", "offer")
          .order("departure_time", { ascending: true });
        if (err2) throw err2;
        return (fallback ?? []) as DbRide[];
      }
      return (data ?? []) as DbRide[];
    },
    refetchInterval: 15000, // auto-refresh every 15s
  });
}

export function useRideById(id: string | undefined) {
  return useQuery({
    queryKey: ["ride", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rides")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;

      // Get driver profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, avatar_url, college, department, rating, verified")
        .eq("user_id", data.user_id)
        .single();

      // Get existing requests count
      const { count } = await supabase
        .from("ride_requests")
        .select("*", { count: "exact", head: true })
        .eq("ride_id", id!)
        .eq("status", "accepted");

      return { ...data, profile, acceptedCount: count ?? 0 } as DbRide & { acceptedCount: number };
    },
  });
}
