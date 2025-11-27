"use client";

import {
  HelpCircle,
  Lightbulb,
  AlertTriangle,
  Frown,
  ThumbsUp,
  ThumbsDown,
  Download,
  ExternalLink,
  Zap,
  MessageSquare,
  Heart,
} from "lucide-react";
import { AnalysisResult } from "@/lib/types";
import SentimentChart from "./SentimentChart";
import InsightCard from "./InsightCard";

interface ResultsDisplayProps {
  analysis: AnalysisResult;
  modelUsed: string;
  tokensUsed?: { input: number; output: number };
}

export default function ResultsDisplay({
  analysis,
  modelUsed,
  tokensUsed,
}: ResultsDisplayProps) {
  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(analysis, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `youtube-analysis-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const rows: string[][] = [
      ["Category", "Insight", "Frequency", "Examples"],
    ];

    const addInsights = (category: string, items: any[]) => {
      items.forEach((item) => {
        rows.push([
          category,
          item.text,
          item.frequency?.toString() || "",
          item.examples?.join(" | ") || "",
        ]);
      });
    };

    addInsights("Knowledge Gaps", analysis.knowledge_gaps);
    addInsights("Demand Signals", analysis.demand_signals);
    addInsights("Myths & Misconceptions", analysis.myths_and_misconceptions);
    addInsights("Pain Points", analysis.pain_points);
    addInsights("What Resonated", analysis.likes_and_resonance.what_resonated);
    addInsights("What Fell Flat", analysis.likes_and_resonance.what_fell_flat);

    const csvContent = rows
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `youtube-analysis-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="card p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 font-display">
              {analysis.video_info.title}
            </h2>
            <p className="text-[#a3a3a3]">
              by {analysis.video_info.channel} •{" "}
              {analysis.video_info.total_comments_analyzed.toLocaleString()} comments analyzed
            </p>
            <div className="flex items-center gap-4 mt-3">
              <a
                href={analysis.video_info.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#ff4d4d] hover:text-[#ff6b6b] flex items-center gap-1 transition-colors"
              >
                <ExternalLink size={14} />
                View on YouTube
              </a>
              <span className="text-xs text-[#525252]">
                Model: {modelUsed.split("/")[1]}
              </span>
              {tokensUsed && (
                <span className="text-xs text-[#525252]">
                  Tokens: {(tokensUsed.input + tokensUsed.output).toLocaleString()}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExportJSON}
              className="px-4 py-2 bg-[#1f1f1f] hover:bg-[#262626] border border-[#262626] rounded-lg text-sm text-[#a3a3a3] flex items-center gap-2 transition-colors"
            >
              <Download size={14} />
              JSON
            </button>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-[#1f1f1f] hover:bg-[#262626] border border-[#262626] rounded-lg text-sm text-[#a3a3a3] flex items-center gap-2 transition-colors"
            >
              <Download size={14} />
              CSV
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Sentiment Chart */}
        <div className="stat-card">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#4dff91]"></span>
            Sentiment Breakdown
          </h3>
          <SentimentChart breakdown={analysis.sentiment_analysis.breakdown} />
          <p className="text-sm text-[#a3a3a3] mt-4 text-center">
            {analysis.sentiment_analysis.overall_tone}
          </p>
        </div>

        {/* Positive Drivers */}
        <div className="stat-card">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <ThumbsUp size={18} className="text-[#4dff91]" />
            What's Driving Positivity
          </h3>
          <ul className="space-y-2">
            {analysis.sentiment_analysis.sentiment_drivers.positive_drivers
              .slice(0, 5)
              .map((driver, i) => (
                <li
                  key={i}
                  className="text-sm text-[#a3a3a3] flex items-start gap-2"
                >
                  <span className="text-[#4dff91] mt-1">•</span>
                  {driver}
                </li>
              ))}
            {analysis.sentiment_analysis.sentiment_drivers.positive_drivers.length === 0 && (
              <li className="text-sm text-[#525252] italic">No positive drivers identified</li>
            )}
          </ul>
        </div>

        {/* Negative Drivers */}
        <div className="stat-card">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <ThumbsDown size={18} className="text-[#ff4d4d]" />
            What's Causing Criticism
          </h3>
          <ul className="space-y-2">
            {analysis.sentiment_analysis.sentiment_drivers.negative_drivers
              .slice(0, 5)
              .map((driver, i) => (
                <li
                  key={i}
                  className="text-sm text-[#a3a3a3] flex items-start gap-2"
                >
                  <span className="text-[#ff4d4d] mt-1">•</span>
                  {driver}
                </li>
              ))}
            {analysis.sentiment_analysis.sentiment_drivers.negative_drivers.length === 0 && (
              <li className="text-sm text-[#525252] italic">No negative drivers identified</li>
            )}
          </ul>
        </div>
      </div>

      {/* Actionable Recommendations */}
      {analysis.actionable_recommendations.length > 0 && (
        <div className="card p-6 mb-8 border-l-4 border-l-[#ff4d4d]">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Zap size={18} className="text-[#ff4d4d]" />
            Actionable Recommendations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {analysis.actionable_recommendations.map((rec, i) => (
              <div
                key={i}
                className="bg-[#1f1f1f] rounded-lg p-4 border border-[#262626]"
              >
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#ff4d4d20] text-[#ff4d4d] text-xs flex items-center justify-center font-semibold">
                    {i + 1}
                  </span>
                  <p className="text-sm text-[#a3a3a3]">{rec}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insight Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <InsightCard
          title="Knowledge Gaps"
          icon={<HelpCircle size={20} />}
          iconColor="#457b9d"
          items={analysis.knowledge_gaps}
          emptyMessage="Viewers seem to understand the content well"
        />

        <InsightCard
          title="Demand Signals"
          icon={<Lightbulb size={20} />}
          iconColor="#e9c46a"
          items={analysis.demand_signals}
          emptyMessage="No specific content requests detected"
        />

        <InsightCard
          title="Myths & Misconceptions"
          icon={<AlertTriangle size={20} />}
          iconColor="#e76f51"
          items={analysis.myths_and_misconceptions}
          emptyMessage="No significant misconceptions found"
        />

        <InsightCard
          title="Pain Points"
          icon={<Frown size={20} />}
          iconColor="#9b59b6"
          items={analysis.pain_points}
          emptyMessage="No major pain points expressed"
        />

        <InsightCard
          title="What Resonated"
          icon={<Heart size={20} />}
          iconColor="#4dff91"
          items={analysis.likes_and_resonance.what_resonated}
          emptyMessage="Analyzing what worked well..."
        />

        <InsightCard
          title="What Fell Flat"
          icon={<ThumbsDown size={20} />}
          iconColor="#ff4d4d"
          items={analysis.likes_and_resonance.what_fell_flat}
          emptyMessage="No significant criticisms found"
        />
      </div>

      {/* Top Comments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Heart size={18} className="text-[#ff4d4d]" />
            Most Liked Comments
          </h3>
          <div className="space-y-3">
            {analysis.top_comments.most_liked.slice(0, 5).map((comment, i) => (
              <div
                key={i}
                className="bg-[#1f1f1f] rounded-lg p-4 border border-[#262626]"
              >
                <p className="text-sm text-[#fafafa] mb-2">{comment.text}</p>
                <div className="flex items-center gap-3 text-xs text-[#525252]">
                  <span className="flex items-center gap-1">
                    <Heart size={12} className="text-[#ff4d4d]" />
                    {comment.likes.toLocaleString()}
                  </span>
                  <span>by {comment.author}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <MessageSquare size={18} className="text-[#457b9d]" />
            Most Discussed Comments
          </h3>
          <div className="space-y-3">
            {analysis.top_comments.most_discussed.slice(0, 5).map((comment, i) => (
              <div
                key={i}
                className="bg-[#1f1f1f] rounded-lg p-4 border border-[#262626]"
              >
                <p className="text-sm text-[#fafafa] mb-2">{comment.text}</p>
                <div className="flex items-center gap-3 text-xs text-[#525252]">
                  <span className="flex items-center gap-1">
                    <MessageSquare size={12} className="text-[#457b9d]" />
                    {comment.replyCount} replies
                  </span>
                  <span>by {comment.author}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
