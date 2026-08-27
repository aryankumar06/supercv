# supercv 📄✨

> **SuperCV** — AI-Powered ATS Resume Compatibility Checker & Auto-Enhancement Platform with **Client-Side PDF-to-TXT Parsing** & **Local Transformers (No API Keys Required)**.

SuperCV scores candidate resumes against target job descriptions using an authentic 5-category Applicant Tracking System (ATS) rubric modeled after industry systems (Workday, Taleo, Greenhouse, iCIMS, and Lever). If the compatibility score falls below **70%**, SuperCV automatically triggers a structured Phase 2 rewrite to optimize presentation, keyword alignment, and impact without hallucinating qualifications.

---

## 🌟 Key Features

- 📑 **Instant PDF / Word to TXT Structure Parser**:
  - Automatically extracts clean, ATS-parseable plain text from **Adobe PDF (`.pdf`)** and **Microsoft Word (`.docx`)** directly in the browser or terminal.
  - **Structure Inspector**: Real-time section detection badges (Contact Info, Summary, Skills, Experience, Education, Projects, Certifications) and word/page counts.
  - **Live Text Review & Editor**: Inspect how the ATS parser reads your resume before running compatibility analysis.
- 🧠 **Local Transformers Engine (100% Free, Zero API Keys)**:
  - Powered by `@xenova/transformers` with dense semantic vector embeddings (`Xenova/all-MiniLM-L6-v2`).
  - Runs completely offline on CPU / Neural Engine with zero cloud dependencies and zero cost.
- 🎯 **5-Category ATS Scoring Rubric**:
  - **Keyword & Skills Match (35%)**: Exact & dense semantic embedding matching, synonym analysis, keyword stuffing penalties.
  - **Title & Seniority Alignment (15%)**: Experience level & title alignment.
  - **Formatting & Parseability (20%)**: Section header validation, table/column detection, date standardizations (MM/YYYY).
  - **Content Quality & Impact (20%)**: Action verbs, quantified metrics (`%`, `$`, scale), bullet point conciseness.
  - **Structure & Completeness (10%)**: Core sections presence, length checks, gap detection.
- ⚡ **Automated Phase 2 Resume Enhancement**:
  - Automatically triggers if score `< 70%` (or via `--force-enhance`).
  - Rewrites weak bullet points using `[Action Verb] + [Context/How] + [Result/Scope]`.
  - Injects `[ADD METRIC]` placeholders rather than hallucinating metrics.
  - Generates a "What Changed & Why" table, re-scores the enhanced resume, and lists remaining candidate action items.
- 💻 **Dual Interfaces**:
  - **Interactive Web App**: Modern React + Tailwind interface with real-time score visualizer, category breakdown, PDF parsing flow, and Supabase history.
  - **Power-User CLI**: Terminal interface with multi-file ingestion, streaming outputs, and Markdown/JSON export capabilities.
- 🤖 **Universal Multi-Provider Support**:
  - **Local Transformers** (Default, zero keys required)
  - **Google Gemini**: `gemini-2.5-flash`, `gemini-2.5-pro`
  - **OpenAI**: `gpt-4o`, `gpt-4o-mini`
  - **Anthropic Claude**: `claude-3-7-sonnet`, `claude-3-5-sonnet`
  - **Local Ollama**: `llama3.2`, `llama3.3`, `deepseek-r1`

---

## 🚀 Setup & Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/aryankumar06/supercv.git
cd supercv
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Parse Any PDF Resume to Structured Plain Text
```bash
npm run parse-pdf -- path/to/resume.pdf
```
Or save the extracted TXT to a file:
```bash
npm run parse-pdf -- path/to/resume.pdf -o extracted_resume.txt
```

### 4. Run ATS Compatibility Analysis (Keyless / Local Transformer)
```bash
npm run ats -- --resume samples/sample_resume.txt --jd samples/sample_jd.txt
```

---

## 🖥️ Running the Web Application

To launch the web interface with drag-and-drop PDF-to-TXT parsing:

```bash
npm run dev
```

