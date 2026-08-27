import { useState } from 'react';
import { ScanSearch } from 'lucide-react';
import { AnalysisInput } from './components/AnalysisInput';
import { AnalysisResults } from './components/AnalysisResults';
import { analyzeResume } from './utils/atsAnalyzer';
import { supabase } from './lib/supabase';
import type { AnalysisResult } from './lib/supabase';

function App() {
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
      <div className="container mx-auto px-4 py-8">
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

        <footer className="mt-16 text-center text-sm text-gray-400">
          <p>
            Scores resumes against job descriptions using a 5-category weighted rubric.
            Results are saved for future reference.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
