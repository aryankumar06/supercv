import {
  extractKeywords,
  checkKeywordInResume,
  extractJobTitle,
  extractSeniorityLevel,
  extractYearsRequired,
} from './keywordExtractor';
import type {
  Suggestion,
  CategoryScores,
  AnalysisResult,
  EnhancementChange,
} from '../lib/supabase';

const WEIGHTS = {
  keyword_match: 0.35,
  title_seniority: 0.15,
  formatting_parseability: 0.20,
  content_quality: 0.20,
  structure_completeness: 0.10,
};

const SENIORITY_RANK: Record<string, number> = {
  junior: 1,
  mid: 2,
  lead: 3,
  senior: 4,
  executive: 5,
};

export function analyzeResume(resumeText: string, jobDescription: string): AnalysisResult {
  const keywordResult = scoreKeywordMatch(resumeText, jobDescription);
  const titleResult = scoreTitleSeniority(resumeText, jobDescription);
  const formattingResult = scoreFormattingParseability(resumeText);
  const contentResult = scoreContentQuality(resumeText);
  const structureResult = scoreStructureCompleteness(resumeText);

  const category_scores: CategoryScores = {
    keyword_match: keywordResult.score,
    title_seniority: titleResult.score,
    formatting_parseability: formattingResult.score,
    content_quality: contentResult.score,
    structure_completeness: structureResult.score,
  };

  const ats_score = Math.round(
    keywordResult.score * WEIGHTS.keyword_match +
    titleResult.score * WEIGHTS.title_seniority +
    formattingResult.score * WEIGHTS.formatting_parseability +
    contentResult.score * WEIGHTS.content_quality +
    structureResult.score * WEIGHTS.structure_completeness
  );

  const verdict: 'PASS' | 'FAIL' = ats_score >= 70 ? 'PASS' : 'FAIL';

  const suggestions = generateSuggestions(
    resumeText,
    jobDescription,
    category_scores,
    keywordResult,
    titleResult,
    formattingResult,
    contentResult,
    structureResult
  );

  const topIssues = identifyTopIssues(
    category_scores,
    keywordResult,
    formattingResult,
    contentResult,
    structureResult
  );

  const shouldEnhance = ats_score < 70;

  let enhanced_resume: string | null = null;
  let enhancement_changes: EnhancementChange[] | null = null;
  let enhanced_score: number | null = null;
  let manual_actions: string[] | null = null;

  if (shouldEnhance) {
    const enhancement = enhanceResume(resumeText, jobDescription, {
      category_scores,
      matched_keywords: keywordResult.matched,
      missing_keywords: keywordResult.missing,
      formatting_red_flags: formattingResult.redFlags,
      suggestions,
    });
    enhanced_resume = enhancement.resume;
    enhancement_changes = enhancement.changes;
    manual_actions = enhancement.manualActions;

    const reScored = analyzeResume(enhancement.resume, jobDescription);
    enhanced_score = reScored.ats_score;
  }

  return {
    ats_score,
    category_scores,
    matched_keywords: keywordResult.matched,
    missing_keywords: keywordResult.missing,
    formatting_red_flags: formattingResult.redFlags,
    top_issues: topIssues,
    suggestions,
    verdict,
    enhanced_resume,
    enhancement_changes,
    enhanced_score,
    manual_actions,
  };
}

// ── Category 1: Keyword & Skills Match (35%) ──

interface KeywordResult {
  score: number;
  matched: string[];
  missing: string[];
}

function scoreKeywordMatch(resumeText: string, jobDescription: string): KeywordResult {
  const { hardSkills, softSkills } = extractKeywords(jobDescription);

  const matched: string[] = [];
  const missing: string[] = [];

  for (const skill of hardSkills) {
    if (checkKeywordInResume(skill.normalized, resumeText)) {
      matched.push(skill.normalized);
    } else {
      missing.push(skill.normalized);
    }
  }

  for (const skill of softSkills) {
    if (checkKeywordInResume(skill.normalized, resumeText)) {
      matched.push(skill.normalized);
    } else {
      missing.push(skill.normalized);
    }
  }

  const totalKeywords = hardSkills.length + softSkills.length;
  if (totalKeywords === 0) return { score: 50, matched, missing };

  const matchedCount = matched.length;

  // Check for keyword stuffing — unnatural repetition of the same keyword
  const stuffingPenalty = detectKeywordStuffing(resumeText);

  let score = Math.round((matchedCount / totalKeywords) * 100) - stuffingPenalty;

  return { score: Math.max(0, Math.min(100, score)), matched, missing };
}

