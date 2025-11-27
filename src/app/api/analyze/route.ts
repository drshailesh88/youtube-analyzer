import { NextRequest, NextResponse } from "next/server";
import { Comment, AnalysisResult, AnalyzeResponse } from "@/lib/types";
import { ANALYSIS_SYSTEM_PROMPT, ANALYSIS_USER_PROMPT } from "@/lib/prompts";

export const maxDuration = 120; // Allow up to 2 minutes for analysis

export async function POST(request: NextRequest) {
  try {
    const { comments, videoInfo, model } = await request.json();

    if (!comments || !Array.isArray(comments) || comments.length === 0) {
      return NextResponse.json(
        { success: false, error: "Comments are required" },
        { status: 400 }
      );
    }

    const openrouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openrouterApiKey) {
      return NextResponse.json(
        { success: false, error: "OPENROUTER_API_KEY not configured" },
        { status: 500 }
      );
    }

    const selectedModel = model || process.env.DEFAULT_MODEL || "google/gemini-2.5-pro-preview-06-05";

    // Prepare comments for analysis
    // Sort by likes to prioritize high-engagement comments
    const sortedComments = [...comments].sort(
      (a: Comment, b: Comment) => b.likes - a.likes
    );

    // Format comments with metadata
    const formattedComments = sortedComments
      .slice(0, 1500) // Limit to avoid token limits
      .map(
        (c: Comment, i: number) =>
          `[${i + 1}] (${c.likes} likes) ${c.author}: ${c.text}`
      )
      .join("\n\n");

    const userPrompt = ANALYSIS_USER_PROMPT(
      videoInfo.title,
      videoInfo.channel,
      comments.length,
      formattedComments
    );

    console.log(`Analyzing ${comments.length} comments with ${selectedModel}`);

    // Call OpenRouter API
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openrouterApiKey}`,
        "HTTP-Referer": process.env.VERCEL_URL || "http://localhost:3000",
        "X-Title": "YouTube Comment Analyzer",
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          { role: "system", content: ANALYSIS_SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3, // Lower temperature for more consistent analysis
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter error:", errorText);
      return NextResponse.json(
        { success: false, error: "AI analysis failed. Please try again." },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { success: false, error: "No analysis generated" },
        { status: 500 }
      );
    }

    // Parse the JSON response
    let analysis: Partial<AnalysisResult>;
    try {
      // Clean up potential markdown code blocks
      const cleanedContent = content
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      analysis = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      return NextResponse.json(
        { success: false, error: "Failed to parse analysis results" },
        { status: 500 }
      );
    }

    // Find top comments by likes and replies
    const topByLikes = sortedComments.slice(0, 5);
    const topByReplies = [...comments]
      .sort((a: Comment, b: Comment) => b.replyCount - a.replyCount)
      .slice(0, 5);

    // Construct full analysis result
    const fullAnalysis: AnalysisResult = {
      video_info: {
        title: videoInfo.title,
        channel: videoInfo.channel,
        url: videoInfo.url,
        total_comments_analyzed: comments.length,
        analysis_timestamp: new Date().toISOString(),
      },
      sentiment_analysis: analysis.sentiment_analysis || {
        breakdown: { positive: 33, negative: 33, neutral: 34 },
        overall_tone: "Mixed",
        sentiment_drivers: { positive_drivers: [], negative_drivers: [] },
      },
      knowledge_gaps: analysis.knowledge_gaps || [],
      demand_signals: analysis.demand_signals || [],
      myths_and_misconceptions: analysis.myths_and_misconceptions || [],
      pain_points: analysis.pain_points || [],
      likes_and_resonance: analysis.likes_and_resonance || {
        what_resonated: [],
        what_fell_flat: [],
      },
      top_comments: {
        most_liked: topByLikes,
        most_discussed: topByReplies,
      },
      actionable_recommendations: analysis.actionable_recommendations || [],
    };

    const result: AnalyzeResponse = {
      success: true,
      analysis: fullAnalysis,
      model_used: selectedModel,
      tokens_used: {
        input: data.usage?.prompt_tokens || 0,
        output: data.usage?.completion_tokens || 0,
      },
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
