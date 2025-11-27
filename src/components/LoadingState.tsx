"use client";

import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  stage: "idle" | "scraping" | "analyzing" | "complete" | "error";
  progress?: number;
  message?: string;
}

const stages = {
  idle: { progress: 0, message: "Ready to analyze" },
  scraping: { progress: 35, message: "Scraping comments from YouTube..." },
  analyzing: { progress: 75, message: "AI is analyzing comments..." },
  complete: { progress: 100, message: "Analysis complete!" },
  error: { progress: 0, message: "An error occurred" },
};

export default function LoadingState({ stage, message }: LoadingStateProps) {
  const stageInfo = stages[stage];
  const displayMessage = message || stageInfo.message;
  const progress = stageInfo.progress;

  if (stage === "idle") return null;

  return (
    <div className="card p-8 text-center animate-fade-in">
      <div className="mb-6">
        {stage !== "complete" && stage !== "error" && (
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <Loader2 className="w-16 h-16 text-[#ff4d4d] animate-spin" />
          </div>
        )}

        {stage === "complete" && (
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#4dff9120] flex items-center justify-center">
            <svg
              className="w-8 h-8 text-[#4dff91]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        )}

        {stage === "error" && (
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#ff4d4d20] flex items-center justify-center">
            <svg
              className="w-8 h-8 text-[#ff4d4d]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        )}

        <p className="text-lg text-white font-medium">{displayMessage}</p>

        {stage !== "error" && (
          <p className="text-sm text-[#525252] mt-2">
            {stage === "scraping" && "This may take 1-3 minutes for large videos"}
            {stage === "analyzing" && "AI is extracting insights from comments"}
            {stage === "complete" && "Scroll down to see your results"}
          </p>
        )}
      </div>

      {stage !== "complete" && stage !== "error" && (
        <div className="max-w-md mx-auto">
          <div className="progress-bar">
            <div
              className="progress-bar-fill bg-gradient-to-r from-[#ff4d4d] to-[#ff6b6b]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-[#525252] mt-2">{progress}% complete</p>
        </div>
      )}

      {(stage === "scraping" || stage === "analyzing") && (
        <div className="mt-8 space-y-2">
          <div className="flex items-center justify-center gap-2 text-sm text-[#525252]">
            <span className={stage === "scraping" ? "text-[#ff4d4d]" : "text-[#4dff91]"}>
              {stage === "scraping" ? "●" : "✓"}
            </span>
            <span className={stage === "scraping" ? "text-white" : "text-[#525252]"}>
              Fetch YouTube comments
            </span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-[#525252]">
            <span className={stage === "analyzing" ? "text-[#ff4d4d]" : "text-[#525252]"}>
              {stage === "analyzing" ? "●" : "○"}
            </span>
            <span className={stage === "analyzing" ? "text-white" : "text-[#525252]"}>
              AI sentiment & insight analysis
            </span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-[#525252]">
            <span>○</span>
            <span>Generate report</span>
          </div>
        </div>
      )}
    </div>
  );
}