function detectKeywordStuffing(resumeText: string): number {
  let penalty = 0;
  const words = resumeText.toLowerCase().split(/\s+/);
  const wordCounts = new Map<string, number>();

  for (const word of words) {
    const clean = word.replace(/[^a-z0-9.#]/g, '');
    if (clean.length < 3) continue;
    wordCounts.set(clean, (wordCounts.get(clean) || 0) + 1);
  }

  for (const [, count] of wordCounts) {
    if (count > 8) penalty += 5;
  }

  return Math.min(penalty, 20);
}

// ── Category 2: Title & Seniority Alignment (15%) ──

interface TitleResult {
  score: number;
  notes: string;
}

function scoreTitleSeniority(resumeText: string, jobDescription: string): TitleResult {
  const jdTitle = extractJobTitle(jobDescription);
  const jdSeniority = extractSeniorityLevel(jobDescription);
  const yearsRequired = extractYearsRequired(jobDescription);

  const lower = resumeText.toLowerCase();

  // Try to find candidate's job titles
  const titleLines: string[] = [];
  const lines = resumeText.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length > 0 && trimmed.length < 80 && !trimmed.includes('@')) {
      if (/\b(engineer|developer|manager|designer|analyst|specialist|coordinator|director|lead|architect|consultant|administrator|scientist)\b/i.test(trimmed)) {
        titleLines.push(trimmed);
      }
    }
  }

  // Estimate candidate's seniority from their titles
  let candidateSeniority = 'mid';
  if (titleLines.length > 0) {
    const allTitles = titleLines.join(' ').toLowerCase();
    if (/\b(staff|principal|head of|director|vp)\b/i.test(allTitles)) candidateSeniority = 'executive';
    else if (/\b(senior|sr\.?|founding|founder|architect|lead engineer|tech lead)\b/i.test(allTitles)) candidateSeniority = 'senior';
    else if (/\b(lead|product engineer|sole engineer)\b/i.test(allTitles)) candidateSeniority = 'lead';
    else if (/\b(junior|jr\.?|associate|entry|intern)\b/i.test(allTitles)) candidateSeniority = 'junior';
  }

  // Estimate years of experience from dates in resume
  const yearMatches = resumeText.match(/\b(19|20)\d{2}\b/g);
  let candidateYears = 0;
  if (yearMatches && yearMatches.length >= 2) {
    const years = yearMatches.map(Number).sort();
    candidateYears = Math.max(0, years[years.length - 1] - years[0]);
  }

  let score = 100;
  const notes: string[] = [];

  // Seniority comparison
  const jdRank = SENIORITY_RANK[jdSeniority] || 2;
  const candRank = SENIORITY_RANK[candidateSeniority] || 2;
  const seniorityGap = Math.abs(jdRank - candRank);

  if (seniorityGap >= 2) {
    score -= 40;
    notes.push(`Major seniority mismatch: JD requires ${jdSeniority}, resume suggests ${candidateSeniority}`);
  } else if (seniorityGap === 1) {
    score -= 15;
    notes.push(`Minor seniority gap: JD requires ${jdSeniority}, resume suggests ${candidateSeniority}`);
  }

  // Years comparison
  if (yearsRequired > 0 && candidateYears > 0) {
    if (candidateYears < yearsRequired - 1) {
      score -= 25;
      notes.push(`Experience gap: JD requires ~${yearsRequired} years, resume shows ~${candidateYears} years`);
    } else if (candidateYears >= yearsRequired) {
      notes.push(`Experience meets requirement: ~${candidateYears} years vs ${yearsRequired} required`);
    }
  } else if (yearsRequired > 0 && candidateYears === 0) {
    score -= 10;
    notes.push('Could not determine years of experience from resume dates');
  }

  // Title keyword match
  if (jdTitle) {
    const jdTitleWords = jdTitle.toLowerCase().split(/\s+/).filter((w) => w.length > 3 && !['senior', 'junior', 'lead', 'staff', 'associate'].includes(w));
    let titleMatchCount = 0;
    for (const word of jdTitleWords) {
      if (lower.includes(word)) titleMatchCount++;
    }
    if (jdTitleWords.length > 0 && titleMatchCount === 0) {
      score -= 20;
      notes.push(`Job title "${jdTitle}" keywords not found in resume`);
    }
  }

  return { score: Math.max(0, Math.min(100, score)), notes: notes.join('; ') };
}

