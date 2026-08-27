import { useState } from 'react';
import { ScanSearch, Github, Linkedin, Instagram, Mail, Heart, Building2, FileCheck } from 'lucide-react';
import { AnalysisInput } from './components/AnalysisInput';
import { AnalysisResults } from './components/AnalysisResults';
import { TierScreenerView } from './components/TierScreenerView';
import { analyzeResume } from './utils/atsAnalyzer';
import { supabase } from './lib/supabase';
import type { AnalysisResult } from './lib/supabase';

function App() {
  const [activeView, setActiveView] = useState<'ats' | 'tierScreener'>('ats');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [currentResume, setCurrentResume] = useState('');
  const [currentJd, setCurrentJd] = useState('');

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-blue-50/30">
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Main Navigation Bar */}
        <div className="flex items-center justify-center mb-8">
          <div className="inline-flex items-center p-1.5 rounded-2xl bg-white border border-gray-200 shadow-sm gap-1">
            <button
              onClick={() => setActiveView('ats')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all ${
                activeView === 'ats'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              ATS Resume Optimizer
            </button>
            <button
              onClick={() => setActiveView('tierScreener')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all ${
                activeView === 'tierScreener'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Building2 className="w-4 h-4" />
              FAANG vs. Startup Screener
              <span className="px-1.5 py-0.5 text-[10px] uppercase font-black bg-amber-400 text-amber-950 rounded-md">
                New
              </span>
            </button>
          </div>
        </div>

        {activeView === 'ats' ? (
          <>
            <header className="text-center mb-12">
              <div className="flex items-center justify-center mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                    <ScanSearch className="w-7 h-7 text-white" />
                  </div>
                  <h1 className="text-4xl font-bold text-gray-800 tracking-tight">
                    ATS Resume Optimizer
                  </h1>
                </div>
              </div>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Paste your resume and a job description to get a precise ATS compatibility
                score with keyword matching, formatting checks, and automatic enhancement.
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

        {/* Get in Touch with Developer */}
        <footer className="mt-20 border-t border-gray-200/80 pt-12 pb-8">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              Get in Touch with Developer
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-800">
                Built by <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Aryan Kumar</span>
              </h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto mt-1.5">
                Have feedback, ideas, bug reports, or want to collaborate? Feel free to reach out and connect!
              </p>
            </div>

            {/* Social Links */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <a
                href="https://www.linkedin.com/in/aryan-kumarr-5450491ba/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 shadow-sm hover:border-blue-500 hover:text-blue-600 hover:shadow-md transition-all text-xs font-semibold text-gray-700"
              >
                <Linkedin className="w-4 h-4 text-[#0077B5]" />
                LinkedIn
              </a>

              <a
                href="https://github.com/aryankumar06"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 shadow-sm hover:border-gray-900 hover:text-gray-900 hover:shadow-md transition-all text-xs font-semibold text-gray-700"
              >
                <Github className="w-4 h-4 text-gray-900" />
                GitHub
              </a>

              <a
                href="https://instagram.com/aaryan_yarr"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 shadow-sm hover:border-pink-500 hover:text-pink-600 hover:shadow-md transition-all text-xs font-semibold text-gray-700"
              >
                <Instagram className="w-4 h-4 text-[#E4405F]" />
                Instagram
              </a>

              <a
                href="mailto:workingforaryan@gmail.com"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 shadow-sm hover:border-red-500 hover:text-red-600 hover:shadow-md transition-all text-xs font-semibold text-gray-700"
              >
                <Mail className="w-4 h-4 text-red-500" />
                workingforaryan@gmail.com
              </a>
            </div>

            <p className="text-xs text-gray-400 pt-4">
              © {new Date().getFullYear()} SuperCV • AI ATS Resume Checker & Enhancer. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
