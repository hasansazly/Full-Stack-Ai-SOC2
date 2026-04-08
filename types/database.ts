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
      waitlist: {
        Row: {
          id: string;
          email: string;
          company: string | null;
          deal_at_risk: boolean | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          company?: string | null;
          deal_at_risk?: boolean | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["waitlist"]["Insert"]>;
        Relationships: [];
      };
      clients: {
        Row: {
          id: string;
          name: string | null;
          company_name?: string | null;
          tier?: string | null;
          owner_id?: string | null;
          created_at: string;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          name?: string | null;
          company_name?: string | null;
          tier?: string | null;
          owner_id?: string | null;
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
          control?: string | null;
          source: string | null;
          collected_at: string;
          content_hash?: string | null;
          raw_content?: string | null;
          raw_data: Json | null;
          checksum: string | null;
          artifact_type: string | null;
        };
        Insert: {
          id?: string;
          client_id?: string | null;
          control?: string | null;
          source?: string | null;
          collected_at?: string;
          content_hash?: string | null;
          raw_content?: string | null;
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
          evidence_id?: string | null;
          control?: string | null;
          control_area: string | null;
          severity: string | null;
          finding?: string | null;
          auto_remediable?: boolean | null;
          remediation_type?: string | null;
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
          evidence_id?: string | null;
          control?: string | null;
          control_area?: string | null;
          severity?: string | null;
          finding?: string | null;
          auto_remediable?: boolean | null;
          remediation_type?: string | null;
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
          gap_id?: string | null;
          finding_id: string | null;
          remediation_code?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          executed_at?: string | null;
          execution_result?: Json | null;
          action_taken: string | null;
          actor: string | null;
          timestamp: string;
        };
        Insert: {
          id?: string;
          gap_id?: string | null;
          finding_id?: string | null;
          remediation_code?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          executed_at?: string | null;
          execution_result?: Json | null;
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
