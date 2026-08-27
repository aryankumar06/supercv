export interface GrammarIssue {
  id: string;
  type: 'spelling' | 'tense' | 'punctuation' | 'capitalization' | 'wordiness' | 'grammar';
  severity: 'error' | 'warning' | 'suggestion';
  originalText: string;
  suggestedText: string;
  explanation: string;
  lineNumber?: number;
  context: string;
}

export interface GrammarCheckResult {
  score: number; // 0 to 100
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  totalIssues: number;
  spellingErrorsCount: number;
  grammarErrorsCount: number;
  styleSuggestionsCount: number;
  issues: GrammarIssue[];
  correctedText: string;
  summary: string;
}

// Common resume typos and misspellings
const COMMON_TYPOS: Record<string, string> = {
  experiance: 'experience',
  experianced: 'experienced',
  managment: 'management',
  devlopment: 'development',
  devloper: 'developer',
  responsable: 'responsible',
  reponsibilities: 'responsibilities',
  acheived: 'achieved',
  acheivement: 'achievement',
  acheivements: 'achievements',
  implmented: 'implemented',
  implmentation: 'implementation',
  maintenence: 'maintenance',
  technlogies: 'technologies',
  technolgy: 'technology',
  seperate: 'separate',
  seperated: 'separated',
  succesful: 'successful',
  succesfully: 'successfully',
  recieved: 'received',
  calender: 'calendar',
  definately: 'definitely',
  untill: 'until',
  oppurtunity: 'opportunity',
  oppurtunities: 'opportunities',
  enviroment: 'environment',
  enviroments: 'environments',
  collaberated: 'collaborated',
  collaberation: 'collaboration',
  proffessional: 'professional',
  proffesional: 'professional',
  occured: 'occurred',
  tommorrow: 'tomorrow',
  goverment: 'government',
  intrested: 'interested',
  intrest: 'interest',
  neccessary: 'necessary',
  reccomend: 'recommend',
  reccomended: 'recommended',
  independant: 'independent',
  efficent: 'efficient',
  efficently: 'efficiently',
  perfomance: 'performance',
  archtecture: 'architecture',
  databse: 'database',
  databses: 'databases',
  libary: 'library',
  libaries: 'libraries',
  langauge: 'language',
  langauges: 'languages',
  analyis: 'analysis',
  algoritm: 'algorithm',
  algoritms: 'algorithms',
  infrastucture: 'infrastructure',
  optmized: 'optimized',
  optmization: 'optimization',
  teh: 'the',
  adn: 'and',
  waht: 'what',
  wiht: 'with',
};

// Wordy / passive phrases and their punchy active alternatives
const WORDY_REPLACEMENTS: Record<string, string> = {
  'was responsible for managing': 'managed',
  'was responsible for creating': 'created',
  'was responsible for designing': 'designed',
  'was responsible for developing': 'developed',
  'was responsible for building': 'built',
  'was responsible for leading': 'led',
  'was responsible for': 'led',
  'responsible for the development of': 'developed',
  'responsible for the management of': 'managed',
  'responsible for': 'managed',
  'was involved in the creation of': 'created',
  'was involved in the development of': 'developed',
  'was involved in': 'contributed to',
  'helped with the implementation of': 'implemented',
  'helped with the development of': 'developed',
  'helped with': 'assisted in',
  'in order to': 'to',
  'due to the fact that': 'because',
  'at this point in time': 'currently',
  'a large number of': 'numerous',
  'a wide variety of': 'various',
  'each and every': 'every',
  'for the purpose of': 'to',
  'has the ability to': 'can',
  'in the event that': 'if',
  'is able to': 'can',
  'made the decision to': 'decided to',
  'served as': 'worked as',
  'utilize': 'use',
  'utilized': 'used',
  'utilizing': 'using',
};

