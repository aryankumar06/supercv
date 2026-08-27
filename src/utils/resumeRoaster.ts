export interface ResumeRoastResult {
  roastScore: number; // 0 to 100 (100 = completely burnt/roasted)
  roastLevel: 'Lightly Toasted' | 'Medium Rare' | 'Well Done' | 'Extra Crispy 🔥';
  verdictHeadline: string;
  recruiterInnerThought: string;
  burns: {
    category: string;
    emoji: string;
    punchline: string;
    details: string;
  }[];
  buzzwordsFound: string[];
  toughLoveFixes: string[];
}

const BUZZWORD_ROASTS: Record<string, string> = {
  'results-driven': 'Results-driven? As opposed to people actively trying to produce disasters?',
  'hard-working': 'Listing "hard-working" is like a restaurant advertising that their food is "edible".',
  'hard worker': 'Listing "hard worker" is the #1 sign you ran out of actual achievements.',
  'team player': 'Team player: Translation = "I haven\'t started any fistfights during sprint planning yet."',
  'go-getter': 'Go-getter? Are you an eager golden retriever or a professional engineer?',
  'fast learner': 'Fast learner usually means "I had to Google everything 5 minutes before the interview."',
  'detail-oriented': 'Calling yourself detail-oriented right before a formatting glitch is peak irony.',
  'passionate': 'Saying you are passionate about enterprise CSS is something not even your therapist believes.',
  'ninja': 'Unless you are throwing smoke bombs in the office, remove "ninja" immediately.',
  'rockstar': 'Unless you smash laptops on stage after a deployment, you are not a rockstar.',
  'guru': 'Tech guru? Please do not meditate on the production server.',
  'synergy': 'Synergy detected. Corporate buzzword bingo champion 2026.',
  'dynamic': 'Dynamic? What are you, a JavaScript variable with loose type checking?',
  'self-starter': 'Self-starter: You worked remotely and nobody checked your Jira tickets for 3 weeks.',
  'responsible for': '"Responsible for" sounds like a court summons, not an achievement.',
  'seeking a challenging position': 'An objective statement in 2026? Recruiter time machines only go forward, not back to 1999.',
};

