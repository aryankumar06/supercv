import { useState, useEffect } from 'react';
import { ScanSearch, Github, Linkedin, Instagram, Mail, Heart, Building2, FileCheck, Sun, Moon } from 'lucide-react';
import { AnalysisInput } from './components/AnalysisInput';
import { AnalysisResults } from './components/AnalysisResults';
import { TierScreenerView } from './components/TierScreenerView';
import { analyzeResume } from './utils/atsAnalyzer';
import { supabase } from './lib/supabase';
import type { AnalysisResult } from './lib/supabase';

function App() {
  const [activeView, setActiveView] = useState<'ats' | 'tierScreener'>('ats');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [currentResume, setCurrentResume] = useState('');
  const [currentJd, setCurrentJd] = useState('');

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handleAnalyze = async (resumeText: string, jobDescription: string) => {
    setIsAnalyzing(true);
    setCurrentResume(resumeText);
    setCurrentJd(jobDescription);

    try {
      const analysis = analyzeResume(resumeText, jobDescription);

      try {
        const { error } = await supabase.from('resume_analyses').insert({
          resume_text: resumeText,
          job_description: jobDescription,
          ats_score: analysis.ats_score,
          category_scores: analysis.category_scores,
          matched_keywords: analysis.matched_keywords,
          missing_keywords: analysis.missing_keywords,
          formatting_red_flags: analysis.formatting_red_flags,
          top_issues: analysis.top_issues,
          suggestions: analysis.suggestions,
          enhanced_resume: analysis.enhanced_resume,
          enhancement_changes: analysis.enhancement_changes,
          enhanced_score: analysis.enhanced_score,
          manual_actions: analysis.manual_actions,
          verdict: analysis.verdict,
        });

        if (error) {
          console.error('Error saving analysis:', error);
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
      }

      setResult(analysis);
    } catch (error) {
      console.error('Error analyzing resume:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
        {/* Top Header & Navigation Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 dark:bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <ScanSearch className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                SuperCV
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">AI ATS & Recruiter Intelligence</p>
            </div>
          </div>

          {/* Nav Tabs */}
          <div className="inline-flex items-center p-1.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md gap-1">
            <button
              onClick={() => setActiveView('ats')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all duration-200 ${
                activeView === 'ats'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-[1.02]'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              ATS Optimizer
            </button>
            <button
              onClick={() => setActiveView('tierScreener')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all duration-200 ${
                activeView === 'tierScreener'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20 scale-[1.02]'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Building2 className="w-4 h-4" />
              FAANG vs. Startup
              <span className="px-1.5 py-0.5 text-[9px] uppercase font-black bg-amber-400 text-amber-950 rounded-md animate-pulse">
                New
              </span>
            </button>
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            aria-label="Toggle Dark Mode"
            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 shadow-sm transition-all hover:scale-105"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-amber-400 transition-transform rotate-0 duration-300" />
            ) : (
              <Moon className="w-5 h-5 text-slate-700 transition-transform -rotate-12 duration-300" />
            )}
          </button>
        </div>

        {/* Dynamic View with Smooth Animation */}
        <div key={activeView} className="animate-fade-in">
          {activeView === 'ats' ? (
            <>
              <header className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  ATS Resume Optimizer
                </h2>
                <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed mt-2">
                  Paste your resume and job description to get a precise ATS compatibility score with keyword matching, formatting checks, and automatic enhancement.
                </p>
              </header>

              <main>
                {!result ? (
                  <AnalysisInput onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
                ) : (
                  <AnalysisResults
                    result={result}
                    onReset={handleReset}
                    resumeText={currentResume}
                    jobDescription={currentJd}
                  />
                )}
              </main>
            </>
          ) : (
            <main>
              <TierScreenerView />
            </main>
          )}
        </div>

        {/* Get in Touch with Developer */}
        <footer className="mt-24 border-t border-slate-200 dark:border-slate-800/80 pt-12 pb-8 transition-colors">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              Get in Touch with Developer
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                Built by <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Aryan Kumar</span>
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1.5">
                Have feedback, ideas, bug reports, or want to collaborate? Feel free to reach out and connect!
              </p>
            </div>

            {/* Social Links */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <a
                href="https://www.linkedin.com/in/aryan-kumarr-5450491ba/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-500 hover:text-blue-600 dark:hover:border-blue-400 dark:hover:text-blue-400 hover:shadow-md transition-all text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                <Linkedin className="w-4 h-4 text-[#0077B5]" />
                LinkedIn
              </a>

              <a
                href="https://github.com/aryankumar06"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-900 hover:text-slate-900 dark:hover:border-slate-100 dark:hover:text-white hover:shadow-md transition-all text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                <Github className="w-4 h-4 text-slate-900 dark:text-white" />
                GitHub
              </a>

              <a
                href="https://instagram.com/aaryan_yarr"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-pink-500 hover:text-pink-600 dark:hover:border-pink-400 dark:hover:text-pink-400 hover:shadow-md transition-all text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                <Instagram className="w-4 h-4 text-[#E4405F]" />
                Instagram
              </a>

              <a
                href="mailto:workingforaryan@gmail.com"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-red-500 hover:text-red-600 dark:hover:border-red-400 dark:hover:text-red-400 hover:shadow-md transition-all text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                <Mail className="w-4 h-4 text-red-500" />
                workingforaryan@gmail.com
              </a>
            </div>

            <p className="text-xs text-slate-400 dark:text-slate-500 pt-4">
              © {new Date().getFullYear()} SuperCV • AI ATS Resume Checker & Enhancer. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
