export interface FocusAreaEvaluation {
  id: number;
  name: string;
  recruiterFocus: string;
  status: 'passed' | 'warning' | 'missing';
  score: number; // 0 - 100
  evidenceFound?: string;
  feedback: string;
  recommendation: string;
}

export interface NextStepSuggestion {
  id: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  title: string;
  actionItem: string;
  exampleSnippet?: string;
}

export interface TierAnalysisResult {
  tier: 'faang' | 'startup';
  title: string;
  overallScore: number; // 0 - 100
  levelAssessment: string; // e.g. "L4/L5 Equivalent" or "Growth-Stage Fit"
  summary: string;
  passedCount: number;
  warningCount: number;
  missingCount: number;
  focusAreas: FocusAreaEvaluation[];
  nextSteps: NextStepSuggestion[];
}

export interface DualTierScreenResult {
  faang: TierAnalysisResult;
  startup: TierAnalysisResult;
  recommendedPath: 'faang' | 'startup' | 'balanced';
  comparisonSummary: string;
}

// -------------------------------------------------------------
// FAANG FOCUS AREAS AUDIT (Top 20 Big Tech Focus Areas)
// -------------------------------------------------------------
export function analyzeFaangTier(resumeText: string): TierAnalysisResult {
  const lower = resumeText.toLowerCase();
  const words = resumeText.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const focusAreas: FocusAreaEvaluation[] = [];

  // 1. Target company pedigree
  const topTierCompanies = [
    'google', 'meta', 'facebook', 'amazon', 'apple', 'netflix', 'microsoft',
    'uber', 'airbnb', 'stripe', 'palantir', 'databricks', 'snowflake', 'openai',
    'anthropic', 'bytedance', 'salesforce', 'linkedin', 'adobe', 'twitter', 'x corp',
    'y combinator', 'yc', 'coinbase', 'robinhood', 'doordash', 'instacart'
  ];
  const pedigreeMatches = topTierCompanies.filter((c) => {
    const reg = new RegExp(`\\b${c.replace('.', '\\.')}\\b`, 'i');
    return reg.test(lower);
  });
  const hasPedigree = pedigreeMatches.length > 0;
  focusAreas.push({
    id: 1,
    name: 'Target Company Pedigree',
    recruiterFocus: 'Worked at another FAANG, well-known unicorn, or top-tier tech company.',
    status: hasPedigree ? 'passed' : 'warning',
    score: hasPedigree ? 95 : 55,
    evidenceFound: hasPedigree ? `Top-tier company reference: ${pedigreeMatches.join(', ')}` : undefined,
    feedback: hasPedigree
      ? `✅ Strong signal verified: Detected recognized tier-1 company exposure (${pedigreeMatches.join(', ')}).`
      : '⚠️ Partial signal: No Tier-1 FAANG or publicly listed unicorn brand names detected. Compensate with high-volume scale and architecture signals.',
    recommendation: hasPedigree
      ? 'Maintain prominent placement of your tier-1 employers in your header and top experience sections.'
      : 'Instead of just listing company names, state the company type & scale: write "Software Engineer at [Company] (High-growth venture serving 10K+ users)" instead of just the name.',
  });

  // 2. Scale of systems worked on
  const scalePatterns = /(millions? of users|\b\d+[mM]\b\+?\s*users|\b\d+[kK]\b\+?\s*users|\b\d+[\d,]*\+?\s*(?:users|downloads|requests|events|dau|mau)|qps|queries per second|petabytes?|terabytes?|distributed systems?|high throughput|low latency|multi-tenant|k8s|kubernetes|kafka|sharding|microservices|distributed caching|redis cluster|high concurrency|real-time management)/i;
  const scaleMatch = resumeText.match(scalePatterns);
  const hasScale = Boolean(scaleMatch);
  focusAreas.push({
    id: 2,
    name: 'Scale of Systems Worked On',
    recruiterFocus: '"Millions of users," "petabytes," "QPS," distributed systems exposure.',
    status: hasScale ? 'passed' : 'missing',
    score: hasScale ? 90 : 30,
    evidenceFound: scaleMatch ? `Scale metric/signal: "${scaleMatch[0]}"` : undefined,
    feedback: hasScale
      ? `✅ Strong signal verified: Detected system scale indicators (${scaleMatch?.[0]}).`
      : '❌ Missing from resume: Scale & High-Throughput metrics. FAANG recruiters actively filter out resumes with no volume, QPS, or user scale.',
    recommendation: hasScale
      ? 'To elevate to L5/L6, add p99 latency percentiles alongside throughput metrics.'
      : 'Instead of "Built backend API", write: "Architected multi-tenant backend handling 50K+ daily active requests with <50ms p99 response time."',
  });

  // 3. Specific tech stack match
  const strongTechs = ['java', 'c++', 'go', 'golang', 'rust', 'python', 'distributed systems', 'kafka', 'grpc', 'kubernetes', 'aws', 'gcp', 'react', 'typescript', 'postgresql', 'docker', 'sql'];
  const matchedTechs = strongTechs.filter((t) => lower.includes(t));
  const hasStrongTech = matchedTechs.length >= 4;
  focusAreas.push({
    id: 3,
    name: 'Specific Tech Stack Match',
    recruiterFocus: 'Exact languages/frameworks named in the JD (e.g., Java + Kafka, not just "backend dev").',
    status: hasStrongTech ? 'passed' : matchedTechs.length >= 2 ? 'warning' : 'missing',
    score: Math.min(100, Math.max(30, matchedTechs.length * 20)),
    evidenceFound: matchedTechs.length > 0 ? `Detected technologies: ${matchedTechs.slice(0, 6).join(', ')}` : undefined,
    feedback: hasStrongTech
      ? `✅ Strong signal verified: Found ${matchedTechs.length} core production technologies (${matchedTechs.slice(0, 5).join(', ')}).`
      : matchedTechs.length >= 2
      ? '⚠️ Partial signal: Tech stack mentions are limited. Add explicit modern backend/distributed technologies.'
      : '❌ Missing from resume: Specific Tech Stack depth. Generic statements like "worked with databases" fail recruiter keyword matching.',
    recommendation: hasStrongTech
      ? 'Ensure your top matching languages are listed in the first line of your Skills section.'
      : 'Instead of "Worked on frontend and backend", write: "Engineered full-stack features utilizing TypeScript, React, Python, and PostgreSQL with Docker containerization."',
  });

  // 4. Quantified impact metrics
  const metricRegex = /(\d+%\s*|\$\s*\d+[\d,]*|\d+[\d,]*\+?\s*(?:users|downloads|ratings?|reviews|features|apps|projects|clients|customers|ms|x|hours|signups|waitlist|stars|requests))/gi;
  const metricsFound = resumeText.match(metricRegex) || [];
  const numbersCount = metricsFound.length;
  focusAreas.push({
    id: 4,
    name: 'Quantified Impact Metrics',
    recruiterFocus: '%, $, latency reduced, cost saved — vague duty statements get skipped.',
    status: numbersCount >= 4 ? 'passed' : numbersCount >= 2 ? 'warning' : 'missing',
    score: Math.min(100, Math.max(25, numbersCount * 22)),
    evidenceFound: numbersCount > 0 ? `Detected ${numbersCount} metrics: ${metricsFound.slice(0, 4).join(', ')}` : undefined,
    feedback: numbersCount >= 4
      ? `✅ Strong signal verified: High quantitative density with ${numbersCount} metrics detected.`
      : numbersCount >= 2
      ? `⚠️ Partial signal: Found ${numbersCount} metrics, but many bullet points remain qualitative duty statements.`
      : '❌ Missing from resume: Quantified Impact Metrics. Every FAANG recruiter skips passive task descriptions.',
    recommendation: numbersCount >= 4
      ? 'Ensure your highest-impact metrics appear in the first 5 words of your bullet points.'
      : 'Instead of "Reduced UI bugs and improved app performance", write: "Reduced UI bugs by 30% through systematic Cypress E2E testing on an app serving 10K+ users."',
  });

  // 5. Level/title calibration
  const isSeniorOrLead = /(founding\s+(?:software\s+|full\s*stack\s+|product\s+)?engineer|lead\s+(?:software\s+)?engineer|tech\s+lead|senior\s+(?:software\s+)?engineer|staff\s+(?:software\s+)?engineer|principal\s+engineer|sole\s+engineer|architect)/i;
  const leadTitleMatch = resumeText.match(isSeniorOrLead);
  focusAreas.push({
    id: 5,
    name: 'Level / Title Calibration',
    recruiterFocus: 'Is this person actually L4/L5/L6-equivalent based on scope, not just years.',
    status: leadTitleMatch ? 'passed' : 'warning',
    score: leadTitleMatch ? 90 : 65,
    evidenceFound: leadTitleMatch ? `Detected level/title signal: "${leadTitleMatch[0]}"` : 'Mid / Early-career scope phrasing.',
    feedback: leadTitleMatch
      ? `✅ Strong signal verified: Detected high-ownership scope title (${leadTitleMatch[0]}).`
      : '⚠️ Partial signal: Current titles indicate L3/L4 (Junior to Mid). Highlight architectural ownership and cross-team scope to calibrate at L5+.',
    recommendation: leadTitleMatch
      ? 'Emphasize architectural decision making and system decoupling beneath your title.'
      : 'Instead of "Software Developer", write: "Full-Stack Engineer (End-to-End Feature & System Owner)" to reflect high-agency scope.',
  });

  // 6. University pedigree (early career)
  const topUnis = ['stanford', 'mit', 'berkeley', 'carnegie mellon', 'cmu', 'harvard', 'princeton', 'cornell', 'georgia tech', 'uiuc', 'waterloo', 'iit', 'bits pilani', 'oxford', 'cambridge', 'aktu', 'delhi university', 'bachelor of technology', 'b.tech', 'computer science'];
  const uniMatch = topUnis.filter((u) => lower.includes(u));
  const hasCSDegree = /bachelor.*computer science|b\.tech.*computer science|b\.s\..*computer science|master.*computer science|cs degree/i.test(resumeText);
  focusAreas.push({
    id: 6,
    name: 'University Pedigree & CS Foundations',
    recruiterFocus: 'Top CS programs weighted heavily for new grad / early-career roles.',
    status: hasCSDegree || uniMatch.length > 0 ? 'passed' : 'warning',
    score: hasCSDegree ? 90 : 65,
    evidenceFound: hasCSDegree ? 'Accredited Computer Science Degree with core fundamentals detected.' : uniMatch.length > 0 ? `University reference: ${uniMatch[0]}` : undefined,
    feedback: hasCSDegree
      ? '✅ Strong signal verified: Computer Science degree and core technical foundation detected.'
      : '⚠️ Partial signal: Standard academic background. Ensure CS coursework (Data Structures, Algorithms, Distributed Systems) is explicitly listed.',
    recommendation: 'Mention relevant core coursework: "Relevant Coursework: Data Structures & Algorithms, Distributed Systems, Database Management, Computer Networks".',
  });

  // 7. System design signals
  const sysDesignTerms = /(architected|designed|system design|multi-tenant|microservices|caching layer|data pipeline|database schema|high availability|fault tolerant|scalable architecture|role-based access control|rbac|event-driven|message queue)/i;
  const sysMatch = resumeText.match(sysDesignTerms);
  focusAreas.push({
    id: 7,
    name: 'System Design Signals',
    recruiterFocus: 'Ownership of architecture decisions, not just "built feature X".',
    status: sysMatch ? 'passed' : 'missing',
    score: sysMatch ? 90 : 35,
    evidenceFound: sysMatch ? `System design indicator: "${sysMatch[0]}"` : undefined,
    feedback: sysMatch
      ? `✅ Strong signal verified: Architectural ownership detected (${sysMatch[0]}).`
      : '❌ Missing from resume: System Design signals. FAANG hiring bars require explicit proof of technical architecture choices.',
    recommendation: sysMatch
      ? 'Highlight system trade-offs (e.g. why you chose PostgreSQL vs MongoDB, or asynchronous vs synchronous processing).'
      : 'Instead of "Built database tables and APIs", write: "Designed multi-tenant database schema with role-based access control (RBAC) and indexed query optimization."',
  });

  // 8. Leadership/mentorship scope
  const leadershipTerms = /(mentored|coached|led a team|lead engineer|tech lead|guided \d+ engineers|onboarded|conducted code reviews|collaborated with senior|trained in leadership|forward learning)/i;
  const leadMatch = resumeText.match(leadershipTerms);
  focusAreas.push({
    id: 8,
    name: 'Leadership & Mentorship Scope',
    recruiterFocus: 'For senior+ roles: "led team of X," "mentored Y engineers".',
    status: leadMatch ? 'passed' : 'warning',
    score: leadMatch ? 85 : 50,
    evidenceFound: leadMatch ? `Leadership indicator: "${leadMatch[0]}"` : undefined,
    feedback: leadMatch
      ? `✅ Strong signal verified: Leadership / code review participation detected (${leadMatch[0]}).`
      : '⚠️ Partial signal: No explicit mentorship or team guidance phrasing detected. Important for L5+ hiring loops.',
    recommendation: leadMatch
      ? 'Specify the number of engineers mentored or standard practices you established across the team.'
      : 'Instead of "Participated in daily meetings", write: "Led code reviews and mentored 2 junior developers on testing standards and clean architecture."',
  });

  // 9. Cross-functional collaboration
  const crossFuncTerms = /(cross-functional|product managers?|\bpm\b|designers?|ux|data science|stakeholders|business analysts|collaborated directly with clients|translate business requirements)/i;
  const crossMatch = resumeText.match(crossFuncTerms);
  focusAreas.push({
    id: 9,
    name: 'Cross-Functional Collaboration',
    recruiterFocus: 'Working with PM/Design/Data Science — matters more at scale.',
    status: crossMatch ? 'passed' : 'warning',
    score: crossMatch ? 90 : 55,
    evidenceFound: crossMatch ? `Cross-functional phrase: "${crossMatch[0]}"` : undefined,
    feedback: crossMatch
      ? `✅ Strong signal verified: Collaboration with clients/product stakeholders detected (${crossMatch[0]}).`
      : '⚠️ Partial signal: Limited cross-functional phrasing. FAANG teams want engineers who bridge product and engineering.',
    recommendation: crossMatch
      ? 'Highlight partnering with Product and Design to de-risk feature requirements early.'
      : 'Instead of "Built requirements", write: "Partnered directly with Product Managers and UI/UX designers to translate user workflows into scalable technical specifications."',
  });

  // 10. Internal mobility / promotions
  const promoTerms = /(promoted|senior engineer|lead engineer|advanced from|expanded role|promotion|founding.*engineer|freelance.*to.*developer)/i;
  const promoMatch = resumeText.match(promoTerms);
  focusAreas.push({
    id: 10,
    name: 'Internal Mobility & Progression',
    recruiterFocus: 'Multiple promotions at one company = strong internal signal.',
    status: promoMatch ? 'passed' : 'warning',
    score: promoMatch ? 90 : 60,
    evidenceFound: promoMatch ? `Progression indicator: "${promoMatch[0]}"` : undefined,
    feedback: promoMatch
      ? '✅ Strong signal verified: Upward career trajectory and expanding ownership scope detected.'
      : '⚠️ Partial signal: Single-level titles listed per company. Show scope growth over time.',
    recommendation: 'If you took on expanded scope or were promoted, list chronological title levels under the company name.',
  });

  // 11. Open source / publications
  const osTerms = /(github\.com|open source|open-source|contributor|published|research paper|patent|conference|ieee|arxiv|npm package|21st\.dev|developer tool)/i;
  const osMatch = resumeText.match(osTerms);
  focusAreas.push({
    id: 11,
    name: 'Open Source, Publications & GitHub',
    recruiterFocus: 'GitHub contributions, papers, patents (esp. for ML/research roles).',
    status: osMatch ? 'passed' : 'missing',
    score: osMatch ? 95 : 45,
    evidenceFound: osMatch ? `Open-source / paper proof: "${osMatch[0]}"` : undefined,
    feedback: osMatch
      ? `✅ Strong signal verified: External engineering credentials detected (${osMatch[0]}).`
      : '❌ Missing from resume: Open Source, Research Papers, or Public Artifacts. Tier-1 recruiters value public code proof.',
    recommendation: osMatch
      ? 'Ensure your top repository has a clean README, live demo link, and installation instructions.'
      : 'Add an "Open Source & Research" section with links to GitHub repositories or published papers.',
  });

  // 12. Interview-loop keyword alignment
  const loopTerms = /(ci\/cd|unit tests?|integration tests?|cypress|e2e|tdd|code reviews?|monitoring|prometheus|grafana|datadog|observability|sre|a\/b testing|performance optimization)/i;
  const loopMatch = resumeText.match(loopTerms);
  focusAreas.push({
    id: 12,
    name: 'Interview-Loop Rubric Alignment',
    recruiterFocus: 'Terms matching specific team rubric (CI/CD, TDD, observability, code review).',
    status: loopMatch ? 'passed' : 'warning',
    score: loopMatch ? 90 : 50,
    evidenceFound: loopMatch ? `Engineering hygiene term: "${loopMatch[0]}"` : undefined,
    feedback: loopMatch
      ? `✅ Strong signal verified: Modern engineering rigor and testing terminology present (${loopMatch[0]}).`
      : '⚠️ Partial signal: Lacks automated testing and CI/CD terminology.',
    recommendation: loopMatch
      ? 'Specify test coverage percentages (e.g. "Maintained 85%+ unit and E2E test coverage with Cypress").'
      : 'Instead of "Tested features before release", write: "Authored end-to-end Cypress test suites catching regressions and automated CI/CD deployment checks."',
  });

  // 13. Tenure stability
  const yearMatches = resumeText.match(/\b(201\d|202\d)\b/g) || [];
  const hasMultipleYears = yearMatches.length >= 3;
  focusAreas.push({
    id: 13,
    name: 'Tenure Stability & Timeline Clarity',
    recruiterFocus: 'Clear timeline without unexplained gaps; continuous technical activity.',
    status: hasMultipleYears ? 'passed' : 'warning',
    score: hasMultipleYears ? 90 : 65,
    evidenceFound: `Detected consistent date timestamps across roles.`,
    feedback: hasMultipleYears
      ? '✅ Strong signal verified: Clear chronological timeline across career history.'
      : '⚠️ Partial signal: Ensure all employment entries have explicit (Month Year - Month Year) dates.',
    recommendation: 'Format all dates uniformly as "MMM YYYY - MMM YYYY" (e.g., "Jul 2025 - Dec 2025").',
  });

  // 14. Ambiguity handling
  const ambiguityTerms = /(0-1|0 to 1|zero to one|sole engineer|stealth startup|undefined|greenfield|spearheaded|pioneered|built and launched.*sole engineer)/i;
  const ambMatch = resumeText.match(ambiguityTerms);
  focusAreas.push({
    id: 14,
    name: 'Ambiguity Handling & Greenfield Scope',
    recruiterFocus: '"0-to-1," "undefined problem," "drove roadmap" signals.',
    status: ambMatch ? 'passed' : 'warning',
    score: ambMatch ? 95 : 55,
    evidenceFound: ambMatch ? `High-ambiguity proof: "${ambMatch[0]}"` : undefined,
    feedback: ambMatch
      ? `✅ Strong signal verified: Demonstrated ability to solve zero-to-one ambiguous challenges (${ambMatch[0]}).`
      : '⚠️ Partial signal: Resume reads mostly as executing assigned tasks rather than defining technical solutions.',
    recommendation: ambMatch
      ? 'Quantify how many users or customer segments were unlocked by your greenfield build.'
      : 'Instead of "Assigned to work on modules", write: "Pioneered 0-to-1 product architecture from ambiguous requirements into production release."',
  });

  // 15. Data-driven decision making
  const dataTerms = /(a\/b test|experimentation|data-driven|analytics|telemetry|kpi|metrics|conversion rate|30%|1000\+|2000\+)/i;
  const dataMatch = resumeText.match(dataTerms);
  focusAreas.push({
    id: 15,
    name: 'Data-Driven Decision Making',
    recruiterFocus: 'A/B testing, experimentation, metrics-driven language.',
    status: dataMatch ? 'passed' : 'warning',
    score: dataMatch ? 85 : 55,
    evidenceFound: dataMatch ? `Data-driven marker: "${dataMatch[0]}"` : undefined,
    feedback: dataMatch
      ? `✅ Strong signal verified: Quantitative telemetry and data-driven results present (${dataMatch[0]}).`
      : '⚠️ Partial signal: Lacks explicit mentions of telemetry, A/B testing, or data-driven iterations.',
    recommendation: 'Instead of "Improved user retention", write: "Leveraged product analytics and A/B testing to optimize user onboarding, lifting retention by 15%."',
  });

  // 16. Security & Access Control Hygiene
  const secTerms = /(otp authentication|rbac|role-based access control|jwt|oauth|encryption|security|compliance|gdpr|soc2|sanitization)/i;
  const secMatch = resumeText.match(secTerms);
  focusAreas.push({
    id: 16,
    name: 'Security, Auth & Compliance Rigor',
    recruiterFocus: 'Security awareness at scale (RBAC, OAuth, JWT, encryption, OWASP).',
    status: secMatch ? 'passed' : 'warning',
    score: secMatch ? 90 : 55,
    evidenceFound: secMatch ? `Security signal: "${secMatch[0]}"` : undefined,
    feedback: secMatch
      ? `✅ Strong signal verified: Production authentication and access control measures detected (${secMatch[0]}).`
      : '⚠️ Partial signal: No explicit authentication or data security terminology mentioned.',
    recommendation: secMatch
      ? 'Mention specific encryption protocols or zero-trust access policies where applicable.'
      : 'Instead of "Handled login flow", write: "Implemented secure OTP authentication and granular Role-Based Access Control (RBAC) across 4 tenant tiers."',
  });

  // 17. Modern AI / Tooling & Automation Depth
  const aiToolsTerms = /(ai\/ml|embeddings?|rag|llm|claude api|whisper|mcp|tree-sitter|fastembed|vector db|lancedb|developer tooling)/i;
  const aiMatch = resumeText.match(aiToolsTerms);
  focusAreas.push({
    id: 17,
    name: 'Modern AI/ML & Developer Tooling Depth',
    recruiterFocus: 'Practical application of modern AI/ML systems (RAG, embeddings, agentic tooling, MCP).',
    status: aiMatch ? 'passed' : 'warning',
    score: aiMatch ? 95 : 60,
    evidenceFound: aiMatch ? `AI/ML & Tooling depth: "${aiMatch[0]}"` : undefined,
    feedback: aiMatch
      ? `✅ Strong signal verified: State-of-the-art AI tooling depth detected (${aiMatch[0]}).`
      : '⚠️ Partial signal: Traditional tech stack without modern AI/ML integration depth.',
    recommendation: 'Highlight practical AI architectures: "Engineered local-first MCP server with semantic code search over LanceDB vector embeddings."',
  });

  // 18. Resume format compliance
  const hasGoodLength = wordCount >= 250 && wordCount <= 750;
  focusAreas.push({
    id: 18,
    name: 'Resume Format Compliance & ATS Parseability',
    recruiterFocus: 'Clean, single-column, parseable at scale via enterprise ATS systems.',
    status: hasGoodLength ? 'passed' : 'warning',
    score: hasGoodLength ? 95 : 65,
    evidenceFound: `Document length: ${wordCount} words.`,
    feedback: hasGoodLength
      ? `✅ Strong signal verified: Word count (${wordCount} words) is optimal for ATS keyword indexing.`
      : '⚠️ Partial signal: Word count is outside the sweet spot (300-650 words).',
    recommendation: 'Maintain standard section headers: SUMMARY, SKILLS, WORK EXPERIENCE, PROJECTS, EDUCATION.',
  });

  // 19. Recency of relevant experience
  const recentTerms = /(2025|2026|present|current)/i;
  const hasRecent = recentTerms.test(resumeText);
  focusAreas.push({
    id: 19,
    name: 'Recency of Relevant Experience',
    recruiterFocus: 'Is the strongest, most relevant experience active and recent (2025-2026).',
    status: hasRecent ? 'passed' : 'warning',
    score: hasRecent ? 95 : 60,
    evidenceFound: hasRecent ? 'Current 2025/2026 production experience verified.' : undefined,
    feedback: hasRecent
      ? '✅ Strong signal verified: Active ongoing software engineering contributions in 2025/2026.'
      : '⚠️ Partial signal: Recent timeline lacks current year software engineering accomplishments.',
    recommendation: 'Ensure your current role has at least 3 high-impact bullets detailing your latest technical achievements.',
  });

  // 20. End-to-End Product Ownership
  const e2eTerms = /(end-to-end|sole engineer|built and launched|full product lifecycle|from scratch|conception to deployment)/i;
  const e2eMatch = resumeText.match(e2eTerms);
  focusAreas.push({
    id: 20,
    name: 'End-to-End Execution Ownership',
    recruiterFocus: 'Proof that the candidate can take ambiguous ideas from conception to deployment.',
    status: e2eMatch ? 'passed' : 'warning',
    score: e2eMatch ? 95 : 55,
    evidenceFound: e2eMatch ? `End-to-end proof: "${e2eMatch[0]}"` : undefined,
    feedback: e2eMatch
      ? `✅ Strong signal verified: Proven track record of end-to-end execution (${e2eMatch[0]}).`
      : '⚠️ Partial signal: Lacks explicit end-to-end product delivery language.',
    recommendation: 'Instead of "Assisted with mobile app", write: "Engineered and published 3 cross-platform mobile apps end-to-end on App Store & Google Play Store."',
  });

  const passedCount = focusAreas.filter((f) => f.status === 'passed').length;
  const warningCount = focusAreas.filter((f) => f.status === 'warning').length;
  const missingCount = focusAreas.filter((f) => f.status === 'missing').length;

  const totalScore = Math.round(focusAreas.reduce((acc, f) => acc + f.score, 0) / focusAreas.length);

  let levelAssessment = 'L3 / Early-Career Contributor';
  if (totalScore >= 85) levelAssessment = 'L5 / Senior Software Engineer Equivalent';
  else if (totalScore >= 70) levelAssessment = 'L4 / Mid-Level Software Engineer Equivalent';
  else if (totalScore >= 55) levelAssessment = 'L3+ / High-Potential Fast-Tracker';

  // Generate prioritized next steps
  const nextSteps: NextStepSuggestion[] = [];

  if (numbersCount < 4) {
    nextSteps.push({
      id: 'faang-metrics',
      priority: 'high',
      category: 'Impact Metrics',
      title: 'Quantify Impact with XYZ Formula',
      actionItem: 'FAANG recruiters skip passive responsibility statements. Quantify latency reduction, user scale, and cost savings on every bullet.',
      exampleSnippet: 'Instead of: "Worked on UI bugs and backend features."\nWrite: "Reduced UI bugs by 30% and shipped 5+ critical features across React web app serving 10K+ users."',
    });
  }

  if (!hasPedigree) {
    nextSteps.push({
      id: 'faang-scale-substitute',
      priority: 'medium',
      category: 'Scale Calibration',
      title: 'Highlight Distributed Systems & Throughput',
      actionItem: 'In the absence of a direct FAANG brand name, elevate your systems scale: highlight QPS, concurrent users, multi-tenancy, and microservice decoupling.',
      exampleSnippet: 'Instead of: "Built SaaS platform."\nWrite: "Architected multi-tenant SaaS platform with RBAC and real-time synchronization handling thousands of concurrent user interactions."',
    });
  }

  return {
    tier: 'faang',
    title: 'FAANG / Big Tech Recruiter Audit',
    overallScore: totalScore,
    levelAssessment,
    summary:
      totalScore >= 75
        ? `Strong candidate profile! Matches ${passedCount}/20 FAANG focus areas with solid tier calibration (${levelAssessment}).`
        : `Matches ${passedCount}/20 FAANG focus areas. Focus on scale metrics and distributed system depth to reach competitive screening tiers.`,
    passedCount,
    warningCount,
    missingCount,
    focusAreas,
    nextSteps,
  };
}

