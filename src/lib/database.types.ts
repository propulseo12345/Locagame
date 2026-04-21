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
      access_difficulty_types: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          label: string
          surcharge_percent: number | null
          value: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          label: string
          surcharge_percent?: number | null
          value: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          label?: string
          surcharge_percent?: number | null
          value?: string
        }
        Relationships: []
      }
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
        ]
      }
      admin_users: {
        Row: {
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          is_active: boolean | null
          last_name: string | null
          permissions: Json | null
          phone: string | null
          role: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          permissions?: Json | null
          phone?: string | null
          role: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          permissions?: Json | null
          phone?: string | null
          role?: string
          user_id?: string | null
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          created_at: string | null
          id: string
          key: string
          updated_at: string | null
          value: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: string | null
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
      customer_favorites: {
        Row: {
          created_at: string | null
          customer_id: string
          id: string
          product_id: string
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          id?: string
          product_id: string
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_favorites_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_favorites_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          company_name: string | null
          created_at: string | null
          customer_type: string | null
          email: string
          first_name: string | null
          id: string
          is_guest: boolean | null
          last_name: string | null
          loyalty_points: number | null
          phone: string | null
          siret: string | null
          stripe_customer_id: string | null
          updated_at: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          customer_type?: string | null
          email: string
          first_name?: string | null
          id: string
          is_guest?: boolean | null
          last_name?: string | null
          loyalty_points?: number | null
          phone?: string | null
          siret?: string | null
          stripe_customer_id?: string | null
          updated_at?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          customer_type?: string | null
          email?: string
          first_name?: string | null
          id?: string
          is_guest?: boolean | null
          last_name?: string | null
          loyalty_points?: number | null
          phone?: string | null
          siret?: string | null
          stripe_customer_id?: string | null
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
          cities: string[]
          created_at: string | null
          delivery_fee: number
          display_order: number | null
          free_delivery_threshold: number | null
          id: string
          is_active: boolean | null
          name: string
          postal_codes: string[]
        }
        Insert: {
          cities?: string[]
          created_at?: string | null
          delivery_fee?: number
          display_order?: number | null
          free_delivery_threshold?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          postal_codes?: string[]
        }
        Update: {
          cities?: string[]
          created_at?: string | null
          delivery_fee?: number
          display_order?: number | null
          free_delivery_threshold?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          postal_codes?: string[]
        }
        Relationships: []
      }
      email_outbox: {
        Row: {
          attempts: number | null
          created_at: string | null
          error_message: string | null
          id: string
          last_attempt_at: string | null
          payload: Json
          sent_at: string | null
          status: string
          template: string
          to_email: string
        }
        Insert: {
          attempts?: number | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          last_attempt_at?: string | null
          payload: Json
          sent_at?: string | null
          status?: string
          template: string
          to_email: string
        }
        Update: {
          attempts?: number | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          last_attempt_at?: string | null
          payload?: Json
          sent_at?: string | null
          status?: string
          template?: string
          to_email?: string
        }
        Relationships: []
      }
      event_types: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          category: string | null
          created_at: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          question: string
        }
        Insert: {
          answer: string
          category?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          question: string
        }
        Update: {
          answer?: string
          category?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          question?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          customer_email: string | null
          id: string
          metadata: Json | null
          reservation_id: string
          status: string
          stripe_checkout_session_id: string | null
          stripe_event_id: string | null
          stripe_payment_intent_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          customer_email?: string | null
          id?: string
          metadata?: Json | null
          reservation_id: string
          status: string
          stripe_checkout_session_id?: string | null
          stripe_event_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          customer_email?: string | null
          id?: string
          metadata?: Json | null
          reservation_id?: string
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_event_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_events: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          event_date: string | null
          event_type_id: string | null
          featured_image: string | null
          guest_count: number | null
          id: string
          images: string[] | null
          is_active: boolean | null
          is_featured: boolean | null
          location: string | null
          products_used: string[] | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          event_date?: string | null
          event_type_id?: string | null
          featured_image?: string | null
          guest_count?: number | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_featured?: boolean | null
          location?: string | null
          products_used?: string[] | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          event_date?: string | null
          event_type_id?: string | null
          featured_image?: string | null
          guest_count?: number | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_featured?: boolean | null
          location?: string | null
          products_used?: string[] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_events_event_type_id_fkey"
            columns: ["event_type_id"]
            isOneToOne: false
            referencedRelation: "event_types"
            referencedColumns: ["id"]
          },
        ]
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
      product_categories: {
        Row: {
          category_id: string
          created_at: string | null
          product_id: string
        }
        Insert: {
          category_id: string
          created_at?: string | null
          product_id: string
        }
        Update: {
          category_id?: string
          created_at?: string | null
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_categories_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_themes: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          theme_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          theme_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          theme_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_themes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_themes_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "themes"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          created_at: string | null
          delivery_people_count: number
          description: string | null
          featured: boolean | null
          id: string
          images: string[] | null
          is_active: boolean | null
          meta_description: string | null
          meta_title: string | null
          multi_day_coefficient: number
          name: string
          pickup_people_count: number
          pricing: Json
          slug: string
          specifications: Json | null
          total_stock: number | null
          updated_at: string | null
          weekend_flat_price: number | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          delivery_people_count?: number
          description?: string | null
          featured?: boolean | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          multi_day_coefficient?: number
          name: string
          pickup_people_count?: number
          pricing?: Json
          slug: string
          specifications?: Json | null
          total_stock?: number | null
          updated_at?: string | null
          weekend_flat_price?: number | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          delivery_people_count?: number
          description?: string | null
          featured?: boolean | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          multi_day_coefficient?: number
          name?: string
          pickup_people_count?: number
          pricing?: Json
          slug?: string
          specifications?: Json | null
          total_stock?: number | null
          updated_at?: string | null
          weekend_flat_price?: number | null
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
      promo_codes: {
        Row: {
          code: string
          created_at: string | null
          current_uses: number | null
          description: string | null
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean | null
          max_uses: number | null
          min_order_amount: number | null
          stripe_coupon_id: string | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          current_uses?: number | null
          description?: string | null
          discount_type: string
          discount_value: number
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_order_amount?: number | null
          stripe_coupon_id?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          current_uses?: number | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_order_amount?: number | null
          stripe_coupon_id?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      reservation_items: {
        Row: {
          created_at: string | null
          delivery_people_count: number | null
          duration_days: number
          id: string
          pickup_people_count: number | null
          product_id: string | null
          quantity: number
          reservation_id: string | null
          subtotal: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          delivery_people_count?: number | null
          duration_days: number
          id?: string
          pickup_people_count?: number | null
          product_id?: string | null
          quantity?: number
          reservation_id?: string | null
          subtotal: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          delivery_people_count?: number | null
          duration_days?: number
          id?: string
          pickup_people_count?: number | null
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
          billing_address_line1: string | null
          billing_address_line2: string | null
          billing_city: string | null
          billing_company_name: string | null
          billing_country: string | null
          billing_postal_code: string | null
          billing_vat_number: string | null
          cgv_accepted: boolean | null
          created_at: string | null
          customer_id: string | null
          delivery_address_id: string | null
          delivery_distance_km: number | null
          delivery_fee: number | null
          delivery_is_mandatory: boolean | null
          delivery_time: string | null
          delivery_type: string
          deposit_amount: number | null
          discount: number | null
          end_date: string
          end_slot: string | null
          event_details: Json | null
          event_type: string | null
          id: string
          is_business: boolean
          newsletter_accepted: boolean | null
          notes: string | null
          paid_at: string | null
          payment_intent_id: string | null
          payment_method: string | null
          payment_status: string | null
          pickup_is_mandatory: boolean | null
          pickup_slot: string | null
          pickup_time: string | null
          pricing_breakdown: Json | null
          promo_code: string | null
          recipient_data: Json | null
          return_time: string | null
          start_date: string
          start_slot: string | null
          status: string | null
          stripe_checkout_session_id: string | null
          subtotal: number | null
          total: number
          updated_at: string | null
          zone_id: string | null
        }
        Insert: {
          billing_address_line1?: string | null
          billing_address_line2?: string | null
          billing_city?: string | null
          billing_company_name?: string | null
          billing_country?: string | null
          billing_postal_code?: string | null
          billing_vat_number?: string | null
          cgv_accepted?: boolean | null
          created_at?: string | null
          customer_id?: string | null
          delivery_address_id?: string | null
          delivery_distance_km?: number | null
          delivery_fee?: number | null
          delivery_is_mandatory?: boolean | null
          delivery_time?: string | null
          delivery_type: string
          deposit_amount?: number | null
          discount?: number | null
          end_date: string
          end_slot?: string | null
          event_details?: Json | null
          event_type?: string | null
          id?: string
          is_business?: boolean
          newsletter_accepted?: boolean | null
          notes?: string | null
          paid_at?: string | null
          payment_intent_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          pickup_is_mandatory?: boolean | null
          pickup_slot?: string | null
          pickup_time?: string | null
          pricing_breakdown?: Json | null
          promo_code?: string | null
          recipient_data?: Json | null
          return_time?: string | null
          start_date: string
          start_slot?: string | null
          status?: string | null
          stripe_checkout_session_id?: string | null
          subtotal?: number | null
          total: number
          updated_at?: string | null
          zone_id?: string | null
        }
        Update: {
          billing_address_line1?: string | null
          billing_address_line2?: string | null
          billing_city?: string | null
          billing_company_name?: string | null
          billing_country?: string | null
          billing_postal_code?: string | null
          billing_vat_number?: string | null
          cgv_accepted?: boolean | null
          created_at?: string | null
          customer_id?: string | null
          delivery_address_id?: string | null
          delivery_distance_km?: number | null
          delivery_fee?: number | null
          delivery_is_mandatory?: boolean | null
          delivery_time?: string | null
          delivery_type?: string
          deposit_amount?: number | null
          discount?: number | null
          end_date?: string
          end_slot?: string | null
          event_details?: Json | null
          event_type?: string | null
          id?: string
          is_business?: boolean
          newsletter_accepted?: boolean | null
          notes?: string | null
          paid_at?: string | null
          payment_intent_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          pickup_is_mandatory?: boolean | null
          pickup_slot?: string | null
          pickup_time?: string | null
          pricing_breakdown?: Json | null
          promo_code?: string | null
          recipient_data?: Json | null
          return_time?: string | null
          start_date?: string
          start_slot?: string | null
          status?: string | null
          stripe_checkout_session_id?: string | null
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
        ]
      }
      security_logs: {
        Row: {
          created_at: string | null
          details: Json | null
          event: string
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          event: string
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          event?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
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
      testimonials: {
        Row: {
          author_location: string | null
          author_name: string
          author_role: string | null
          content: string
          created_at: string | null
          display_order: number | null
          event_date: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          rating: number
        }
        Insert: {
          author_location?: string | null
          author_name: string
          author_role?: string | null
          content: string
          created_at?: string | null
          display_order?: number | null
          event_date?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          rating: number
        }
        Update: {
          author_location?: string | null
          author_name?: string
          author_role?: string | null
          content?: string
          created_at?: string | null
          display_order?: number | null
          event_date?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          rating?: number
        }
        Relationships: []
      }
      themes: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      time_slots: {
        Row: {
          created_at: string | null
          display_order: number | null
          end_time: string
          id: string
          is_active: boolean | null
          label: string
          slot_type: string
          start_time: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          end_time: string
          id?: string
          is_active?: boolean | null
          label: string
          slot_type?: string
          start_time: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          end_time?: string
          id?: string
          is_active?: boolean | null
          label?: string
          slot_type?: string
          start_time?: string
        }
        Relationships: []
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
      calc_locagame_price: {
        Args: { p_locagame_days: number; p_price_per_day: number }
        Returns: number
      }
      calc_product_unit_price: {
        Args: {
          p_coefficient?: number
          p_end: string
          p_pricing: Json
          p_start: string
        }
        Returns: number
      }
      check_email_exists: { Args: { email_to_check: string }; Returns: boolean }
      check_product_availability: {
        Args: {
          p_end_date: string
          p_product_id: string
          p_quantity?: number
          p_start_date: string
        }
        Returns: boolean
      }
      check_product_availability_for_dates: {
        Args: {
          p_end_date: string
          p_product_id: string
          p_quantity?: number
          p_start_date: string
        }
        Returns: boolean
      }
      clean_description: { Args: { desc_text: string }; Returns: string }
      count_locagame_days: {
        Args: { p_end: string; p_start: string }
        Returns: number
      }
      create_guest_checkout: { Args: { payload: Json }; Returns: Json }
      expire_pending_reservations: {
        Args: never
        Returns: {
          expired_count: number
          released_availability_count: number
        }[]
      }
      format_product_name: { Args: { name_text: string }; Returns: string }
      get_current_user_role: {
        Args: never
        Returns: {
          email: string
          first_name: string
          last_name: string
          phone: string
          profile_id: string
          role: string
        }[]
      }
      get_realtime_tables: {
        Args: never
        Returns: {
          tablename: string
        }[]
      }
      get_technician_id: { Args: never; Returns: string }
      get_technician_vehicle_id: { Args: never; Returns: string }
      increment_promo_code_usage: {
        Args: { p_code: string }
        Returns: undefined
      }
      is_admin:
        | { Args: never; Returns: boolean }
        | { Args: { user_id: string }; Returns: boolean }
      is_french_holiday: { Args: { p_date: string }; Returns: boolean }
      is_user_admin: { Args: { check_user_id: string }; Returns: boolean }
      is_user_technician: { Args: { check_user_id: string }; Returns: boolean }
      optimize_description: {
        Args: { desc_text: string; product_name: string }
        Returns: string
      }
      period_contains_weekend: {
        Args: { p_end: string; p_start: string }
        Returns: boolean
      }
      update_delivery_task_status: {
        Args: {
          p_completed_at?: string
          p_started_at?: string
          p_status: string
          p_task_id: string
        }
        Returns: Json
      }
      validate_and_create_reservation: {
        Args: {
          p_client_total?: number
          p_customer_id: string
          p_delivery_distance_km?: number
          p_delivery_fee?: number
          p_delivery_is_mandatory?: boolean
          p_delivery_type: string
          p_end_date: string
          p_items: Json
          p_metadata?: Json
          p_pickup_is_mandatory?: boolean
          p_promo_code?: string
          p_start_date: string
          p_zone_id?: string
        }
        Returns: Json
      }
      validate_promo_code: {
        Args: { p_code: string; p_order_amount: number }
        Returns: Json
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