// ── Category 3: Formatting & Parseability (20%) ──

interface FormattingResult {
  score: number;
  redFlags: string[];
}

function scoreFormattingParseability(resumeText: string): FormattingResult {
  let score = 100;
  const redFlags: string[] = [];

  // Box-drawing / table characters
  if (resumeText.includes('│') || resumeText.includes('─') || resumeText.includes('┌') || resumeText.includes('└') || resumeText.includes('┐') || resumeText.includes('┘')) {
    score -= 25;
    redFlags.push('Table or box-drawing characters detected — ATS may not parse correctly');
  }

  // Special symbols / icons
  const specialChars = /[★☆●○■□▪▫◆◇►▷▸▹✦✧✓✔✗✘☎✉⚙]/g;
  if (specialChars.test(resumeText)) {
    score -= 20;
    redFlags.push('Special symbols or icons detected — these are invisible to ATS parsers');
  }

  // Very long lines (may indicate multi-column or text boxes)
  const lines = resumeText.split('\n');
  const longLines = lines.filter((l) => l.length > 120).length;
  if (longLines > 3) {
    score -= 15;
    redFlags.push('Very long lines detected — may indicate multi-column layout that ATS cannot parse');
  }

  // Non-standard section headers
  const standardHeaders = ['experience', 'education', 'skills', 'summary', 'contact', 'work', 'employment', 'certifications', 'projects'];
  const lines_lower = lines.map((l) => l.trim().toLowerCase());
  const nonStandardHeaders = lines_lower.filter(
    (l) => l.length < 40 && l.length > 3 &&
    !standardHeaders.some((h) => l.includes(h)) &&
    /^(my|our|the\s)/i.test(l) &&
    !l.includes('@') && !/\d/.test(l)
  );
  if (nonStandardHeaders.length > 0) {
    score -= 10;
    redFlags.push(`Non-standard section headers detected: "${nonStandardHeaders.slice(0, 2).join('", "')}" — use standard labels like "Experience", "Education"`);
  }

  // Inconsistent date formatting
  const dateFormats = resumeText.match(/\b\d{1,2}\/\d{4}\b|\b\d{4}\b|\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{4}\b/gi);
  if (dateFormats && dateFormats.length > 0) {
    const hasNumeric = dateFormats.some((d) => /\d{1,2}\/\d{4}/.test(d));
    const hasText = dateFormats.some((d) => /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(d));
    const hasYearOnly = dateFormats.some((d) => /^\d{4}$/.test(d));
    const formatCount = [hasNumeric, hasText, hasYearOnly].filter(Boolean).length;
    if (formatCount > 1) {
      score -= 10;
      redFlags.push('Inconsistent date formats — standardize to MM/YYYY throughout');
    }
  }

  // Check for contact info in body (not just header/footer)
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  if (!emailRegex.test(resumeText)) {
    score -= 15;
    redFlags.push('No email address found in resume body — ATS may not be able to contact you');
  }

  // Garbled text indicators
  if (/\uFFFD/.test(resumeText)) {
    score -= 20;
    redFlags.push('Replacement characters detected — text extraction may have produced garbled content');
  }

  return { score: Math.max(0, score), redFlags };
}

// ── Category 4: Content Quality & Impact (20%) ──

interface ContentResult {
  score: number;
  notes: string[];
}

