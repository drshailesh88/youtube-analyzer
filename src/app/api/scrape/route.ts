import { NextRequest, NextResponse } from "next/server";
import { Comment, ScrapeResponse } from "@/lib/types";

// Extract video ID from various YouTube URL formats
function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/, // Direct video ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const { videoUrl } = await request.json();

    if (!videoUrl) {
      return NextResponse.json(
        { success: false, error: "Video URL is required" },
        { status: 400 }
      );
    }

    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      return NextResponse.json(
        { success: false, error: "Invalid YouTube URL" },
        { status: 400 }
      );
    }

    const apifyApiKey = process.env.APIFY_API_KEY;
    if (!apifyApiKey) {
      return NextResponse.json(
        { success: false, error: "APIFY_API_KEY not configured" },
        { status: 500 }
      );
    }

    // Use Apify's YouTube Comment Scraper
    // Actor ID: apify/youtube-comment-scraper or bernardo/youtube-comment-scraper
    const actorId = "bernardo~youtube-comment-scraper";

    console.log(`Starting Apify scrape for video: ${videoId}`);

    // Start the actor run
    const runResponse = await fetch(
      `https://api.apify.com/v2/acts/${actorId}/runs?token=${apifyApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startUrls: [`https://www.youtube.com/watch?v=${videoId}`],
          maxComments: 2000,
          maxReplies: 0, // Skip replies to speed up
          sortBy: "top", // Get most relevant comments first
        }),
      }
    );

    if (!runResponse.ok) {
      const errorText = await runResponse.text();
      console.error("Apify run start failed:", errorText);
      return NextResponse.json(
        { success: false, error: "Failed to start comment scraper" },
        { status: 500 }
      );
    }

    const runData = await runResponse.json();
    const runId = runData.data.id;

    console.log(`Apify run started: ${runId}`);

    // Poll for completion (max 5 minutes)
    const maxWaitTime = 5 * 60 * 1000;
    const pollInterval = 5000;
    const startTime = Date.now();

    let runStatus = "RUNNING";
    while (runStatus === "RUNNING" || runStatus === "READY") {
      if (Date.now() - startTime > maxWaitTime) {
        return NextResponse.json(
          { success: false, error: "Scraping timed out. Try a video with fewer comments." },
          { status: 504 }
        );
      }

      await new Promise((resolve) => setTimeout(resolve, pollInterval));

      const statusResponse = await fetch(
        `https://api.apify.com/v2/actor-runs/${runId}?token=${apifyApiKey}`
      );
      const statusData = await statusResponse.json();
      runStatus = statusData.data.status;

      console.log(`Run status: ${runStatus}`);
    }

    if (runStatus !== "SUCCEEDED") {
      return NextResponse.json(
        { success: false, error: `Scraping failed with status: ${runStatus}` },
        { status: 500 }
      );
    }

    // Fetch the results
    const datasetId = runData.data.defaultDatasetId;
    const resultsResponse = await fetch(
      `https://api.apify.com/v2/datasets/${datasetId}/items?token=${apifyApiKey}&format=json`
    );

    if (!resultsResponse.ok) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch results" },
        { status: 500 }
      );
    }

    const results = await resultsResponse.json();

    // Transform Apify results to our Comment format
    const comments: Comment[] = results
      .filter((item: any) => item.text && item.text.trim())
      .map((item: any) => ({
        text: item.text || "",
        author: item.author || "Anonymous",
        likes: item.likes || item.votesCount || 0,
        publishedAt: item.publishedAt || item.date || "",
        replyCount: item.replyCount || item.repliesCount || 0,
      }));

    // Extract video info from first result or use defaults
    const firstResult = results[0] || {};
    const videoInfo = {
      title: firstResult.videoTitle || `Video ${videoId}`,
      channel: firstResult.channelName || firstResult.author || "Unknown Channel",
      url: `https://www.youtube.com/watch?v=${videoId}`,
    };

    console.log(`Scraped ${comments.length} comments`);

    const response: ScrapeResponse = {
      success: true,
      comments,
      videoInfo,
      totalComments: comments.length,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Scrape error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
