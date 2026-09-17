// ============================================================================
// Hand-written to match supabase/migrations/*.sql. This is a stand-in —
// once you have a live Supabase project linked, replace this file by
// running:
//
//   npx supabase gen types typescript --linked > lib/supabase/types.ts
//
// That command talks to your actual database and will always be accurate;
// this file could drift from the SQL if the two are edited independently.
// ============================================================================

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          first_name: string | null;
          last_name: string | null;
          display_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & { id: string };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
      organizations: {
        Row: { id: string; name: string; slug: string; status: string; created_at: string; updated_at: string };
        Insert: Partial<Database["public"]["Tables"]["organizations"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["organizations"]["Row"]>;
      };
      farms: {
        Row: {
          id: string; organization_id: string; name: string; slug: string; farm_code: string;
          farm_type: string | null; location_name: string | null; address: string | null;
          latitude: number | null; longitude: number | null; status: string;
          created_at: string; updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["farms"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["farms"]["Row"]>;
      };
      farm_members: {
        Row: { id: string; farm_id: string; user_id: string; role_id: string; status: string; joined_at: string };
        Insert: Partial<Database["public"]["Tables"]["farm_members"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["farm_members"]["Row"]>;
      };
      roles: {
        Row: { id: string; name: string; description: string | null };
        Insert: Partial<Database["public"]["Tables"]["roles"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["roles"]["Row"]>;
      };
      species: {
        Row: { id: string; name: string };
        Insert: Partial<Database["public"]["Tables"]["species"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["species"]["Row"]>;
      };
      breeds: {
        Row: { id: string; species_id: string; name: string };
        Insert: Partial<Database["public"]["Tables"]["breeds"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["breeds"]["Row"]>;
      };
      animals: {
        Row: {
          id: string; farm_id: string; tag: string; species_id: string | null; breed_id: string | null;
          sex: string | null; date_of_birth: string | null; current_weight: number | null;
          weight_unit: string | null; location: string | null; status: string;
          created_at: string; updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["animals"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["animals"]["Row"]>;
      };
      animal_events: {
        Row: {
          id: string; animal_id: string; farm_id: string; event_date: string; event_type: string;
          detail: string | null; recorded_by: string | null; created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["animal_events"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["animal_events"]["Row"]>;
      };
      crop_types: {
        Row: { id: string; name: string };
        Insert: Partial<Database["public"]["Tables"]["crop_types"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["crop_types"]["Row"]>;
      };
      fields: {
        Row: {
          id: string; farm_id: string; code: string; name: string; area: number | null;
          area_unit: string | null; soil_type: string | null; irrigation_type: string | null;
          status: string; created_at: string; updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["fields"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["fields"]["Row"]>;
      };
      field_history: {
        Row: { id: string; field_id: string; season: string; crop: string; outcome: string | null; created_at: string };
        Insert: Partial<Database["public"]["Tables"]["field_history"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["field_history"]["Row"]>;
      };
      crop_cycles: {
        Row: {
          id: string; farm_id: string; field_id: string | null; crop_type_id: string | null; code: string;
          variety: string | null; season: string | null; planting_date: string | null;
          expected_harvest_date: string | null; area: string | null; status: string;
          created_at: string; updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["crop_cycles"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["crop_cycles"]["Row"]>;
      };
      crop_activities: {
        Row: {
          id: string; crop_cycle_id: string; farm_id: string; activity_date: string;
          activity_type: string; detail: string | null; created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["crop_activities"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["crop_activities"]["Row"]>;
      };
      harvests: {
        Row: {
          id: string; farm_id: string; crop_cycle_id: string | null; code: string; harvest_date: string;
          quantity: number; unit: string; quality_grade: string | null; destination: string | null;
          recorded_by: string | null; status: string; created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["harvests"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["harvests"]["Row"]>;
      };
      veterinary_reports: {
        Row: {
          id: string; farm_id: string; animal_id: string; code: string; submitted_by: string | null;
          visit_date: string; reason: string | null; findings: string | null; diagnosis: string | null;
          treatment_plan: string | null; status: string; reviewed_by: string | null; reviewed_at: string | null;
          created_at: string; updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["veterinary_reports"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["veterinary_reports"]["Row"]>;
      };
      inventory_items: {
        Row: {
          id: string; farm_id: string; sku: string; name: string; category: string; quantity: number;
          unit: string; reorder_level: number; location: string | null; created_at: string; updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["inventory_items"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["inventory_items"]["Row"]>;
      };
      inventory_transactions: {
        Row: {
          id: string; farm_id: string; inventory_item_id: string; transaction_date: string;
          transaction_type: string; quantity_change: number; reference: string | null;
          reference_type: string | null; reference_id: string | null; created_by: string | null; created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["inventory_transactions"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["inventory_transactions"]["Row"]>;
      };
      product_categories: {
        Row: { id: string; slug: string; name: string; description: string | null };
        Insert: Partial<Database["public"]["Tables"]["product_categories"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["product_categories"]["Row"]>;
      };
      products: {
        Row: {
          id: string; farm_id: string; slug: string; sku: string; name: string; category_id: string | null;
          price: number; unit: string; status: string; inventory_item_id: string | null;
          rating: number | null; review_count: number | null; badge: string | null;
          created_at: string; updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["products"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["products"]["Row"]>;
      };
      customers: {
        Row: {
          id: string; farm_id: string; user_id: string | null; name: string; email: string;
          phone: string | null; location: string | null; created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["customers"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["customers"]["Row"]>;
      };
      orders: {
        Row: {
          id: string; farm_id: string; order_number: string; customer_id: string; order_date: string;
          delivery_method: string; delivery_fee: number; address: string | null; payment_status: string;
          status: string; created_at: string; updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["orders"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["orders"]["Row"]>;
      };
      order_items: {
        Row: {
          id: string; order_id: string; product_id: string | null; product_name_snapshot: string;
          quantity: number; unit_price: number; created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["order_items"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["order_items"]["Row"]>;
      };
      suppliers: {
        Row: {
          id: string; farm_id: string; code: string; name: string; contact_person: string | null;
          phone: string | null; email: string | null; category: string | null; payment_terms: string | null;
          status: string; created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["suppliers"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["suppliers"]["Row"]>;
      };
      supplier_purchases: {
        Row: { id: string; supplier_id: string; farm_id: string; purchase_date: string; item: string; amount: number; created_at: string };
        Insert: Partial<Database["public"]["Tables"]["supplier_purchases"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["supplier_purchases"]["Row"]>;
      };
      equipment: {
        Row: {
          id: string; farm_id: string; code: string; name: string; category: string | null;
          manufacturer: string | null; model: string | null; purchase_date: string | null;
          condition: string | null; location: string | null; status: string; created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["equipment"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["equipment"]["Row"]>;
      };
      maintenance_records: {
        Row: {
          id: string; equipment_id: string; farm_id: string; maintenance_date: string;
          maintenance_type: string; cost: number | null; notes: string | null; created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["maintenance_records"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["maintenance_records"]["Row"]>;
      };
      expenses: {
        Row: {
          id: string; farm_id: string; category: string; amount: number; expense_date: string;
          supplier_id: string | null; description: string | null; payment_method: string | null;
          created_by: string | null; created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["expenses"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["expenses"]["Row"]>;
      };
      income_records: {
        Row: {
          id: string; farm_id: string; category: string; amount: number; income_date: string;
          source: string | null; description: string | null; created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["income_records"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["income_records"]["Row"]>;
      };
      blog_posts: {
        Row: {
          id: string; farm_id: string | null; slug: string; title: string; category: string | null;
          excerpt: string | null; body: string | null; author_id: string | null; reading_time: string | null;
          status: string; published_at: string | null; created_at: string; updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["blog_posts"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["blog_posts"]["Row"]>;
      };
      audit_log: {
        Row: {
          id: string; farm_id: string | null; user_id: string | null; action: string; entity_type: string;
          entity_label: string; old_values: Record<string, unknown> | null;
          new_values: Record<string, unknown> | null; created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["audit_log"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["audit_log"]["Row"]>;
      };
      settings: {
        Row: { id: string; farm_id: string; key: string; value: string | null; updated_at: string };
        Insert: Partial<Database["public"]["Tables"]["settings"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["settings"]["Row"]>;
      };
    };
  };
};
