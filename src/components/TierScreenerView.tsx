import { useState } from 'react';
import {
  Building2,
  Rocket,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Sparkles,
  Upload,
  Lightbulb,
  Target,
  Layers,
  Award,
  Filter,
  Check,
  Copy,
} from 'lucide-react';
import {
  screenResumeDualTier,
  type DualTierScreenResult,
  type FocusAreaEvaluation,
  type NextStepSuggestion,
} from '../utils/tierScreener';
import { parseDocument } from '../utils/documentParser';

export function TierScreenerView() {
  const [resumeText, setResumeText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [screenResult, setScreenResult] = useState<DualTierScreenResult | null>(null);
  const [selectedTierTab, setSelectedTierTab] = useState<'both' | 'faang' | 'startup'>('both');
  const [statusFilter, setStatusFilter] = useState<'all' | 'passed' | 'warning' | 'missing'>('all');
  const [expandedAreaId, setExpandedAreaId] = useState<number | null>(null);
  const [copiedActionId, setCopiedActionId] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    setIsParsing(true);
    try {
      const parsed = await parseDocument(file);
      setResumeText(parsed.text);
      const result = screenResumeDualTier(parsed.text);
      setScreenResult(result);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setIsParsing(false);
    }
  };

  const handleAnalyzeText = () => {
    if (resumeText.trim().length < 50) return;
    const result = screenResumeDualTier(resumeText);
    setScreenResult(result);
  };

  const handleCopyExample = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedActionId(id);
    setTimeout(() => setCopiedActionId(null), 2000);
  };

  const getStatusIcon = (status: FocusAreaEvaluation['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />;
      case 'missing':
        return <XCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0" />;
    }
  };

  const getStatusBadge = (status: FocusAreaEvaluation['status']) => {
    switch (status) {
      case 'passed':
        return <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">Pass</span>;
      case 'warning':
        return <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">Partial</span>;
      case 'missing':
        return <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800">Missing</span>;
    }
  };

  const getPriorityBadge = (p: NextStepSuggestion['priority']) => {
    switch (p) {
      case 'high':
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-850">High Priority</span>;
      case 'medium':
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-850">Medium Priority</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-850">Suggestion</span>;
    }
  };

  const filterFocusAreas = (areas: FocusAreaEvaluation[]) => {
    if (statusFilter === 'all') return areas;
    return areas.filter((a) => a.status === statusFilter);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-fade-in transition-colors">
      {/* Subpage Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold shadow-xs">
          <Target className="w-3.5 h-3.5" />
          40-Point Recruiter Tier Benchmark
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          FAANG vs. Startup Resume Screener
        </h2>
        <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Audit your resume against the exact 20 focus areas checked by Tier-1 Big Tech recruiters versus Early-Stage Startup founders, with personalized strategic next-step roadmaps.
        </p>
      </div>

      {/* Input Section (if no screen result yet) */}
      {!screenResult && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-6 md:p-8 space-y-6 transition-colors">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* File Dropzone */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                Option 1: Upload Resume (PDF / DOCX / TXT)
              </label>
              <div className="relative border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-xl p-8 text-center transition-all bg-gray-50/50 dark:bg-slate-950/50 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20">
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-sm">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-slate-200">
                    {isParsing ? 'Parsing Document...' : 'Drop your resume file here'}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-slate-500">PDF, Word DOCX, or Plain Text</p>
                </div>
              </div>
            </div>

            {/* Direct Paste */}
            <div className="space-y-3 flex flex-col">
              <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                Option 2: Paste Resume Plain Text
              </label>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your full resume text here..."
                className="flex-1 w-full p-4 text-xs font-mono bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl resize-none outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 transition-all text-gray-800 dark:text-slate-200 min-h-[140px]"
              />
            </div>
          </div>

          <div className="text-center pt-2">
            <button
              onClick={handleAnalyzeText}
              disabled={resumeText.trim().length < 50 || isParsing}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-sm shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-4 h-4" />
              Run 40-Point Tier Audit
            </button>
          </div>
        </div>
      )}

      {/* Results View */}
      {screenResult && (
        <div className="space-y-8 animate-fade-in">
          {/* Top Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm transition-colors">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mr-1">View Mode:</span>
              <button
                onClick={() => setSelectedTierTab('both')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedTierTab === 'both'
                    ? 'bg-indigo-600 text-white shadow-sm scale-[1.02]'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                }`}
              >
                Dual Comparison
              </button>
              <button
                onClick={() => setSelectedTierTab('faang')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedTierTab === 'faang'
                    ? 'bg-blue-600 text-white shadow-sm scale-[1.02]'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                FAANG Top 20
              </button>
              <button
                onClick={() => setSelectedTierTab('startup')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedTierTab === 'startup'
                    ? 'bg-orange-600 text-white shadow-sm scale-[1.02]'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                }`}
              >
                <Rocket className="w-3.5 h-3.5" />
                Startup Top 20
              </button>
            </div>

            <button
              onClick={() => {
                setScreenResult(null);
                setResumeText('');
              }}
              className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Screen Another Resume
            </button>
          </div>

          {/* Dual Score Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* FAANG Card */}
            <div className="p-6 bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/50 dark:from-blue-950/40 dark:via-slate-900 dark:to-slate-900 rounded-2xl border-2 border-blue-200 dark:border-blue-900/60 shadow-sm space-y-4 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">FAANG / Big Tech Benchmark</h3>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{screenResult.faang.levelAssessment}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-blue-600 dark:text-blue-400">{screenResult.faang.overallScore}%</div>
                  <div className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500">Match Score</div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2 text-xs">
                <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  {screenResult.faang.passedCount} Passed
                </span>
                <span className="flex items-center gap-1 text-amber-700 dark:text-amber-300 font-semibold bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-md border border-amber-200 dark:border-amber-800">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  {screenResult.faang.warningCount} Partial
                </span>
                <span className="flex items-center gap-1 text-rose-700 dark:text-rose-300 font-semibold bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-md border border-rose-200 dark:border-rose-800">
                  <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                  {screenResult.faang.missingCount} Missing
                </span>
              </div>

              <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed pt-1">{screenResult.faang.summary}</p>
            </div>

            {/* Startup Card */}
            <div className="p-6 bg-gradient-to-br from-orange-50/80 via-white to-amber-50/50 dark:from-orange-950/40 dark:via-slate-900 dark:to-slate-900 rounded-2xl border-2 border-orange-200 dark:border-orange-900/60 shadow-sm space-y-4 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-orange-600 dark:bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
                    <Rocket className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">Startup Recruiter Benchmark</h3>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{screenResult.startup.levelAssessment}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-orange-600 dark:text-orange-400">{screenResult.startup.overallScore}%</div>
                  <div className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500">Match Score</div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2 text-xs">
                <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  {screenResult.startup.passedCount} Passed
                </span>
                <span className="flex items-center gap-1 text-amber-700 dark:text-amber-300 font-semibold bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-md border border-amber-200 dark:border-amber-800">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  {screenResult.startup.warningCount} Partial
                </span>
                <span className="flex items-center gap-1 text-rose-700 dark:text-rose-300 font-semibold bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-md border border-rose-200 dark:border-rose-800">
                  <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                  {screenResult.startup.missingCount} Missing
                </span>
              </div>

              <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed pt-1">{screenResult.startup.summary}</p>
            </div>
          </div>

          {/* Verdict Recommendation Box */}
          <div className="p-5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 flex items-start gap-3.5 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
              <Award className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-indigo-950 dark:text-indigo-200">Recruiter Alignment Verdict</h4>
              <p className="text-xs text-indigo-800 dark:text-indigo-300 leading-relaxed">{screenResult.comparisonSummary}</p>
            </div>
          </div>

          {/* Next Steps & Action Plan Roadmap */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 space-y-5 shadow-sm transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">Personalized Next Steps & Strategic Roadmap</h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Targeted actions to elevate your score in recruitment loops</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...screenResult.faang.nextSteps, ...screenResult.startup.nextSteps].map((step) => (
                <div
                  key={step.id}
                  className="p-4 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-950/50 hover:bg-white dark:hover:bg-slate-950 hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-all space-y-2.5 shadow-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{step.category}</span>
                    {getPriorityBadge(step.priority)}
                  </div>
                  <h4 className="text-sm font-bold text-gray-800 dark:text-slate-100">{step.title}</h4>
                  <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed">{step.actionItem}</p>

                  {step.exampleSnippet && (
                    <div className="relative mt-2 p-3 bg-gray-900 dark:bg-black text-gray-200 rounded-lg text-xs font-mono border border-slate-800">
                      <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
                        <span>EXAMPLE REWRITE</span>
                        <button
                          onClick={() => handleCopyExample(step.id, step.exampleSnippet!)}
                          className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors"
                        >
                          {copiedActionId === step.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          {copiedActionId === step.id ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <pre className="whitespace-pre-wrap font-sans text-xs text-gray-100 dark:text-slate-200">{step.exampleSnippet}</pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Detailed 20-Point Recruiter Focus Breakdown */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 space-y-6 shadow-sm transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  {selectedTierTab === 'faang'
                    ? 'FAANG Top 20 Focus Areas'
                    : selectedTierTab === 'startup'
                    ? 'Startup Top 20 Focus Areas'
                    : '20-Point Recruiter Focus Rubric Breakdown'}
                </h3>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" />
                <span className="text-xs text-gray-500 dark:text-slate-400 font-medium mr-1">Filter:</span>
                {(['all', 'passed', 'warning', 'missing'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-md capitalize transition-colors ${
                      statusFilter === st
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* List of Focus Areas */}
            <div className="space-y-6">
              {(selectedTierTab === 'both' || selectedTierTab === 'faang') && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-blue-900 dark:text-blue-200 bg-blue-50 dark:bg-blue-950/60 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800">
                    <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    FAANG / Big Tech Focus Areas (1 - 20)
                  </div>

                  <div className="space-y-2">
                    {filterFocusAreas(screenResult.faang.focusAreas).map((area) => {
                      const isExpanded = expandedAreaId === area.id;
                      return (
                        <div
                          key={`faang-${area.id}`}
                          className="border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 hover:border-blue-300 dark:hover:border-blue-500/50 transition-all shadow-xs"
                        >
                          <div
                            onClick={() => setExpandedAreaId(isExpanded ? null : area.id)}
                            className="p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-gray-50/80 dark:hover:bg-slate-800/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 flex items-center justify-center text-xs font-bold shrink-0">
                                {area.id}
                              </span>
                              {getStatusIcon(area.status)}
                              <div>
                                <h4 className="text-xs font-bold text-gray-900 dark:text-slate-100">{area.name}</h4>
                                <p className="text-[11px] text-gray-500 dark:text-slate-400 line-clamp-1">{area.recruiterFocus}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {getStatusBadge(area.status)}
                              <span className="text-xs font-bold text-gray-400 dark:text-slate-500">
                                {isExpanded ? '▲' : '▼'}
                              </span>
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="p-4 bg-gray-50/60 dark:bg-slate-950/60 border-t border-gray-200 dark:border-slate-800 space-y-2.5 text-xs">
                              <div>
                                <span className="font-bold text-gray-700 dark:text-slate-300">What Recruiters Are Checking:</span>
                                <p className="text-gray-600 dark:text-slate-400 mt-0.5">{area.recruiterFocus}</p>
                              </div>
                              {area.evidenceFound && (
                                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-800 dark:text-emerald-300">
                                  <span className="font-bold">Detected Evidence: </span>
                                  {area.evidenceFound}
                                </div>
                              )}
                              <div>
                                <span className="font-bold text-gray-700 dark:text-slate-300">Recruiter Feedback:</span>
                                <p className="text-gray-600 dark:text-slate-400 mt-0.5">{area.feedback}</p>
                              </div>
                              <div className="p-2.5 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-900 dark:text-blue-300">
                                <span className="font-bold">Recommendation: </span>
                                {area.recommendation}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {(selectedTierTab === 'both' || selectedTierTab === 'startup') && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-orange-900 dark:text-orange-200 bg-orange-50 dark:bg-orange-950/60 px-3 py-1.5 rounded-lg border border-orange-200 dark:border-orange-800">
                    <Rocket className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    Startup Recruiter Focus Areas (1 - 20)
                  </div>

                  <div className="space-y-2">
                    {filterFocusAreas(screenResult.startup.focusAreas).map((area) => {
                      const isExpanded = expandedAreaId === area.id + 100;
                      return (
                        <div
                          key={`startup-${area.id}`}
                          className="border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 hover:border-orange-300 dark:hover:border-orange-500/50 transition-all shadow-xs"
                        >
                          <div
                            onClick={() => setExpandedAreaId(isExpanded ? null : area.id + 100)}
                            className="p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-gray-50/80 dark:hover:bg-slate-800/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 flex items-center justify-center text-xs font-bold shrink-0">
                                {area.id}
                              </span>
                              {getStatusIcon(area.status)}
                              <div>
                                <h4 className="text-xs font-bold text-gray-900 dark:text-slate-100">{area.name}</h4>
                                <p className="text-[11px] text-gray-500 dark:text-slate-400 line-clamp-1">{area.recruiterFocus}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {getStatusBadge(area.status)}
                              <span className="text-xs font-bold text-gray-400 dark:text-slate-500">
                                {isExpanded ? '▲' : '▼'}
                              </span>
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="p-4 bg-gray-50/60 dark:bg-slate-950/60 border-t border-gray-200 dark:border-slate-800 space-y-2.5 text-xs">
                              <div>
                                <span className="font-bold text-gray-700 dark:text-slate-300">What Recruiters Are Checking:</span>
                                <p className="text-gray-600 dark:text-slate-400 mt-0.5">{area.recruiterFocus}</p>
                              </div>
                              {area.evidenceFound && (
                                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-800 dark:text-emerald-300">
                                  <span className="font-bold">Detected Evidence: </span>
                                  {area.evidenceFound}
                                </div>
                              )}
                              <div>
                                <span className="font-bold text-gray-700 dark:text-slate-300">Recruiter Feedback:</span>
                                <p className="text-gray-600 dark:text-slate-400 mt-0.5">{area.feedback}</p>
                              </div>
                              <div className="p-2.5 bg-orange-50 dark:bg-orange-950/50 border border-orange-200 dark:border-orange-800 rounded-lg text-orange-900 dark:text-orange-300">
                                <span className="font-bold">Recommendation: </span>
                                {area.recommendation}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
