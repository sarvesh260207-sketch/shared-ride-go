export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      campus_league: {
        Row: {
          college: string
          department: string
          id: string
          member_count: number
          total_co2_saved: number
          total_distance: number
          total_rides: number
          updated_at: string
        }
        Insert: {
          college: string
          department: string
          id?: string
          member_count?: number
          total_co2_saved?: number
          total_distance?: number
          total_rides?: number
          updated_at?: string
        }
        Update: {
          college?: string
          department?: string
          id?: string
          member_count?: number
          total_co2_saved?: number
          total_distance?: number
          total_rides?: number
          updated_at?: string
        }
        Relationships: []
      }
      carbon_ledger: {
        Row: {
          actual_emissions_g: number
          bau_emissions_g: number
          created_at: string
          delta_g: number
          distance_km: number
          entry_hash: string
          id: string
          occupancy: number
          previous_hash: string | null
          ride_id: string | null
          user_id: string
          vehicle_type: string
          verified: boolean
        }
        Insert: {
          actual_emissions_g?: number
          bau_emissions_g?: number
          created_at?: string
          delta_g?: number
          distance_km?: number
          entry_hash: string
          id?: string
          occupancy?: number
          previous_hash?: string | null
          ride_id?: string | null
          user_id: string
          vehicle_type?: string
          verified?: boolean
        }
        Update: {
          actual_emissions_g?: number
          bau_emissions_g?: number
          created_at?: string
          delta_g?: number
          distance_km?: number
          entry_hash?: string
          id?: string
          occupancy?: number
          previous_hash?: string | null
          ride_id?: string | null
          user_id?: string
          vehicle_type?: string
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "carbon_ledger_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      guardian_shares: {
        Row: {
          active: boolean
          created_at: string
          guardian_name: string
          guardian_phone: string
          id: string
          ride_id: string | null
          share_token: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          guardian_name: string
          guardian_phone: string
          id?: string
          ride_id?: string | null
          share_token?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          guardian_name?: string
          guardian_phone?: string
          id?: string
          ride_id?: string | null
          share_token?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guardian_shares_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          ride_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          ride_id?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          ride_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          co2_saved: number | null
          college: string | null
          connections: number | null
          created_at: string
          department: string | null
          display_name: string
          id: string
          location: string | null
          money_saved: number | null
          rating: number | null
          total_rides: number | null
          updated_at: string
          user_id: string
          verified: boolean | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          co2_saved?: number | null
          college?: string | null
          connections?: number | null
          created_at?: string
          department?: string | null
          display_name?: string
          id?: string
          location?: string | null
          money_saved?: number | null
          rating?: number | null
          total_rides?: number | null
          updated_at?: string
          user_id: string
          verified?: boolean | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          co2_saved?: number | null
          college?: string | null
          connections?: number | null
          created_at?: string
          department?: string | null
          display_name?: string
          id?: string
          location?: string | null
          money_saved?: number | null
          rating?: number | null
          total_rides?: number | null
          updated_at?: string
          user_id?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      ride_requests: {
        Row: {
          created_at: string
          id: string
          message: string | null
          requester_id: string
          ride_id: string
          seats_requested: number
          status: Database["public"]["Enums"]["ride_request_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          requester_id: string
          ride_id: string
          seats_requested?: number
          status?: Database["public"]["Enums"]["ride_request_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          requester_id?: string
          ride_id?: string
          seats_requested?: number
          status?: Database["public"]["Enums"]["ride_request_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ride_requests_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      rides: {
        Row: {
          created_at: string
          departure_time: string
          destination: string
          destination_lat: number | null
          destination_lng: number | null
          driver_college: string | null
          driver_department: string | null
          id: string
          notes: string | null
          origin: string
          origin_lat: number | null
          origin_lng: number | null
          price: number | null
          seats_available: number
          status: Database["public"]["Enums"]["ride_status"]
          type: Database["public"]["Enums"]["ride_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          departure_time: string
          destination: string
          destination_lat?: number | null
          destination_lng?: number | null
          driver_college?: string | null
          driver_department?: string | null
          id?: string
          notes?: string | null
          origin: string
          origin_lat?: number | null
          origin_lng?: number | null
          price?: number | null
          seats_available?: number
          status?: Database["public"]["Enums"]["ride_status"]
          type?: Database["public"]["Enums"]["ride_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          departure_time?: string
          destination?: string
          destination_lat?: number | null
          destination_lng?: number | null
          driver_college?: string | null
          driver_department?: string | null
          id?: string
          notes?: string | null
          origin?: string
          origin_lat?: number | null
          origin_lng?: number | null
          price?: number | null
          seats_available?: number
          status?: Database["public"]["Enums"]["ride_status"]
          type?: Database["public"]["Enums"]["ride_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_type: string
          co2_saved: number
          created_at: string
          id: string
          rides_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          badge_type?: string
          co2_saved?: number
          created_at?: string
          id?: string
          rides_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          badge_type?: string
          co2_saved?: number
          created_at?: string
          id?: string
          rides_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      virtual_bus_stops: {
        Row: {
          created_at: string
          description: string | null
          id: string
          lat: number
          lng: number
          name: string
          popularity: number
          stop_type: string
          zone: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          lat: number
          lng: number
          name: string
          popularity?: number
          stop_type?: string
          zone?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          lat?: number
          lng?: number
          name?: string
          popularity?: number
          stop_type?: string
          zone?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      ride_request_status: "pending" | "accepted" | "rejected" | "cancelled"
      ride_status: "active" | "in_progress" | "completed" | "cancelled"
      ride_type: "offer" | "request"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      ride_request_status: ["pending", "accepted", "rejected", "cancelled"],
      ride_status: ["active", "in_progress", "completed", "cancelled"],
      ride_type: ["offer", "request"],
    },
  },
} as const
