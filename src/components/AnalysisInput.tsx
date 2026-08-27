import { useState } from 'react';
import { FileText, Briefcase, Upload, Sparkles, ClipboardPaste } from 'lucide-react';

interface AnalysisInputProps {
  onAnalyze: (resumeText: string, jobDescription: string) => void;
  isAnalyzing: boolean;
}

type InputMode = 'text' | 'file';

export function AnalysisInput({ onAnalyze, isAnalyzing }: AnalysisInputProps) {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [resumeMode, setResumeMode] = useState<InputMode>('text');
  const [jdMode, setJdMode] = useState<InputMode>('text');
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (file: File, target: 'resume' | 'jd') => {
    setError('');

    if (!file.type.includes('text') && !file.name.endsWith('.txt')) {
      setError('Please upload a plain text file (.txt)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    try {
      const content = await file.text();
      if (content.trim().length === 0) {
        setError('File is empty');
        return;
      }
      if (target === 'resume') {
        setResumeText(content);
      } else {
        setJobDescription(content);
      }
    } catch {
      setError('Error reading file');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent, target: 'resume' | 'jd') => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0], target);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, target: 'resume' | 'jd') => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0], target);
    }
  };

  const handlePaste = async (target: 'resume' | 'jd') => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim().length === 0) {
        setError('Clipboard is empty');
        return;
      }
      if (target === 'resume') {
        setResumeText(text);
      } else {
        setJobDescription(text);
      }
    } catch {
      setError('Unable to read clipboard — please paste manually');
    }
  };

  const handleSubmit = () => {
    setError('');

    if (resumeText.trim().length < 50) {
      setError('Please provide your resume (at least 50 characters)');
      return;
    }
    if (jobDescription.trim().length < 50) {
      setError('Please provide the job description (at least 50 characters)');
      return;
    }

    onAnalyze(resumeText, jobDescription);
  };

  const handleClear = () => {
    setResumeText('');
    setJobDescription('');
    setError('');
  };

  const canSubmit = resumeText.trim().length >= 50 && jobDescription.trim().length >= 50 && !isAnalyzing;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resume Input */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-blue-50 to-blue-50/50 border-b border-gray-100">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-800">Your Resume</h3>
            <div className="ml-auto flex gap-1">
              <button
                onClick={() => setResumeMode('text')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  resumeMode === 'text'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Paste
              </button>
              <button
                onClick={() => setResumeMode('file')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  resumeMode === 'file'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Upload
              </button>
            </div>
          </div>

          <div className="p-5">
            {resumeMode === 'text' ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">Paste your resume text below</p>
                  <button
                    onClick={() => handlePaste('resume')}
                    className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <ClipboardPaste className="w-3.5 h-3.5" />
                    Paste from clipboard
                  </button>
                </div>
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your resume content here..."
                  className="w-full h-64 p-3 text-sm text-gray-700 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  disabled={isAnalyzing}
                />
                <p className="text-xs text-gray-400 text-right">{resumeText.length} characters</p>
              </div>
            ) : (
              <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                  dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                } ${isAnalyzing ? 'opacity-50 pointer-events-none' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={(e) => handleDrop(e, 'resume')}
              >
                <input
                  type="file"
                  id="resume-upload"
                  className="hidden"
                  accept=".txt,text/plain"
                  onChange={(e) => handleFileChange(e, 'resume')}
                  disabled={isAnalyzing}
                />
                <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center">
                  <Upload className="w-12 h-12 text-gray-400 mb-3" />
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Drop resume or click to browse
                  </p>
                  <p className="text-xs text-gray-500">Plain text (.txt), max 5MB</p>
                </label>
                {resumeText && (
                  <p className="mt-3 text-xs text-green-600 font-medium">
                    Loaded {resumeText.length} characters
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Job Description Input */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-emerald-50 to-emerald-50/50 border-b border-gray-100">
            <Briefcase className="w-5 h-5 text-emerald-600" />
            <h3 className="font-semibold text-gray-800">Job Description</h3>
            <div className="ml-auto flex gap-1">
              <button
                onClick={() => setJdMode('text')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  jdMode === 'text'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Paste
              </button>
              <button
                onClick={() => setJdMode('file')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  jdMode === 'file'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Upload
              </button>
            </div>
          </div>

          <div className="p-5">
            {jdMode === 'text' ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">Paste the job posting below</p>
                  <button
                    onClick={() => handlePaste('jd')}
                    className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    <ClipboardPaste className="w-3.5 h-3.5" />
                    Paste from clipboard
                  </button>
                </div>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here..."
                  className="w-full h-64 p-3 text-sm text-gray-700 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  disabled={isAnalyzing}
                />
                <p className="text-xs text-gray-400 text-right">{jobDescription.length} characters</p>
              </div>
            ) : (
              <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                  dragActive ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 hover:border-gray-400'
                } ${isAnalyzing ? 'opacity-50 pointer-events-none' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={(e) => handleDrop(e, 'jd')}
              >
                <input
                  type="file"
                  id="jd-upload"
                  className="hidden"
                  accept=".txt,text/plain"
                  onChange={(e) => handleFileChange(e, 'jd')}
                  disabled={isAnalyzing}
                />
                <label htmlFor="jd-upload" className="cursor-pointer flex flex-col items-center">
                  <Upload className="w-12 h-12 text-gray-400 mb-3" />
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Drop job description or click to browse
                  </p>
                  <p className="text-xs text-gray-500">Plain text (.txt), max 5MB</p>
                </label>
                {jobDescription && (
                  <p className="mt-3 text-xs text-green-600 font-medium">
                    Loaded {jobDescription.length} characters
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="flex items-center justify-center gap-4">
        <button
          onClick={handleClear}
          disabled={isAnalyzing}
          className="px-6 py-3 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          Clear
        </button>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="flex items-center gap-2 px-8 py-3 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
        >
          {isAnalyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Analyze Resume
            </>
          )}
        </button>
      </div>

      <div className="text-center text-sm text-gray-500 max-w-2xl mx-auto">
        <p>
          Paste your resume and the target job description, then click Analyze. The tool scores
          your resume against the job posting using a 5-category ATS rubric and automatically
          enhances it if the score is below 70%.
        </p>
      </div>
    </div>
  );
}
