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
      class_schedules: {
        Row: {
          analyzed: boolean | null
          created_at: string
          file_name: string
          file_path: string
          id: string
          schedule_data: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          analyzed?: boolean | null
          created_at?: string
          file_name: string
          file_path: string
          id?: string
          schedule_data?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          analyzed?: boolean | null
          created_at?: string
          file_name?: string
          file_path?: string
          id?: string
          schedule_data?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      hosted_exams: {
        Row: {
          access_code: string
          allow_late_submission: boolean | null
          assessment_data: Json
          created_at: string
          description: string | null
          duration_minutes: number
          host_user_id: string
          id: string
          scheduled_start: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          access_code: string
          allow_late_submission?: boolean | null
          assessment_data: Json
          created_at?: string
          description?: string | null
          duration_minutes: number
          host_user_id: string
          id?: string
          scheduled_start: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          access_code?: string
          allow_late_submission?: boolean | null
          assessment_data?: Json
          created_at?: string
          description?: string | null
          duration_minutes?: number
          host_user_id?: string
          id?: string
          scheduled_start?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      lab_works: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          language: string
          likes_count: number
          output: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          language: string
          likes_count?: number
          output?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          language?: string
          likes_count?: number
          output?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_works_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          academic_advisor: string | null
          academic_status: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          department: string | null
          expected_graduation: string | null
          facebook_url: string | null
          followers_count: number | null
          following_count: number | null
          full_name: string | null
          gpa: number | null
          id: string
          instagram_url: string | null
          institute_enrollment: string | null
          introduction: string | null
          location: string | null
          major: string | null
          posts_count: number | null
          social_media_id: string | null
          student_id: string | null
          twitter_url: string | null
          updated_at: string
          user_id: string
          website: string | null
          year_of_study: string | null
          youtube_url: string | null
        }
        Insert: {
          academic_advisor?: string | null
          academic_status?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          department?: string | null
          expected_graduation?: string | null
          facebook_url?: string | null
          followers_count?: number | null
          following_count?: number | null
          full_name?: string | null
          gpa?: number | null
          id?: string
          instagram_url?: string | null
          institute_enrollment?: string | null
          introduction?: string | null
          location?: string | null
          major?: string | null
          posts_count?: number | null
          social_media_id?: string | null
          student_id?: string | null
          twitter_url?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
          year_of_study?: string | null
          youtube_url?: string | null
        }
        Update: {
          academic_advisor?: string | null
          academic_status?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          department?: string | null
          expected_graduation?: string | null
          facebook_url?: string | null
          followers_count?: number | null
          following_count?: number | null
          full_name?: string | null
          gpa?: number | null
          id?: string
          instagram_url?: string | null
          institute_enrollment?: string | null
          introduction?: string | null
          location?: string | null
          major?: string | null
          posts_count?: number | null
          social_media_id?: string | null
          student_id?: string | null
          twitter_url?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
          year_of_study?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      student_exam_sessions: {
        Row: {
          answers: Json | null
          created_at: string
          evaluation_result: Json | null
          hosted_exam_id: string
          id: string
          score: number | null
          started_at: string | null
          status: string
          student_email: string | null
          student_name: string
          student_user_id: string | null
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          answers?: Json | null
          created_at?: string
          evaluation_result?: Json | null
          hosted_exam_id: string
          id?: string
          score?: number | null
          started_at?: string | null
          status?: string
          student_email?: string | null
          student_name: string
          student_user_id?: string | null
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          answers?: Json | null
          created_at?: string
          evaluation_result?: Json | null
          hosted_exam_id?: string
          id?: string
          score?: number | null
          started_at?: string | null
          status?: string
          student_email?: string | null
          student_name?: string
          student_user_id?: string | null
          submitted_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_exam_sessions_hosted_exam_id_fkey"
            columns: ["hosted_exam_id"]
            isOneToOne: false
            referencedRelation: "hosted_exams"
            referencedColumns: ["id"]
          },
        ]
      }
      study_sessions: {
        Row: {
          color: string | null
          course_name: string | null
          created_at: string
          description: string | null
          end_time: string
          id: string
          location: string | null
          session_type: string
          start_time: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          course_name?: string | null
          created_at?: string
          description?: string | null
          end_time: string
          id?: string
          location?: string | null
          session_type?: string
          start_time: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          course_name?: string | null
          created_at?: string
          description?: string | null
          end_time?: string
          id?: string
          location?: string | null
          session_type?: string
          start_time?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      theme_settings: {
        Row: {
          background_color: string | null
          button_colors: Json | null
          created_at: string
          id: string
          logo_color: string | null
          template_color: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          background_color?: string | null
          button_colors?: Json | null
          created_at?: string
          id?: string
          logo_color?: string | null
          template_color?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          background_color?: string | null
          button_colors?: Json | null
          created_at?: string
          id?: string
          logo_color?: string | null
          template_color?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_access_code: { Args: never; Returns: string }
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
