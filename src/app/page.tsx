"use client";

import { useState } from "react";
import { Search, ShieldAlert, Activity, GitBranch } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function Home() {
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl) return;

    setLoading(true);
    setReport(null);
    setError(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl }),
      });

      const data = await res.json();

      if (!data.success) throw new Error(data.error);
      setReport(data.analysis);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col min-h-screen bg-slate-950 text-slate-200 font-sans">
      <div className="flex-grow max-w-4xl mx-auto px-6 py-20">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center items-center gap-3 mb-4 text-indigo-400">
            <Activity size={40} />
            <h1 className="text-5xl font-extrabold tracking-tight text-white">ArchLens</h1>
          </div>
          <p className="text-lg text-slate-400 max-w-xl mx-auto">
            AI-powered repository architecture and tech-debt analyzer. 
            Paste a GitHub URL to get an instant DevSecOps code review.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleAnalyze} className="relative max-w-2xl mx-auto mb-12">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <GitBranch className="h-5 w-5 text-slate-500" />
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-32 py-4 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              placeholder="owner/repository-name"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute inset-y-2 right-2 flex items-center gap-2 px-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="animate-pulse">Scanning...</span>
              ) : (
                <>
                  <Search size={18} />
                  Analyze
                </>
              )}
            </button>
          </div>
          <p className="mt-3 text-center text-xs text-slate-500/80 tracking-wide">
            Note: Currently only supports <span className="text-slate-400 font-medium">public</span> GitHub repositories.
          </p>
        </form>

        {/* Error Message */}
        {error && (
          <div className="p-4 mb-8 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-3">
            <ShieldAlert className="shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Report Results */}
        {report && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2 border-b border-slate-800 pb-4">
              <Activity className="text-indigo-400" /> Vibe Check Report
            </h2>
            <div className="prose prose-invert prose-indigo max-w-none">
              <ReactMarkdown>{report}</ReactMarkdown>
            </div>
          </div>
        )}

      </div>
    {/* Footer */}
        <footer className="mt-20 border-t border-slate-800/50 pt-8 pb-12 text-center text-slate-500 text-sm">
          <p className="mb-4">
            Built with ⚡️ by <a href="https://github.com/niklasr-c" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 transition-colors">Niklas</a>.
          </p>
          <div className="flex justify-center items-center gap-6 mb-4">
            <a href="mailto:archlens@mail.de?subject=Feedback ArchLens" className="hover:text-white transition-colors">
              Feedback 
            </a>
            <span className="text-slate-700">•</span>
            <a href="https://github.com/niklasr-c/archlens" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              Source Code
            </a>
          </div>
          <p className="text-xs text-slate-600 mb-2">
            <p className="text-xs text-slate-600 mb-2">
             This is a non-commercial open-source project.
            </p>  
          </p>
        </footer>
    </main>
  );
}