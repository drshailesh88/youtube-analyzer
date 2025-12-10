import { NextRequest, NextResponse } from 'next/server';
import { WebClient } from '@slack/web-api';
import crypto from 'crypto';

const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);

// Verify Slack request signature
function verifySlackRequest(req: NextRequest, body: string): boolean {
  const slackSigningSecret = process.env.SLACK_SIGNING_SECRET;
  if (!slackSigningSecret) {
    console.error('SLACK_SIGNING_SECRET not configured');
    return false;
  }

  const slackSignature = req.headers.get('x-slack-signature');
  const slackTimestamp = req.headers.get('x-slack-request-timestamp');

  if (!slackSignature || !slackTimestamp) {
    return false;
  }

  // Prevent replay attacks (request older than 5 minutes)
  const time = Math.floor(Date.now() / 1000);
  if (Math.abs(time - parseInt(slackTimestamp)) > 300) {
    return false;
  }

  const sigBasestring = `v0:${slackTimestamp}:${body}`;
  const mySignature = 'v0=' + crypto
    .createHmac('sha256', slackSigningSecret)
    .update(sigBasestring)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(mySignature),
    Buffer.from(slackSignature)
  );
}

export async function POST(req: NextRequest) {
  try {
    // Get raw body for signature verification
    const body = await req.text();

    // Verify request is from Slack
    if (!verifySlackRequest(req, body)) {
      return NextResponse.json(
        { error: 'Invalid request signature' },
        { status: 401 }
      );
    }

    // Parse form data
    const params = new URLSearchParams(body);
    const text = params.get('text') || '';
    const userId = params.get('user_id');
    const channelId = params.get('channel_id');
    const responseUrl = params.get('response_url');

    // Validate YouTube URL
    if (!text || !text.trim()) {
      return NextResponse.json({
        response_type: 'ephemeral',
        text: '❌ Please provide a YouTube URL\n\nUsage: `/analyze https://www.youtube.com/watch?v=...`',
      });
    }

    const youtubeUrl = text.trim();

    // Basic YouTube URL validation
    if (!youtubeUrl.includes('youtube.com') && !youtubeUrl.includes('youtu.be')) {
      return NextResponse.json({
        response_type: 'ephemeral',
        text: '❌ Invalid YouTube URL. Please provide a valid YouTube video link.',
      });
    }

    // Respond immediately to Slack (required within 3 seconds)
    const immediateResponse = {
      response_type: 'ephemeral',
      text: '🔍 Analyzing YouTube video...',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '🔍 *Analyzing YouTube video...*\n\nThis may take up to a minute. I\'ll update you when it\'s done!',
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `📹 Video: \`${youtubeUrl}\``,
          },
        },
      ],
    };

    // Start background processing
    processVideoAnalysis(youtubeUrl, responseUrl!, channelId!, userId!);

    return NextResponse.json(immediateResponse);
  } catch (error) {
    console.error('Slack command error:', error);
    return NextResponse.json({
      response_type: 'ephemeral',
      text: '❌ An error occurred while processing your request.',
    });
  }
}

