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

    const youtubeApiKey = process.env.YOUTUBE_API_KEY;
    if (!youtubeApiKey) {
      return NextResponse.json(
        { success: false, error: "YOUTUBE_API_KEY not configured" },
        { status: 500 }
      );
    }

    console.log(`Starting YouTube Data API scrape for video: ${videoId}`);

    // Fetch video details first
    const videoDetailsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${youtubeApiKey}`
    );

    if (!videoDetailsResponse.ok) {
      const errorText = await videoDetailsResponse.text();
      console.error("YouTube API video details failed:", errorText);
      return NextResponse.json(
        { success: false, error: "Failed to fetch video details" },
        { status: 500 }
      );
    }

    const videoData = await videoDetailsResponse.json();

    if (!videoData.items || videoData.items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Video not found" },
        { status: 404 }
      );
    }

    const videoSnippet = videoData.items[0].snippet;
    const videoInfo = {
      title: videoSnippet.title || `Video ${videoId}`,
      channel: videoSnippet.channelTitle || "Unknown Channel",
      url: `https://www.youtube.com/watch?v=${videoId}`,
    };

    // Fetch comments (up to 2000)
    const comments: Comment[] = [];
    let pageToken: string | undefined;
    const maxComments = 2000;
    const maxResultsPerPage = 100; // YouTube API max

    console.log(`Fetching comments for: ${videoInfo.title}`);

    while (comments.length < maxComments) {
      const commentsUrl = new URL("https://www.googleapis.com/youtube/v3/commentThreads");
      commentsUrl.searchParams.set("part", "snippet");
      commentsUrl.searchParams.set("videoId", videoId);
      commentsUrl.searchParams.set("maxResults", maxResultsPerPage.toString());
      commentsUrl.searchParams.set("order", "relevance"); // Get most relevant first
      commentsUrl.searchParams.set("textFormat", "plainText");
      commentsUrl.searchParams.set("key", youtubeApiKey);

      if (pageToken) {
        commentsUrl.searchParams.set("pageToken", pageToken);
      }

      const commentsResponse = await fetch(commentsUrl.toString());

      if (!commentsResponse.ok) {
        const errorData = await commentsResponse.json();

        // Check if comments are disabled
        if (errorData.error?.errors?.[0]?.reason === "commentsDisabled") {
          console.log("Comments are disabled for this video");
          break;
        }

        console.error("YouTube API comments fetch failed:", errorData);

        // If we have some comments, return them instead of failing
        if (comments.length > 0) {
          console.log(`Partial fetch: got ${comments.length} comments before error`);
          break;
        }

        return NextResponse.json(
          { success: false, error: "Failed to fetch comments" },
          { status: 500 }
        );
      }

      const commentsData = await commentsResponse.json();

      // Transform YouTube API comments to our format
      const newComments = (commentsData.items || []).map((item: any) => {
        const snippet = item.snippet.topLevelComment.snippet;
        return {
          text: snippet.textDisplay || snippet.textOriginal || "",
          author: snippet.authorDisplayName || "Anonymous",
          likes: snippet.likeCount || 0,
          publishedAt: snippet.publishedAt || "",
          replyCount: item.snippet.totalReplyCount || 0,
        };
      });

      comments.push(...newComments);

      console.log(`Fetched ${comments.length} comments so far...`);

      // Check if there are more pages
      pageToken = commentsData.nextPageToken;
      if (!pageToken) {
        break; // No more pages
      }

      // Stop if we've reached our limit
      if (comments.length >= maxComments) {
        break;
      }
    }

    console.log(`Scraped ${comments.length} comments total`);

    const response: ScrapeResponse = {
      success: true,
      comments: comments.slice(0, maxComments), // Ensure we don't exceed limit
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
