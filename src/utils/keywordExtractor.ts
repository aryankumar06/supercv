// Keyword extraction from job descriptions — identifies hard skills, tools,
// technologies, certifications, and soft-skill competencies that ATS systems look for.

const HARD_SKILL_PATTERNS: { pattern: RegExp; normalized: string }[] = [
  // Programming languages
  { pattern: /\b(javascript|js)\b/i, normalized: 'JavaScript' },
  { pattern: /\btypescript|ts\b/i, normalized: 'TypeScript' },
  { pattern: /\bpython\b/i, normalized: 'Python' },
  { pattern: /\bjava\b/i, normalized: 'Java' },
  { pattern: /\bc\+\+\b/i, normalized: 'C++' },
  { pattern: /\bc#\b/i, normalized: 'C#' },
  { pattern: /\bgo(lang)?\b/i, normalized: 'Go' },
  { pattern: /\brust\b/i, normalized: 'Rust' },
  { pattern: /\bruby\b/i, normalized: 'Ruby' },
  { pattern: /\bphp\b/i, normalized: 'PHP' },
  { pattern: /\bswift\b/i, normalized: 'Swift' },
  { pattern: /\bkotlin\b/i, normalized: 'Kotlin' },
  { pattern: /\bscala\b/i, normalized: 'Scala' },
  { pattern: /\bsql\b/i, normalized: 'SQL' },
  { pattern: /\bnosql\b/i, normalized: 'NoSQL' },
  // Frontend frameworks
  { pattern: /\breact(\.js)?\b/i, normalized: 'React' },
  { pattern: /\bangular(\.js)?\b/i, normalized: 'Angular' },
  { pattern: /\bvue(\.js)?\b/i, normalized: 'Vue' },
  { pattern: /\bsvelte\b/i, normalized: 'Svelte' },
  { pattern: /\bnext(\.js)?\b/i, normalized: 'Next.js' },
  { pattern: /\bnuxt\b/i, normalized: 'Nuxt' },
  { pattern: /\bredux\b/i, normalized: 'Redux' },
  { pattern: /\bgraphql\b/i, normalized: 'GraphQL' },
  { pattern: /\bapollo\b/i, normalized: 'Apollo' },
  // Backend frameworks
  { pattern: /\bnode(\.js)?\b/i, normalized: 'Node.js' },
  { pattern: /\bexpress(\.js)?\b/i, normalized: 'Express' },
  { pattern: /\bdjango\b/i, normalized: 'Django' },
  { pattern: /\bflask\b/i, normalized: 'Flask' },
  { pattern: /\bspring(\s?boot)?\b/i, normalized: 'Spring Boot' },
  { pattern: /\brails\b/i, normalized: 'Rails' },
  { pattern: /\blaravel\b/i, normalized: 'Laravel' },
  { pattern: /\bfastapi\b/i, normalized: 'FastAPI' },
  // Cloud / DevOps
  { pattern: /\baws\b/i, normalized: 'AWS' },
  { pattern: /\bgcp|google cloud\b/i, normalized: 'Google Cloud' },
  { pattern: /\bazure\b/i, normalized: 'Azure' },
  { pattern: /\bdocker\b/i, normalized: 'Docker' },
  { pattern: /\bkubernetes|k8s\b/i, normalized: 'Kubernetes' },
  { pattern: /\bterraform\b/i, normalized: 'Terraform' },
  { pattern: /\bjenkins\b/i, normalized: 'Jenkins' },
  { pattern: /\bcircleci\b/i, normalized: 'CircleCI' },
  { pattern: /\bgithub actions\b/i, normalized: 'GitHub Actions' },
  { pattern: /\bci\/cd\b/i, normalized: 'CI/CD' },
  { pattern: /\bserverless\b/i, normalized: 'Serverless' },
  { pattern: /\blambda\b/i, normalized: 'Lambda' },
  // Databases
  { pattern: /\bpostgresql|postgres\b/i, normalized: 'PostgreSQL' },
  { pattern: /\bmysql\b/i, normalized: 'MySQL' },
  { pattern: /\bmongodb|mongo\b/i, normalized: 'MongoDB' },
  { pattern: /\bredis\b/i, normalized: 'Redis' },
  { pattern: /\belasticsearch\b/i, normalized: 'Elasticsearch' },
  { pattern: /\bdynamodb\b/i, normalized: 'DynamoDB' },
  { pattern: /\bsnowflake\b/i, normalized: 'Snowflake' },
  { pattern: /\bcassandra\b/i, normalized: 'Cassandra' },
  // Data / ML
  { pattern: /\bpandas\b/i, normalized: 'pandas' },
  { pattern: /\bnumpy\b/i, normalized: 'NumPy' },
  { pattern: /\btensorflow\b/i, normalized: 'TensorFlow' },
  { pattern: /\bpytorch\b/i, normalized: 'PyTorch' },
  { pattern: /\bscikit-learn\b/i, normalized: 'scikit-learn' },
  { pattern: /\bmachine learning|ml\b/i, normalized: 'Machine Learning' },
  { pattern: /\bdeep learning\b/i, normalized: 'Deep Learning' },
  { pattern: /\bnlp\b/i, normalized: 'NLP' },
  { pattern: /\bdata analysis\b/i, normalized: 'Data Analysis' },
  { pattern: /\bdata visualization\b/i, normalized: 'Data Visualization' },
  { pattern: /\btableau\b/i, normalized: 'Tableau' },
  { pattern: /\bpower bi\b/i, normalized: 'Power BI' },
  { pattern: /\bexcel\b/i, normalized: 'Excel' },
  { pattern: /\bspark\b/i, normalized: 'Spark' },
  { pattern: /\bairflow\b/i, normalized: 'Airflow' },
  { pattern: /\bhadoop\b/i, normalized: 'Hadoop' },
  // Tools / methodologies
  { pattern: /\bgit\b/i, normalized: 'Git' },
  { pattern: /\bjira\b/i, normalized: 'Jira' },
  { pattern: /\bconfluence\b/i, normalized: 'Confluence' },
  { pattern: /\bslack\b/i, normalized: 'Slack' },
  { pattern: /\bfigma\b/i, normalized: 'Figma' },
  { pattern: /\bagile\b/i, normalized: 'Agile' },
  { pattern: /\bscrum\b/i, normalized: 'Scrum' },
  { pattern: /\bkanban\b/i, normalized: 'Kanban' },
  { pattern: /\brest(ful)?\sapi\b/i, normalized: 'REST API' },
  { pattern: /\bmicroservices\b/i, normalized: 'Microservices' },
  { pattern: /\btdd\b/i, normalized: 'TDD' },
  { pattern: /\bunit testing\b/i, normalized: 'Unit Testing' },
  // Certifications
  { pattern: /\bpmp\b/i, normalized: 'PMP' },
  { pattern: /\baws certified\b/i, normalized: 'AWS Certified' },
  { pattern: /\bcka\b/i, normalized: 'CKA' },
  { pattern: /\bcissp\b/i, normalized: 'CISSP' },
  { pattern: /\bccna\b/i, normalized: 'CCNA' },
  { pattern: /\bsix sigma\b/i, normalized: 'Six Sigma' },
  { pattern: /\bprince2\b/i, normalized: 'PRINCE2' },
  { pattern: /\bcsm\b/i, normalized: 'CSM' },
];

const SOFT_SKILL_PATTERNS: { pattern: RegExp; normalized: string }[] = [
  { pattern: /\bleadership\b/i, normalized: 'Leadership' },
  { pattern: /\bcommunication\b/i, normalized: 'Communication' },
  { pattern: /\bcollaboration\b/i, normalized: 'Collaboration' },
  { pattern: /\bproblem.solving\b/i, normalized: 'Problem Solving' },
  { pattern: /\bteamwork\b/i, normalized: 'Teamwork' },
  { pattern: /\bproject management\b/i, normalized: 'Project Management' },
  { pattern: /\bstakeholder\b/i, normalized: 'Stakeholder Management' },
  { pattern: /\bmentoring|mentorship\b/i, normalized: 'Mentoring' },
  { pattern: /\bstrategic\b/i, normalized: 'Strategic Thinking' },
  { pattern: /\banalytical\b/i, normalized: 'Analytical Skills' },
  { pattern: /\btime management\b/i, normalized: 'Time Management' },
  { pattern: /\badaptability\b/i, normalized: 'Adaptability' },
  { pattern: /\bnegotiation\b/i, normalized: 'Negotiation' },
  { pattern: /\bpresentation\b/i, normalized: 'Presentation' },
  { pattern: /\bcross.functional\b/i, normalized: 'Cross-functional Collaboration' },
  { pattern: /\bdecision.making\b/i, normalized: 'Decision Making' },
  { pattern: /\bcreativity\b/i, normalized: 'Creativity' },
  { pattern: /\battention to detail\b/i, normalized: 'Attention to Detail' },
  { pattern: /\bownership\b/i, normalized: 'Ownership' },
  { pattern: /\binitiative\b/i, normalized: 'Initiative' },
];

export interface ExtractedKeyword {
  term: string;
  normalized: string;
  type: 'hard' | 'soft';
  count: number;
}

export function extractKeywords(jobDescription: string): {
  hardSkills: ExtractedKeyword[];
  softSkills: ExtractedKeyword[];
  all: ExtractedKeyword[];
} {
  const hardMap = new Map<string, ExtractedKeyword>();
  const softMap = new Map<string, ExtractedKeyword>();

  for (const { pattern, normalized } of HARD_SKILL_PATTERNS) {
    const matches = jobDescription.match(new RegExp(pattern.source, 'gi'));
    if (matches && matches.length > 0) {
      const existing = hardMap.get(normalized);
      if (existing) {
        existing.count += matches.length;
      } else {
        hardMap.set(normalized, { term: normalized, normalized, type: 'hard', count: matches.length });
      }
    }
  }

  for (const { pattern, normalized } of SOFT_SKILL_PATTERNS) {
    const matches = jobDescription.match(new RegExp(pattern.source, 'gi'));
    if (matches && matches.length > 0) {
      const existing = softMap.get(normalized);
      if (existing) {
        existing.count += matches.length;
      } else {
        softMap.set(normalized, { term: normalized, normalized, type: 'soft', count: matches.length });
      }
    }
  }

  const hardSkills = Array.from(hardMap.values()).sort((a, b) => b.count - a.count);
  const softSkills = Array.from(softMap.values())
    .filter((s) => s.count > 1)
    .sort((a, b) => b.count - a.count);

  return { hardSkills, softSkills, all: [...hardSkills, ...softSkills] };
}

export function checkKeywordInResume(keyword: string, resumeText: string): boolean {
  const lower = resumeText.toLowerCase();
  const kw = keyword.toLowerCase();

  if (lower.includes(kw)) return true;

  // Check close synonyms / abbreviations
  const synonyms: Record<string, string[]> = {
    'react': ['react.js', 'reactjs', 'reactjs'],
    'node.js': ['node', 'nodejs'],
    'next.js': ['next', 'nextjs'],
    'machine learning': ['ml'],
    'postgresql': ['postgres'],
    'rest api': ['restful', 'rest apis', 'restful api'],
    'ci/cd': ['ci cd', 'continuous integration', 'continuous delivery', 'continuous deployment'],
    'kubernetes': ['k8s'],
    'google cloud': ['gcp'],
    'aws certified': ['aws certification'],
    'cross-functional collaboration': ['cross functional', 'cross-functional'],
  };

  const syns = synonyms[kw] || [];
  for (const syn of syns) {
    if (lower.includes(syn.toLowerCase())) return true;
  }

  return false;
}

export function extractJobTitle(jobDescription: string): string | null {
  const lines = jobDescription.split('\n').map((l) => l.trim()).filter(Boolean);

  // Common patterns: "Job Title: X", "Position: X", or the first non-empty line
  for (const line of lines.slice(0, 10)) {
    if (/^(job title|position|role)\s*:/i.test(line)) {
      return line.replace(/^(job title|position|role)\s*:\s*/i, '').trim();
    }
  }

  // Look for "Senior", "Junior", "Lead", "Staff", "Principal" + role
  for (const line of lines.slice(0, 15)) {
    if (/\b(senior|junior|lead|staff|principal|associate|head of|director of|vp of)\b/i.test(line) &&
        line.length < 100) {
      return line;
    }
  }

  return lines[0] || null;
}

export function extractSeniorityLevel(jobDescription: string): string {
  const lower = jobDescription.toLowerCase();
  if (/\b(staff|principal|head of|director)\b/i.test(lower)) return 'executive';
  if (/\b(senior|sr\.?)\b/i.test(lower)) return 'senior';
  if (/\b(lead)\b/i.test(lower)) return 'lead';
  if (/\b(mid|mid-level|intermediate)\b/i.test(lower)) return 'mid';
  if (/\b(junior|jr\.?|entry.level|associate)\b/i.test(lower)) return 'junior';
  return 'mid';
}

export function extractYearsRequired(jobDescription: string): number {
  const lower = jobDescription.toLowerCase();

  // "5+ years", "5 years of experience", "minimum 3 years"
  const patterns = [
    /(\d+)\+?\s*years?\s+of\s+(experience|professional|relevant)/,
    /(\d+)\+?\s*years?\s+experience/,
    /minimum\s+of\s+(\d+)\s+years?/,
    /at least\s+(\d+)\s+years?/,
    /(\d+)\+?\s*yrs?/,
  ];

  for (const p of patterns) {
    const match = lower.match(p);
    if (match) return parseInt(match[1], 10);
  }

  return 0;
}
