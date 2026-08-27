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
// FAANG FOCUS AREAS AUDIT
// -------------------------------------------------------------
export function analyzeFaangTier(resumeText: string): TierAnalysisResult {
  const lower = resumeText.toLowerCase();
  const words = resumeText.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const focusAreas: FocusAreaEvaluation[] = [];

  // 1. Target company pedigree
  const topTierCompanies = ['google', 'meta', 'facebook', 'amazon', 'apple', 'netflix', 'microsoft', 'uber', 'airbnb', 'stripe', 'palantir', 'databricks', 'snowflake', 'openai', 'anthropic', 'bytedance', 'salesforce', 'linkedin', 'adobe', 'twitter', 'x corp'];
  const pedigreeMatches = topTierCompanies.filter((c) => lower.includes(c));
  const hasPedigree = pedigreeMatches.length > 0;
  focusAreas.push({
    id: 1,
    name: 'Target Company Pedigree',
    recruiterFocus: 'Worked at another FAANG, well-known unicorn, or top-tier tech company.',
    status: hasPedigree ? 'passed' : 'warning',
    score: hasPedigree ? 95 : 50,
    evidenceFound: hasPedigree ? `Found top-tier company references: ${pedigreeMatches.join(', ')}` : undefined,
    feedback: hasPedigree
      ? 'Strong top-tier company signal detected.'
      : 'No FAANG or tier-1 unicorn brand names detected. You will need stronger scale & metrics signals to compensate.',
    recommendation: 'Highlight any high-growth companies, well-funded startups, or enterprise clients if direct tier-1 names are absent.',
  });

  // 2. Scale of systems worked on
  const scalePatterns = /(millions? of users|\b\d+[mM]\b\+?\s*users|qps|queries per second|petabytes?|terabytes?|distributed systems?|high throughput|low latency|k8s|kubernetes|kafka|sharding|microservices|distributed caching|redis cluster|high concurrency)/i;
  const scaleMatch = resumeText.match(scalePatterns);
  const hasScale = Boolean(scaleMatch);
  focusAreas.push({
    id: 2,
    name: 'Scale of Systems Worked On',
    recruiterFocus: '"Millions of users," "petabytes," "QPS," distributed systems exposure.',
    status: hasScale ? 'passed' : 'missing',
    score: hasScale ? 90 : 30,
    evidenceFound: scaleMatch ? `Scale terms found: "${scaleMatch[0]}"` : undefined,
    feedback: hasScale
      ? 'Good scale and distributed systems signals found.'
      : 'Missing explicit scale indicators (QPS, concurrent users, data volume). FAANG recruiters actively filter for high-throughput signals.',
    recommendation: 'Quantify your systems: e.g. "Scaled backend handling 50M+ monthly requests and 5K peak QPS with <50ms p99 latency."',
  });

  // 3. Specific tech stack match
  const strongTechs = ['java', 'c++', 'go', 'golang', 'rust', 'python', 'distributed systems', 'kafka', 'grpc', 'kubernetes', 'aws', 'gcp', 'react', 'typescript', 'sql'];
  const matchedTechs = strongTechs.filter((t) => lower.includes(t));
  const hasStrongTech = matchedTechs.length >= 4;
  focusAreas.push({
    id: 3,
    name: 'Specific Tech Stack Match',
    recruiterFocus: 'Exact languages/frameworks named in the JD (e.g., Java + Kafka, not just "backend dev").',
    status: hasStrongTech ? 'passed' : matchedTechs.length >= 2 ? 'warning' : 'missing',
    score: Math.min(100, matchedTechs.length * 20),
    evidenceFound: matchedTechs.length > 0 ? `Key technologies detected: ${matchedTechs.slice(0, 6).join(', ')}` : undefined,
    feedback: hasStrongTech
      ? `Found ${matchedTechs.length} standard industry technologies.`
      : 'Tech stack mentions are sparse or generic.',
    recommendation: 'Specify exact production languages and frameworks in your Skills section and bullet points (e.g. "Go, Kafka, PostgreSQL, Docker").',
  });

  // 4. Quantified impact metrics
  const numbersCount = (resumeText.match(/(\d+%\s*|\$\s*\d+|\d+\+?\s*(users|clients|customers|ms|x|hours|engineers|team|projects|sales|revenue))/gi) || []).length;
  focusAreas.push({
    id: 4,
    name: 'Quantified Impact Metrics',
    recruiterFocus: '%, $, latency reduced, cost saved — vague duty statements get skipped.',
    status: numbersCount >= 5 ? 'passed' : numbersCount >= 2 ? 'warning' : 'missing',
    score: Math.min(100, numbersCount * 20),
    evidenceFound: `${numbersCount} quantified metric statements detected.`,
    feedback: numbersCount >= 5
      ? 'Strong quantitative density across your experience.'
      : 'Insufficient metrics. FAANG recruiters skip passive responsibility statements.',
    recommendation: 'Use the XYZ formula: "Accomplished [X] as measured by [Y] by doing [Z]" on every single bullet point.',
  });

  // 5. Level/title calibration
  const isSeniorOrStaff = /senior|lead|principal|staff|architect|manager/i.test(resumeText);
  focusAreas.push({
    id: 5,
    name: 'Level / Title Calibration',
    recruiterFocus: 'Is this person actually L4/L5/L6-equivalent based on scope, not just years.',
    status: isSeniorOrStaff ? 'passed' : 'warning',
    score: isSeniorOrStaff ? 85 : 65,
    evidenceFound: isSeniorOrStaff ? 'Senior / Lead level terminology detected.' : 'Mid / Early-career scope detected.',
    feedback: isSeniorOrStaff
      ? 'Title and ownership scope align with L5+ (Senior) expectations.'
      : 'Scope signals indicate L3/L4 (Junior to Mid-Level). Emphasize end-to-end feature ownership and technical ambiguity.',
    recommendation: 'Show architecture-level decision making and domain ownership to calibrate at higher compensation bands.',
  });

  // 6. University pedigree (early career)
  const topUnis = ['stanford', 'mit', 'berkeley', 'carnegie mellon', 'cmu', 'harvard', 'princeton', 'cornell', 'georgia tech', 'uiuc', 'university of waterloo', 'iit', 'bits pilani', 'oxford', 'cambridge'];
  const uniMatch = topUnis.filter((u) => lower.includes(u));
  focusAreas.push({
    id: 6,
    name: 'University Pedigree & CS Foundations',
    recruiterFocus: 'Top CS programs weighted heavily for new grad / early-career roles.',
    status: uniMatch.length > 0 ? 'passed' : 'warning',
    score: uniMatch.length > 0 ? 95 : 65,
    evidenceFound: uniMatch.length > 0 ? `Found recognized academic institution: ${uniMatch.join(', ')}` : undefined,
    feedback: uniMatch.length > 0
      ? 'Recognized CS program detected.'
      : 'Standard academic background. Make sure your Projects, Open Source, or Work Experience highlight core CS fundamentals (algorithms, systems).',
    recommendation: 'If early in career, list relevant coursework (Operating Systems, Distributed Systems, Algorithms) and competitive programming/hackathons.',
  });

  // 7. System design signals
  const sysDesignTerms = /(architected|designed|system design|microservices|caching layer|data pipeline|database schema|high availability|fault tolerant|scalable architecture)/i;
  const sysMatch = resumeText.match(sysDesignTerms);
  focusAreas.push({
    id: 7,
    name: 'System Design Signals',
    recruiterFocus: 'Ownership of architecture decisions, not just "built feature X".',
    status: sysMatch ? 'passed' : 'missing',
    score: sysMatch ? 90 : 35,
    evidenceFound: sysMatch ? `System design indicator: "${sysMatch[0]}"` : undefined,
    feedback: sysMatch
      ? 'Evidence of architectural ownership detected.'
      : 'Resume lacks explicit system design vocabulary. FAANG hiring bars require proof of technical design choices.',
    recommendation: 'Replace "Built API endpoints" with "Architected resilient event-driven microservices handling asynchronous message processing."',
  });

  // 8. Leadership/mentorship scope
  const leadershipTerms = /(mentored|coached|led a team|lead engineer|tech lead|guided \d+ engineers|onboarded|conducted interviews)/i;
  const leadMatch = resumeText.match(leadershipTerms);
  focusAreas.push({
    id: 8,
    name: 'Leadership & Mentorship Scope',
    recruiterFocus: 'For senior+ roles: "led team of X," "mentored Y engineers".',
    status: leadMatch ? 'passed' : 'warning',
    score: leadMatch ? 90 : 50,
    evidenceFound: leadMatch ? `Leadership phrasing: "${leadMatch[0]}"` : undefined,
    feedback: leadMatch ? 'Direct mentorship and leadership signals present.' : 'No mentorship or team guidance phrasing detected.',
    recommendation: 'Include signals such as: "Mentored 3 junior engineers on code quality and distributed systems patterns."',
  });

  // 9. Cross-functional collaboration
  const crossFuncTerms = /(cross-functional|product managers?|\bpm\b|designers?|ux|data science|stakeholders|business analysts)/i;
  const crossMatch = resumeText.match(crossFuncTerms);
  focusAreas.push({
    id: 9,
    name: 'Cross-Functional Collaboration',
    recruiterFocus: 'Working with PM/Design/Data Science — matters more at scale.',
    status: crossMatch ? 'passed' : 'warning',
    score: crossMatch ? 85 : 55,
    evidenceFound: crossMatch ? `Cross-functional phrase: "${crossMatch[0]}"` : undefined,
    feedback: crossMatch ? 'Clear signs of cross-functional team alignment.' : 'Limited cross-functional teamwork phrasing.',
    recommendation: 'Mention partnerships with Product Managers, UX, and QA to ship user-facing initiatives.',
  });

  // 10. Internal mobility / promotions
  const promoTerms = /(promoted|senior engineer|lead engineer|advanced from|expanded role|promotion)/i;
  const promoMatch = resumeText.match(promoTerms);
  focusAreas.push({
    id: 10,
    name: 'Internal Mobility & Promotions',
    recruiterFocus: 'Multiple promotions at one company = strong internal signal.',
    status: promoMatch ? 'passed' : 'warning',
    score: promoMatch ? 90 : 60,
    evidenceFound: promoMatch ? `Career progression term: "${promoMatch[0]}"` : undefined,
    feedback: promoMatch ? 'Clear signs of upward promotion and retention.' : 'Single-level tenure displayed.',
    recommendation: 'If you were promoted at a company, list both job titles under the same company header to showcase rapid internal growth.',
  });

  // 11. Open source / publications
  const osTerms = /(github\.com|open source|contributor|published|paper|patent|conference|ieee|arxiv|npm package)/i;
  const osMatch = resumeText.match(osTerms);
  focusAreas.push({
    id: 11,
    name: 'Open Source, Publications & GitHub',
    recruiterFocus: 'GitHub contributions, papers, patents (esp. for ML/research roles).',
    status: osMatch ? 'passed' : 'warning',
    score: osMatch ? 95 : 55,
    evidenceFound: osMatch ? `Open source/portfolio link: "${osMatch[0]}"` : undefined,
    feedback: osMatch ? 'External engineering proof (GitHub/Publications) found.' : 'No GitHub, Open Source, or publication links found.',
    recommendation: 'Add a clean link to your active GitHub profile or top open source contributions in the header.',
  });

  // 12. Interview-loop keyword alignment
  const loopTerms = /(ci\/cd|unit tests|integration tests|tdd|code reviews|monitoring|prometheus|grafana|datadog|observability|sre|production outages|incident management)/i;
  const loopMatch = resumeText.match(loopTerms);
  focusAreas.push({
    id: 12,
    name: 'Interview-Loop Rubric Alignment',
    recruiterFocus: 'Terms matching specific team rubric (CI/CD, TDD, observability, code review).',
    status: loopMatch ? 'passed' : 'warning',
    score: loopMatch ? 85 : 50,
    evidenceFound: loopMatch ? `Engineering rigor indicator: "${loopMatch[0]}"` : undefined,
    feedback: loopMatch ? 'Strong engineering hygiene and operational rigor detected.' : 'Lacks modern testing/observability signals.',
    recommendation: 'Mention automated testing (Jest, PyTest), CI/CD pipelines, and observability/monitoring (Grafana, Datadog).',
  });

  // 13. Tenure stability
  const yearMatches = resumeText.match(/\b(201\d|202\d)\b/g) || [];
  const hasMultipleYears = yearMatches.length >= 4;
  focusAreas.push({
    id: 13,
    name: 'Tenure Stability & Progression',
    recruiterFocus: 'Red flag if job-hopping <1yr repeatedly without clear reason.',
    status: hasMultipleYears ? 'passed' : 'warning',
    score: hasMultipleYears ? 85 : 70,
    evidenceFound: `Detected date timestamps across career history.`,
    feedback: hasMultipleYears ? 'Career history shows steady chronological progression.' : 'Ensure all role durations (MM/YYYY - MM/YYYY) are explicitly formatted.',
    recommendation: 'Use standard date formats (e.g. "06/2022 - 08/2024") and note contract or acquisition roles explicitly.',
  });

  // 14. Ambiguity handling
  const ambiguityTerms = /(0 to 1|0-to-1|undefined|greenfield|spearheaded|pioneered|drove roadmap|ambiguous|conceptualized)/i;
  const ambMatch = resumeText.match(ambiguityTerms);
  focusAreas.push({
    id: 14,
    name: 'Ambiguity Handling & Greenfield Scope',
    recruiterFocus: '"0-to-1," "undefined problem," "drove roadmap" signals.',
    status: ambMatch ? 'passed' : 'warning',
    score: ambMatch ? 90 : 50,
    evidenceFound: ambMatch ? `Ambiguity phrasing: "${ambMatch[0]}"` : undefined,
    feedback: ambMatch ? 'Strong signals of thriving in ambiguous technical environments.' : 'Experience reads mostly as ticket execution rather than problem definition.',
    recommendation: 'Highlight greenfield projects or initiatives where you defined the technical requirements from scratch.',
  });

  // 15. Data-driven decision making
  const dataTerms = /(a\/b test|experimentation|data-driven|analytics|telemetry|kpi|metrics|statistically significant)/i;
  const dataMatch = resumeText.match(dataTerms);
  focusAreas.push({
    id: 15,
    name: 'Data-Driven Decision Making',
    recruiterFocus: 'A/B testing, experimentation, metrics-driven language.',
    status: dataMatch ? 'passed' : 'warning',
    score: dataMatch ? 85 : 55,
    evidenceFound: dataMatch ? `Data decision keyword: "${dataMatch[0]}"` : undefined,
    feedback: dataMatch ? 'Metrics and experimentation culture evident.' : 'Limited mentions of A/B testing or experimentation.',
    recommendation: 'Show how data influenced feature rollout: "Conducted A/B tests on 200K users, boosting checkout conversion by 8.4%."',
  });

  // 16. Domain-specific certs
  const certTerms = /(aws certified|gcp certified|ckad|cka|solution architect|azure certified|hashicorp|cissp)/i;
  const certMatch = resumeText.match(certTerms);
  focusAreas.push({
    id: 16,
    name: 'Domain-Specific Certifications',
    recruiterFocus: 'Cloud certs for infra roles, specific ML certs for AI roles.',
    status: certMatch ? 'passed' : 'warning',
    score: certMatch ? 95 : 65,
    evidenceFound: certMatch ? `Certified credential: "${certMatch[0]}"` : undefined,
    feedback: certMatch ? 'Recognized industry certification present.' : 'No major cloud/domain certification listed.',
    recommendation: 'Include recognized certs (e.g. AWS Solutions Architect, CKA) if targeting cloud infrastructure or platform roles.',
  });

  // 17. Referral/network signal
  focusAreas.push({
    id: 17,
    name: 'Referral & Network Signal Readiness',
    recruiterFocus: 'Internal referral often outweighs resume alone at initial screen.',
    status: lower.includes('linkedin.com') ? 'passed' : 'warning',
    score: lower.includes('linkedin.com') ? 85 : 50,
    evidenceFound: lower.includes('linkedin.com') ? 'LinkedIn profile URL detected.' : undefined,
    feedback: lower.includes('linkedin.com')
      ? 'Clean LinkedIn profile link present for recruiter reference.'
      : 'Missing direct LinkedIn profile link in resume header.',
    recommendation: 'Include your customized LinkedIn URL at the top of your resume for fast recruiter screening.',
  });

  // 18. Resume format compliance
  const hasGoodLength = wordCount >= 250 && wordCount <= 800;
  focusAreas.push({
    id: 18,
    name: 'Resume Format Compliance & ATS Parseability',
    recruiterFocus: 'Clean, 1-page (early career) to 2-page (senior), no graphics — parsed at scale via ATS.',
    status: hasGoodLength ? 'passed' : 'warning',
    score: hasGoodLength ? 95 : 60,
    evidenceFound: `Document length: ${wordCount} words.`,
    feedback: hasGoodLength
      ? 'Ideal length and clean density for automated high-volume ATS scanners.'
      : 'Word count is either too sparse (<250 words) or too verbose (>800 words).',
    recommendation: 'Target 400–650 words with clean Markdown or standard single-column typography.',
  });

  // 19. Recency of relevant experience
  const recentTerms = /(2024|2025|2026|present|current)/i;
  const hasRecent = recentTerms.test(resumeText);
  focusAreas.push({
    id: 19,
    name: 'Recency of Relevant Experience',
    recruiterFocus: 'Is the strongest, most relevant experience in the last 2-3 years.',
    status: hasRecent ? 'passed' : 'warning',
    score: hasRecent ? 90 : 55,
    evidenceFound: hasRecent ? 'Recent / current active employment timeline verified.' : undefined,
    feedback: hasRecent ? 'Relevant active technical roles in recent years.' : 'Recent years lack explicit technical depth.',
    recommendation: 'Place the heaviest technical detail and scale metrics in your most recent 2 positions.',
  });

  // 20. Culture/values keyword echo
  const cultureTerms = /(ownership|customer obsession|bias for action|deep dive|deliver results|learn and be curious|dive deep|frugality|googleyness)/i;
  const cultMatch = resumeText.match(cultureTerms);
  focusAreas.push({
    id: 20,
    name: 'Culture & Leadership Principles Echo',
    recruiterFocus: 'Subtle alignment with company leadership principles (Amazon LPs, Google "Googleyness").',
    status: cultMatch ? 'passed' : 'warning',
    score: cultMatch ? 85 : 55,
    evidenceFound: cultMatch ? `Leadership principle echo: "${cultMatch[0]}"` : undefined,
    feedback: cultMatch ? 'Echoes behavioral leadership and ownership principles.' : 'Neutral phrasing without leadership principle alignment.',
    recommendation: 'Incorporate action verbs reflecting ownership, customer impact, and high engineering standards.',
  });

  const passedCount = focusAreas.filter((f) => f.status === 'passed').length;
  const warningCount = focusAreas.filter((f) => f.status === 'warning').length;
  const missingCount = focusAreas.filter((f) => f.status === 'missing').length;

  const totalScore = Math.round(focusAreas.reduce((acc, f) => acc + f.score, 0) / focusAreas.length);

  let levelAssessment = 'L3 / Associate Level';
  if (totalScore >= 85) levelAssessment = 'L5 / Senior Software Engineer Equivalent';
  else if (totalScore >= 70) levelAssessment = 'L4 / Mid-Level Software Engineer Equivalent';
  else if (totalScore >= 55) levelAssessment = 'L3+ / High-Potential Early Career';

  // Generate prioritized next steps
  const nextSteps: NextStepSuggestion[] = [];

  if (numbersCount < 4) {
    nextSteps.push({
      id: 'faang-metrics',
      priority: 'high',
      category: 'Impact Metrics',
      title: 'Quantify Every Production Achievement',
      actionItem: 'FAANG recruiters instantly skip bullets with zero numbers. Add latency (% improvement), scale (QPS, concurrent requests), or cost savings to at least 80% of bullets.',
      exampleSnippet: 'Before: "Worked on caching layer."\nAfter: "Architected Redis multi-region caching layer, slashing p99 latency from 240ms to 42ms for 12M DAU."',
    });
  }

  if (!hasScale) {
    nextSteps.push({
      id: 'faang-scale',
      priority: 'high',
      category: 'Scale & Distributed Systems',
      title: 'Inject Concrete High-Throughput Signals',
      actionItem: 'Explicitly describe data volume and throughput: database partition size, Kafka message rate, or microservice scale.',
      exampleSnippet: 'Add: "Processed 40M+ daily events through Kafka pipeline with 99.99% uptime."',
    });
  }

  if (!sysMatch) {
    nextSteps.push({
      id: 'faang-sysdesign',
      priority: 'medium',
      category: 'System Design',
      title: 'Highlight Architectural Ownership',
      actionItem: 'Demonstrate that you participated in technical design decisions, trade-offs (e.g. SQL vs NoSQL), and service decoupling.',
      exampleSnippet: 'Use terms like: "Designed modular microservices schema", "Implemented idempotent REST/gRPC contracts".',
    });
  }

  if (!leadMatch) {
    nextSteps.push({
      id: 'faang-leadership',
      priority: 'medium',
      category: 'Leadership & Mentorship',
      title: 'Showcase Engineering Influence & Mentorship',
      actionItem: 'For L4+ calibration, mention mentoring interns/junior developers, establishing CI/CD standards, or leading cross-team code reviews.',
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
        : `Currently matches ${passedCount}/20 FAANG focus areas. Focus on scale metrics and distributed system depth to reach competitive screening tiers.`,
    passedCount,
    warningCount,
    missingCount,
    focusAreas,
    nextSteps,
  };
}

// -------------------------------------------------------------
// STARTUP FOCUS AREAS AUDIT
// -------------------------------------------------------------
export function analyzeStartupTier(resumeText: string): TierAnalysisResult {
  const lower = resumeText.toLowerCase();
  const words = resumeText.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const focusAreas: FocusAreaEvaluation[] = [];

  // 1. Generalist range
  const isFullStack = /(full-stack|fullstack|frontend and backend|react.*node|python.*react|typescript.*python|end-to-end)/i.test(resumeText);
  focusAreas.push({
    id: 1,
    name: 'Generalist Range & Stack Versatility',
    recruiterFocus: 'Can this person wear multiple hats (eng + product, growth + ops).',
    status: isFullStack ? 'passed' : 'warning',
    score: isFullStack ? 95 : 60,
    evidenceFound: isFullStack ? 'Broad full-stack / multi-disciplinary skills detected.' : 'Single-domain focus detected.',
    feedback: isFullStack
      ? 'Strong generalist versatility across frontend, backend, and infrastructure.'
      : 'Resume appears specialized. Startups prioritize candidates who can touch any layer of the stack.',
    recommendation: 'Highlight end-to-end project ownership: "Built full-stack Next.js + PostgreSQL app including UI, auth, and Stripe payments."',
  });

  // 2. Startup/scrappy experience
  const startupTerms = /(startup|founding|early-stage|seed|series a|series b|scrappy|bootstrapped|y combinator|techstars|incubator)/i;
  const startMatch = resumeText.match(startupTerms);
  focusAreas.push({
    id: 2,
    name: 'Startup & Scrappy Experience',
    recruiterFocus: 'Prior startup exposure, or evidence of working without process/resources.',
    status: startMatch ? 'passed' : 'warning',
    score: startMatch ? 90 : 55,
    evidenceFound: startMatch ? `Startup environment mention: "${startMatch[0]}"` : undefined,
    feedback: startMatch ? 'Direct early-stage or startup vocabulary detected.' : 'Background looks enterprise-heavy.',
    recommendation: 'Showcase fast-paced environments, agile pivots, or building features without established corporate guardrails.',
  });

  // 3. Speed of execution
  const speedTerms = /(shipped in \d+|shipped within|mvp|fast iteration|rapidly deployed|over the weekend|hackathon|launched in \d+ (days|weeks|months))/i;
  const speedMatch = resumeText.match(speedTerms);
  focusAreas.push({
    id: 3,
    name: 'Speed of Execution & Velocity',
    recruiterFocus: '"Shipped in X weeks," "0-to-1," fast iteration language.',
    status: speedMatch ? 'passed' : 'warning',
    score: speedMatch ? 95 : 50,
    evidenceFound: speedMatch ? `Velocity indicator: "${speedMatch[0]}"` : undefined,
    feedback: speedMatch ? 'High shipping velocity and execution speed clearly signaled.' : 'Lacks explicit speed-to-market metrics.',
    recommendation: 'Include fast turnaround proof: "Designed, built, and launched MVP in 4 weeks from scratch."',
  });

  // 4. Direct business impact
  const bizImpactTerms = /(revenue|arr|mrr|churn|retention|conversion rate|sales|monetization|customer acquisition|cac|ltv|\$|profit)/i;
  const bizMatch = resumeText.match(bizImpactTerms);
  focusAreas.push({
    id: 4,
    name: 'Direct Business Impact (Revenue & Growth)',
    recruiterFocus: 'Revenue, growth %, retention — tied to company outcomes, not just technical output.',
    status: bizMatch ? 'passed' : 'missing',
    score: bizMatch ? 90 : 35,
    evidenceFound: bizMatch ? `Business metric: "${bizMatch[0]}"` : undefined,
    feedback: bizMatch ? 'Direct business outcome connections found.' : 'All bullet points focus purely on code rather than business/revenue outcomes.',
    recommendation: 'Tie technical features to business growth: "Re-architected onboarding flow, increasing user conversion by 28% and adding $150K ARR."',
  });

  // 5. Ownership language
  const ownTerms = /(owned|spearheaded|built from scratch|drove|sole engineer|single-handedly|architected and built)/i;
  const ownMatch = resumeText.match(ownTerms);
  focusAreas.push({
    id: 5,
    name: 'Uncompromising Ownership Language',
    recruiterFocus: '"Owned," "drove," "built from scratch" vs. "contributed to".',
    status: ownMatch ? 'passed' : 'warning',
    score: ownMatch ? 90 : 50,
    evidenceFound: ownMatch ? `Ownership phrase: "${ownMatch[0]}"` : undefined,
    feedback: ownMatch ? 'High-agency, self-directed ownership phrasing detected.' : 'Uses passive "assisted with" or "contributed to" language.',
    recommendation: 'Replace "Helped build" with "Solely engineered and deployed full billing system from scratch."',
  });

  // 6. Founder-adjacent signals
  const founderTerms = /(founder|co-founder|side project|freelance|consultant|indie|client work|my own app|built an app)/i;
  const founderMatch = resumeText.match(founderTerms);
  focusAreas.push({
    id: 6,
    name: 'Founder-Adjacent Signals & Side Projects',
    recruiterFocus: 'Side projects, own startup attempts, freelance/consulting history.',
    status: founderMatch ? 'passed' : 'warning',
    score: founderMatch ? 95 : 60,
    evidenceFound: founderMatch ? `Entrepreneurial marker: "${founderMatch[0]}"` : undefined,
    feedback: founderMatch ? 'Entrepreneurial and self-starter track record evident.' : 'No personal side projects or freelance work listed.',
    recommendation: 'Include a "Projects" section highlighting apps, open-source tools, or micro-businesses you created yourself.',
  });

  // 7. Resourcefulness under constraint
  const constraintTerms = /(zero budget|bootstrapped|small team|lean|doing more with less|optimized costs|saved \$\d+)/i;
  const constMatch = resumeText.match(constraintTerms);
  focusAreas.push({
    id: 7,
    name: 'Resourcefulness Under Constraints',
    recruiterFocus: 'Doing more with less — small team, no budget, tight deadline stories.',
    status: constMatch ? 'passed' : 'warning',
    score: constMatch ? 90 : 55,
    evidenceFound: constMatch ? `Constraint phrase: "${constMatch[0]}"` : undefined,
    feedback: constMatch ? 'Demonstrates high output with lean resources.' : 'No explicit cost-efficiency or lean operations examples.',
    recommendation: 'Mention how you reduced cloud costs or built complex features with minimal third-party spend.',
  });

  // 8. Domain/industry relevance
  const industryTerms = /(fintech|healthtech|saas|ai\/ml|devtools|e-commerce|web3|edtech|b2b|b2c|marketplace)/i;
  const indMatch = resumeText.match(industryTerms);
  focusAreas.push({
    id: 8,
    name: 'Domain & Industry Vertical Alignment',
    recruiterFocus: 'Direct experience in specific vertical (fintech, healthtech, dev tools, SaaS).',
    status: indMatch ? 'passed' : 'warning',
    score: indMatch ? 85 : 60,
    evidenceFound: indMatch ? `Vertical domain: "${indMatch[0]}"` : undefined,
    feedback: indMatch ? 'Clear domain specialization evident.' : 'General technology wording without vertical context.',
    recommendation: 'Tailor your summary to state your domain focus (e.g. "Full-Stack Engineer specialized in B2B SaaS & Payment Flows").',
  });

  // 9. Stage-appropriate experience
  const stageTerms = /(0-1|0 to 1|first engineer|founding engineer|first 5|seed stage|early employee)/i;
  const stageMatch = resumeText.match(stageTerms);
  focusAreas.push({
    id: 9,
    name: 'Stage-Appropriate Experience (0-to-1)',
    recruiterFocus: 'Seed-stage startups want people who have done 0-10 employees before, not just big co.',
    status: stageMatch ? 'passed' : 'warning',
    score: stageMatch ? 95 : 55,
    evidenceFound: stageMatch ? `Stage term: "${stageMatch[0]}"` : undefined,
    feedback: stageMatch ? 'Proven track record in high-ambiguity early teams.' : 'Lacks early-stage employee keywords.',
    recommendation: 'If you joined an early company, explicitly state "Founding Engineer" or "Employee #4".',
  });

  // 10. Cultural/mission fit signals
  const missionTerms = /(mission|passionate about|community|user-centric|fast-moving|empowering)/i;
  const misMatch = resumeText.match(missionTerms);
  focusAreas.push({
    id: 10,
    name: 'Cultural & Mission Fit Signals',
    recruiterFocus: 'Resume/cover letter language echoing the startup stated mission.',
    status: misMatch ? 'passed' : 'warning',
    score: misMatch ? 85 : 60,
    evidenceFound: misMatch ? `Mission term: "${misMatch[0]}"` : undefined,
    feedback: misMatch ? 'Shows enthusiasm and mission alignment.' : 'Neutral corporate tone.',
    recommendation: 'Add a 2-line summary tailored to the specific startup industry and mission.',
  });

  // 11. Willingness to take risk
  focusAreas.push({
    id: 11,
    name: 'Willingness to Take Calculated Risk',
    recruiterFocus: 'Career pivots into startups from stable big-co jobs read as a positive signal.',
    status: startMatch || founderMatch ? 'passed' : 'warning',
    score: startMatch || founderMatch ? 90 : 60,
    feedback: startMatch || founderMatch ? 'Demonstrates appetite for high-upside entrepreneurial bets.' : 'Traditional corporate career path shown.',
    recommendation: 'Show willingness to build new ventures, tackle unexplored tech, or lead new product lines.',
  });

  // 12. Breadth over depth
  const stackVariety = ['react', 'vue', 'python', 'node', 'docker', 'tailwind', 'sql', 'nosql', 'figma', 'stripe'];
  const matchedStack = stackVariety.filter((s) => lower.includes(s));
  focusAreas.push({
    id: 12,
    name: 'Breadth Over Depth (Stack Adaptability)',
    recruiterFocus: 'Comfortable across the stack rather than narrow specialist, especially pre-Series B.',
    status: matchedStack.length >= 4 ? 'passed' : 'warning',
    score: Math.min(100, matchedStack.length * 22),
    evidenceFound: `Covers ${matchedStack.length} distinct stack components: ${matchedStack.slice(0, 5).join(', ')}`,
    feedback: matchedStack.length >= 4 ? 'Great versatility across tools, UI, backend, and infra.' : 'Tech stack looks narrowly focused.',
    recommendation: 'List full-stack competencies including database management, frontend UI, APIs, and deployments.',
  });

  // 13. Network/introduction readiness
  focusAreas.push({
    id: 13,
    name: 'Warm Introduction & Network Readiness',
    recruiterFocus: 'Warm intros from investors, advisors, or existing team carry heavy weight.',
    status: lower.includes('github.com') || lower.includes('linkedin.com') ? 'passed' : 'warning',
    score: lower.includes('github.com') && lower.includes('linkedin.com') ? 90 : 60,
    feedback: 'Contact links allow fast verification by founders and hiring managers.',
    recommendation: 'Ensure your GitHub and LinkedIn are top-notch with pinned showcase repos and clean bios.',
  });

  // 14. Speed-to-value in first 90 days
  const fastValTerms = /(onboarded in|shipped first feature in|immediately contributed|hit ground running|zero onboarding)/i;
  const fastMatch = resumeText.match(fastValTerms);
  focusAreas.push({
    id: 14,
    name: 'Speed-to-Value in First 90 Days',
    recruiterFocus: 'Can they contribute immediately with minimal onboarding/training.',
    status: fastMatch ? 'passed' : 'warning',
    score: fastMatch ? 90 : 60,
    evidenceFound: fastMatch ? `Fast onboarding signal: "${fastMatch[0]}"` : undefined,
    feedback: fastMatch ? 'Demonstrates rapid time-to-first-commit.' : 'Standard ramp-up implied.',
    recommendation: 'Add evidence of immediate contribution: "Shipped critical billing fix within first week of joining."',
  });

  // 15. Metrics personally moved
  const personalMetric = /(increased.*by \d+%|boosted.*by \d+%|generated \$\d+|cut.*by \d+ hours|reduced churn by \d+%)/i;
  const perMatch = resumeText.match(personalMetric);
  focusAreas.push({
    id: 15,
    name: 'Individual Attribution Metrics',
    recruiterFocus: 'Founder-recruiters want individual attribution, not team-diluted metrics.',
    status: perMatch ? 'passed' : 'warning',
    score: perMatch ? 90 : 45,
    evidenceFound: perMatch ? `Individual metric: "${perMatch[0]}"` : undefined,
    feedback: perMatch ? 'Explicitly ties personal actions to quantitative outcomes.' : 'Metrics feel passive or team-diluted.',
    recommendation: 'State what YOU specifically moved: "Individually rewrote landing page checkout, lifting conversion by 19%."',
  });

  // 16. Comfort with ambiguity / building process
  const procTerms = /(established process|implemented ci\/cd from scratch|set up agile|created design system|standardized)/i;
  const procMatch = resumeText.match(procTerms);
  focusAreas.push({
    id: 16,
    name: 'Comfort with Ambiguity & Process Creation',
    recruiterFocus: 'Explicit mentions of building processes from scratch, not just following them.',
    status: procMatch ? 'passed' : 'warning',
    score: procMatch ? 85 : 55,
    evidenceFound: procMatch ? `Process creation term: "${procMatch[0]}"` : undefined,
    feedback: procMatch ? 'Evidence of building infrastructure and workflows from zero.' : 'Lacks examples of building company processes.',
    recommendation: 'Mention setting up testing pipelines, linting rules, or deployment workflows for the engineering team.',
  });

  // 17. Recent relevant project work
  const projTerms = /(projects|side projects|hackathon|built and launched|open-source creator)/i;
  const projMatch = resumeText.match(projTerms);
  focusAreas.push({
    id: 17,
    name: 'Recent Project Work & Live Builds',
    recruiterFocus: 'Side projects, hackathons, or personal builds (esp. for early-career candidates).',
    status: projMatch ? 'passed' : 'warning',
    score: projMatch ? 90 : 55,
    evidenceFound: projMatch ? 'Dedicated Projects or Live Build section present.' : undefined,
    feedback: projMatch ? 'Demonstrates genuine passion for building in free time.' : 'No side projects or demo links listed.',
    recommendation: 'Add 2 live, deployed project links with active user numbers or GitHub repositories.',
  });

  // 18. Compensation/equity flexibility signals
  focusAreas.push({
    id: 18,
    name: 'High-Upside Mindset & Growth Alignment',
    recruiterFocus: 'Career history suggesting openness to lower cash + equity trade-off and high growth.',
    status: 'passed',
    score: 80,
    feedback: 'Standard career trajectory aligned with high-growth startup equity potential.',
    recommendation: 'Emphasize business outcome ownership and passion for long-term product upside.',
  });

  // 19. Communication clarity
  const isConcise = wordCount >= 200 && wordCount <= 600;
  focusAreas.push({
    id: 19,
    name: 'Communication Clarity & Punchiness',
    recruiterFocus: 'Startups read the resume as a proxy for how someone communicates — concise, no fluff.',
    status: isConcise ? 'passed' : 'warning',
    score: isConcise ? 95 : 60,
    evidenceFound: `Word count: ${wordCount} words (Ideal range: 200–600).`,
    feedback: isConcise ? 'Concise, high-density bullet points without fluff.' : 'Bullet points are overly wordy.',
    recommendation: 'Keep each bullet point to a crisp 1–2 lines focused strictly on action + result.',
  });

  // 20. Passion/authenticity signals
  const passTerms = /(built with|passionate|love building|craftsmanship|obsessed with|user feedback)/i;
  const passMatch = resumeText.match(passTerms);
  focusAreas.push({
    id: 20,
    name: 'Passion & Authentic Builder Signals',
    recruiterFocus: 'Personal note, specific reason for interest in building products (not generic corporate).',
    status: passMatch ? 'passed' : 'warning',
    score: passMatch ? 85 : 55,
    evidenceFound: passMatch ? `Authenticity signal: "${passMatch[0]}"` : undefined,
    feedback: passMatch ? 'Authentic builder tone detected.' : 'Reads like a standard corporate resume.',
    recommendation: 'Inject authentic builder tone in your summary (e.g. "Obsessed with high-performance web apps and slick UI micro-interactions").',
  });

  const passedCount = focusAreas.filter((f) => f.status === 'passed').length;
  const warningCount = focusAreas.filter((f) => f.status === 'warning').length;
  const missingCount = focusAreas.filter((f) => f.status === 'missing').length;

  const totalScore = Math.round(focusAreas.reduce((acc, f) => acc + f.score, 0) / focusAreas.length);

  let levelAssessment = 'Seed-Stage Generalist';
  if (totalScore >= 85) levelAssessment = 'Founding Engineer / Head of Eng Fit';
  else if (totalScore >= 70) levelAssessment = 'Growth-Stage / Series A Full-Stack Fit';
  else if (totalScore >= 55) levelAssessment = 'Junior / Scrappy Contributor Fit';

  // Generate prioritized next steps
  const nextSteps: NextStepSuggestion[] = [];

  if (!bizMatch) {
    nextSteps.push({
      id: 'startup-business',
      priority: 'high',
      category: 'Business & Revenue Impact',
      title: 'Tie Technical Work to Business Outcomes',
      actionItem: 'Founders care about user acquisition, retention, and revenue. Add concrete business metrics to your bullet points.',
      exampleSnippet: 'Before: "Built new checkout flow."\nAfter: "Architected single-page checkout flow with Stripe, boosting conversion by 22% and reducing drop-off by 40%."',
    });
  }

  if (!ownMatch) {
    nextSteps.push({
      id: 'startup-ownership',
      priority: 'high',
      category: 'High-Agency Ownership',
      title: 'Adopt High-Agency Founder Language',
      actionItem: 'Replace passive phrases like "Assisted with" or "Worked in team" with "Owned", "Spearheaded", "Built from scratch".',
      exampleSnippet: 'Rewrite: "Solely engineered end-to-end authentication and role-based access control from scratch."',
    });
  }

  if (!projMatch) {
    nextSteps.push({
      id: 'startup-projects',
      priority: 'medium',
      category: 'Side Projects & Demos',
      title: 'Add Live Deployed Side Projects',
      actionItem: 'Startups love builders who ship in their spare time. Add 1-2 live side project links (with active URLs and GitHub stars/users).',
    });
  }

  if (!isFullStack) {
    nextSteps.push({
      id: 'startup-generalist',
      priority: 'medium',
      category: 'Generalist Range',
      title: 'Showcase Stack Versatility',
      actionItem: 'Emphasize your willingness to touch UI, backend, databases, and DevOps without waiting for specialized team handoffs.',
    });
  }

  return {
    tier: 'startup',
    title: 'Startup Recruiter Audit',
    overallScore: totalScore,
    levelAssessment,
    summary:
      totalScore >= 75
        ? `Excellent startup profile! Matches ${passedCount}/20 startup recruiter focus areas (${levelAssessment}).`
        : `Matches ${passedCount}/20 startup recruiter focus areas. Highlight direct business impact and 0-to-1 ownership to stand out to early-stage founders.`,
    passedCount,
    warningCount,
    missingCount,
    focusAreas,
    nextSteps,
  };
}

// -------------------------------------------------------------
// DUAL SCREENER RUNNER
// -------------------------------------------------------------
export function screenResumeDualTier(resumeText: string): DualTierScreenResult {
  const faang = analyzeFaangTier(resumeText);
  const startup = analyzeStartupTier(resumeText);

  let recommendedPath: DualTierScreenResult['recommendedPath'] = 'balanced';
  let comparisonSummary = '';

  if (faang.overallScore >= startup.overallScore + 10) {
    recommendedPath = 'faang';
    comparisonSummary = `Your profile shows stronger alignment for FAANG & Big Tech (${faang.overallScore}% vs. ${startup.overallScore}%). Your scale, systems, and structured team signals make you a competitive fit for enterprise / tier-1 tech loops.`;
  } else if (startup.overallScore >= faang.overallScore + 10) {
    recommendedPath = 'startup';
    comparisonSummary = `Your profile is primed for Startups & High-Growth Unicorns (${startup.overallScore}% vs. ${faang.overallScore}%). Your versatility, speed-to-value, and ownership signals will resonate immediately with founders and hiring managers.`;
  } else {
    recommendedPath = 'balanced';
    comparisonSummary = `Versatile profile! You hold a balanced score across both tiers (FAANG: ${faang.overallScore}%, Startup: ${startup.overallScore}%). With minor positioning tweaks, you can target both big tech and early-stage companies.`;
  }

  return {
    faang,
    startup,
    recommendedPath,
    comparisonSummary,
  };
}
