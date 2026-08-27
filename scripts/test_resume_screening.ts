import { screenResumeDualTier } from '../src/utils/tierScreener';

const resume = `ARYAN
Bengaluru, Karnataka, India | aryankumarr127@gmail.com | +91-9310479532 |  Website :  aryankumar.work
LinkedIn : linkedin.com/in/aryan-kumarr-5450491ba |  GitHub : github.com/aryankumar06
Software Engineer with hands-on experience shipping production full-stack and mobile products end-to-end,
and  applied depth in AI/ML (embeddings, RAG, LLM-powered developer tooling). Built and launched a multi-
tenant platform as sole engineer, and an open-source developer tool that reached 1,000+ npm downloads in
its first four days. Seeking full-time Software Engineer roles.
SUMMARY
CONSULTING EXPERIENCE
Jan 2026 - Present
Languages:
Framework:
Cloud Infra and Backend:
Tools & Platforms:
Testing & Optimization:
Python, Java, Dart, JavaScript and TypeScript
React, Next.js, Node.js, Express.js and Flutter
PostgreSQL , MongoDB, Supabase, Firebase, LanceDB, GCP, Docker and Prisma ORM
Git, GitHub, Android Studio, Xcode, VS Code, Linear, Infimium, TwinCode
A/B Testing, App Performance Optimization, Unit Testing
SKILLS
Founding Software Engineer
Stealth Startup | On-site Bengaluru
Designed and built a scalable SaaS platform (3 Flutter apps, 4 user types) for real-time management of order
lifecycle, QR based validation as well as wallet-based payment flow from end-to-end.
Designed subscription workflows, dynamic menu systems, and bulk CSV pipelines that cut down repetitive admin
work across multiple brands and organizations.
Implemented OTP authentication, role-based access control, and performance optimizations to keep the app
secure, fast, and consistent across devices.
WORK EXPERIENCE
Jul 2025 - Dec 2025 Software Developer
YRIT Solutions PVT LTD (Gurugram,Haryana, India) | Remote
Reduced UI bugs by 30% through systematic code reviews and cross-browser testing on a React web app serving
10K+ users.
Built and shipped 5+ features end-to-end, contributing to daily sprints and collaborating with senior devs on
production code.
Wrote end-to-end tests using Cypress to catch regressions before deployment.
Flutter Developer (Freelance) Nov 2024 - Dec 2025
Self-Employed | Remote
Developed and deployed 3+ cross-platform mobile applications including  Cetavizer ,  ASAP , and  Smarter Day  to
Apple App Store and Google Play Store with 4.9+ average rating and 1000+ combined downloads.
Implemented Firebase backend integration (Authentication, Firestore, Cloud Storage) and REST API consumption
for real-time data synchronization.
Collaborated directly with clients to translate business requirements into functional, scalable mobile applications.
Full Stack Product Engineer
AassetIQ - AI-Powered Property Analysis Platform | Remote
Provided end-to-end engineering for a production property intelligence SaaS focused on unbiased, data-driven
real estate analysis.
Owned frontend in React, backend by firebase functions, and database design; ensured scalable deployment on
cloud infrastructure.
Nov 2025 - Jan 2026

ACHIEVEMENTS & CERTIFICATIONS
Nov 2025 McKinsey Forward Learning Program
Participant — Trained in leadership, problem-solving, and digital transformation.
May 6, 2025 Research Paper: on Topic- The Role of Automation in Shaping Next-Generation Digital
Libraries and Knowledge System
Traditional management systems persist in academic libraries despite their vital institutional role
because they fail to adapt to modern needs. Such outdated management systems create multiple
operational problems through delayed notification systems for book returns alongside confusing fine
management and limited payment system choices.
Our proposed solution introduces a two-application library automation system that targets both
students and administrators to streamline modernized management of library operations. The system
includes digital library cards and delivers real-time alerts which perform automatic computing of fines
and enables users to make payments online. –  Read  publication
Claude Skills Collection- Developer Tooling
Python · FFmpeg · Pillow · OpenAI Whisper · Claude API
Authored and published a motion graphics skill and audio transcription skill for Claude Code enabling AI agents to
generate MP4 animations and SRT transcriptions from audio using Whisper.
Designed frame-by-frame animation pipelines with Pillow + FFmpeg; engineered skill architecture for easy agent
integration and community reuse.
Check out the skill on Github— https://github.com/aryankumar06/claude-code-skills
Open Source UI Components- 21st.dev
React · TypeScript · Tailwind CSS · Lucide React
Published 2 open-source components to 21st.dev community: a  Notion-style Job Application Tracker  and a fully
interactive  Weekly Habit Tracker  with dark/light mode, drag-and-drop, bulk actions, and live progress analytics.
Both components have zero runtime dependencies beyond React, Tailwind, and Lucide; structured for drop-in use
in production applications.
Infimium.ai- Developer Tool
TypeScript · fastembed · SQLite·  tree-sitter · MCP
Open-core, local-first MCP server giving AI coding agents (Cursor, Claude Code) a persistent memory and  intelligence layer
over a codebase.
Built passive project memory via file watching, semantic code search across JS/TS/Python/Dart, and automated plan.md
and Project level context.yaml memory generation.
Published as an npm package with a full CLI; reached 2,000+ downloads and 60+ waitlist signups in its first week.
checkout at https://infimium.com and at github: https://github.com/infimium-ai/infimium-agent
F E AT U R E D P R OJ E C T S
Bachelor of Technology in Computer Science  Aug 2021 - Aug 2025
Dr. A.P.J. Abdul Kalam Technical University  (AKTU), Lucknow, U.P.
CGPA: 7.44, Relevant Courses: Data Structures, Web Dev, Databases, Software Engineering, AI, CLOUD
EDUCATION`;

const result = screenResumeDualTier(resume);

console.log('=== STARTUP TIER RESULT ===');
console.log('Overall Score:', result.startup.overallScore);
console.log('Level:', result.startup.levelAssessment);
console.log('Passed:', result.startup.passedCount, 'Warning:', result.startup.warningCount, 'Missing:', result.startup.missingCount);
console.log('\nStartup Focus Area #9 (Stage-Appropriate Experience):');
const area9 = result.startup.focusAreas.find(a => a.id === 9);
console.log(JSON.stringify(area9, null, 2));

console.log('\n=== FAANG TIER RESULT ===');
console.log('Overall Score:', result.faang.overallScore);
console.log('Level:', result.faang.levelAssessment);
console.log('Passed:', result.faang.passedCount, 'Warning:', result.faang.warningCount, 'Missing:', result.faang.missingCount);
console.log('\n=== TEST ON SPARSE RESUME (Checking Missing State & Instead-Of Recommendations) ===');
const sparseResume = `John Doe | john@example.com
Junior Developer with 1 year experience building web pages.
Skills: HTML, CSS, JavaScript.
Experience:
Junior Developer at WebCo (2024 - 2025)
Worked on client websites and fixed bugs. Updated UI.`;

const sparseResult = screenResumeDualTier(sparseResume);
console.log('Sparse Startup Missing Count:', sparseResult.startup.missingCount);
const sparseArea9 = sparseResult.startup.focusAreas.find(a => a.id === 9);
console.log('\nSparse Resume Area #9:');
console.log(JSON.stringify(sparseArea9, null, 2));

const sparseArea4 = sparseResult.startup.focusAreas.find(a => a.id === 4);
console.log('\nSparse Resume Area #4 (Business Impact):');
console.log(JSON.stringify(sparseArea4, null, 2));
