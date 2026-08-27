# supercv 📄✨

> **SuperCV** — AI-Powered ATS Resume Compatibility Checker & Auto-Enhancement Platform using **Local Transformers (No API Keys Required)**.

SuperCV scores candidate resumes against target job descriptions using an authentic 5-category Applicant Tracking System (ATS) rubric modeled after industry systems (Workday, Taleo, Greenhouse, iCIMS, and Lever). If the compatibility score falls below **70%**, SuperCV automatically triggers a structured Phase 2 rewrite to optimize presentation, keyword alignment, and impact without hallucinating qualifications.

---

## 🌟 Key Features

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
  - **Interactive Web App**: Modern React + Tailwind interface with real-time score visualizer, category breakdown, and Supabase history.
  - **Power-User CLI**: Terminal interface with multi-file ingestion, streaming outputs, and Markdown/JSON export capabilities.
- 🤖 **Universal Multi-Provider Support**:
  - **Local Transformers** (Default, zero keys required)
  - **Google Gemini**: `gemini-2.5-flash`, `gemini-2.5-pro`
  - **OpenAI**: `gpt-4o`, `gpt-4o-mini`
  - **Anthropic Claude**: `claude-3-7-sonnet`, `claude-3-5-sonnet`
  - **Local Ollama**: `llama3.2`, `llama3.3`, `deepseek-r1`
- 📂 **Multi-Format Document Ingestion**:
  - Plain Text (`.txt`), Markdown (`.md`), Adobe PDF (`.pdf`), and Microsoft Word (`.docx`).

---

## 🛠️ Prerequisites

- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- *No API keys needed by default!*

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

### 3. Run ATS Analysis Instantly (Keyless / Local Transformer)
```bash
npm run ats -- --resume samples/sample_resume.txt --jd samples/sample_jd.txt
```

---

## 🖥️ Running the Web Application

To launch the web interface:

```bash
npm run dev
```

Open your browser at `http://localhost:5173`.

---

## ⌨️ Running the CLI Tool

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

### Interactive Step-by-Step Wizard
```bash
npm run ats:interactive
# or
npm run ats
```

### Optional: Use Cloud AI Providers
If you want to use cloud LLMs instead of the default local transformer:

```bash
# Google Gemini
GEMINI_API_KEY=your_key npm run ats -- -r resume.pdf -j jd.txt -p gemini

# OpenAI GPT-4o
OPENAI_API_KEY=your_key npm run ats -- -r resume.pdf -j jd.txt -p openai

# Anthropic Claude
ANTHROPIC_API_KEY=your_key npm run ats -- -r resume.pdf -j jd.txt -p claude
```

---

## 📋 CLI Flags Reference

| Flag | Shorthand | Description |
|---|---|---|
| `--resume <path>` | `-r` | Path to resume file (`.txt`, `.pdf`, `.docx`, `.md`) |
| `--jd <path>` | `-j` | Path to job description file (`.txt`, `.md`, `.pdf`) |
| `--provider <name>` | `-p` | Provider: `transformer` (default/free), `gemini`, `openai`, `claude`, `ollama`, `groq` |
| `--model <name>` | `-m` | Model name override |
| `--output <path>` | `-o` | Export complete Markdown analysis report |
| `--json <path>` | | Export structured report as JSON |
| `--save-enhanced <path>` | | Export enhanced plain-text resume |
| `--force-enhance` | `-f` | Force Phase 2 rewrite even if score is ≥70% |
| `--interactive` | `-i` | Run interactive wizard mode |
| `--raw` | | Output raw response without terminal formatting |
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
│   │   ├── llmClient.ts       # Multi-provider client (Transformers + LLMs)
│   │   ├── prompt.ts          # ATS System prompt & Phase templates
│   │   └── transformerEngine.ts # 100% Local ONNX Transformer Engine
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

MIT License.