export function roastResume(resumeText: string, jobDescription?: string): ResumeRoastResult {
  const lower = resumeText.toLowerCase();
  const words = resumeText.split(/\s+/).filter(Boolean);
  const lines = resumeText.split('\n').map((l) => l.trim()).filter(Boolean);

  const buzzwordsFound: string[] = [];
  for (const [bw] of Object.entries(BUZZWORD_ROASTS)) {
    if (lower.includes(bw)) {
      buzzwordsFound.push(bw);
    }
  }

  const burns: ResumeRoastResult['burns'] = [];
  let roastScore = 40; // Base heat

  // 1. Buzzword Check
  if (buzzwordsFound.length > 0) {
    roastScore += Math.min(25, buzzwordsFound.length * 7);
    const sampleBw = buzzwordsFound[0];
    burns.push({
      category: 'Buzzword Soup',
      emoji: '🥫',
      punchline: BUZZWORD_ROASTS[sampleBw] || `You packed ${buzzwordsFound.length} corporate clichés into this document.`,
      details: `Detected clichés: "${buzzwordsFound.slice(0, 4).join('", "')}". Recruiters roll their eyes at these in 0.2 seconds.`,
    });
  }

  // 1.5 Target Job Match
  if (jobDescription && jobDescription.trim().length > 20) {
    const targetTitleMatch = jobDescription.match(/^([^\n]+)/);
    const targetTitle = targetTitleMatch
      ? targetTitleMatch[1].replace(/^(job description|role|hiring:?)\s*/i, '').trim()
      : '';
    if (targetTitle && !lower.includes(targetTitle.toLowerCase().slice(0, 15))) {
      roastScore += 10;
      burns.push({
        category: 'Target Job Amnesia',
        emoji: '🎯',
        punchline: `You are targeting "${targetTitle.slice(0, 35)}..." but your resume does not even mention the title.`,
        details: 'Recruiters will assume you spray-and-prayed a generic resume to 50 companies in 10 minutes.',
      });
    }
  }

  // 2. Quantification Check (Numbers, %, $)
  const numbers = resumeText.match(/(\d+%\s*|\$\s*\d+|\d+\+?\s*(users|clients|customers|ms|x|hours|engineers|team|projects|sales|revenue))/gi) || [];
  if (numbers.length === 0) {
    roastScore += 20;
    burns.push({
      category: 'Ghost Metrics',
      emoji: '👻',
      punchline: 'Zero numbers detected. Did you actually work there, or were you just a polite observer?',
      details: 'Not a single %, $, or scale metric found. "Improved performance" could mean 0.01% or you made coffee faster.',
    });
  } else if (numbers.length < 3) {
    roastScore += 10;
    burns.push({
      category: 'Metric Scarcity',
      emoji: '📉',
      punchline: 'You gave us maybe 1-2 metrics and called it a day.',
      details: 'Show the hiring manager real dollar impact, latency reductions, or user scale instead of vague duty descriptions.',
    });
  }

  // 3. Action Verbs Check ("Responsible for" syndrome)
  const weakStarters = lines.filter((l) => /^[-*•]?\s*(responsible for|worked on|helped with|assisted with|tasked with|duties included)/i.test(l));
  if (weakStarters.length > 0) {
    roastScore += 15;
    burns.push({
      category: 'Passive Passenger Syndrome',
      emoji: '🛋️',
      punchline: `Found ${weakStarters.length} bullets starting with "Responsible for..." or "Helped with...".`,
      details: 'You are describing your job description from HR, not what you actually achieved. Lead with heavy-hitter action verbs (Architected, Scaled, Cut, Spearheaded).',
    });
  }

  // 4. Summary Check
  if (/objective\s*:/i.test(resumeText) || /seeking a position/i.test(resumeText)) {
    roastScore += 15;
    burns.push({
      category: 'Objective Statement Dinosaur',
      emoji: '🦖',
      punchline: 'You have an "Objective" statement. Are we faxing this resume in 1998?',
      details: 'Hiring managers do not care what you want from them; they care what value you bring to them. Replace it with a 3-line punchy Professional Summary.',
    });
  } else if (!/summary|profile|about/i.test(resumeText)) {
    roastScore += 10;
    burns.push({
      category: 'Missing Elevator Pitch',
      emoji: '🚪',
      punchline: 'No Summary section. You threw the recruiter straight into the weeds.',
      details: 'Give a 3-line teaser of your superpower before asking them to decipher 5 years of bullet points.',
    });
  }

  // 5. Length Check
  if (words.length > 900) {
    roastScore += 15;
    burns.push({
      category: 'War and Peace Volume 2',
      emoji: '📜',
      punchline: `At ${words.length} words, this is a novel, not a resume.`,
      details: 'Recruiters spend 6 seconds per resume. They are not pulling up a chair with hot tea to read your life story.',
    });
  } else if (words.length < 150) {
    roastScore += 20;
    burns.push({
      category: 'Micro-Resume',
      emoji: '🔍',
      punchline: 'This resume is so short it looks like a grocery shopping list.',
      details: 'Add meaningful project depth, key achievements, and technical scope.',
    });
  }

  // 6. Formatting & Parseability Check
  if (/[|•*]{4,}/.test(resumeText) || /my journey|what i do/i.test(resumeText)) {
    roastScore += 15;
    burns.push({
      category: 'ATS Kryptonite',
      emoji: '💀',
      punchline: 'Creative headers and fancy decorative symbols detected.',
      details: 'Applicant Tracking Systems will chew this up, choke on it, and send you an automated rejection email before a human ever sees it.',
    });
  }

  // Cap roast score
  roastScore = Math.min(98, Math.max(35, roastScore));

  let roastLevel: ResumeRoastResult['roastLevel'] = 'Medium Rare';
  if (roastScore >= 85) roastLevel = 'Extra Crispy 🔥';
  else if (roastScore >= 70) roastLevel = 'Well Done';
  else if (roastScore <= 50) roastLevel = 'Lightly Toasted';

  const verdictHeadlines = [
    'The recruiter had to take an aspirin after reading this.',
    'It has potential, but right now it reads like a 2012 LinkedIn auto-generator.',
    'Your skills are probably great, but your resume is doing its best to hide them.',
    'ATS robots and human recruiters have joined forces to reject this in unison.',
    'Looks like a solid draft, but currently suffering from severe fluff overload.',
  ];
  const verdictHeadline = verdictHeadlines[Math.floor(Math.random() * verdictHeadlines.length)];

  const recruiterThoughts = [
    '"I gave this 4 seconds and learned you like buzzwords and dislike specific numbers."',
    '"If I see another \'responsible for collaborating with cross-functional stakeholders\', I am closing my laptop."',
    '"This candidate might be a genius, but their resume looks like it was formatted in Notepad on Windows 95."',
    '"I asked for a full-stack engineer and got an encyclopedia of technologies without a single quantified result."',
  ];
  const recruiterInnerThought = recruiterThoughts[Math.floor(Math.random() * recruiterThoughts.length)];

  const toughLoveFixes = [
    'Replace every "Responsible for" with high-impact power verbs (Engineered, Reduced, Scaled, Overhauled).',
    'Add at least 1 quantifiable metric (%, $, users, latency, hours saved) to EVERY single bullet point.',
    'Nuke all cliché buzzwords ("results-driven", "team player", "ninja", "dynamic") — let your numbers prove it.',
    'Stick to standard ATS headers: Summary, Skills, Experience, Education. No fancy graphic bars or tables.',
    'Keep your Professional Summary to exactly 3 lines targeted strictly at the job title you are applying for.',
  ];

  return {
    roastScore,
    roastLevel,
    verdictHeadline,
    recruiterInnerThought,
    burns: burns.slice(0, 4),
    buzzwordsFound,
    toughLoveFixes,
  };
}
