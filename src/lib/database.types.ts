export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      diagnoses: {
        Row: {
          id: string;
          created_at: string;
          user_id: string | null;
          image_path: string;
          is_healthy: boolean;
          disease_name: string | null;
          confidence_score: number;
          plant_type: string;
          description: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          user_id?: string | null;
          image_path: string;
          is_healthy: boolean;
          disease_name?: string | null;
          confidence_score: number;
          plant_type: string;
          description: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          user_id?: string | null;
          image_path?: string;
          is_healthy?: boolean;
          disease_name?: string | null;
          confidence_score?: number;
          plant_type?: string;
          description?: string;
        };
      };
      diagnosis_details: {
        Row: {
          id: string;
          diagnosis_id: string;
          symptoms: string[] | null;
          treatment_options: Json | null;
          product_recommendations: Json | null;
          feedback_helpful: boolean | null;
          feedback_comments: string | null;
        };
        Insert: {
          id?: string;
          diagnosis_id: string;
          symptoms?: string[] | null;
          treatment_options?: Json | null;
          product_recommendations?: Json | null;
          feedback_helpful?: boolean | null;
          feedback_comments?: string | null;
        };
        Update: {
          id?: string;
          diagnosis_id?: string;
          symptoms?: string[] | null;
          treatment_options?: Json | null;
          product_recommendations?: Json | null;
          feedback_helpful?: boolean | null;
          feedback_comments?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
