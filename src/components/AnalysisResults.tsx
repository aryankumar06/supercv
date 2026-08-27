import { useState } from 'react';
import {
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  TrendingUp,
  XCircle,
  Sparkles,
  Copy,
  Check,
  ArrowRight,
  Lightbulb,
  Flame,
  SpellCheck,
} from 'lucide-react';
import type { EnhancementChange, AnalysisResult } from '../lib/supabase';
import { roastResume, type ResumeRoastResult } from '../utils/resumeRoaster';
import { ResumeRoastModal } from './ResumeRoastModal';
import { checkGrammar, type GrammarCheckResult } from '../utils/grammarChecker';
import { GrammarCheckerModal } from './GrammarCheckerModal';

interface AnalysisResultsProps {
  result: AnalysisResult;
  onReset: () => void;
  resumeText?: string;
  jobDescription?: string;
}

const CATEGORY_META = [
  { key: 'keyword_match' as const, label: 'Keyword & Skills Match', weight: '35%' },
  { key: 'title_seniority' as const, label: 'Title & Seniority Alignment', weight: '15%' },
  { key: 'formatting_parseability' as const, label: 'Formatting & Parseability', weight: '20%' },
  { key: 'content_quality' as const, label: 'Content Quality & Impact', weight: '20%' },
  { key: 'structure_completeness' as const, label: 'Structure & Completeness', weight: '10%' },
];

