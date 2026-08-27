import React from 'react';
import { Flame, X, Zap, MessageSquareQuote, CheckCircle, Copy, Check, Sparkles } from 'lucide-react';
import type { ResumeRoastResult } from '../utils/resumeRoaster';

interface ResumeRoastModalProps {
  roast: ResumeRoastResult | null;
  isOpen: boolean;
  onClose: () => void;
  onAutoEnhance?: () => void;
}

export function ResumeRoastModal({ roast, isOpen, onClose, onAutoEnhance }: ResumeRoastModalProps) {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !roast) return null;

  const handleCopyRoast = () => {
    const roastText = `🔥 RESUME ROAST (${roast.roastLevel} - ${roast.roastScore}/100)
Verdict: ${roast.verdictHeadline}

Recruiter's Inner Monologue:
${roast.recruiterInnerThought}

Top Burns:
${roast.burns.map((b) => `• ${b.emoji} ${b.category}: ${b.punchline}\n  ${b.details}`).join('\n\n')}

Tough Love Fixes:
${roast.toughLoveFixes.map((f, i) => `${i + 1}. ${f}`).join('\n')}`;

    navigator.clipboard.writeText(roastText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-gray-950 text-gray-100 rounded-2xl border border-red-500/30 shadow-2xl shadow-red-950/60 p-6 md:p-8 space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-gray-800/80 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Flame Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-red-950/80 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/30">
              <Flame className="w-7 h-7 text-white animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-amber-300">
                  AI Resume Roast
                </h2>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-900/60 text-red-300 border border-red-700/50">
                  Savage Mode
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Brutally honest, unfiltered hiring manager critique
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-gray-900/90 border border-red-900/50 px-4 py-2 rounded-xl">
            <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Roast Level</p>
              <p className="text-sm font-extrabold text-orange-400">{roast.roastLevel}</p>
            </div>
            <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
              {roast.roastScore}<span className="text-xs text-gray-500 font-normal">/100</span>
            </div>
          </div>
        </div>

        {/* Recruiter Monologue */}
        <div className="relative p-4 rounded-xl bg-gradient-to-r from-red-950/40 to-orange-950/30 border border-red-900/40">
          <div className="flex gap-3">
            <MessageSquareQuote className="w-6 h-6 text-orange-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-orange-300 uppercase tracking-wide mb-1">
                Recruiter's 6-Second First Impression:
              </p>
              <p className="text-sm font-medium italic text-gray-200 leading-relaxed">
                {roast.recruiterInnerThought}
              </p>
            </div>
          </div>
        </div>

        {/* Burns Breakdown */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            Top Burns ({roast.burns.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {roast.burns.map((burn, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-gray-900/70 border border-gray-800 hover:border-red-900/60 transition-all space-y-1.5"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-orange-300">
                  <span className="text-base">{burn.emoji}</span>
                  <span>{burn.category}</span>
                </div>
                <p className="text-sm font-semibold text-gray-100">{burn.punchline}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{burn.details}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tough Love Fixes */}
        <div className="p-4 rounded-xl bg-gray-900/90 border border-emerald-900/50 space-y-2">
          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            Tough Love: How to Fix It Immediately
          </h4>
          <ul className="space-y-1.5 text-xs text-gray-300">
            {roast.toughLoveFixes.map((fix, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold shrink-0">{idx + 1}.</span>
                <span>{fix}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actions Footer */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-800">
          <button
            onClick={handleCopyRoast}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-200 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Roast Copied!' : 'Copy Roast to Clipboard'}
          </button>

          {onAutoEnhance && (
            <button
              onClick={() => {
                onClose();
                onAutoEnhance();
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-bold text-white shadow-lg shadow-blue-900/30 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Fix & Auto-Enhance with ATS Optimizer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