// Proper tech capitalization
const TECH_CASING: Record<string, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  nodejs: 'Node.js',
  'node.js': 'Node.js',
  reactjs: 'React',
  'react.js': 'React',
  graphql: 'GraphQL',
  postgresql: 'PostgreSQL',
  postgres: 'PostgreSQL',
  mongodb: 'MongoDB',
  mysql: 'MySQL',
  html5: 'HTML5',
  css3: 'CSS3',
  aws: 'AWS',
  gcp: 'GCP',
  api: 'API',
  apis: 'APIs',
  rest: 'REST',
  restful: 'RESTful',
  'ci/cd': 'CI/CD',
  cicd: 'CI/CD',
  json: 'JSON',
  xml: 'XML',
  saas: 'SaaS',
  ui: 'UI',
  ux: 'UX',
  'ui/ux': 'UI/UX',
  seo: 'SEO',
  sdk: 'SDK',
  sdks: 'SDKs',
  jwt: 'JWT',
  nosql: 'NoSQL',
  github: 'GitHub',
  gitlab: 'GitLab',
  vscode: 'VS Code',
};

export function checkGrammar(resumeText: string): GrammarCheckResult {
  const issues: GrammarIssue[] = [];
  const lines = resumeText.split('\n');
  let issueCounter = 1;

  // Track corrected lines for full auto-correction
  const correctedLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    const originalLine = line;
    const lineNumber = i + 1;
    const trimmed = line.trim();

    if (trimmed.length === 0) {
      correctedLines.push('');
      continue;
    }

    // 1. Check Typos & Misspellings (word by word)
    const words = line.split(/\b/);
    for (const rawWord of words) {
      const lower = rawWord.toLowerCase();
      if (COMMON_TYPOS[lower]) {
        const replacement =
          rawWord[0] === rawWord[0].toUpperCase()
            ? COMMON_TYPOS[lower].charAt(0).toUpperCase() + COMMON_TYPOS[lower].slice(1)
            : COMMON_TYPOS[lower];

        issues.push({
          id: `spelling-${issueCounter++}`,
          type: 'spelling',
          severity: 'error',
          originalText: rawWord,
          suggestedText: replacement,
          explanation: `Spelling error: "${rawWord}" is commonly misspelled. Replace with "${replacement}".`,
          lineNumber,
          context: line,
        });

        // Apply fix in corrected line
        const regex = new RegExp(`\\b${rawWord}\\b`, 'g');
        line = line.replace(regex, replacement);
      }
    }

    // 2. Check Tech Acronym Capitalization
    for (const [techKey, properCasing] of Object.entries(TECH_CASING)) {
      const regex = new RegExp(`\\b${techKey.replace('.', '\\.')}\\b`, 'gi');
      let match: RegExpExecArray | null;
      while ((match = regex.exec(originalLine)) !== null) {
        if (match[0] !== properCasing) {
          issues.push({
            id: `cap-${issueCounter++}`,
            type: 'capitalization',
            severity: 'suggestion',
            originalText: match[0],
            suggestedText: properCasing,
            explanation: `Standardize industry technology casing: "${match[0]}" should be written as "${properCasing}".`,
            lineNumber,
            context: originalLine,
          });
          line = line.replace(new RegExp(`\\b${match[0].replace('.', '\\.')}\\b`, 'g'), properCasing);
        }
      }
    }

    // 3. Check Wordiness & Passive Voice Phrases
    for (const [phrase, replacement] of Object.entries(WORDY_REPLACEMENTS)) {
      const phraseRegex = new RegExp(`\\b${phrase}\\b`, 'gi');
      if (phraseRegex.test(line)) {
        issues.push({
          id: `wordiness-${issueCounter++}`,
          type: 'wordiness',
          severity: 'warning',
          originalText: phrase,
          suggestedText: replacement,
          explanation: `Passive or wordy phrasing: Replace "${phrase}" with the direct, high-impact action verb "${replacement}".`,
          lineNumber,
          context: originalLine,
        });
        line = line.replace(phraseRegex, replacement);
      }
    }

    // 4. Check Punctuation Errors (e.g. missing space after comma/colon, double spaces)
    if (/([a-zA-Z]),([a-zA-Z])/.test(line)) {
      const match = line.match(/([a-zA-Z]),([a-zA-Z])/);
      if (match) {
        issues.push({
          id: `punct-${issueCounter++}`,
          type: 'punctuation',
          severity: 'error',
          originalText: match[0],
          suggestedText: `${match[1]}, ${match[2]}`,
          explanation: 'Missing space after comma.',
          lineNumber,
          context: originalLine,
        });
        line = line.replace(/([a-zA-Z]),([a-zA-Z])/g, '$1, $2');
      }
    }

    // Double space fix
    if (/ {2,}/.test(line)) {
      line = line.replace(/ {2,}/g, ' ');
    }

    // 5. Check Bullet Point Capitalization (Bullets should start with capital letter)
    const bulletMatch = line.match(/^(\s*[-*•]\s*)([a-z])(.*)/);
    if (bulletMatch) {
      const capitalized = bulletMatch[2].toUpperCase();
      issues.push({
        id: `cap-${issueCounter++}`,
        type: 'capitalization',
        severity: 'warning',
        originalText: `${bulletMatch[1]}${bulletMatch[2]}`,
        suggestedText: `${bulletMatch[1]}${capitalized}`,
        explanation: 'Bullet points should start with a capitalized letter.',
        lineNumber,
        context: originalLine,
      });
      line = `${bulletMatch[1]}${capitalized}${bulletMatch[3]}`;
    }

    // 6. Check repeated words (e.g. "the the", "in in", "to to")
    const repeatedWordMatch = line.match(/\b([a-zA-Z]+)\s+\1\b/i);
    if (repeatedWordMatch && !/^(that|had)$/i.test(repeatedWordMatch[1])) {
      issues.push({
        id: `grammar-${issueCounter++}`,
        type: 'grammar',
        severity: 'error',
        originalText: repeatedWordMatch[0],
        suggestedText: repeatedWordMatch[1],
        explanation: `Accidental duplicate word: "${repeatedWordMatch[0]}".`,
        lineNumber,
        context: originalLine,
      });
      line = line.replace(new RegExp(`\\b${repeatedWordMatch[0]}\\b`, 'gi'), repeatedWordMatch[1]);
    }

    correctedLines.push(line);
  }

  const correctedText = correctedLines.join('\n');

  // Count categories
  const spellingErrorsCount = issues.filter((i) => i.type === 'spelling').length;
  const grammarErrorsCount = issues.filter((i) => i.type === 'grammar' || i.type === 'tense').length;
  const styleSuggestionsCount = issues.filter(
    (i) => i.type === 'wordiness' || i.type === 'capitalization' || i.type === 'punctuation'
  ).length;

  const totalIssues = issues.length;

  // Calculate Grammar Score (100 base, penalize per error)
  let score = 100 - spellingErrorsCount * 12 - grammarErrorsCount * 10 - styleSuggestionsCount * 4;
  score = Math.max(25, Math.min(100, score));

  let grade: GrammarCheckResult['grade'] = 'A+';
  if (score >= 95) grade = 'A+';
  else if (score >= 88) grade = 'A';
  else if (score >= 75) grade = 'B';
  else if (score >= 60) grade = 'C';
  else if (score >= 45) grade = 'D';
  else grade = 'F';

  let summary = '';
  if (totalIssues === 0) {
    summary = 'Outstanding! Your resume is clean, error-free, and grammatically polished.';
  } else if (score >= 85) {
    summary = `Great shape! Found only ${totalIssues} minor formatting/style improvement${totalIssues > 1 ? 's' : ''}.`;
  } else if (score >= 70) {
    summary = `Good, but found ${totalIssues} issue${totalIssues > 1 ? 's' : ''} (including spelling/acronym formatting) that should be fixed before applying.`;
  } else {
    summary = `Needs attention: Found ${totalIssues} critical grammar/spelling issue${totalIssues > 1 ? 's' : ''} that could trigger recruiter rejection.`;
  }

  return {
    score,
    grade,
    totalIssues,
    spellingErrorsCount,
    grammarErrorsCount,
    styleSuggestionsCount,
    issues,
    correctedText,
    summary,
  };
}