Open your browser at `http://localhost:5173`.

---

## ⌨️ CLI Commands & Usage

### 1. PDF / DOCX to TXT Parser (`parse-pdf`)
```bash
# Terminal overview with detected sections & contact info
npm run parse-pdf -- /path/to/resume.pdf

# Export parsed plain text directly
npm run parse-pdf -- /path/to/resume.pdf -o resume_plain.txt

# Structured JSON output
npm run parse-pdf -- /path/to/resume.pdf --json
```

### 2. ATS Compatibility Scoring & Auto-Enhancement (`ats`)
```bash
# Analyze PDF Resume against Job Description
npm run ats -- -r /path/to/resume.pdf -j /path/to/job_description.txt

# Export Markdown & JSON Reports + Enhanced Resume
npm run ats -- \
  -r samples/sample_resume.txt \
  -j samples/sample_jd.txt \
  --output report.md \
  --json report.json \
  --save-enhanced enhanced_resume.txt

# Force Phase 2 Enhancement Rewrite (Regardless of Score)
npm run ats -- -r resume.pdf -j jd.txt --force-enhance

# Interactive Step-by-Step Wizard
npm run ats:interactive
```

---

## 📋 CLI Flags Reference

| Command | Flag | Shorthand | Description |
|---|---|---|---|
| `ats` | `--resume <path>` | `-r` | Path to resume file (`.pdf`, `.docx`, `.txt`, `.md`) |
| `ats` | `--jd <path>` | `-j` | Path to job description file (`.txt`, `.md`, `.pdf`) |
| `ats` | `--provider <name>` | `-p` | Provider: `transformer` (default/free), `gemini`, `openai`, `claude`, `ollama` |
| `ats` | `--output <path>` | `-o` | Export complete Markdown analysis report |
| `ats` | `--json <path>` | | Export structured report as JSON |
| `ats` | `--save-enhanced <path>` | | Export enhanced plain-text resume |
| `ats` | `--force-enhance` | `-f` | Force Phase 2 rewrite even if score is ≥70% |
| `ats` | `--interactive` | `-i` | Run interactive wizard mode |
| `parse-pdf` | `-o, --output <path>` | | Save extracted plain text to file |
| `parse-pdf` | `--json` | | Output parsed structure & detected sections as JSON |

---

## 📁 Project Structure

```
supercv/
├── bin/
│   └── ats.js                 # Executable CLI launcher
├── samples/
│   ├── sample_resume.txt      # Sample candidate resume for testing
│   └── sample_jd.txt          # Sample job posting for testing
├── src/
│   ├── cli/
│   │   ├── fileReader.ts      # Multi-format document parser (PDF, Word, Text)
│   │   ├── formatter.ts       # Terminal visualizer and report exporter
│   │   ├── index.ts           # Main Commander CLI entrypoint
│   │   ├── interactive.ts     # Step-by-step interactive CLI wizard
│   │   ├── llmClient.ts       # Multi-provider client (Transformers + LLMs)
│   │   ├── parsePdf.ts        # PDF to TXT CLI tool & structure inspector
│   │   ├── prompt.ts          # ATS System prompt & Phase templates
│   │   └── transformerEngine.ts # 100% Local ONNX Transformer Engine
│   ├── components/
│   │   ├── AnalysisInput.tsx   # Web resume & JD upload/paste with PDF flow
│   │   └── AnalysisResults.tsx # Web score visualizer & report renderer
│   ├── lib/
│   │   └── supabase.ts        # Database client & TypeScript definitions
│   ├── utils/
│   │   ├── atsAnalyzer.ts     # Client-side heuristic analyzer
│   │   ├── documentParser.ts  # Browser-side PDF.js & Word text extractor
│   │   └── keywordExtractor.ts# Rule-based NLP extraction
│   ├── App.tsx                # Main React App
│   ├── index.css              # Tailwind styling
│   └── main.tsx               # React DOM entrypoint
├── .env.example               # Environment variables template
├── package.json
└── README.md
```

---

## 📜 License

MIT License.