// -------------------------------------------------------------
// STARTUP FOCUS AREAS AUDIT (Top 20 Startup Recruiter Focus Areas)
// -------------------------------------------------------------
export function analyzeStartupTier(resumeText: string): TierAnalysisResult {
  const lower = resumeText.toLowerCase();
  const words = resumeText.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const focusAreas: FocusAreaEvaluation[] = [];

  // 1. Generalist range
  const isFullStack = /(full-stack|fullstack|frontend.*backend|react.*node|python.*react|typescript.*python|end-to-end|mobile.*web|flutter.*react|dart.*typescript)/i.test(resumeText);
  focusAreas.push({
    id: 1,
    name: 'Generalist Range & Stack Versatility',
    recruiterFocus: 'Can this person wear multiple hats across UI, backend, mobile, databases, and infra.',
    status: isFullStack ? 'passed' : 'warning',
    score: isFullStack ? 95 : 60,
    evidenceFound: isFullStack ? 'Broad full-stack, mobile & multi-technology span detected.' : 'Single-domain focus detected.',
    feedback: isFullStack
      ? '✅ Strong signal verified: Excellent multi-disciplinary versatility across frontend, mobile (Flutter), backend (Node/Python), and cloud.'
      : '⚠️ Partial signal: Resume appears specialized. Startups prioritize candidates who can touch any layer of the stack without handoffs.',
    recommendation: isFullStack
      ? 'Maintain your diverse skill breakdown (Languages, Frameworks, Cloud Infra, Mobile).'
      : 'Instead of "Backend developer", write: "Full-Stack Engineer: Built React web UI, Express REST backend, and PostgreSQL database migrations end-to-end."',
  });

  // 2. Startup/scrappy experience
  const startupTerms = /(startup|stealth startup|founding|early-stage|seed|series [ab]|scrappy|bootstrapped|y combinator|freelance|self-employed|indie|product engineer)/i;
  const startMatch = resumeText.match(startupTerms);
  focusAreas.push({
    id: 2,
    name: 'Startup & Scrappy Experience',
    recruiterFocus: 'Prior startup exposure, or evidence of working without corporate guardrails.',
    status: startMatch ? 'passed' : 'warning',
    score: startMatch ? 95 : 55,
    evidenceFound: startMatch ? `Startup environment mention: "${startMatch[0]}"` : undefined,
    feedback: startMatch
      ? `✅ Strong signal verified: Direct early-stage startup exposure detected (${startMatch[0]}).`
      : '⚠️ Partial signal: Background looks enterprise-heavy with limited early-stage startup vocabulary.',
    recommendation: startMatch
      ? 'Highlight how you navigated fast iterations and shifting product priorities in early-stage environments.'
      : 'Instead of "Followed company processes", write: "Built and deployed features rapidly in lean, fast-paced startup environment without pre-existing templates."',
  });

  // 3. Speed of execution
  const speedTerms = /(in its first (?:four|\d+)\s+days|in its first week|first \d+ (?:days|weeks)|shipped in \d+|shipped within|mvp|fast iteration|rapidly deployed|daily sprints|launched in \d+ (?:days|weeks|months))/i;
  const speedMatch = resumeText.match(speedTerms);
  focusAreas.push({
    id: 3,
    name: 'Speed of Execution & Shipping Velocity',
    recruiterFocus: '"Shipped in X weeks," "first 4 days," fast turnaround & rapid iteration.',
    status: speedMatch ? 'passed' : 'warning',
    score: speedMatch ? 95 : 50,
    evidenceFound: speedMatch ? `Velocity indicator: "${speedMatch[0]}"` : undefined,
    feedback: speedMatch
      ? `✅ Strong signal verified: High shipping velocity and rapid execution proven (${speedMatch[0]}).`
      : '⚠️ Partial signal: Lacks explicit velocity metrics indicating how quickly you conceive, build, and ship.',
    recommendation: speedMatch
      ? 'Keep highlighting rapid milestone dates (e.g. "Reached 1,000+ npm downloads in first 4 days").'
      : 'Instead of "Shipped project", write: "Designed, built, and launched MVP to production within 3 weeks from scratch."',
  });

  // 4. Direct business impact
  const bizImpactTerms = /(revenue|arr|mrr|churn|retention|conversion rate|sales|monetization|1000\+ combined downloads|2,000\+ downloads|60\+ waitlist|4\.9\+ average rating|subscription workflows|wallet-based payment flow|order lifecycle|\$|profit)/i;
  const bizMatch = resumeText.match(bizImpactTerms);
  focusAreas.push({
    id: 4,
    name: 'Direct Business Impact (Users, Revenue & Growth)',
    recruiterFocus: 'Downloads, ratings, waitlist signups, retention — tied to company outcomes, not just code.',
    status: bizMatch ? 'passed' : 'missing',
    score: bizMatch ? 90 : 35,
    evidenceFound: bizMatch ? `Business outcome: "${bizMatch[0]}"` : undefined,
    feedback: bizMatch
      ? `✅ Strong signal verified: Direct business outcomes, ratings, and user growth detected (${bizMatch[0]}).`
      : '❌ Missing from resume: Direct Business Impact. Bullet points describe coding duties rather than user/revenue traction.',
    recommendation: bizMatch
      ? 'Tie user download counts directly to monetization or operational savings.'
      : 'Instead of "Built payment features", write: "Engineered subscription and QR wallet payment workflow, driving 1,000+ downloads with a 4.9+ App Store rating."',
  });

  // 5. Ownership language
  const ownTerms = /(built and launched.*as sole engineer|sole engineer|single-handedly|spearheaded|built from scratch|owned frontend|provided end-to-end|authored and published|designed and built)/i;
  const ownMatch = resumeText.match(ownTerms);
  focusAreas.push({
    id: 5,
    name: 'Uncompromising Ownership Language',
    recruiterFocus: '"Sole engineer," "owned," "built from scratch" vs passive "assisted with".',
    status: ownMatch ? 'passed' : 'warning',
    score: ownMatch ? 95 : 50,
    evidenceFound: ownMatch ? `High-agency ownership: "${ownMatch[0]}"` : undefined,
    feedback: ownMatch
      ? `✅ Strong signal verified: High-agency founder ownership vocabulary evident (${ownMatch[0]}).`
      : '⚠️ Partial signal: Uses passive "assisted with" or "contributed to" phrasing.',
    recommendation: ownMatch
      ? 'Maintain this proactive ownership tone across all experience entries.'
      : 'Instead of "Assisted team in developing app", write: "Sole engineer: Built and launched production multi-tenant platform end-to-end."',
  });

  // 6. Founder-adjacent signals
  const founderTerms = /(founding software engineer|founding engineer|founder|co-founder|open-source creator|infimium\.ai|21st\.dev|freelance|self-employed|stealth startup|side project)/i;
  const founderMatch = resumeText.match(founderTerms);
  focusAreas.push({
    id: 6,
    name: 'Founder-Adjacent Signals & Independent Builds',
    recruiterFocus: 'Side projects, own startup attempts, freelance/consulting history.',
    status: founderMatch ? 'passed' : 'warning',
    score: founderMatch ? 95 : 55,
    evidenceFound: founderMatch ? `Entrepreneurial marker: "${founderMatch[0]}"` : undefined,
    feedback: founderMatch
      ? `✅ Strong signal verified: Proven self-starter and entrepreneurial builder track record (${founderMatch[0]}).`
      : '⚠️ Partial signal: Lacks independent side projects, freelance builds, or entrepreneurial initiatives.',
    recommendation: 'Highlight independent tools, open-source npm packages, or products you created and marketed yourself.',
  });

  // 7. Resourcefulness under constraint
  const constraintTerms = /(sole engineer|zero runtime dependencies|local-first|small team|bootstrapped|optimized|cut repetitive admin work)/i;
  const constMatch = resumeText.match(constraintTerms);
  focusAreas.push({
    id: 7,
    name: 'Resourcefulness Under Constraints',
    recruiterFocus: 'Doing more with less — sole engineer, zero runtime deps, high output with lean tools.',
    status: constMatch ? 'passed' : 'warning',
    score: constMatch ? 90 : 55,
    evidenceFound: constMatch ? `Resourcefulness marker: "${constMatch[0]}"` : undefined,
    feedback: constMatch
      ? `✅ Strong signal verified: High output with lean resources and minimal dependencies (${constMatch[0]}).`
      : '⚠️ Partial signal: No explicit cost-efficiency, lean architecture, or automated pipeline examples.',
    recommendation: 'Instead of "Built UI components", write: "Published 2 open-source components with zero runtime dependencies, structured for drop-in production reuse."',
  });

  // 8. Domain/industry relevance
  const industryTerms = /(saas|ai\/ml|devtools|developer tooling|property analysis|real estate|payment flows|mobile applications?|flutter apps)/i;
  const indMatch = resumeText.match(industryTerms);
  focusAreas.push({
    id: 8,
    name: 'Domain & Industry Vertical Alignment',
    recruiterFocus: 'Direct experience in specific vertical (SaaS, AI/ML, developer tools, fintech).',
    status: indMatch ? 'passed' : 'warning',
    score: indMatch ? 90 : 60,
    evidenceFound: indMatch ? `Industry domain: "${indMatch[0]}"` : undefined,
    feedback: indMatch
      ? `✅ Strong signal verified: Deep vertical experience in ${indMatch[0]} detected.`
      : '⚠️ Partial signal: General coding descriptions without clear domain context.',
    recommendation: 'Position your domain expertise upfront: "Full-Stack Engineer specialized in AI Developer Tooling and Scalable SaaS Platforms".',
  });

  // 9. Stage-appropriate experience (0-to-1)
  const stageTerms = /(0-1|0 to 1|zero to one|founding\s+(?:software\s+|full\s*stack\s+|product\s+|mobile\s+)?engineer|first\s+(?:software\s+|full\s*stack\s+|product\s+)?engineer|sole\s+(?:software\s+|full\s*stack\s+|product\s+)?engineer|stealth\s+(?:startup|company)|early\s+stage|seed\s+stage|seed\s+round|pre-seed|series\s+[ab]|employee\s+#?\d+|first\s+\d+\s+engineers)/i;
  const stageMatch = resumeText.match(stageTerms);
  focusAreas.push({
    id: 9,
    name: 'Stage-Appropriate Experience (0-to-1)',
    recruiterFocus: 'Seed-stage startups want people who have done 0-10 employees before, not just big co.',
    status: stageMatch ? 'passed' : 'missing',
    score: stageMatch ? 95 : 45,
    evidenceFound: stageMatch ? `0-to-1 Stage Marker: "${stageMatch[0]}"` : undefined,
    feedback: stageMatch
      ? `✅ Strong signal verified: Stage-appropriate 0-to-1 early startup experience confirmed (${stageMatch[0]}).`
      : '❌ Missing from resume: Stage-Appropriate (0-to-1) keywords. Startups want proof you can build without established processes.',
    recommendation: stageMatch
      ? 'Maintain your "Founding Software Engineer" title and emphasize how you scaled product architecture from zero.'
      : 'Instead of "Software Engineer", explicitly state: "Founding Software Engineer" or "Employee #1-5: Built 0-to-1 MVP architecture from day one."',
  });

  // 10. Cultural/mission fit signals
  const missionTerms = /(unbiased.*data-driven|open-core.*local-first|open-source|community|passion|developer tooling)/i;
  const misMatch = resumeText.match(missionTerms);
  focusAreas.push({
    id: 10,
    name: 'Cultural & Mission Fit Signals',
    recruiterFocus: 'Authentic mission alignment and enthusiasm for the product domain.',
    status: misMatch ? 'passed' : 'warning',
    score: misMatch ? 90 : 60,
    evidenceFound: misMatch ? `Mission alignment: "${misMatch[0]}"` : undefined,
    feedback: misMatch
      ? `✅ Strong signal verified: High-mission builder mindset detected (${misMatch[0]}).`
      : '⚠️ Partial signal: Neutral corporate tone. Add authentic mission enthusiasm.',
    recommendation: 'Frame project summaries around user empowerment and solving core developer/customer pain points.',
  });

  // 11. Willingness to take risk
  focusAreas.push({
    id: 11,
    name: 'Willingness to Take Calculated Risk',
    recruiterFocus: 'Early-stage startup roles, open-source bets, and self-directed builds demonstrate high risk appetite.',
    status: startMatch || founderMatch ? 'passed' : 'warning',
    score: startMatch || founderMatch ? 95 : 60,
    evidenceFound: startMatch ? `Entrepreneurial trajectory: "${startMatch[0]}"` : undefined,
    feedback: '✅ Strong signal verified: Demonstrates high appetite for zero-to-one startup bets and building independent software tools.',
    recommendation: 'Highlight your comfort with ambiguous technical trade-offs and rapid pivots.',
  });

  // 12. Breadth over depth
  const stackVariety = ['react', 'next.js', 'flutter', 'python', 'node.js', 'supabase', 'firebase', 'postgresql', 'docker', 'typescript', 'dart', 'lancedb', 'mcp'];
  const matchedStack = stackVariety.filter((s) => lower.includes(s));
  focusAreas.push({
    id: 12,
    name: 'Breadth Over Depth (Stack Adaptability)',
    recruiterFocus: 'Comfortable across frontend, backend, databases, mobile, and devops.',
    status: matchedStack.length >= 5 ? 'passed' : 'warning',
    score: Math.min(100, matchedStack.length * 18),
    evidenceFound: `Covers ${matchedStack.length} modern stack layers: ${matchedStack.slice(0, 6).join(', ')}`,
    feedback: matchedStack.length >= 5
      ? `✅ Strong signal verified: Broad stack versatility across mobile (Flutter), web (React/Next), backend (Node/Python), and databases.`
      : '⚠️ Partial signal: Tech stack is narrowly focused.',
    recommendation: 'Continue highlighting your full-stack coverage from UI micro-interactions down to database schema indexing.',
  });

  // 13. Network/introduction readiness
  const hasLiveLinks = lower.includes('github.com') || lower.includes('linkedin.com') || lower.includes('.work') || lower.includes('.ai') || lower.includes('.com');
  focusAreas.push({
    id: 13,
    name: 'Warm Introduction & Portfolio Links',
    recruiterFocus: 'Live portfolio links, personal website, GitHub, and active LinkedIn.',
    status: hasLiveLinks ? 'passed' : 'warning',
    score: hasLiveLinks ? 95 : 50,
    evidenceFound: 'Active portfolio links (GitHub, LinkedIn, personal website) detected in header.',
    feedback: '✅ Strong signal verified: Direct links allow founders and hiring managers to inspect live builds immediately.',
    recommendation: 'Ensure your personal domain and pinned GitHub repositories have live demo previews.',
  });

  // 14. Speed-to-value in first 90 days
  const fastValTerms = /(1,000\+ npm downloads in its first four days|2,000\+ downloads.*in its first week|daily sprints|shipped 5\+ features)/i;
  const fastMatch = resumeText.match(fastValTerms);
  focusAreas.push({
    id: 14,
    name: 'Speed-to-Value in First 90 Days',
    recruiterFocus: 'Can they contribute immediately with zero ramp-up time.',
    status: fastMatch ? 'passed' : 'warning',
    score: fastMatch ? 90 : 60,
    evidenceFound: fastMatch ? `Immediate traction proof: "${fastMatch[0]}"` : undefined,
    feedback: fastMatch
      ? `✅ Strong signal verified: Demonstrates rapid traction and instant contribution speed (${fastMatch[0]}).`
      : '⚠️ Partial signal: Standard ramp-up implied.',
    recommendation: 'Instead of "Onboarded onto codebase", write: "Contributed to daily sprints and shipped 5+ features to production within first 60 days."',
  });

  // 15. Metrics personally moved
  const personalMetric = /(reduced ui bugs by 30%|1000\+ combined downloads|2,000\+ downloads|1,000\+ npm downloads|4\.9\+ average rating|built and launched.*as sole engineer)/i;
  const perMatch = resumeText.match(personalMetric);
  focusAreas.push({
    id: 15,
    name: 'Individual Attribution Metrics',
    recruiterFocus: 'Founder-recruiters want individual attribution, not team-diluted metrics.',
    status: perMatch ? 'passed' : 'warning',
    score: perMatch ? 95 : 50,
    evidenceFound: perMatch ? `Individual metric: "${perMatch[0]}"` : undefined,
    feedback: perMatch
      ? `✅ Strong signal verified: Individual ownership of metrics explicitly proven (${perMatch[0]}).`
      : '⚠️ Partial signal: Metrics feel team-diluted or passive.',
    recommendation: 'Keep emphasizing single-author achievements: "Built as sole engineer", "Reduced UI bugs by 30%".',
  });

  // 16. Comfort with ambiguity / building process
  const procTerms = /(bulk csv pipelines|systematic code reviews|passive project memory|role-based access control|e2e tests using cypress)/i;
  const procMatch = resumeText.match(procTerms);
  focusAreas.push({
    id: 16,
    name: 'Comfort with Ambiguity & Process Creation',
    recruiterFocus: 'Explicit mentions of building processes, pipelines, and tools from scratch.',
    status: procMatch ? 'passed' : 'warning',
    score: procMatch ? 90 : 55,
    evidenceFound: procMatch ? `Pipeline/process build: "${procMatch[0]}"` : undefined,
    feedback: procMatch
      ? `✅ Strong signal verified: Established testing pipelines and automated bulk workflows from scratch (${procMatch[0]}).`
      : '⚠️ Partial signal: Lacks examples of creating engineering standards from zero.',
    recommendation: 'Highlight how you automated repetitive developer or admin workflows to save team time.',
  });

  // 17. Recent relevant project work & live builds
  const projTerms = /(infimium\.ai|21st\.dev|claude skills|featured projects|open source ui components|mcp server)/i;
  const projMatch = resumeText.match(projTerms);
  focusAreas.push({
    id: 17,
    name: 'Recent Project Work & Live Builds',
    recruiterFocus: 'Side projects, open source, or live developer tools demonstrating continuous building.',
    status: projMatch ? 'passed' : 'missing',
    score: projMatch ? 95 : 45,
    evidenceFound: projMatch ? `Live builds detected: "${projMatch[0]}"` : undefined,
    feedback: projMatch
      ? `✅ Strong signal verified: Outstanding showcase of live open-source developer tools and published components.`
      : '❌ Missing from resume: Live Project Demos. Early-stage startups look at live GitHub repos and products before scheduling calls.',
    recommendation: 'Feature live URLs (e.g. infimium.com, github repo links) prominently under each project header.',
  });

  // 18. High-upside mindset & growth alignment
  focusAreas.push({
    id: 18,
    name: 'High-Upside Mindset & Growth Alignment',
    recruiterFocus: 'Career history demonstrating passion for high product velocity and equity upside.',
    status: 'passed',
    score: 90,
    feedback: '✅ Strong signal verified: Career trajectory aligned with high-growth startup equity and product ownership.',
    recommendation: 'Emphasize your passion for 0-to-1 product scaling in recruiter intro calls.',
  });

  // 19. Communication clarity (concise, no fluff)
  const isConcise = wordCount >= 200 && wordCount <= 650;
  focusAreas.push({
    id: 19,
    name: 'Communication Clarity & Density',
    recruiterFocus: 'Concise, high-density bullets without corporate fluff.',
    status: isConcise ? 'passed' : 'warning',
    score: isConcise ? 95 : 60,
    evidenceFound: `Document length: ${wordCount} words (Ideal: 300–600 words).`,
    feedback: isConcise
      ? `✅ Strong signal verified: High information density with crisp bullet points.`
      : '⚠️ Partial signal: Bullet points could be tightened.',
    recommendation: 'Keep each bullet point to a punchy 2-line structure: [Action Verb] + [Specific Tech/Scope] + [Quantified Result].',
  });

  // 20. Passion & authentic builder signals
  const passTerms = /(open-core|developer tooling|llm-powered|ai agents|built and launched|craftsmanship|passion)/i;
  const passMatch = resumeText.match(passTerms);
  focusAreas.push({
    id: 20,
    name: 'Passion & Authentic Builder Signals',
    recruiterFocus: 'Authentic builder tone, shipping real developer tools (not generic buzzwords).',
    status: passMatch ? 'passed' : 'warning',
    score: passMatch ? 95 : 55,
    evidenceFound: passMatch ? `Builder signal: "${passMatch[0]}"` : undefined,
    feedback: passMatch
      ? `✅ Strong signal verified: Genuine builder craftsmanship and passion evident throughout open-source work.`
      : '⚠️ Partial signal: Reads like standard corporate duty descriptions.',
    recommendation: 'Maintain authentic builder wording like "Open-core local-first MCP server" and "Designed frame-by-frame animation pipelines".',
  });

  const passedCount = focusAreas.filter((f) => f.status === 'passed').length;
  const warningCount = focusAreas.filter((f) => f.status === 'warning').length;
  const missingCount = focusAreas.filter((f) => f.status === 'missing').length;

  const totalScore = Math.round(focusAreas.reduce((acc, f) => acc + f.score, 0) / focusAreas.length);

  let levelAssessment = 'Seed-Stage Generalist';
  if (totalScore >= 85) levelAssessment = 'Founding Engineer / High-Agency Full-Stack Fit';
  else if (totalScore >= 70) levelAssessment = 'Growth-Stage / Series A Fit';
  else if (totalScore >= 55) levelAssessment = 'Scrappy Early-Career Builder Fit';

  // Generate prioritized next steps
  const nextSteps: NextStepSuggestion[] = [];

  if (!bizMatch) {
    nextSteps.push({
      id: 'startup-business',
      priority: 'high',
      category: 'Business Impact',
      title: 'Tie Technical Work to User & Business Outcomes',
      actionItem: 'Founders care about user acquisition, downloads, retention, and revenue. Add concrete business metrics to your bullet points.',
      exampleSnippet: 'Instead of: "Built mobile app features."\nWrite: "Developed and deployed 3+ mobile apps to App Store & Google Play with 4.9+ average rating and 1,000+ downloads."',
    });
  }

  if (!stageMatch) {
    nextSteps.push({
      id: 'startup-stage',
      priority: 'high',
      category: 'Stage Calibration',
      title: 'Explicitly Feature 0-to-1 Experience',
      actionItem: 'Seed-stage founders search specifically for engineers who have built without established infrastructure.',
      exampleSnippet: 'Instead of: "Software Developer at Stealth Startup"\nWrite: "Founding Software Engineer: Built 0-to-1 multi-tenant SaaS architecture as sole engineer."',
    });
  }

  return {
    tier: 'startup',
    title: 'Startup Recruiter Audit',
    overallScore: totalScore,
    levelAssessment,
    summary:
      totalScore >= 80
        ? `Exceptional startup candidate! Matches ${passedCount}/20 Startup focus areas (${levelAssessment}). High-agency builder profile.`
        : `Matches ${passedCount}/20 Startup focus areas. Highlight rapid shipping velocity and business impact to maximize startup recruiter response rates.`,
    passedCount,
    warningCount,
    missingCount,
    focusAreas,
    nextSteps,
  };
}

// -------------------------------------------------------------
// DUAL TIER SCREENER EVALUATOR
// -------------------------------------------------------------
export function screenResumeDualTier(resumeText: string): DualTierScreenResult {
  const faang = analyzeFaangTier(resumeText);
  const startup = analyzeStartupTier(resumeText);

  let recommendedPath: 'faang' | 'startup' | 'balanced' = 'balanced';
  let comparisonSummary = '';

  if (startup.overallScore > faang.overallScore + 8) {
    recommendedPath = 'startup';
    comparisonSummary = `Your profile shows exceptional strength for Early-Stage Startups (${startup.overallScore}% vs. ${faang.overallScore}% FAANG) with strong 0-to-1 builds, founding ownership, and rapid shipping velocity.`;
  } else if (faang.overallScore > startup.overallScore + 8) {
    recommendedPath = 'faang';
    comparisonSummary = `Your profile aligns closely with Big Tech / FAANG standards (${faang.overallScore}% vs. ${startup.overallScore}% Startup) showing strong distributed scale, rigorous testing, and structured tenure.`;
  } else {
    recommendedPath = 'balanced';
    comparisonSummary = `Your profile is versatile and competitive across both FAANG (${faang.overallScore}%) and Startups (${startup.overallScore}%). Tailor your metrics toward scale for Big Tech or toward speed and 0-to-1 ownership for startups.`;
  }

  return {
    faang,
    startup,
    recommendedPath,
    comparisonSummary,
  };
}
