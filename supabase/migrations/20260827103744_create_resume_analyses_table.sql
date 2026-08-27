/*
# Create resume_analyses table (single-tenant, no auth)

1. New Tables
- `resume_analyses`
  - `id` (uuid, primary key)
  - `resume_text` (text, not null) — the candidate's resume content
  - `job_description` (text, not null) — the target job posting
  - `ats_score` (integer) — composite ATS score 0–100
  - `category_scores` (jsonb) — per-category breakdown (keyword, title, formatting, content, structure)
  - `matched_keywords` (text[]) — keywords found in resume
  - `missing_keywords` (text[]) — critical keywords missing from resume
  - `formatting_red_flags` (text[]) — ATS-breaking formatting issues
  - `top_issues` (text[]) — top issues holding the resume back
  - `suggestions` (jsonb) — list of suggestions with category/issue/recommendation/priority
  - `enhanced_resume` (text) — the rewritten resume from Phase 2 (nullable)
  - `enhancement_changes` (jsonb) — table of changes made during enhancement (nullable)
  - `enhanced_score` (integer) — re-scored ATS score after enhancement (nullable)
  - `manual_actions` (text[]) — remaining manual actions for the candidate (nullable)
  - `verdict` (text) — "PASS" or "FAIL"
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on `resume_analyses`.
- Allow anon + authenticated full CRUD because this is a single-tenant app with no sign-in screen.
- All data is intentionally public/shared within the app.
*/

CREATE TABLE IF NOT EXISTS resume_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_text text NOT NULL,
  job_description text NOT NULL,
  ats_score integer NOT NULL DEFAULT 0,
  category_scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  matched_keywords text[] NOT NULL DEFAULT '{}',
  missing_keywords text[] NOT NULL DEFAULT '{}',
  formatting_red_flags text[] NOT NULL DEFAULT '{}',
  top_issues text[] NOT NULL DEFAULT '{}',
  suggestions jsonb NOT NULL DEFAULT '[]'::jsonb,
  enhanced_resume text,
  enhancement_changes jsonb,
  enhanced_score integer,
  manual_actions text[],
  verdict text NOT NULL DEFAULT 'FAIL',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE resume_analyses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_resume_analyses" ON resume_analyses;
CREATE POLICY "anon_select_resume_analyses"
  ON resume_analyses FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_resume_analyses" ON resume_analyses;
CREATE POLICY "anon_insert_resume_analyses"
  ON resume_analyses FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_resume_analyses" ON resume_analyses;
CREATE POLICY "anon_update_resume_analyses"
  ON resume_analyses FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_resume_analyses" ON resume_analyses;
CREATE POLICY "anon_delete_resume_analyses"
  ON resume_analyses FOR DELETE
  TO anon, authenticated USING (true);
