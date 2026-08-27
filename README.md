# supercv 📄✨

> **SuperCV** — AI-Powered ATS Resume Compatibility Checker & Auto-Enhancement Platform.

SuperCV scores candidate resumes against target job descriptions using an authentic 5-category Applicant Tracking System (ATS) rubric modeled after industry systems (Workday, Taleo, Greenhouse, iCIMS, and Lever). If the compatibility score falls below **70%**, SuperCV automatically triggers a structured Phase 2 rewrite to optimize presentation, keyword alignment, and impact without hallucinating qualifications.

---

## 🌟 Key Features

- 🎯 **5-Category ATS Scoring Rubric**:
  - **Keyword & Skills Match (35%)**: Exact & synonym matching, frequency analysis, keyword stuffing penalties.
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
  - **Interactive Web App**: Modern React + Tailwind interface with real-time score visualizer, category breakdown, and Supabase history.
  - **Power-User CLI**: Terminal interface with multi-file ingestion, streaming outputs, and Markdown/JSON export capabilities.
- 🤖 **Universal Multi-Provider AI Support**:
  - **Google Gemini**: `gemini-2.5-flash`, `gemini-2.5-pro`, `gemini-1.5-pro`
  - **OpenAI**: `gpt-4o`, `gpt-4o-mini`
  - **Anthropic Claude**: `claude-3-7-sonnet`, `claude-3-5-sonnet`
  - **Local Ollama** *(Zero-cost offline execution)*: `llama3.2`, `llama3.3`, `deepseek-r1`, `mistral`
  - **Groq & OpenRouter** / Custom OpenAI-compatible endpoints.
- 📂 **Multi-Format Document Ingestion**:
  - Plain Text (`.txt`), Markdown (`.md`), Adobe PDF (`.pdf`), and Microsoft Word (`.docx`).

---

## 🛠️ Prerequisites

- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- *(Optional)* An API key for Gemini, OpenAI, Claude, or Groq, or a local [Ollama](https://ollama.com) instance.

---

## 🚀 Setup & Installation Guide

### 1. Clone the Repository
```bash
git clone https://github.com/aryankumar06/supercv.git
cd supercv
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` to configure your API keys (choose any provider you prefer):
```env
# AI Providers (At least one recommended for CLI AI analysis)
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
GROQ_API_KEY=your_groq_api_key

# Supabase (Optional - for saving web analysis results)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

> **Tip for 100% Free Local AI:** Install [Ollama](https://ollama.com), run `ollama run llama3.2`, and run the CLI using `-p ollama` without needing any API keys or paid accounts!

---

## 🖥️ Running the Web Application

To launch the web interface:

```bash
npm run dev
```

Open your browser at `http://localhost:5173`.

---

## ⌨️ Running the CLI Tool

### Quick Start with Sample Files
```bash
npm run ats -- --resume samples/sample_resume.txt --jd samples/sample_jd.txt
```

### Analyze a PDF or DOCX Resume
```bash
npm run ats -- -r /path/to/resume.pdf -j /path/to/job_description.txt
```

### Export Reports & Enhanced Resume
```bash
npm run ats -- \
  -r samples/sample_resume.txt \
  -j samples/sample_jd.txt \
  --output report.md \
  --json report.json \
  --save-enhanced enhanced_resume.txt
```

### Force Enhancement Rewrite (Regardless of Score)
```bash
npm run ats -- -r resume.pdf -j jd.txt --force-enhance
```

### Specify an LLM Provider / Model
```bash
# Google Gemini
npm run ats -- -r resume.pdf -j jd.txt -p gemini -m gemini-2.5-flash

# OpenAI GPT-4o
npm run ats -- -r resume.pdf -j jd.txt -p openai -m gpt-4o

# Anthropic Claude 3.7 Sonnet
npm run ats -- -r resume.pdf -j jd.txt -p claude -m claude-3-7-sonnet-latest

# Local Ollama (Offline / Free)
npm run ats -- -r resume.pdf -j jd.txt -p ollama -m llama3.2
```

### Interactive Step-by-Step Wizard
```bash
npm run ats:interactive
# or
npm run ats
```

---

## 📋 CLI Flags Reference

| Flag | Shorthand | Description |
|---|---|---|
| `--resume <path>` | `-r` | Path to resume file (`.txt`, `.pdf`, `.docx`, `.md`) |
| `--jd <path>` | `-j` | Path to job description file (`.txt`, `.md`, `.pdf`) |
| `--provider <name>` | `-p` | Provider: `gemini`, `openai`, `claude`, `ollama`, `groq`, `openrouter` |
| `--model <name>` | `-m` | Model name override |
| `--api-key <key>` | `-k` | API key override |
| `--base-url <url>` | | Base URL override for custom endpoints or Ollama |
| `--output <path>` | `-o` | Export complete Markdown analysis report |
| `--json <path>` | | Export structured report as JSON |
| `--save-enhanced <path>` | | Export enhanced plain-text resume |
| `--force-enhance` | `-f` | Force Phase 2 rewrite even if score is ≥70% |
| `--interactive` | `-i` | Run interactive wizard mode |
| `--raw` | | Output raw LLM response without formatting |
| `--help` | `-h` | Display help screen |

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
│   │   ├── llmClient.ts       # Universal multi-provider LLM caller
│   │   └── prompt.ts          # System prompt & Phase 1/Phase 2 templates
│   ├── components/
│   │   ├── AnalysisInput.tsx   # Web resume & JD upload/paste component
│   │   └── AnalysisResults.tsx # Web score visualizer & report renderer
│   ├── lib/
│   │   └── supabase.ts        # Database client & TypeScript definitions
│   ├── utils/
│   │   ├── atsAnalyzer.ts     # Client-side heuristic analyzer
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

MIT License. Feel free to use and customize for your own projects!
