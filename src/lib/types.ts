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
  // === FREE MODELS (Default) ===
  {
    id: "x-ai/grok-4.1-fast:free",
    name: "Grok 4.1 Fast (FREE)",
    description: "xAI's agentic model, 2M context - Default",
    costPer1kTokens: "FREE",
  },
  {
    id: "openai/gpt-oss-20b:free",
    name: "GPT-OSS 20B (FREE)",
    description: "Open source OpenAI model, 20B parameters",
    costPer1kTokens: "FREE",
  },
  {
    id: "z-ai/glm-4.5-air:free",
    name: "GLM-4.5 Air (FREE)",
    description: "Zhipu AI lightweight model",
    costPer1kTokens: "FREE",
  },
  // === PAID MODELS ===
  {
    id: "google/gemini-3-pro-preview",
    name: "Gemini 3 Pro Preview",
    description: "Google's latest frontier model, 1M context",
    costPer1kTokens: "$0.002 / $0.012",
  },
  {
    id: "openai/gpt-5.1",
    name: "GPT-5.1",
    description: "OpenAI's most advanced model, 400K context",
    costPer1kTokens: "$0.00125 / $0.01",
  },
  {
    id: "openai/gpt-4o-mini",
    name: "GPT-4o Mini",
    description: "Compact version of GPT-4o, cost-effective",
    costPer1kTokens: "$0.00015 / $0.0006",
  },
  {
    id: "openai/gpt-4o",
    name: "GPT-4o",
    description: "OpenAI's flagship multimodal model",
    costPer1kTokens: "$0.003 / $0.012",
  },
  {
    id: "openai/gpt-oss-120b:exacto",
    name: "GPT-OSS 120B Exacto",
    description: "Large open source model, 120B parameters",
    costPer1kTokens: "Varies",
  },
  {
    id: "anthropic/claude-haiku-4.5",
    name: "Claude Haiku 4.5",
    description: "Fastest Claude model, low latency",
    costPer1kTokens: "$0.0003 / $0.0015",
  },
  {
    id: "anthropic/claude-opus-4.5",
    name: "Claude Opus 4.5",
    description: "Most capable Claude model for complex tasks",
    costPer1kTokens: "$0.000005 / $0.000025",
  },
  {
    id: "anthropic/claude-sonnet-4.5",
    name: "Claude Sonnet 4.5",
    description: "Balanced performance and speed",
    costPer1kTokens: "$0.000003 / $0.000015",
  },
  {
    id: "anthropic/claude-sonnet-4",
    name: "Claude Sonnet 4",
    description: "Previous generation, excellent reasoning",
    costPer1kTokens: "$0.003 / $0.015",
  },
  {
    id: "x-ai/grok-4",
    name: "Grok 4",
    description: "xAI's flagship reasoning model",
    costPer1kTokens: "Varies",
  },
  {
    id: "x-ai/grok-3-mini",
    name: "Grok 3 Mini",
    description: "Compact version of Grok 3",
    costPer1kTokens: "Varies",
  },
  {
    id: "x-ai/grok-4-fast",
    name: "Grok 4 Fast",
    description: "Optimized for speed and efficiency",
    costPer1kTokens: "Varies",
  },
  {
    id: "z-ai/glm-4.6",
    name: "GLM-4.6",
    description: "Latest Zhipu AI model",
    costPer1kTokens: "Varies",
  },
  {
    id: "z-ai/glm-4.5",
    name: "GLM-4.5",
    description: "Zhipu AI general purpose model",
    costPer1kTokens: "Varies",
  },
  {
    id: "google/gemini-2.5-pro-preview-06-05",
    name: "Gemini 2.5 Pro",
    description: "High quality Google model",
    costPer1kTokens: "$0.003 / $0.015",
  },
  {
    id: "google/gemini-2.5-flash-preview-05-20",
    name: "Gemini 2.5 Flash",
    description: "Fast & cost-effective Google model",
    costPer1kTokens: "$0.0003 / $0.001",
  },
];
