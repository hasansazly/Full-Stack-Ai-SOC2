# ClearAudit

ClearAudit is a Next.js 14 MVP for detecting compliance gaps across AWS IAM and GitHub branch management. It stores evidence in Supabase, generates rule-based findings, and drafts remediation outputs for security questionnaires and policies.

## Stack

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- Supabase
- AWS SDK v3
- Octokit

## Environment Variables

Copy `.env.example` and fill in:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY` optional
- `ANTHROPIC_API_KEY` optional

## Database

Apply [`supabase/migrations/001_clearaudit_schema.sql`](/Users/abuhasan2003/Documents/Full Stack Ai SOC2 /supabase/migrations/001_clearaudit_schema.sql) in your Supabase project.

## Run

1. Install dependencies with `npm install`
2. Start the dev server with `npm run dev`

## Notes

- The policy and questionnaire generators are rule-based by default.
- When Supabase is not configured, the UI falls back to demo findings and evidence so the flows remain explorable.
