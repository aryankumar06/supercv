# SuperCV 📄✨

SuperCV is an ATS (Applicant Tracking System) resume analyzer, auto-enhancer, grammar checker, and resume critique tool. It scores resumes against job descriptions using a 5-category weighted rubric modeled after systems like Workday, Taleo, Greenhouse, iCIMS, and Lever. When a score falls below 70%, it automatically rewrites and optimizes the resume.

---

## Features

- **FAANG vs. Startup Resume Screener**: Evaluates resumes against the **Top 20 Big Tech Focus Areas** (pedigree, scale, system design, latency metrics, L4-L6 calibration) vs. **Top 20 Startup Focus Areas** (generalist breadth, 0-to-1 velocity, business revenue impact, founder-adjacent signals) with personalized strategic next-step roadmaps.
- **5-Category ATS Scoring Rubric**:
  - Keyword & Skills Match (35%)
  - Title & Seniority Alignment (15%)
  - Formatting & Parseability (20%)
  - Content Quality & Impact (20%)
  - Structure & Completeness (10%)
- **Conditional Auto-Enhancement**: Automatically rewrites weak bullets, restructures sections into standard ATS format, and adds `[ADD METRIC]` placeholders when score < 70%.
- **Local Transformers (No API Keys Required)**: Uses local dense semantic vector embeddings (`all-MiniLM-L6-v2`) to run offline with zero cloud cost.
- **Client-Side PDF/Word to TXT Parsing**: Extracts plain text from `.pdf` and `.docx` files directly in the browser or terminal.
- **AI Grammar & Spell Checker**: Detects typos, passive voice, tense inconsistencies, and tech casing (`reactjs` -> `React`) with one-click auto-correction.
- **Resume Roast Mode**: Generates blunt, constructive hiring-manager feedback with category breakdowns and action steps.
- **Dual Interfaces**: Web interface (React + Tailwind) with dedicated subpage tabs and power-user CLI tool.

---

## Installation & Setup

### Prerequisites
- Node.js 18+
- npm 9+

### Quick Start

1. Clone the repository:
```bash
git clone https://github.com/aryankumar06/supercv.git
cd supercv
```

2. Install dependencies:
```bash
npm install
```

3. Start the Web App:
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## CLI Usage

### 1. ATS Compatibility Scoring & Auto-Enhancement
```bash
# Basic scoring and enhancement
npm run ats -- --resume samples/sample_resume.txt --jd samples/sample_jd.txt

# Analyze a PDF resume against a job posting
npm run ats -- -r path/to/resume.pdf -j path/to/job_description.txt

# Export reports and enhanced resume
npm run ats -- -r resume.pdf -j jd.txt --output report.md --json report.json --save-enhanced enhanced.txt

# Force Phase 2 enhancement rewrite regardless of score
npm run ats -- -r resume.pdf -j jd.txt --force-enhance

# Interactive wizard
npm run ats:interactive
```

### 2. Grammar & Spell Checker
```bash
# Check resume grammar and view suggested fixes
npm run grammar -- path/to/resume.pdf

# Auto-correct and export directly to a text file
npm run grammar -- path/to/resume.pdf -o corrected_resume.txt

# JSON output
npm run grammar -- path/to/resume.pdf --json
```

### 3. FAANG vs. Startup Resume Screener
```bash
# Dual-tier benchmark (FAANG and Startup audit)
npm run screen -- path/to/resume.pdf

# Filter by target tier
npm run screen -- path/to/resume.pdf -t faang
npm run screen -- path/to/resume.pdf -t startup

# JSON output
npm run screen -- path/to/resume.pdf --json
```

### 4. Resume Roast
```bash
# Roast a resume
npm run roast -- path/to/resume.pdf

# Roast against a target job description
npm run roast -- path/to/resume.pdf -j path/to/job_description.txt
```

### 5. PDF to TXT Parser
```bash
# Inspect detected sections and extracted text
npm run parse-pdf -- path/to/resume.pdf

# Export extracted plain text
npm run parse-pdf -- path/to/resume.pdf -o resume.txt
```

---

## Optional: Cloud LLM Configuration

SuperCV uses local Transformers by default without requiring any API keys. If you want to use cloud providers instead, add your keys to `.env`:

```env
# Optional cloud providers
GEMINI_API_KEY=your_key
OPENAI_API_KEY=your_key
ANTHROPIC_API_KEY=your_key
GROQ_API_KEY=your_key
```

Specify the provider when running commands:
```bash
npm run ats -- -r resume.pdf -j jd.txt -p gemini -m gemini-2.5-flash
npm run ats -- -r resume.pdf -j jd.txt -p openai -m gpt-4o
npm run ats -- -r resume.pdf -j jd.txt -p claude -m claude-3-5-sonnet-latest
```

---

## Project Structure

```
supercv/
├── bin/
│   └── ats.js                 # Executable CLI launcher
├── samples/
│   ├── sample_resume.txt      # Sample resume for testing
│   └── sample_jd.txt          # Sample job description for testing
├── src/
│   ├── cli/
│   │   ├── fileReader.ts      # Multi-format document parser
│   │   ├── formatter.ts       # Terminal formatter and exporter
│   │   ├── grammar.ts         # Grammar checker CLI tool
│   │   ├── index.ts           # ATS CLI entrypoint
│   │   ├── interactive.ts     # Interactive wizard
│   │   ├── llmClient.ts       # Multi-provider client
│   │   ├── parsePdf.ts        # PDF to TXT CLI tool
│   │   ├── prompt.ts          # System prompt & templates
│   │   ├── roast.ts           # Resume roast CLI tool
│   │   └── transformerEngine.ts # Local ONNX Transformer engine
│   ├── components/
│   │   ├── AnalysisInput.tsx   # Resume & JD input component
│   │   ├── AnalysisResults.tsx # ATS report component
│   │   ├── GrammarCheckerModal.tsx # Grammar checker modal
│   │   └── ResumeRoastModal.tsx# Roast modal component
│   ├── lib/
│   │   └── supabase.ts        # Database client & types
│   ├── utils/
│   │   ├── atsAnalyzer.ts     # ATS scoring logic
│   │   ├── documentParser.ts  # Browser-side PDF/Word parser
│   │   ├── grammarChecker.ts  # Grammar & spelling engine
│   │   ├── keywordExtractor.ts# Keyword extraction logic
│   │   └── resumeRoaster.ts   # Resume roast engine
│   ├── App.tsx                # Main application component
│   └── main.tsx               # Application entrypoint
├── .env.example               # Environment variables template
├── package.json
└── README.md
```

---

## Developer Contact

**Aryan Kumar** — Developer & Creator of SuperCV.

- **LinkedIn**: [linkedin.com/in/aryan-kumarr-5450491ba/](https://www.linkedin.com/in/aryan-kumarr-5450491ba/)
- **GitHub**: [@aryankumar06](https://github.com/aryankumar06)
- **Instagram**: [@aaryan_yarr](https://instagram.com/aaryan_yarr)
- **Email**: [workingforaryan@gmail.com](mailto:workingforaryan@gmail.com)

---

## License

MIT License.