// Background processing function
async function processVideoAnalysis(
  videoUrl: string,
  responseUrl: string,
  channelId: string,
  userId: string
) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Step 1: Scrape comments
    const scrapeResponse = await fetch(`${baseUrl}/api/scrape`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoUrl }),
    });

    if (!scrapeResponse.ok) {
      throw new Error(`Scraping failed: ${scrapeResponse.statusText}`);
    }

    const scrapeData = await scrapeResponse.json();

    if (!scrapeData.success) {
      await updateSlackMessage(responseUrl, {
        text: '❌ Failed to scrape video comments',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `❌ *Failed to scrape comments*\n\n${scrapeData.error || 'Unknown error'}`,
            },
          },
        ],
      });
      return;
    }

    // Update: Comments scraped
    await updateSlackMessage(responseUrl, {
      text: `✅ Scraped ${scrapeData.totalComments} comments. Analyzing...`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `✅ *Scraped ${scrapeData.totalComments} comments*\n\n🤖 Running AI analysis...`,
          },
        },
      ],
    });

    // Step 2: Analyze with AI
    const analyzeResponse = await fetch(`${baseUrl}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        comments: scrapeData.comments,
        videoInfo: scrapeData.videoInfo,
        model: process.env.DEFAULT_MODEL || 'google/gemini-2.0-flash-exp:free',
      }),
    });

    if (!analyzeResponse.ok) {
      throw new Error(`Analysis failed: ${analyzeResponse.statusText}`);
    }

    const analyzeData = await analyzeResponse.json();

    if (!analyzeData.success) {
      await updateSlackMessage(responseUrl, {
        text: '❌ Analysis failed',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `❌ *Analysis failed*\n\n${analyzeData.error || 'Unknown error'}`,
            },
          },
        ],
      });
      return;
    }

    // Step 3: Save to history
    await fetch(`${baseUrl}/api/history/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        videoId: scrapeData.videoInfo.url.match(/v=([^&]+)/)?.[1] || '',
        videoTitle: scrapeData.videoInfo.title,
        videoChannel: scrapeData.videoInfo.channel,
        videoUrl: scrapeData.videoInfo.url,
        modelUsed: analyzeData.model_used,
        totalComments: scrapeData.totalComments,
        analysis: analyzeData.analysis,
        tokensUsed: analyzeData.tokens_used,
      }),
    });

    // Step 4: Format and send results
    const analysis = analyzeData.analysis;
    const blocks = formatAnalysisBlocks(analysis, scrapeData.videoInfo, scrapeData.totalComments);

    await updateSlackMessage(responseUrl, {
      text: `✅ Analysis complete for: ${scrapeData.videoInfo.title}`,
      blocks,
    });
  } catch (error) {
    console.error('Background processing error:', error);
    await updateSlackMessage(responseUrl, {
      text: '❌ An error occurred during analysis',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `❌ *Error during analysis*\n\n${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        },
      ],
    });
  }
}

// Update Slack message using response_url
async function updateSlackMessage(responseUrl: string, payload: any) {
  await fetch(responseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

// Format analysis results as Slack blocks
function formatAnalysisBlocks(analysis: any, videoInfo: any, totalComments: number) {
  const blocks: any[] = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '✅ Analysis Complete',
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${videoInfo.title}*\nby ${videoInfo.channel}\n📊 Analyzed ${totalComments} comments`,
      },
    },
    {
      type: 'divider',
    },
  ];

  // Sentiment Analysis
  if (analysis.sentiment_analysis) {
    const sentiment = analysis.sentiment_analysis;
    const breakdown = sentiment.breakdown;

    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*😊 Sentiment Breakdown*\n✅ Positive: ${breakdown.positive}%\n❌ Negative: ${breakdown.negative}%\n➖ Neutral: ${breakdown.neutral}%`,
      },
    });

    if (sentiment.positive_drivers && sentiment.positive_drivers.length > 0) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Positive Drivers:*\n${sentiment.positive_drivers.map((d: string) => `• ${d}`).join('\n')}`,
        },
      });
    }

    if (sentiment.negative_drivers && sentiment.negative_drivers.length > 0) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Negative Drivers:*\n${sentiment.negative_drivers.map((d: string) => `• ${d}`).join('\n')}`,
        },
      });
    }

    blocks.push({ type: 'divider' });
  }

  // Knowledge Gaps
  if (analysis.knowledge_gaps && analysis.knowledge_gaps.length > 0) {
    const gaps = analysis.knowledge_gaps.slice(0, 3);
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*🧠 Knowledge Gaps*\n${gaps.map((gap: any) => `• *${gap.topic}*: ${gap.description}`).join('\n')}`,
      },
    });
    blocks.push({ type: 'divider' });
  }

  // Demand Signals
  if (analysis.demand_signals && analysis.demand_signals.length > 0) {
    const demands = analysis.demand_signals.slice(0, 3);
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*📈 Demand Signals*\n${demands.map((d: any) => `• *${d.topic}*: ${d.description}`).join('\n')}`,
      },
    });
    blocks.push({ type: 'divider' });
  }

  // Pain Points
  if (analysis.pain_points && analysis.pain_points.length > 0) {
    const pains = analysis.pain_points.slice(0, 3);
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*😓 Pain Points*\n${pains.map((p: any) => `• *${p.topic}*: ${p.description}`).join('\n')}`,
      },
    });
    blocks.push({ type: 'divider' });
  }

  // Recommendations
  if (analysis.actionable_recommendations && analysis.actionable_recommendations.length > 0) {
    const recs = analysis.actionable_recommendations.slice(0, 3);
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*💡 Recommendations*\n${recs.map((r: string) => `• ${r}`).join('\n')}`,
      },
    });
  }

  // Action buttons
  blocks.push(
    {
      type: 'divider',
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '🔗 View Full Report',
          },
          url: videoInfo.url,
          action_id: 'view_video',
        },
      ],
    }
  );

  return blocks;
}