function scoreContentQuality(resumeText: string): ContentResult {
  let score = 100;
  const notes: string[] = [];

  // Check for quantified achievements
  const quantifiedAchievements = resumeText.match(/\b\d+%|\$\d+|\b\d+,\d{3}\b|\b\d+\s+(users|customers|clients|projects|team members|people|hours|days|weeks|months|years)\b/gi);
  if (!quantifiedAchievements || quantifiedAchievements.length < 2) {
    score -= 25;
    notes.push('Few or no quantified achievements — add metrics like %, $, or counts');
  } else if (quantifiedAchievements.length < 5) {
    score -= 10;
    notes.push('Limited quantified achievements — add more specific metrics');
  }

  // Check for weak phrases
  const weakPhrases = ['responsible for', 'duties included', 'worked on', 'helped with', 'assisted in', 'involved in'];
  const lower = resumeText.toLowerCase();
  let weakCount = 0;
  for (const phrase of weakPhrases) {
    const matches = lower.match(new RegExp(phrase, 'gi'));
    if (matches) weakCount += matches.length;
  }
  if (weakCount > 3) {
    score -= 20;
    notes.push('Overuse of weak phrases like "Responsible for" — start bullets with strong action verbs');
  } else if (weakCount > 0) {
    score -= 10;
    notes.push('Some weak phrases detected — replace with action verbs');
  }

  // Check for first-person pronouns
  const firstPerson = resumeText.match(/\bI\s+(am|was|have|had|did|do|will|would|could|should|managed|led|created|built|developed|worked|designed)\b|\bmy\s+(team|role|job|work|experience|project|responsibilities)\b/gi);
  if (firstPerson && firstPerson.length > 2) {
    score -= 15;
    notes.push('First-person pronouns (I, my) detected — remove and use action verbs instead');
  }

  // Check for objective statement (unless entry-level)
  if (/\bobjective\b/i.test(resumeText) && !/entry.level|career.change/i.test(resumeText)) {
    score -= 10;
    notes.push('Objective statement detected — replace with a professional summary');
  }

  // Check bullet point quality
  const bulletRegex = /^[\s]*[-•*▪▫]\s/gm;
  const bullets = resumeText.match(bulletRegex);
  if (!bullets || bullets.length < 3) {
    score -= 15;
    notes.push('Insufficient bullet points — use bullets for achievements, not paragraphs');
  }

  // Check for paragraph-length bullets
  const bulletLines = resumeText.split('\n').filter((l) => /^[\s]*[-•*▪▫]\s/.test(l));
  const longBullets = bulletLines.filter((l) => l.length > 200);
  if (longBullets.length > 2) {
    score -= 10;
    notes.push('Some bullet points are too long (paragraph-length) — keep to 1-2 lines');
  }

  // Check for action verbs at start of bullets
  const actionVerbs = ['developed', 'implemented', 'designed', 'created', 'built', 'managed', 'led', 'launched', 'improved', 'increased', 'reduced', 'optimized', 'architected', 'engineered', 'delivered', 'drove', 'established', 'streamlined', 'automated', 'spearheaded', 'orchestrated', 'executed', 'analyzed', 'collaborated', 'coordinated', 'facilitated', 'negotiated', 'mentored', 'trained', 'researched', 'evaluated', 'identified', 'resolved', 'migrated', 'integrated', 'deployed', 'configured', 'maintained', 'monitored', 'tested', 'documented', 'presented', 'authored', 'initiated', 'pioneered', 'championed'];
  let verbCount = 0;
  for (const line of bulletLines) {
    const firstWord = line.replace(/^[\s]*[-•*▪▫]\s/, '').split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, '');
    if (firstWord && actionVerbs.includes(firstWord)) verbCount++;
  }
  if (bulletLines.length > 0 && verbCount / bulletLines.length < 0.5) {
    score -= 10;
    notes.push('Many bullets don\'t start with action verbs — begin each bullet with a strong verb');
  }

  return { score: Math.max(0, score), notes };
}

// ── Category 5: Structure & Completeness (10%) ──

interface StructureResult {
  score: number;
  missingSections: string[];
}

