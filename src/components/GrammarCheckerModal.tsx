import { useState } from 'react';
import {
  CheckCircle,
  X,
  Sparkles,
  Copy,
  Check,
  ArrowRight,
  SpellCheck,
} from 'lucide-react';
import type { GrammarCheckResult, GrammarIssue } from '../utils/grammarChecker';

interface GrammarCheckerModalProps {
  result: GrammarCheckResult | null;
  isOpen: boolean;
  onClose: () => void;
  onApplyCorrection: (correctedText: string) => void;
}

export function GrammarCheckerModal({
  result,
  isOpen,
  onClose,
  onApplyCorrection,
}: GrammarCheckerModalProps) {
  const [activeTab, setActiveTab] = useState<'issues' | 'preview'>('issues');
  const [filter, setFilter] = useState<'all' | 'spelling' | 'grammar' | 'style'>('all');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !result) return null;

  const filteredIssues = result.issues.filter((issue) => {
    if (filter === 'all') return true;
    if (filter === 'spelling') return issue.type === 'spelling';
    if (filter === 'grammar') return issue.type === 'grammar' || issue.type === 'tense';
    if (filter === 'style')
      return issue.type === 'wordiness' || issue.type === 'capitalization' || issue.type === 'punctuation';
    return true;
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(result.correctedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    onApplyCorrection(result.correctedText);
    onClose();
  };

  const getScoreColor = (s: number) => {
    if (s >= 90) return 'text-emerald-600 bg-emerald-50 border-emerald-300';
    if (s >= 75) return 'text-blue-600 bg-blue-50 border-blue-300';
    if (s >= 60) return 'text-amber-600 bg-amber-50 border-amber-300';
    return 'text-red-600 bg-red-50 border-red-300';
  };

  const getSeverityBadge = (sev: GrammarIssue['severity']) => {
    switch (sev) {
      case 'error':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-100 text-red-700">Error</span>;
      case 'warning':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-700">Warning</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-100 text-blue-700">Suggestion</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-50 via-indigo-50/50 to-white border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <SpellCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900">Grammar & Spell Checker</h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
                  AI Auto-Correct Ready
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Fixes typos, passive voice, tense inconsistencies, and formatting
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200/80 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Score & Summary Banner */}
        <div className="px-6 py-4 bg-gray-50/80 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-xl border text-center font-bold ${getScoreColor(result.score)}`}>
              <div className="text-2xl font-black leading-tight">{result.score}%</div>
              <div className="text-[10px] uppercase tracking-wider font-semibold">Grade: {result.grade}</div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-800">{result.summary}</p>
              <div className="flex flex-wrap gap-2 mt-1.5">
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-white border border-gray-200 text-gray-600 font-medium">
                  <strong>{result.totalIssues}</strong> Total Issues
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-red-50 border border-red-200 text-red-700 font-medium">
                  <strong>{result.spellingErrorsCount}</strong> Spelling
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-700 font-medium">
                  <strong>{result.grammarErrorsCount}</strong> Grammar & Tense
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700 font-medium">
                  <strong>{result.styleSuggestionsCount}</strong> Style & Casing
                </span>
              </div>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-1 bg-gray-200/80 p-1 rounded-xl shrink-0 self-start sm:self-center">
            <button
              onClick={() => setActiveTab('issues')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === 'issues' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Issues List ({result.totalIssues})
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === 'preview' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Corrected Preview
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'issues' ? (
            <div className="space-y-4">
              {/* Category Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-gray-500 mr-1">Filter:</span>
                {(['all', 'spelling', 'grammar', 'style'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md capitalize transition-colors ${
                      filter === f
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {filteredIssues.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-700">No issues found in this category!</p>
                  <p className="text-xs text-gray-400 mt-0.5">Your resume text passes this check smoothly.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredIssues.map((issue) => (
                    <div
                      key={issue.id}
                      className="p-4 rounded-xl border border-gray-200 bg-white hover:border-blue-300 transition-all space-y-2 shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {getSeverityBadge(issue.severity)}
                          <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                            {issue.type}
                          </span>
                          {issue.lineNumber && (
                            <span className="text-[11px] text-gray-400">Line {issue.lineNumber}</span>
                          )}
                        </div>
                      </div>

                      {/* Diff Replacement */}
                      <div className="flex flex-wrap items-center gap-2 text-xs bg-gray-50 p-2.5 rounded-lg font-mono">
                        <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 line-through">
                          {issue.originalText}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                          {issue.suggestedText}
                        </span>
                      </div>

                      <p className="text-xs text-gray-600 leading-relaxed">{issue.explanation}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-700">
                  Full Auto-Corrected Plain Text Preview
                </p>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy Corrected Text'}
                </button>
              </div>
              <textarea
                value={result.correctedText}
                readOnly
                className="w-full h-80 p-4 text-xs font-mono bg-gray-50 border border-gray-200 rounded-xl resize-none outline-none text-gray-800"
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-xs font-semibold text-gray-700 transition-colors"
          >
            Close
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleApply}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-bold text-white shadow-md shadow-emerald-500/20 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              Apply All {result.totalIssues} Corrections to Resume
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