export function AnalysisResults({ result, onReset, resumeText, jobDescription }: AnalysisResultsProps) {
  const [copied, setCopied] = useState(false);
  const [showEnhanced, setShowEnhanced] = useState(false);
  const [isRoastModalOpen, setIsRoastModalOpen] = useState(false);
  const [roastResult, setRoastResult] = useState<ResumeRoastResult | null>(null);
  const [isGrammarModalOpen, setIsGrammarModalOpen] = useState(false);
  const [grammarResult, setGrammarResult] = useState<GrammarCheckResult | null>(null);

  const handleOpenRoast = () => {
    const textToRoast = showEnhanced && result.enhanced_resume ? result.enhanced_resume : resumeText || '';
    if (!textToRoast) return;
    const roast = roastResume(textToRoast, jobDescription);
    setRoastResult(roast);
    setIsRoastModalOpen(true);
  };

  const handleOpenGrammar = () => {
    const textToCheck = showEnhanced && result.enhanced_resume ? result.enhanced_resume : resumeText || '';
    if (!textToCheck) return;
    const res = checkGrammar(textToCheck);
    setGrammarResult(res);
    setIsGrammarModalOpen(true);
  };

  const score = showEnhanced && result.enhanced_score ? result.enhanced_score : result.ats_score;
  const verdict = showEnhanced && result.enhanced_score
    ? result.enhanced_score >= 70 ? 'PASS' : 'FAIL'
    : result.verdict;

  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-emerald-600';
    if (s >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBg = (s: number) => {
    if (s >= 80) return 'bg-emerald-50 border-emerald-300';
    if (s >= 60) return 'bg-amber-50 border-amber-300';
    return 'bg-red-50 border-red-300';
  };

  const getBarColor = (s: number) => {
    if (s >= 80) return 'bg-emerald-500';
    if (s >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'medium':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'low':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      default:
        return null;
    }
  };

  const getPriorityBg = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 border-red-200';
      case 'medium':
        return 'bg-amber-50 border-amber-200';
      case 'low':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const handleCopy = () => {
    if (result.enhanced_resume) {
      navigator.clipboard.writeText(result.enhanced_resume);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-fade-in transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">ATS Match Report</h2>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">
            {showEnhanced ? 'Enhanced version' : 'Original resume'} analysis
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleOpenGrammar}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-lg transition-all text-sm font-semibold shadow-sm"
          >
            <SpellCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Grammar Check ✨
          </button>
          <button
            onClick={handleOpenRoast}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-600 to-rose-600 hover:from-orange-500 hover:to-rose-500 text-white rounded-lg transition-all text-sm font-semibold shadow-sm hover:shadow-md shadow-red-500/20"
          >
            <Flame className="w-4 h-4 text-amber-300 animate-pulse" />
            Roast Mode 🔥
          </button>
          <button
            onClick={onReset}
            className="px-4 py-2 bg-gray-600 dark:bg-slate-800 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
          >
            New Analysis
          </button>
        </div>
      </div>

      {/* Score Card */}
      <div className={`p-8 rounded-xl border-2 dark:bg-slate-900/90 ${getScoreBg(score)} transition-colors`}>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left">
          <div className="relative">
            <div className="flex items-center justify-center">
              <TrendingUp className={`w-8 h-8 ${getScoreColor(score)} mr-3`} />
              <span className={`text-5xl font-bold ${getScoreColor(score)}`}>{score}</span>
              <span className={`text-2xl font-medium ${getScoreColor(score)} ml-1`}>/ 100</span>
            </div>
          </div>
          <div className="hidden sm:block h-12 w-px bg-gray-300 dark:bg-slate-700" />
          <div>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${
                verdict === 'PASS'
                  ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
              }`}
            >
              {verdict === 'PASS' ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              {verdict === 'PASS' ? 'PASS — ATS-Ready' : 'FAIL — Enhancement Triggered'}
            </span>
            <p className="text-sm text-gray-600 dark:text-slate-300 mt-2 max-w-xs">
              {verdict === 'PASS'
                ? 'Your resume meets ATS compatibility thresholds.'
                : 'Score below 70% — an enhanced version has been generated.'}
            </p>
          </div>
        </div>
      </div>

      {/* Toggle between original and enhanced */}
      {result.enhanced_resume && (
        <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-slate-900 rounded-lg border border-transparent dark:border-slate-800 transition-colors">
          <button
            onClick={() => setShowEnhanced(false)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              !showEnhanced
                ? 'bg-white dark:bg-slate-800 text-gray-800 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
            }`}
          >
            Original ({result.ats_score}/100)
          </button>
          <ArrowRight className="w-4 h-4 text-gray-400 dark:text-slate-500" />
          <button
            onClick={() => setShowEnhanced(true)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              showEnhanced
                ? 'bg-white dark:bg-slate-800 text-gray-800 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 inline mr-1.5 text-blue-500" />
            Enhanced ({result.enhanced_score}/100)
          </button>
        </div>
      )}

      {/* Category Breakdown Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Score Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-950 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wide">
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Score</th>
                <th className="px-6 py-3">Weight</th>
                <th className="px-6 py-3">Bar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {CATEGORY_META.map((cat) => {
                const s = result.category_scores[cat.key];
                return (
                  <tr key={cat.key} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-700 dark:text-slate-200">{cat.label}</td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-bold ${getScoreColor(s)}`}>{s}/100</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-400">{cat.weight}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden min-w-[120px]">
                          <div
                            className={`h-full transition-all duration-500 ${getBarColor(s)}`}
                            style={{ width: `${s}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-slate-400 w-10 text-right">{s}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Keywords */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-5 transition-colors">
          <h3 className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Matched Keywords ({result.matched_keywords.length})
          </h3>
          {result.matched_keywords.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {result.matched_keywords.map((kw) => (
                <span
                  key={kw}
                  className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-medium rounded-md border border-emerald-200 dark:border-emerald-800"
                >
                  {kw}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No keywords matched</p>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-5 transition-colors">
          <h3 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-3 flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            Missing Critical Keywords ({result.missing_keywords.length})
          </h3>
          {result.missing_keywords.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {result.missing_keywords.map((kw) => (
                <span
                  key={kw}
                  className="px-2.5 py-1 bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 text-xs font-medium rounded-md border border-red-200 dark:border-red-800"
                >
                  {kw}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">All keywords matched</p>
          )}
        </div>
      </div>

      {/* Formatting Red Flags */}
      {result.formatting_red_flags.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-5 transition-colors">
          <h3 className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Formatting Red Flags
          </h3>
          <ul className="space-y-2">
            {result.formatting_red_flags.map((flag, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-slate-300">
                <span className="text-amber-500 mt-0.5">•</span>
                <span>{flag}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Top 3 Issues */}
      {result.top_issues.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-5 transition-colors">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4">Top 3 Issues Holding This Resume Back</h3>
          <ol className="space-y-3">
            {result.top_issues.map((issue, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 text-xs font-bold flex items-center justify-center border border-red-200 dark:border-red-800">
                  {i + 1}
                </span>
                <span className="text-sm text-gray-700 dark:text-slate-300">{issue}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Suggestions */}
      {result.suggestions.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-5 transition-colors">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Recommendations</h3>
          <div className="space-y-3">
            {result.suggestions.map((s, i) => (
              <div key={i} className={`p-4 rounded-lg border dark:bg-slate-950 ${getPriorityBg(s.priority)}`}>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">{getPriorityIcon(s.priority)}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-100">{s.category}</h4>
                      <span className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{s.priority} priority</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-slate-300 mb-1.5">{s.issue}</p>
                    <p className="text-sm text-gray-600 dark:text-slate-400">{s.recommendation}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Resume */}
      {showEnhanced && result.enhanced_resume && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-5 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-500" />
                Enhanced Resume (ATS-Optimized)
              </h3>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="w-full p-4 bg-gray-50 dark:bg-slate-950 rounded-lg text-sm text-gray-700 dark:text-slate-200 whitespace-pre-wrap font-mono max-h-96 overflow-y-auto border border-gray-100 dark:border-slate-800">
              {result.enhanced_resume}
            </pre>
          </div>

          {/* What Changed */}
          {result.enhancement_changes && result.enhancement_changes.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-5 transition-colors">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">What Changed & Why</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-slate-950 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wide">
                      <th className="px-4 py-3">Section</th>
                      <th className="px-4 py-3">Original Issue</th>
                      <th className="px-4 py-3">Fix Applied</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                    {result.enhancement_changes.map((change: EnhancementChange, i) => (
                      <tr key={i} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-slate-200 whitespace-nowrap">
                          {change.section}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-slate-300">{change.original_issue}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-slate-300">{change.fix_applied}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm">
                <span className="text-gray-500 dark:text-slate-400">New Estimated ATS Score:</span>
                <span className={`text-lg font-bold ${getScoreColor(result.enhanced_score || 0)}`}>
                  {result.enhanced_score} / 100
                </span>
                <span className="text-gray-400">was</span>
                <span className="text-sm font-medium text-gray-500 dark:text-slate-400">{result.ats_score} / 100</span>
              </div>
            </div>
          )}

          {/* Manual Actions */}
          {result.manual_actions && result.manual_actions.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-xl p-5 transition-colors">
              <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Remaining Manual Actions for You
              </h3>
              <ul className="space-y-2">
                {result.manual_actions.map((action, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-300">
                    <span className="text-amber-500 mt-0.5">•</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Pro Tips */}
      <div className="bg-blue-50 dark:bg-slate-900 border border-blue-200 dark:border-slate-800 rounded-xl p-5 transition-colors">
        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
          <Lightbulb className="w-4 h-4" />
          Pro Tips
        </h4>
        <ul className="space-y-1.5 text-sm text-blue-800 dark:text-slate-300">
          <li>Update your resume based on these recommendations</li>
          <li>Tailor your resume for each job application by matching keywords from the JD</li>
          <li>Keep formatting simple and consistent — no tables, columns, or graphics</li>
          <li>Save your final resume as a .docx or .pdf file for submissions</li>
          <li>Quantify every achievement with specific metrics (% improvement, $ impact, team size)</li>
        </ul>
      </div>

      {/* Roast Modal */}
      <ResumeRoastModal
        roast={roastResult}
        isOpen={isRoastModalOpen}
        onClose={() => setIsRoastModalOpen(false)}
      />

      {/* Grammar Modal */}
      <GrammarCheckerModal
        result={grammarResult}
        isOpen={isGrammarModalOpen}
        onClose={() => setIsGrammarModalOpen(false)}
        onApplyCorrection={() => {}}
      />
    </div>
  );
}