function scoreStructureCompleteness(resumeText: string): StructureResult {
  let score = 100;
  const missingSections: string[] = [];
  const lower = resumeText.toLowerCase();

  const sections = [
    { name: 'Contact Information', patterns: [/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/] },
    { name: 'Professional Summary', patterns: [/summary/, /profile/, /objective/, /headline/] },
    { name: 'Skills', patterns: [/skills/, /technical skills/, /competencies/, /technologies/] },
    { name: 'Experience', patterns: [/experience/, /work history/, /employment/, /professional background/] },
    { name: 'Education', patterns: [/education/, /degree/, /university/, /college/, /bachelor/, /master/, /phd/] },
  ];

  for (const section of sections) {
    const found = section.patterns.some((p) => {
      if (p instanceof RegExp) return p.test(resumeText) || p.test(lower);
      return lower.includes(p);
    });
    if (!found) {
      missingSections.push(section.name);
      score -= 20;
    }
  }

  // Check resume length (word count as proxy)
  const wordCount = resumeText.split(/\s+/).length;
  if (wordCount < 200) {
    score -= 15;
    missingSections.push('Resume appears too short (under 200 words)');
  } else if (wordCount > 1200) {
    score -= 10;
    missingSections.push('Resume may be too long (over 1200 words) — consider trimming');
  }

  // Check for employment gaps
  const yearMatches = resumeText.match(/\b(19|20)\d{2}\b/g);
  if (yearMatches && yearMatches.length >= 4) {
    const years = [...new Set(yearMatches.map(Number))].sort();
    let gaps = 0;
    for (let i = 0; i < years.length - 1; i++) {
      if (years[i + 1] - years[i] > 2) gaps++;
    }
    if (gaps > 0) {
      score -= 10;
      missingSections.push(`${gaps} potential employment gap(s) detected — consider adding context`);
    }
  }

  return { score: Math.max(0, score), missingSections };
}

// ── Suggestions Generation ──

function generateSuggestions(
  resumeText: string,
  _jobDescription: string,
  scores: CategoryScores,
  keywordResult: KeywordResult,
  titleResult: TitleResult,
  formattingResult: FormattingResult,
  contentResult: ContentResult,
  structureResult: StructureResult
): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const lower = resumeText.toLowerCase();

  if (scores.keyword_match < 70 && keywordResult.missing.length > 0) {
    const topMissing = keywordResult.missing.slice(0, 5);
    suggestions.push({
      category: 'Keyword & Skills Match',
      issue: `Missing ${keywordResult.missing.length} critical keyword(s) from the job description`,
      recommendation: `Add these keywords where your experience genuinely supports them: ${topMissing.join(', ')}${keywordResult.missing.length > 5 ? ', and others' : ''}. Weave them naturally into your experience bullets and skills section.`,
      priority: 'high',
    });
  }

  if (scores.title_seniority < 70) {
    suggestions.push({
      category: 'Title & Seniority Alignment',
      issue: titleResult.notes,
      recommendation: 'Ensure your job titles reflect the seniority level of the target role. If you have offsetting evidence (scope, impact, team size), make it prominent in your summary and bullets.',
      priority: 'high',
    });
  }

  if (formattingResult.redFlags.length > 0) {
    suggestions.push({
      category: 'Formatting & Parseability',
      issue: `${formattingResult.redFlags.length} formatting red flag(s) detected`,
      recommendation: `Fix these issues: ${formattingResult.redFlags.join('; ')}. Use plain text with standard headers and bullet points only.`,
      priority: 'high',
    });
  }

  if (scores.content_quality < 70) {
    const topNotes = contentResult.notes.slice(0, 3);
    suggestions.push({
      category: 'Content Quality & Impact',
      issue: topNotes.join('; '),
      recommendation: 'Use the formula: [Strong Action Verb] + [What you did / how] + [Quantified Result]. Replace weak phrases and add specific metrics to every bullet.',
      priority: 'medium',
    });
  }

  if (structureResult.missingSections.length > 0) {
    suggestions.push({
      category: 'Structure & Completeness',
      issue: `Missing or incomplete: ${structureResult.missingSections.join(', ')}`,
      recommendation: 'Include all standard sections: Contact Info, Professional Summary, Skills, Experience, Education. Add Certifications if relevant to the job.',
      priority: 'medium',
    });
  }

  if (!lower.includes('summary') && !lower.includes('profile') && !lower.includes('headline')) {
    suggestions.push({
      category: 'Professional Summary',
      issue: 'No professional summary found',
      recommendation: 'Add a 3-4 line keyword-rich summary at the top, tailored to the target job title. Highlight your most relevant qualifications and career focus.',
      priority: 'medium',
    });
  }

  return suggestions;
}

