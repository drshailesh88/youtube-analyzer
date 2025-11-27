"use client";

import { useState } from "react";
import { Youtube, Sparkles, ChevronDown, AlertCircle } from "lucide-react";
import {
  AnalysisResult,
  ScrapeResponse,
  AnalyzeResponse,
  AVAILABLE_MODELS,
} from "@/lib/types";
import LoadingState from "@/components/LoadingState";
import ResultsDisplay from "@/components/ResultsDisplay";
import HistoryPanel from "@/components/HistoryPanel";

type Stage = "idle" | "scraping" | "analyzing" | "complete" | "error";

export default function Home() {
  const [videoUrl, setVideoUrl] = useState("");
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0].id);
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [modelUsed, setModelUsed] = useState("");
  const [tokensUsed, setTokensUsed] = useState<{ input: number; output: number } | undefined>();
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const handleAnalyze = async () => {
    if (!videoUrl.trim()) {
      setError("Please enter a YouTube URL");
      return;
    }

    setError(null);
    setAnalysis(null);
    setStage("scraping");

    try {
      // Step 1: Scrape comments
      const scrapeResponse = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl }),
      });

      const scrapeData: ScrapeResponse = await scrapeResponse.json();

      if (!scrapeData.success) {
        throw new Error(scrapeData.error || "Failed to scrape comments");
      }

      if (scrapeData.comments.length === 0) {
        throw new Error("No comments found on this video");
      }

      // Step 2: Analyze comments
      setStage("analyzing");

      const analyzeResponse = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comments: scrapeData.comments,
          videoInfo: scrapeData.videoInfo,
          model: selectedModel,
        }),
      });

      const analyzeData: AnalyzeResponse = await analyzeResponse.json();

      if (!analyzeData.success) {
        throw new Error(analyzeData.error || "Failed to analyze comments");
      }

      setAnalysis(analyzeData.analysis);
      setModelUsed(analyzeData.model_used);
      setTokensUsed(analyzeData.tokens_used);
      setStage("complete");

      // Save to Firebase
      await saveToHistory(
        scrapeData.videoInfo,
        analyzeData.analysis,
        analyzeData.model_used,
        scrapeData.totalComments,
        analyzeData.tokens_used
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setStage("error");
    }
  };

  const saveToHistory = async (
    videoInfo: { title: string; channel: string; url: string },
    analysis: AnalysisResult,
    model: string,
    totalComments: number,
    tokens?: { input: number; output: number }
  ) => {
    try {
      // Extract video ID from URL
      const videoId = extractVideoId(videoInfo.url);

      const response = await fetch('/api/history/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId,
          videoTitle: videoInfo.title,
          videoChannel: videoInfo.channel,
          videoUrl: videoInfo.url,
          modelUsed: model,
          totalComments,
          analysis,
          tokensUsed: tokens,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setCurrentAnalysisId(data.id);
      }
    } catch (error) {
      console.error('Failed to save to history:', error);
      // Don't show error to user - saving to history is optional
    }
  };

  const extractVideoId = (url: string): string => {
    const match = url.match(/[?&]v=([^&]+)/);
    return match ? match[1] : url;
  };

  const handleLoadFromHistory = async (id: string) => {
    try {
      setLoadingHistory(true);
      setError(null);

      const response = await fetch(`/api/history/${id}`);
      const data = await response.json();

      if (data.success) {
        setAnalysis(data.analysis.analysis);
        setModelUsed(data.analysis.modelUsed);
        setTokensUsed(data.analysis.tokensUsed);
        setVideoUrl(data.analysis.videoUrl);
        setCurrentAnalysisId(id);
        setStage("complete");
      } else {
        setError('Failed to load analysis from history');
      }
    } catch (error) {
      setError('Failed to load analysis from history');
      console.error('Error loading from history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleReset = () => {
    setVideoUrl("");
    setStage("idle");
    setError(null);
    setAnalysis(null);
  };

  const selectedModelInfo = AVAILABLE_MODELS.find((m) => m.id === selectedModel);

  return (
    <main className="min-h-screen relative">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#0d0d0d] via-[#171717] to-[#0d0d0d] -z-10" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#ff4d4d] opacity-[0.03] blur-[150px] rounded-full -z-10" />

      {/* History Panel */}
      <HistoryPanel
        onSelectAnalysis={handleLoadFromHistory}
        isLoading={loadingHistory}
      />

      <div className="max-w-6xl mx-auto px-4 py-12 lg:pr-[340px]">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#ff4d4d10] border border-[#ff4d4d30] rounded-full mb-6">
            <Sparkles size={14} className="text-[#ff4d4d]" />
            <span className="text-sm text-[#ff4d4d]">AI-Powered Analysis</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 font-display tracking-tight">
            YouTube Comment
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff4d4d] to-[#ff8080]">
              Analyzer
            </span>
          </h1>

          <p className="text-lg text-[#a3a3a3] max-w-2xl mx-auto">
            Uncover audience insights from YouTube comments. Analyze sentiments,
            knowledge gaps, demand signals, myths, and pain points.
          </p>
        </header>

        {/* Input Section */}
        <div className="card p-6 md:p-8 mb-8 max-w-3xl mx-auto">
          <div className="space-y-4">
            {/* URL Input */}
            <div>
              <label className="block text-sm text-[#a3a3a3] mb-2">
                YouTube Video URL
              </label>
              <div className="relative">
                <Youtube
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#525252]"
                />
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="input-dark w-full pl-12 pr-4 py-4 rounded-xl text-base"
                  disabled={stage !== "idle" && stage !== "error" && stage !== "complete"}
                />
              </div>
            </div>

            {/* Model Selection */}
            <div>
              <label className="block text-sm text-[#a3a3a3] mb-2">
                AI Model
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowModelDropdown(!showModelDropdown)}
                  className="input-dark w-full px-4 py-4 rounded-xl text-left flex items-center justify-between"
                  disabled={stage !== "idle" && stage !== "error" && stage !== "complete"}
                >
                  <div>
                    <span className="text-white">{selectedModelInfo?.name}</span>
                    <span className="text-[#525252] text-sm ml-2">
                      — {selectedModelInfo?.description}
                    </span>
                  </div>
                  <ChevronDown
                    size={20}
                    className={`text-[#525252] transition-transform ${
                      showModelDropdown ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showModelDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-[#1f1f1f] border border-[#262626] rounded-xl overflow-hidden z-10 shadow-xl">
                    {AVAILABLE_MODELS.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => {
                          setSelectedModel(model.id);
                          setShowModelDropdown(false);
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-[#262626] transition-colors ${
                          selectedModel === model.id ? "bg-[#262626]" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-white font-medium">
                              {model.name}
                            </span>
                            <p className="text-sm text-[#525252]">
                              {model.description}
                            </p>
                          </div>
                          <span className="text-xs text-[#525252] font-mono">
                            {model.costPer1kTokens}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="flex items-start gap-3 p-4 bg-[#ff4d4d10] border border-[#ff4d4d30] rounded-xl">
                <AlertCircle size={20} className="text-[#ff4d4d] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[#ff4d4d] font-medium">Error</p>
                  <p className="text-sm text-[#a3a3a3]">{error}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleAnalyze}
                disabled={stage === "scraping" || stage === "analyzing"}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {stage === "scraping" || stage === "analyzing" ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Analyze Comments
                  </>
                )}
              </button>

              {(stage === "complete" || stage === "error") && (
                <button
                  onClick={handleReset}
                  className="px-6 py-3 bg-[#1f1f1f] hover:bg-[#262626] border border-[#262626] rounded-xl text-[#a3a3a3] transition-colors"
                >
                  New Analysis
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {(stage === "scraping" || stage === "analyzing") && (
          <div className="max-w-3xl mx-auto mb-8">
            <LoadingState stage={stage} />
          </div>
        )}

        {/* Results */}
        {analysis && stage === "complete" && (
          <ResultsDisplay
            analysis={analysis}
            modelUsed={modelUsed}
            tokensUsed={tokensUsed}
          />
        )}

        {/* Footer */}
        <footer className="text-center mt-16 pt-8 border-t border-[#262626]">
          <p className="text-sm text-[#525252]">
            Built with Next.js • Powered by OpenRouter & Apify
          </p>
        </footer>
      </div>
    </main>
  );
}
