export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      classes: {
        Row: {
          created_at: string
          homeroom_teacher_id: string | null
          id: string
          name: string
          school_id: string
        }
        Insert: {
          created_at?: string
          homeroom_teacher_id?: string | null
          id?: string
          name: string
          school_id: string
        }
        Update: {
          created_at?: string
          homeroom_teacher_id?: string | null
          id?: string
          name?: string
          school_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "classes_homeroom_teacher_id_fkey"
            columns: ["homeroom_teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          created_at: string
          id: string
          name: string
          owner_id: string | null
          tax_id: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          name: string
          owner_id?: string | null
          tax_id?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          name?: string
          owner_id?: string | null
          tax_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_templates: {
        Row: {
          content: string
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      contracts: {
        Row: {
          company_id: string
          created_at: string
          end_date: string | null
          id: string
          is_active: boolean | null
          school_id: string
          start_date: string
        }
        Insert: {
          company_id: string
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          school_id: string
          start_date: string
        }
        Update: {
          company_id?: string
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          school_id?: string
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "contracts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          created_at: string
          id: string
          is_read: boolean | null
          recipient_id: string
          sender_id: string
          subject: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          recipient_id: string
          sender_id: string
          subject: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          recipient_id?: string
          sender_id?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      parent_student: {
        Row: {
          parent_id: string
          student_id: string
        }
        Insert: {
          parent_id: string
          student_id: string
        }
        Update: {
          parent_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "parent_student_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parent_student_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          class_id: string | null
          company_id: string | null
          created_at: string
          full_name: string | null
          id: string
          is_dual_role: boolean
          role: Database["public"]["Enums"]["user_role"]
          school_id: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          class_id?: string | null
          company_id?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          is_dual_role?: boolean
          role?: Database["public"]["Enums"]["user_role"]
          school_id?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          class_id?: string | null
          company_id?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_dual_role?: boolean
          role?: Database["public"]["Enums"]["user_role"]
          school_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          id: string
          name: string
          principal_id: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          id?: string
          name: string
          principal_id?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          id?: string
          name?: string
          principal_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schools_principal_id_fkey"
            columns: ["principal_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_logs: {
        Row: {
          business_contact_id: string | null
          company_id: string | null
          created_at: string
          date_of_service: string
          description: string
          hours_worked: number
          id: string
          rejection_reason: string | null
          status: Database["public"]["Enums"]["service_log_status"] | null
          student_id: string
        }
        Insert: {
          business_contact_id?: string | null
          company_id?: string | null
          created_at?: string
          date_of_service: string
          description: string
          hours_worked: number
          id?: string
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["service_log_status"] | null
          student_id: string
        }
        Update: {
          business_contact_id?: string | null
          company_id?: string | null
          created_at?: string
          date_of_service?: string
          description?: string
          hours_worked?: number
          id?: string
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["service_log_status"] | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_logs_business_contact_id_fkey"
            columns: ["business_contact_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_logs_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      service_log_status: "pending" | "approved" | "rejected"
      user_role:
      | "student"
      | "parent"
      | "homeroom_teacher"
      | "principal"
      | "business_owner"
      | "business_contact"
      | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
  | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
    Database[PublicTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
    Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
    PublicSchema["Views"])
  ? (PublicSchema["Tables"] &
    PublicSchema["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
  | keyof PublicSchema["Tables"]
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
  | keyof PublicSchema["Tables"]
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
  | keyof PublicSchema["Enums"]
  | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
  ? PublicSchema["Enums"][PublicEnumNameOrOptions]
  : never
