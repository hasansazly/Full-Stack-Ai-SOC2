export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string;
          name: string | null;
          created_at: string;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          name?: string | null;
          created_at?: string;
          user_id?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["clients"]["Insert"]>;
        Relationships: [];
      };
      integrations: {
        Row: {
          id: string;
          client_id: string | null;
          type: string | null;
          credentials: Json | null;
          status: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          client_id?: string | null;
          type?: string | null;
          credentials?: Json | null;
          status?: string | null;
          created_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["integrations"]["Insert"]>;
        Relationships: [];
      };
      evidence_artifacts: {
        Row: {
          id: string;
          client_id: string | null;
          source: string | null;
          collected_at: string;
          raw_data: Json | null;
          checksum: string | null;
          artifact_type: string | null;
        };
        Insert: {
          id?: string;
          client_id?: string | null;
          source?: string | null;
          collected_at?: string;
          raw_data?: Json | null;
          checksum?: string | null;
          artifact_type?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["evidence_artifacts"]["Insert"]>;
        Relationships: [];
      };
      gap_findings: {
        Row: {
          id: string;
          client_id: string | null;
          control_area: string | null;
          severity: string | null;
          title: string | null;
          description: string | null;
          business_risk: string | null;
          remediation_steps: Json | null;
          status: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          client_id?: string | null;
          control_area?: string | null;
          severity?: string | null;
          title?: string | null;
          description?: string | null;
          business_risk?: string | null;
          remediation_steps?: Json | null;
          status?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["gap_findings"]["Insert"]>;
        Relationships: [];
      };
      remediation_log: {
        Row: {
          id: string;
          finding_id: string | null;
          action_taken: string | null;
          actor: string | null;
          timestamp: string;
        };
        Insert: {
          id?: string;
          finding_id?: string | null;
          action_taken?: string | null;
          actor?: string | null;
          timestamp?: string;
        };
        Update: Partial<Database["public"]["Tables"]["remediation_log"]["Insert"]>;
        Relationships: [];
      };
    };
  };
};
