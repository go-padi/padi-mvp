// Stopgap hand-written types for the public schema.
// Replace with `pnpm gen:types` output once the Supabase CLI is authenticated
// against project rcrjfweguedbtfngeovp with sufficient privileges. Covers
// only the tables the app queries today; extend as needed.

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          tenant_id: string | null;
          email: string | null;
          role: 'parent' | 'teacher';
          role_set_at: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          tenant_id?: string | null;
          email?: string | null;
          role: 'parent' | 'teacher';
          role_set_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string | null;
          email?: string | null;
          role?: 'parent' | 'teacher';
          role_set_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      tenants: {
        Row: {
          id: string;
          name: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      subjects: {
        Row: {
          id: string;
          tenant_id: string;
          key: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          key: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          key?: string;
          name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      students: {
        Row: {
          id: string;
          tenant_id: string;
          name: string | null;
          first_name: string | null;
          last_name: string | null;
          focus_areas: string[] | null;
          progress_percent: number | null;
          progress_label: string | null;
          assessment_status: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          focus_areas?: string[] | null;
          progress_percent?: number | null;
          progress_label?: string | null;
          assessment_status?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          focus_areas?: string[] | null;
          progress_percent?: number | null;
          progress_label?: string | null;
          assessment_status?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      groups: {
        Row: {
          id: string;
          tenant_id: string;
          subject_id: string | null;
          name: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          subject_id?: string | null;
          name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          subject_id?: string | null;
          name?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      student_group_memberships: {
        Row: {
          id: string;
          tenant_id: string;
          student_id: string;
          group_id: string;
          subject_id: string | null;
          active: boolean | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          student_id: string;
          group_id: string;
          subject_id?: string | null;
          active?: boolean | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          student_id?: string;
          group_id?: string;
          subject_id?: string | null;
          active?: boolean | null;
          created_at?: string;
        };
        Relationships: [];
      };
      lesson_completions: {
        Row: {
          id: string;
          tenant_id: string;
          student_id: string;
          subject_id: string;
          developmental_area_id: string;
          module_id: string;
          lesson_id: string;
          completed_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          student_id: string;
          subject_id: string;
          developmental_area_id: string;
          module_id: string;
          lesson_id: string;
          completed_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          student_id?: string;
          subject_id?: string;
          developmental_area_id?: string;
          module_id?: string;
          lesson_id?: string;
          completed_at?: string;
        };
        Relationships: [];
      };
      module_assessment: {
        Row: {
          id: string;
          tenant_id: string;
          student_id: string;
          subject_id: string;
          module_id: string;
          notes: string | null;
          audio_url: string | null;
          prediction_json: Json | null;
          teacher_feedback: string | null;
          status: 'in_progress' | 'completed' | 'needs_review';
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          student_id: string;
          subject_id: string;
          module_id: string;
          notes?: string | null;
          audio_url?: string | null;
          prediction_json?: Json | null;
          teacher_feedback?: string | null;
          status?: 'in_progress' | 'completed' | 'needs_review';
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          student_id?: string;
          subject_id?: string;
          module_id?: string;
          notes?: string | null;
          audio_url?: string | null;
          prediction_json?: Json | null;
          teacher_feedback?: string | null;
          status?: 'in_progress' | 'completed' | 'needs_review';
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      teaching_notes: {
        Row: {
          id: string;
          tenant_id: string;
          student_id: string;
          module_code: string;
          notes: string;
          attachment_url: string | null;
          attachment_name: string | null;
          attachment_type: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          student_id: string;
          module_code: string;
          notes: string;
          attachment_url?: string | null;
          attachment_name?: string | null;
          attachment_type?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          student_id?: string;
          module_code?: string;
          notes?: string;
          attachment_url?: string | null;
          attachment_name?: string | null;
          attachment_type?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
