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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          car_id: string
          created_at: string | null
          distance: number
          eco_savings: number
          end_date: string
          id: string
          start_date: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          car_id: string
          created_at?: string | null
          distance: number
          eco_savings: number
          end_date: string
          id?: string
          start_date: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          car_id?: string
          created_at?: string | null
          distance?: number
          eco_savings?: number
          end_date?: string
          id?: string
          start_date?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      cars: {
        Row: {
          available: boolean | null
          created_at: string | null
          emission_rate: number
          id: string
          image_url: string | null
          latitude: number | null
          location: string
          longitude: number | null
          name: string
          type: string
          updated_at: string | null
        }
        Insert: {
          available?: boolean | null
          created_at?: string | null
          emission_rate: number
          id?: string
          image_url?: string | null
          latitude?: number | null
          location: string
          longitude?: number | null
          name: string
          type: string
          updated_at?: string | null
        }
        Update: {
          available?: boolean | null
          created_at?: string | null
          emission_rate?: number
          id?: string
          image_url?: string | null
          latitude?: number | null
          location?: string
          longitude?: number | null
          name?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          car_id: string
          created_at: string | null
          discount_applied: boolean | null
          id: string
          scheduled_date: string
          status: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          car_id: string
          created_at?: string | null
          discount_applied?: boolean | null
          id?: string
          scheduled_date: string
          status?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          car_id?: string
          created_at?: string | null
          discount_applied?: boolean | null
          id?: string
          scheduled_date?: string
          status?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          credits: number | null
          eco_score: number | null
          email: string
          green_tier: string | null
          id: string
          name: string
          password: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          credits?: number | null
          eco_score?: number | null
          email: string
          green_tier?: string | null
          id?: string
          name: string
          password: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          credits?: number | null
          eco_score?: number | null
          email?: string
          green_tier?: string | null
          id?: string
          name?: string
          password?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      authenticate_user: {
        Args: { email_param: string; password_param: string }
        Returns: {
          credits: number
          eco_score: number
          green_tier: string
          user_email: string
          user_id: string
          user_name: string
        }[]
      }
      award_credits: {
        Args: {
          eco_savings: number
          tier_multiplier?: number
          user_id_param: string
        }
        Returns: number
      }
      calculate_eco_savings: {
        Args: { car_emission_rate: number; distance_km: number }
        Returns: number
      }
      create_user_with_auth: {
        Args: { user_email: string; user_name: string; user_password: string }
        Returns: string
      }
      eco_match: {
        Args: {
          car_type_param?: string
          distance_param?: number
          location_param?: string
        }
        Returns: {
          available: boolean
          car_id: string
          car_name: string
          car_type: string
          credits_potential: number
          eco_savings: number
          emission_rate: number
          image_url: string
          location: string
        }[]
      }
      get_booking_history: {
        Args: {
          limit_count?: number
          offset_count?: number
          user_id_param: string
        }
        Returns: {
          booking_id: string
          car_name: string
          car_type: string
          credits_earned: number
          distance: number
          eco_savings: number
          end_date: string
          start_date: string
          status: string
        }[]
      }
      get_booking_summary: {
        Args: { days_back?: number; user_id_param: string }
        Returns: {
          active_bookings: number
          average_trip_length: number
          completed_bookings: number
          favorite_car_type: string
          next_booking_date: string
          total_bookings: number
          total_distance: number
          total_eco_savings: number
        }[]
      }
      get_car_analytics: {
        Args: never
        Returns: {
          average_booking_distance: number
          car_id: string
          car_name: string
          car_type: string
          total_bookings: number
          total_eco_savings: number
          total_revenue: number
          utilization_rate: number
        }[]
      }
      get_car_utilization_trends: {
        Args: { days_back?: number }
        Returns: {
          available_cars: number
          booked_cars: number
          date_bucket: string
          ev_utilization: number
          gas_utilization: number
          hybrid_utilization: number
          total_cars: number
          utilization_rate: number
        }[]
      }
      get_dashboard_stats: {
        Args: never
        Returns: {
          active_bookings: number
          average_eco_score: number
          ev_percentage: number
          most_popular_location: string
          revenue_this_month: number
          total_bookings: number
          total_cars: number
          total_credits_awarded: number
          total_eco_savings: number
          total_users: number
        }[]
      }
      get_eco_trends: {
        Args: { days_back?: number }
        Returns: {
          average_emission_rate: number
          date_bucket: string
          ev_bookings: number
          gas_bookings: number
          hybrid_bookings: number
          total_bookings: number
          total_eco_savings: number
        }[]
      }
      get_eco_trends_formatted: {
        Args: { days_back?: number }
        Returns: {
          average_emission_rate: number
          date_bucket: string
          ev_bookings: number
          ev_percentage: number
          gas_bookings: number
          gas_percentage: number
          hybrid_bookings: number
          hybrid_percentage: number
          total_bookings: number
          total_eco_savings: number
        }[]
      }
      get_leaderboard: {
        Args: never
        Returns: {
          credits: number
          eco_score: number
          green_tier: string
          total_bookings: number
          total_eco_savings: number
          user_email: string
          user_id: string
          user_name: string
        }[]
      }
      get_location_analytics: {
        Args: never
        Returns: {
          available_cars: number
          average_emission_rate: number
          eco_score_potential: number
          location: string
          total_bookings: number
          total_cars: number
        }[]
      }
      get_revenue_trends: {
        Args: { months_back?: number }
        Returns: {
          average_booking_value: number
          eco_savings_bonus: number
          month_bucket: string
          total_bookings: number
          total_revenue: number
        }[]
      }
      get_service_history: {
        Args: {
          car_id_param: string
          limit_count?: number
          offset_count?: number
        }
        Returns: {
          days_until_service: number
          discount_applied: boolean
          scheduled_date: string
          service_id: string
          service_type: string
          status: string
        }[]
      }
      get_user_growth_trends: {
        Args: { months_back?: number }
        Returns: {
          active_users: number
          month_bucket: string
          new_users: number
          total_users: number
        }[]
      }
      get_user_notifications: {
        Args: { limit_count?: number; user_id_param: string }
        Returns: {
          created_at: string
          is_read: boolean
          message: string
          notification_type: string
          related_id: string
        }[]
      }
      get_user_stats: {
        Args: { user_id_param: string }
        Returns: {
          current_credits: number
          current_eco_score: number
          current_tier: string
          next_tier: string
          points_to_next_tier: number
          total_bookings: number
          total_distance: number
          total_eco_savings: number
        }[]
      }
      hash_password: { Args: { password: string }; Returns: string }
      is_admin: { Args: { user_id: string }; Returns: boolean }
      predict_service_needs: {
        Args: { car_id_param: string }
        Returns: {
          distance_since_service: number
          last_service_date: string
          needs_service: boolean
          service_type: string
          urgency_level: string
        }[]
      }
      redeem_credits: {
        Args: { credits_to_redeem: number; user_id_param: string }
        Returns: boolean
      }
      search_cars: {
        Args: {
          available_only?: boolean
          car_type_param?: string
          limit_count?: number
          location_param?: string
          max_emission_rate?: number
          min_emission_rate?: number
          offset_count?: number
          search_term?: string
        }
        Returns: {
          available: boolean
          car_id: string
          car_name: string
          car_type: string
          eco_rating: number
          emission_rate: number
          image_url: string
          location: string
        }[]
      }
      search_cars_by_location: {
        Args: {
          available_only?: boolean
          car_type_param?: string
          lat_param: number
          limit_count?: number
          lng_param: number
          radius_km?: number
        }
        Returns: {
          available: boolean
          car_id: string
          car_name: string
          car_type: string
          distance_km: number
          eco_rating: number
          emission_rate: number
          image_url: string
          latitude: number
          location: string
          longitude: number
        }[]
      }
      signup_user: {
        Args: { user_email: string; user_name: string; user_password: string }
        Returns: string
      }
      update_eco_score: {
        Args: { additional_score: number; user_id_param: string }
        Returns: undefined
      }
      verify_password: {
        Args: { hash: string; password: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
