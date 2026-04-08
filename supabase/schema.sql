create extension if not exists pgcrypto;

-- Waitlist
CREATE TABLE waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  company TEXT,
  deal_at_risk BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clients
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  company_name TEXT NOT NULL,
  aws_account_id TEXT,
  github_org TEXT,
  tier TEXT DEFAULT 'readiness',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Evidence artifacts (append-only, tamper-evident)
CREATE TABLE evidence_artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id),
  control TEXT NOT NULL,
  source TEXT NOT NULL,
  collected_at TIMESTAMPTZ NOT NULL,
  content_hash TEXT NOT NULL,
  raw_content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gap findings
CREATE TABLE gap_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id),
  evidence_id UUID REFERENCES evidence_artifacts(id),
  control TEXT NOT NULL,
  severity TEXT NOT NULL,
  finding TEXT NOT NULL,
  auto_remediable BOOLEAN DEFAULT FALSE,
  remediation_type TEXT,
  remediation_code TEXT,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Remediation log
CREATE TABLE remediation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gap_id UUID REFERENCES gap_findings(id),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  executed_at TIMESTAMPTZ,
  execution_result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE gap_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE remediation_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "waitlist insert" ON waitlist
  FOR INSERT WITH CHECK (true);

CREATE POLICY "users see own clients" ON clients
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "clients see own evidence" ON evidence_artifacts
  FOR ALL USING (
    client_id IN (SELECT id FROM clients WHERE user_id = auth.uid())
  )
  WITH CHECK (
    client_id IN (SELECT id FROM clients WHERE user_id = auth.uid())
  );

CREATE POLICY "clients see own gaps" ON gap_findings
  FOR ALL USING (
    client_id IN (SELECT id FROM clients WHERE user_id = auth.uid())
  )
  WITH CHECK (
    client_id IN (SELECT id FROM clients WHERE user_id = auth.uid())
  );

CREATE POLICY "clients see own remediations" ON remediation_log
  FOR ALL USING (
    gap_id IN (
      SELECT id FROM gap_findings WHERE client_id IN (
        SELECT id FROM clients WHERE user_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    gap_id IN (
      SELECT id FROM gap_findings WHERE client_id IN (
        SELECT id FROM clients WHERE user_id = auth.uid()
      )
    )
  );
