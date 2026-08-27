import { useState, useCallback } from 'react';
import {
  FileText,
  Upload,
  Briefcase,
  AlertCircle,
  Sparkles,
  ClipboardPaste,
  FileCheck,
  Check,
  Eye,
  CheckCircle2,
  FileCode,
  Flame,
  SpellCheck,
} from 'lucide-react';
import { parseDocument, type ParsedDocumentResult } from '../utils/documentParser';
import { roastResume, type ResumeRoastResult } from '../utils/resumeRoaster';
import { ResumeRoastModal } from './ResumeRoastModal';
import { checkGrammar, type GrammarCheckResult } from '../utils/grammarChecker';
import { GrammarCheckerModal } from './GrammarCheckerModal';

interface AnalysisInputProps {
  onAnalyze: (resumeText: string, jobDescription: string) => void;
  isAnalyzing: boolean;
}

export function AnalysisInput({ onAnalyze, isAnalyzing }: AnalysisInputProps) {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [resumeMode, setResumeMode] = useState<'file' | 'text'>('file');
  const [jdMode, setJdMode] = useState<'text' | 'file'>('text');
  const [dragActiveResume, setDragActiveResume] = useState(false);
  const [dragActiveJd, setDragActiveJd] = useState(false);
  const [resumeMetadata, setResumeMetadata] = useState<ParsedDocumentResult | null>(null);
  const [jdMetadata, setJdMetadata] = useState<ParsedDocumentResult | null>(null);
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [isParsingJd, setIsParsingJd] = useState(false);
  const [showRawResumeText, setShowRawResumeText] = useState(false);
  const [error, setError] = useState('');

  // Roast Modal State
  const [roastResult, setRoastResult] = useState<ResumeRoastResult | null>(null);
  const [isRoastModalOpen, setIsRoastModalOpen] = useState(false);

  // Grammar Checker Modal State
  const [grammarResult, setGrammarResult] = useState<GrammarCheckResult | null>(null);
  const [isGrammarModalOpen, setIsGrammarModalOpen] = useState(false);

  const handleProcessFile = useCallback(async (file: File, type: 'resume' | 'jd') => {
    setError('');
    if (type === 'resume') setIsParsingResume(true);
    else setIsParsingJd(true);

    try {
      const parsed = await parseDocument(file);
      if (type === 'resume') {
        setResumeText(parsed.text);
        setResumeMetadata(parsed);
      } else {
        setJobDescription(parsed.text);
        setJdMetadata(parsed);
      }
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Error extracting text from document');
    } finally {
      if (type === 'resume') setIsParsingResume(false);
      else setIsParsingJd(false);
    }
  }, []);

  const handleDrag = useCallback((e: React.DragEvent, type: 'resume' | 'jd') => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      if (type === 'resume') setDragActiveResume(true);
      else setDragActiveJd(true);
    } else if (e.type === 'dragleave') {
      if (type === 'resume') setDragActiveResume(false);
      else setDragActiveJd(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, type: 'resume' | 'jd') => {
      e.preventDefault();
      e.stopPropagation();
      if (type === 'resume') setDragActiveResume(false);
      else setDragActiveJd(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        handleProcessFile(file, type);
      }
    },
    [handleProcessFile]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'resume' | 'jd') => {
    if (e.target.files && e.target.files[0]) {
      handleProcessFile(e.target.files[0], type);
    }
  };

  const handlePaste = async (type: 'resume' | 'jd') => {
    try {
      const text = await navigator.clipboard.readText();
      if (type === 'resume') {
        setResumeText(text);
        setResumeMetadata(null);
      } else {
        setJobDescription(text);
        setJdMetadata(null);
      }
    } catch {
      // Clipboard access denied
    }
  };

  const handleSubmit = () => {
    if (!resumeText.trim()) {
      setError('Please provide your resume content');
      return;
    }
    if (!jobDescription.trim()) {
      setError('Please provide the job description');
      return;
    }
    if (resumeText.trim().length < 50) {
      setError('Resume content is too short for meaningful analysis');
      return;
    }
    if (jobDescription.trim().length < 50) {
      setError('Job description is too short for meaningful analysis');
      return;
    }
    setError('');
    onAnalyze(resumeText.trim(), jobDescription.trim());
  };

  const handleRoast = () => {
    if (!resumeText.trim() || resumeText.trim().length < 50) {
      setError('Please upload or paste your resume before roasting');
      return;
    }
    setError('');
    const roast = roastResume(resumeText, jobDescription);
    setRoastResult(roast);
    setIsRoastModalOpen(true);
  };

  const handleCheckGrammar = () => {
    if (!resumeText.trim() || resumeText.trim().length < 50) {
      setError('Please upload or paste your resume before checking grammar');
      return;
    }
    setError('');
    const result = checkGrammar(resumeText);
    setGrammarResult(result);
    setIsGrammarModalOpen(true);
  };

  const handleApplyGrammarCorrection = (corrected: string) => {
    setResumeText(corrected);
  };

  const handleClear = () => {
    setResumeText('');
    setJobDescription('');
    setResumeMetadata(null);
    setJdMetadata(null);
    setError('');
  };

  const canSubmit = resumeText.trim().length >= 50 && jobDescription.trim().length >= 50 && !isAnalyzing;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resume Input & PDF Parsing Flow */}
        <div className="bg-white dark:bg-[#121215] rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 overflow-hidden flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center gap-3 px-5 py-4 bg-gray-50/80 dark:bg-[#18181c] border-b border-gray-100 dark:border-zinc-800">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold text-gray-800 dark:text-zinc-100">Your Resume (CV)</h3>
              <div className="ml-auto flex gap-1">
                <button
                  onClick={() => setResumeMode('file')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    resumeMode === 'file'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  Upload PDF / Word
                </button>
                <button
                  onClick={() => setResumeMode('text')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    resumeMode === 'text'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  Paste Text
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {resumeMode === 'file' ? (
                <div>
                  <div
                    className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                      dragActiveResume
                        ? 'border-blue-500 bg-blue-50/80 dark:bg-zinc-900 scale-[0.99]'
                        : 'border-gray-300 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-zinc-600 bg-gray-50/50 dark:bg-[#09090b]'
                    } ${isAnalyzing || isParsingResume ? 'opacity-50 pointer-events-none' : ''}`}
                    onDragEnter={(e) => handleDrag(e, 'resume')}
                    onDragLeave={(e) => handleDrag(e, 'resume')}
                    onDragOver={(e) => handleDrag(e, 'resume')}
                    onDrop={(e) => handleDrop(e, 'resume')}
                  >
                    <input
                      type="file"
                      id="resume-upload"
                      className="hidden"
                      accept=".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                      onChange={(e) => handleFileChange(e, 'resume')}
                      disabled={isAnalyzing || isParsingResume}
                    />
                    <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-zinc-800 flex items-center justify-center mb-3 text-blue-600 dark:text-blue-400 shadow-sm">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-zinc-200 mb-1">
                        Drop your Resume (PDF / DOCX / TXT)
                      </p>
                      <p className="text-xs text-gray-500 dark:text-zinc-400">
                        Supports PDF, Word (.docx), and Text formats (max 15MB)
                      </p>
                    </label>

                    {isParsingResume && (
                      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-blue-600 dark:text-blue-400 font-medium animate-pulse">
                        <div className="w-3.5 h-3.5 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin" />
                        Extracting PDF structure to plain text...
                      </div>
                    )}
                  </div>

                  {/* Parsed Structure Flow */}
                  {resumeMetadata && (
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-[#09090b] border border-gray-200 dark:border-zinc-800 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-xs font-bold text-gray-800 dark:text-zinc-200 truncate max-w-[200px]">
                            {resumeMetadata.fileName}
                          </span>
                          <span className="text-[10px] bg-gray-200 dark:bg-zinc-800 text-gray-800 dark:text-zinc-300 font-medium px-2 py-0.5 rounded-full uppercase border border-gray-300 dark:border-zinc-700">
                            {resumeMetadata.fileType}
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-500 dark:text-zinc-400 font-medium">
                          {resumeMetadata.pageCount ? `${resumeMetadata.pageCount} page(s) • ` : ''}
                          {resumeMetadata.wordCount} words
                        </span>
                      </div>

                      {/* Detected Sections Flow */}
                      <div className="space-y-1.5 pt-1">
                        <p className="text-[11px] font-semibold text-gray-600 dark:text-zinc-400 uppercase tracking-wider">
                          Detected CV Sections (ATS Flow):
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {resumeMetadata.detectedSections.map((sec, idx) => (
                            <span
                              key={idx}
                              className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md font-medium ${
                                sec.found
                                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80'
                                  : 'bg-gray-100 dark:bg-zinc-800/80 text-gray-400 dark:text-zinc-500 border border-gray-200 dark:border-zinc-800'
                              }`}
                            >
                              {sec.found ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : '–'}
                              {sec.name}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-gray-200 dark:border-zinc-800 flex items-center justify-between">
                        <button
                          onClick={() => setShowRawResumeText(!showRawResumeText)}
                          className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          {showRawResumeText ? 'Hide Parsed Text' : 'Review / Edit Parsed Text'}
                        </button>
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Ready for ATS Analysis
                        </span>
                      </div>

                      {showRawResumeText && (
                        <textarea
                          value={resumeText}
                          onChange={(e) => setResumeText(e.target.value)}
                          className="w-full h-44 p-2.5 text-xs text-gray-700 dark:text-zinc-200 font-mono bg-white dark:bg-[#09090b] border border-gray-300 dark:border-zinc-700 rounded-lg resize-none outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Extracted plain text..."
                        />
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500 dark:text-zinc-400">Paste your resume text below</p>
                    <button
                      onClick={() => handlePaste('resume')}
                      className="flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                    >
                      <ClipboardPaste className="w-3.5 h-3.5" />
                      Paste from clipboard
                    </button>
                  </div>
                  <textarea
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Paste your resume plain text content here..."
                    className="w-full h-64 p-3 text-sm text-gray-700 dark:text-zinc-200 bg-white dark:bg-[#09090b] border border-gray-200 dark:border-zinc-800 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    disabled={isAnalyzing}
                  />
                  <p className="text-xs text-gray-400 dark:text-zinc-500 text-right">{resumeText.length} characters</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Job Description Input */}
        <div className="bg-white dark:bg-[#121215] rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 overflow-hidden flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center gap-3 px-5 py-4 bg-gray-50/80 dark:bg-[#18181c] border-b border-gray-100 dark:border-zinc-800">
              <Briefcase className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-semibold text-gray-800 dark:text-zinc-100">Job Description</h3>
              <div className="ml-auto flex gap-1">
                <button
                  onClick={() => setJdMode('text')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    jdMode === 'text'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  Paste Text
                </button>
                <button
                  onClick={() => setJdMode('file')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    jdMode === 'file'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  Upload File
                </button>
              </div>
            </div>

            <div className="p-5">
              {jdMode === 'text' ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500 dark:text-zinc-400">Paste the job posting below</p>
                    <button
                      onClick={() => handlePaste('jd')}
                      className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                    >
                      <ClipboardPaste className="w-3.5 h-3.5" />
                      Paste from clipboard
                    </button>
                  </div>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job description here..."
                    className="w-full h-64 p-3 text-sm text-gray-700 dark:text-zinc-200 bg-white dark:bg-[#09090b] border border-gray-200 dark:border-zinc-800 rounded-lg resize-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    disabled={isAnalyzing}
                  />
                  <p className="text-xs text-gray-400 dark:text-zinc-500 text-right">{jobDescription.length} characters</p>
                </div>
              ) : (
                <div>
                  <div
                    className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                      dragActiveJd
                        ? 'border-emerald-500 bg-emerald-50/80 dark:bg-zinc-900 scale-[0.99]'
                        : 'border-gray-300 dark:border-zinc-800 hover:border-emerald-400 dark:hover:border-zinc-600 bg-gray-50/50 dark:bg-[#09090b]'
                    } ${isAnalyzing || isParsingJd ? 'opacity-50 pointer-events-none' : ''}`}
                    onDragEnter={(e) => handleDrag(e, 'jd')}
                    onDragLeave={(e) => handleDrag(e, 'jd')}
                    onDragOver={(e) => handleDrag(e, 'jd')}
                    onDrop={(e) => handleDrop(e, 'jd')}
                  >
                    <input
                      type="file"
                      id="jd-upload"
                      className="hidden"
                      accept=".pdf,.docx,.txt,.md,text/plain"
                      onChange={(e) => handleFileChange(e, 'jd')}
                      disabled={isAnalyzing || isParsingJd}
                    />
                    <label htmlFor="jd-upload" className="cursor-pointer flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-zinc-800 flex items-center justify-center mb-3 text-emerald-600 dark:text-emerald-400 shadow-sm">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-zinc-200 mb-1">
                        Drop job description file or browse
                      </p>
                      <p className="text-xs text-gray-500 dark:text-zinc-400">Supports TXT, PDF, DOCX (max 15MB)</p>
                    </label>

                    {isParsingJd && (
                      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium animate-pulse">
                        <div className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                        Extracting Job Description text...
                      </div>
                    )}
                  </div>

                  {jdMetadata && (
                    <div className="mt-4 p-3 bg-gray-50 dark:bg-[#09090b] border border-gray-200 dark:border-zinc-800 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-xs font-semibold text-gray-800 dark:text-zinc-200 truncate max-w-[200px]">
                          {jdMetadata.fileName}
                        </span>
                      </div>
                      <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                        {jdMetadata.wordCount} words extracted
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/80 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
          <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={handleClear}
          disabled={isAnalyzing}
          className="px-5 py-3 text-sm font-medium text-gray-600 dark:text-zinc-300 bg-gray-100 dark:bg-zinc-800 rounded-xl hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
        >
          Clear All
        </button>

        <button
          type="button"
          onClick={handleCheckGrammar}
          disabled={resumeText.trim().length < 50 || isAnalyzing}
          className="flex items-center gap-2 px-5 py-3 text-sm font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-zinc-850 dark:bg-[#18181c] hover:bg-indigo-100 dark:hover:bg-zinc-800 border border-indigo-200/80 dark:border-zinc-700 rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <SpellCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          Check & Fix Grammar ✨
        </button>

        <button
          type="button"
          onClick={handleRoast}
          disabled={resumeText.trim().length < 50 || isAnalyzing}
          className="flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-orange-600 via-red-600 to-rose-600 hover:from-orange-500 hover:to-rose-500 rounded-xl transition-all shadow-md hover:shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Flame className="w-4 h-4 text-amber-300 animate-pulse" />
          Roast My Resume 🔥
        </button>

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="flex items-center gap-2 px-7 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg shadow-blue-500/20"
        >
          {isAnalyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Running ATS Analysis...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Analyze ATS Compatibility
            </>
          )}
        </button>
      </div>

      {/* Resume Roast Modal */}
      <ResumeRoastModal
        roast={roastResult}
        isOpen={isRoastModalOpen}
        onClose={() => setIsRoastModalOpen(false)}
        onAutoEnhance={canSubmit ? handleSubmit : undefined}
      />

      {/* Grammar Checker Modal */}
      <GrammarCheckerModal
        result={grammarResult}
        isOpen={isGrammarModalOpen}
        onClose={() => setIsGrammarModalOpen(false)}
        onApplyCorrection={handleApplyGrammarCorrection}
      />

      <div className="text-center text-xs text-gray-500 dark:text-zinc-500 max-w-2xl mx-auto">
        <p>
          Drop your PDF or Word resume to extract plain-text, fix grammar & spelling errors, get brutally honest roast feedback, or run full ATS scoring with automatic enhancement under 70%.
        </p>
      </div>
    </div>
  );
}
