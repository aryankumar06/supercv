import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Suggestion {
  category: string;
  issue: string;
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
}

export interface CategoryScores {
  keyword_match: number;
  title_seniority: number;
  formatting_parseability: number;
  content_quality: number;
  structure_completeness: number;
}

export interface EnhancementChange {
  section: string;
  original_issue: string;
  fix_applied: string;
}

export interface AnalysisResult {
  ats_score: number;
  category_scores: CategoryScores;
  matched_keywords: string[];
  missing_keywords: string[];
  formatting_red_flags: string[];
  top_issues: string[];
  suggestions: Suggestion[];
  verdict: 'PASS' | 'FAIL';
  enhanced_resume: string | null;
  enhancement_changes: EnhancementChange[] | null;
  enhanced_score: number | null;
  manual_actions: string[] | null;
}

export interface ResumeAnalysis {
  id: string;
  resume_text: string;
  job_description: string;
  ats_score: number;
  category_scores: CategoryScores;
  matched_keywords: string[];
  missing_keywords: string[];
  formatting_red_flags: string[];
  top_issues: string[];
  suggestions: Suggestion[];
  enhanced_resume: string | null;
  enhancement_changes: EnhancementChange[] | null;
  enhanced_score: number | null;
  manual_actions: string[] | null;
  verdict: string;
  created_at: string;
}