function identifyTopIssues(
  scores: CategoryScores,
  keywordResult: KeywordResult,
  formattingResult: FormattingResult,
  contentResult: ContentResult,
  structureResult: StructureResult
): string[] {
  const issues: { text: string; severity: number }[] = [];

  if (scores.keyword_match < 70) {
    issues.push({
      text: `Missing ${keywordResult.missing.length} critical keyword(s): ${keywordResult.missing.slice(0, 3).join(', ')}${keywordResult.missing.length > 3 ? '...' : ''}`,
      severity: 100 - scores.keyword_match,
    });
  }

  if (formattingResult.redFlags.length > 0) {
    issues.push({
      text: formattingResult.redFlags[0],
      severity: 100 - scores.formatting_parseability,
    });
  }

  if (scores.content_quality < 70) {
    issues.push({
      text: contentResult.notes[0] || 'Content lacks quantified achievements and strong action verbs',
      severity: 100 - scores.content_quality,
    });
  }

  if (scores.title_seniority < 70) {
    issues.push({
      text: 'Job title or seniority level does not align well with the target role',
      severity: 100 - scores.title_seniority,
    });
  }

  if (structureResult.missingSections.length > 0) {
    issues.push({
      text: `Missing sections: ${structureResult.missingSections.slice(0, 2).join(', ')}`,
      severity: 100 - scores.structure_completeness,
    });
  }

  return issues.sort((a, b) => b.severity - a.severity).slice(0, 3).map((i) => i.text);
}

// ── Phase 2: Auto-Enhancement ──

interface EnhancementResult {
  resume: string;
  changes: EnhancementChange[];
  manualActions: string[];
}

