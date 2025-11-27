export interface Comment {
  text: string;
  author: string;
  likes: number;
  publishedAt: string;
  replyCount: number;
}

export interface SentimentBreakdown {
  positive: number;
  negative: number;
  neutral: number;
}

export interface InsightItem {
  text: string;
  frequency?: number;
  examples?: string[];
  engagement_score?: number;
}

export interface AnalysisResult {
  video_info: {
    title: string;
    channel: string;
    url: string;
    total_comments_analyzed: number;
    analysis_timestamp: string;
  };
  sentiment_analysis: {
    breakdown: SentimentBreakdown;
    overall_tone: string;
    sentiment_drivers: {
      positive_drivers: string[];
      negative_drivers: string[];
    };
  };
  knowledge_gaps: InsightItem[];
  demand_signals: InsightItem[];
  myths_and_misconceptions: InsightItem[];
  pain_points: InsightItem[];
  likes_and_resonance: {
    what_resonated: InsightItem[];
    what_fell_flat: InsightItem[];
  };
  top_comments: {
    most_liked: Comment[];
    most_discussed: Comment[];
  };
  actionable_recommendations: string[];
}

export interface ScrapeResponse {
  success: boolean;
  comments: Comment[];
  videoInfo: {
    title: string;
    channel: string;
    url: string;
  };
  totalComments: number;
  error?: string;
}

export interface AnalyzeResponse {
  success: boolean;
  analysis: AnalysisResult;
  model_used: string;
  tokens_used?: {
    input: number;
    output: number;
  };
  error?: string;
}

export type ModelOption = {
  id: string;
  name: string;
  description: string;
  costPer1kTokens: string;
};

export const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: "google/gemini-2.5-pro-preview-06-05",
    name: "Gemini 2.5 Pro",
    description: "Best quality, most thorough analysis",
    costPer1kTokens: "$0.003 / $0.015",
  },
  {
    id: "google/gemini-2.5-flash-preview-05-20",
    name: "Gemini 2.5 Flash",
    description: "Fast & cost-effective",
    costPer1kTokens: "$0.0003 / $0.001",
  },
  {
    id: "anthropic/claude-sonnet-4",
    name: "Claude Sonnet 4",
    description: "Excellent reasoning & nuance",
    costPer1kTokens: "$0.003 / $0.015",
  },
  {
    id: "openai/gpt-4o",
    name: "GPT-4o",
    description: "OpenAI's flagship model",
    costPer1kTokens: "$0.003 / $0.012",
  },
];
