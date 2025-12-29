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
      addresses: {
        Row: {
          address_line1: string
          address_line2: string | null
          city: string
          created_at: string | null
          customer_id: string | null
          id: string
          is_default: boolean | null
          postal_code: string
          zone_id: string | null
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          city: string
          created_at?: string | null
          customer_id?: string | null
          id?: string
          is_default?: boolean | null
          postal_code: string
          zone_id?: string | null
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          city?: string
          created_at?: string | null
          customer_id?: string | null
          id?: string
          is_default?: boolean | null
          postal_code?: string
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "addresses_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "addresses_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "delivery_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_users: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          permissions: Json | null
          role: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          permissions?: Json | null
          role: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          permissions?: Json | null
          role?: string
          user_id?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          company_name: string | null
          created_at: string | null
          customer_type: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          loyalty_points: number | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          customer_type?: string | null
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          loyalty_points?: number | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          customer_type?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          loyalty_points?: number | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      delivery_tasks: {
        Row: {
          access_constraints: Json | null
          address_data: Json | null
          completed_at: string | null
          created_at: string | null
          customer_data: Json | null
          id: string
          notes: string | null
          order_number: string | null
          products_data: Json | null
          reservation_id: string | null
          scheduled_date: string
          scheduled_time: string
          started_at: string | null
          status: string | null
          technician_id: string | null
          type: string
          updated_at: string | null
          vehicle_id: string | null
        }
        Insert: {
          access_constraints?: Json | null
          address_data?: Json | null
          completed_at?: string | null
          created_at?: string | null
          customer_data?: Json | null
          id?: string
          notes?: string | null
          order_number?: string | null
          products_data?: Json | null
          reservation_id?: string | null
          scheduled_date: string
          scheduled_time: string
          started_at?: string | null
          status?: string | null
          technician_id?: string | null
          type: string
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Update: {
          access_constraints?: Json | null
          address_data?: Json | null
          completed_at?: string | null
          created_at?: string | null
          customer_data?: Json | null
          id?: string
          notes?: string | null
          order_number?: string | null
          products_data?: Json | null
          reservation_id?: string | null
          scheduled_date?: string
          scheduled_time?: string
          started_at?: string | null
          status?: string | null
          technician_id?: string | null
          type?: string
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_tasks_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_tasks_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_tasks_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_zones: {
        Row: {
          cities: string[] | null
          created_at: string | null
          delivery_fee: number | null
          estimated_delivery_time: string | null
          free_delivery_threshold: number | null
          id: string
          is_active: boolean | null
          name: string
          postal_codes: string[] | null
        }
        Insert: {
          cities?: string[] | null
          created_at?: string | null
          delivery_fee?: number | null
          estimated_delivery_time?: string | null
          free_delivery_threshold?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          postal_codes?: string[] | null
        }
        Update: {
          cities?: string[] | null
          created_at?: string | null
          delivery_fee?: number | null
          estimated_delivery_time?: string | null
          free_delivery_threshold?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          postal_codes?: string[] | null
        }
        Relationships: []
      }
      product_availability: {
        Row: {
          buffer_hours: number | null
          created_at: string | null
          end_date: string
          id: string
          product_id: string | null
          quantity: number
          reservation_id: string | null
          start_date: string
          status: string | null
        }
        Insert: {
          buffer_hours?: number | null
          created_at?: string | null
          end_date: string
          id?: string
          product_id?: string | null
          quantity?: number
          reservation_id?: string | null
          start_date: string
          status?: string | null
        }
        Update: {
          buffer_hours?: number | null
          created_at?: string | null
          end_date?: string
          id?: string
          product_id?: string | null
          quantity?: number
          reservation_id?: string | null
          start_date?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_availability_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_availability_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          created_at: string | null
          description: string | null
          featured: boolean | null
          id: string
          images: string[] | null
          is_active: boolean | null
          meta_description: string | null
          meta_title: string | null
          name: string
          pricing: Json
          slug: string
          specifications: Json | null
          total_stock: number | null
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          pricing?: Json
          slug: string
          specifications?: Json | null
          total_stock?: number | null
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          pricing?: Json
          slug?: string
          specifications?: Json | null
          total_stock?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      reservation_items: {
        Row: {
          created_at: string | null
          duration_days: number
          id: string
          product_id: string | null
          quantity: number
          reservation_id: string | null
          subtotal: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          duration_days: number
          id?: string
          product_id?: string | null
          quantity?: number
          reservation_id?: string | null
          subtotal: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          duration_days?: number
          id?: string
          product_id?: string | null
          quantity?: number
          reservation_id?: string | null
          subtotal?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "reservation_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservation_items_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      reservations: {
        Row: {
          created_at: string | null
          customer_id: string | null
          delivery_address_id: string | null
          delivery_fee: number | null
          delivery_time: string | null
          delivery_type: string
          deposit_amount: number | null
          discount: number | null
          end_date: string
          event_type: string | null
          id: string
          notes: string | null
          payment_method: string | null
          payment_status: string | null
          payment_transaction_id: string | null
          start_date: string
          status: string | null
          subtotal: number | null
          total: number
          updated_at: string | null
          zone_id: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          delivery_address_id?: string | null
          delivery_fee?: number | null
          delivery_time?: string | null
          delivery_type: string
          deposit_amount?: number | null
          discount?: number | null
          end_date: string
          event_type?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_status?: string | null
          payment_transaction_id?: string | null
          start_date: string
          status?: string | null
          subtotal?: number | null
          total: number
          updated_at?: string | null
          zone_id?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          delivery_address_id?: string | null
          delivery_fee?: number | null
          delivery_time?: string | null
          delivery_type?: string
          deposit_amount?: number | null
          discount?: number | null
          end_date?: string
          event_type?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_status?: string | null
          payment_transaction_id?: string | null
          start_date?: string
          status?: string | null
          subtotal?: number | null
          total?: number
          updated_at?: string | null
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reservations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_delivery_address_id_fkey"
            columns: ["delivery_address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "delivery_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      technicians: {
        Row: {
          created_at: string | null
          email: string
          first_name: string
          id: string
          is_active: boolean | null
          last_name: string
          phone: string | null
          updated_at: string | null
          user_id: string | null
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          first_name: string
          id?: string
          is_active?: boolean | null
          last_name: string
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          first_name?: string
          id?: string
          is_active?: boolean | null
          last_name?: string
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_technician_vehicle"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          capacity: number
          created_at: string | null
          id: string
          is_active: boolean | null
          license_plate: string
          name: string
          type: string
          updated_at: string | null
        }
        Insert: {
          capacity: number
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          license_plate: string
          name: string
          type: string
          updated_at?: string | null
        }
        Update: {
          capacity?: number
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          license_plate?: string
          name?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_product_availability: {
        Args: {
          p_end_date: string
          p_product_id: string
          p_quantity: number
          p_start_date: string
        }
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