function enhanceResume(
  resumeText: string,
  _jobDescription: string,
  context: {
    category_scores: CategoryScores;
    matched_keywords: string[];
    missing_keywords: string[];
    formatting_red_flags: string[];
    suggestions: Suggestion[];
  }
): EnhancementResult {
  const changes: EnhancementChange[] = [];
  const manualActions: string[] = [];
  const lines = resumeText.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);

  const lower = resumeText.toLowerCase();

  // Extract existing sections
  const sections = parseSections(lines);

  let enhanced = '';

  // 1. Contact Info — keep as-is, ensure it's at top
  const contactLines = lines.slice(0, Math.min(5, lines.length)).filter((l) =>
    l.includes('@') || /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(l) || /linkedin|github/i.test(l)
  );

  if (contactLines.length > 0) {
    enhanced += contactLines.join('\n') + '\n\n';
  } else {
    enhanced += '[YOUR NAME]\n[Email] | [Phone] | [LinkedIn] | [Location]\n\n';
    manualActions.push('Add your contact information at the top of the resume');
  }

  // 2. Professional Summary — generate if missing or weak
  const hasSummary = lower.includes('summary') || lower.includes('profile') || lower.includes('headline');
  const jdTitle = extractJobTitle(_jobDescription);
  const { hardSkills } = extractKeywords(_jobDescription);
  const topSkills = hardSkills.slice(0, 5).map((s) => s.normalized);

  if (!hasSummary) {
    const summaryLine = jdTitle
      ? `Professional Summary\n\nResults-driven professional with experience aligning to ${jdTitle} requirements. Skilled in ${topSkills.slice(0, 3).join(', ')}. Proven track record of delivering impact through strategic execution and cross-functional collaboration.`
      : `Professional Summary\n\nResults-driven professional with expertise in ${topSkills.slice(0, 3).join(', ')}. Proven track record of delivering measurable impact through strategic execution and cross-functional collaboration.`;

    enhanced += summaryLine + '\n\n';
    changes.push({
      section: 'Professional Summary',
      original_issue: 'No professional summary found',
      fix_applied: 'Added a keyword-rich 3-4 line summary tailored to the target role',
    });
  } else if (sections.summary) {
    enhanced += sections.summary + '\n\n';
  }

  // 3. Core Skills — flat list with missing keywords
  const hasSkillsSection = lower.includes('skills') || lower.includes('competencies') || lower.includes('technologies');
  const skillsToAdd = context.missing_keywords.filter((k) =>
    topSkills.includes(k) || hardSkills.some((h) => h.normalized === k)
  );

  if (hasSkillsSection && sections.skills) {
    // Append missing keywords to existing skills
    let skillsSection = sections.skills;
    if (skillsToAdd.length > 0) {
      skillsSection += '\n' + skillsToAdd.join(' • ');
      changes.push({
        section: 'Core Skills',
        original_issue: `Missing ${skillsToAdd.length} keywords from JD`,
        fix_applied: `Added: ${skillsToAdd.join(', ')} to skills section`,
      });
    }
    enhanced += skillsSection + '\n\n';
  } else {
    // Create skills section
    const allSkills = [...context.matched_keywords, ...skillsToAdd];
    const uniqueSkills = [...new Set(allSkills)].slice(0, 15);
    enhanced += `Core Skills\n\n${uniqueSkills.join(' • ')}\n\n`;
    changes.push({
      section: 'Core Skills',
      original_issue: 'No dedicated skills section found',
      fix_applied: 'Created flat list of core skills with JD-matched keywords',
    });
  }

  // 4. Professional Experience — rewrite bullets
  if (sections.experience) {
    const enhancedExp = enhanceExperienceSection(sections.experience, context.missing_keywords, changes, manualActions);
    enhanced += enhancedExp + '\n\n';
  } else if (sections.other.length > 0) {
    // Try to reconstruct from other lines
    enhanced += 'Professional Experience\n\n';
    for (const line of sections.other.slice(0, 20)) {
      enhanced += line + '\n';
    }
    enhanced += '\n\n';
    changes.push({
      section: 'Professional Experience',
      original_issue: 'No clear experience section found',
      fix_applied: 'Reconstructed from available content with standard header',
    });
  }

  // 5. Education
  if (sections.education) {
    enhanced += sections.education + '\n\n';
  } else {
    enhanced += 'Education\n\n[Degree] — [University], [Year]\n\n';
    manualActions.push('Add your education details (degree, university, year)');
    changes.push({
      section: 'Education',
      original_issue: 'No education section found',
      fix_applied: 'Added placeholder education section for manual completion',
    });
  }

  // 6. Certifications
  if (sections.certifications) {
    enhanced += sections.certifications + '\n\n';
  } else if (hardSkills.some((s) => /certified|pmp|cka|cissp|ccna/i.test(s.normalized))) {
    enhanced += 'Certifications\n\n[Add relevant certifications]\n\n';
    manualActions.push('Add relevant certifications mentioned in the job description');
    changes.push({
      section: 'Certifications',
      original_issue: 'JD mentions certifications but none found in resume',
      fix_applied: 'Added certifications section placeholder',
    });
  }

  // Strip formatting red flags
  if (context.formatting_red_flags.length > 0) {
    enhanced = enhanced
      .replace(/[│─┌┐└┘├┤┬┴┼]/g, '')
      .replace(/[★☆●○■□▪▫◆◇►▷▸▹✦✧✓✔✗✘☎✉⚙]/g, '');
    changes.push({
      section: 'Formatting',
      original_issue: 'ATS-breaking formatting elements detected',
      fix_applied: 'Stripped table characters, special symbols, and icons',
    });
  }

  return { resume: enhanced.trim(), changes, manualActions };
}

function parseSections(lines: string[]): {
  summary: string | null;
  skills: string | null;
  experience: string | null;
  education: string | null;
  certifications: string | null;
  other: string[];
} {
  const result = {
    summary: null as string | null,
    skills: null as string | null,
    experience: null as string | null,
    education: null as string | null,
    certifications: null as string | null,
    other: [] as string[],
  };

  let currentSection: keyof typeof result | null = null;
  let currentLines: string[] = [];

  const sectionHeaders: Record<string, keyof typeof result> = {
    summary: 'summary', profile: 'summary', objective: 'summary', headline: 'summary',
    skills: 'skills', 'technical skills': 'skills', competencies: 'skills', technologies: 'skills',
    experience: 'experience', 'work history': 'experience', 'work experience': 'experience',
    'professional experience': 'experience', employment: 'experience',
    education: 'education',
    certifications: 'certifications', 'certificates': 'certifications', 'licenses': 'certifications',
  };

  const flush = () => {
    if (currentSection && currentSection !== 'other' && currentLines.length > 0) {
      result[currentSection] = currentLines.join('\n');
    } else if (currentLines.length > 0) {
      result.other.push(...currentLines);
    }
    currentLines = [];
  };

  for (const line of lines) {
    const lower = line.toLowerCase().trim();
    let matched: keyof typeof result | null = null;

    for (const [header, key] of Object.entries(sectionHeaders)) {
      if (lower === header || lower.startsWith(header + ':')) {
        matched = key;
        break;
      }
    }

    if (matched) {
      flush();
      currentSection = matched;
      currentLines.push(line);
    } else if (currentSection) {
      currentLines.push(line);
    } else {
      result.other.push(line);
    }
  }
  flush();

  return result;
}

function enhanceExperienceSection(
  experienceText: string,
  _missingKeywords: string[],
  changes: EnhancementChange[],
  manualActions: string[]
): string {
  const lines = experienceText.split('\n');
  const enhanced: string[] = [];
  let bulletCount = 0;
  let rewrittenCount = 0;

  const actionVerbMap: Record<string, string> = {
    'responsible for': 'Managed',
    'duties included': 'Executed',
    'worked on': 'Developed',
    'helped with': 'Supported',
    'assisted in': 'Collaborated on',
    'involved in': 'Contributed to',
  };

  for (let line of lines) {
    const trimmed = line.trim();
    const lower = trimmed.toLowerCase();

    // Check if it's a bullet point
    const isBullet = /^[\s]*[-•*▪▫]\s/.test(trimmed);

    if (isBullet) {
      bulletCount++;
      let bulletContent = trimmed.replace(/^[\s]*[-•*▪▫]\s/, '');

      // Replace weak phrases with action verbs
      for (const [phrase, verb] of Object.entries(actionVerbMap)) {
        if (lower.includes(phrase)) {
          bulletContent = verb + bulletContent.slice(phrase.length).replace(/^\s*for\s+/i, ' ');
          rewrittenCount++;
          break;
        }
      }

      // Remove first-person pronouns
      bulletContent = bulletContent.replace(/\bI\s+(am|was|have|had|did|do|will|would|could|should|managed|led|created|built|developed|worked|designed)\b/gi, (_, verb) => verb.charAt(0).toUpperCase() + verb.slice(1));
      bulletContent = bulletContent.replace(/\bmy\s+/gi, '');

      // Check for quantification
      const hasMetric = /\d+%|\$\d+|\b\d+,\d{3}\b|\b\d+\s+(users|customers|clients|projects|team|people|hours|days|weeks|months|years)\b/i.test(bulletContent);
      if (!hasMetric && rewrittenCount < 3) {
        manualActions.push(`Add specific metric to bullet: "${bulletContent.slice(0, 60)}..." — e.g., % improvement, $ impact, team size, or time saved`);
      }

      enhanced.push(`- ${bulletContent}`);
    } else {
      enhanced.push(trimmed);
    }
  }

  if (rewrittenCount > 0) {
    changes.push({
      section: 'Professional Experience',
      original_issue: 'Weak phrases and first-person pronouns in bullets',
      fix_applied: `Rewrote ${rewrittenCount} bullet(s) with strong action verbs, removed first-person pronouns`,
    });
  }

  if (bulletCount < 3) {
    changes.push({
      section: 'Professional Experience',
      original_issue: 'Insufficient bullet points',
      fix_applied: 'Formatted content with standard bullet points',
    });
  }

  return enhanced.join('\n');
}
