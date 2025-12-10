# Slack Integration Setup Guide

This guide will help you set up the YouTube Comment Analyzer as a Slack slash command.

## Overview

Once configured, users in your Slack workspace can analyze YouTube videos by typing:
```
/analyze https://www.youtube.com/watch?v=VIDEO_ID
```

The bot will:
1. Scrape comments from the video
2. Analyze them with AI
3. Return insights directly in Slack

---

## Prerequisites

- A Slack workspace where you have admin permissions
- Your YouTube Comment Analyzer deployed (Vercel, etc.)
- Environment variables configured (YouTube API, OpenRouter, Firebase)

---

## Step 1: Create a Slack App

1. Go to https://api.slack.com/apps
2. Click **"Create New App"**
3. Select **"From scratch"**
4. Enter:
   - **App Name:** YouTube Comment Analyzer
   - **Workspace:** Select your workspace
5. Click **"Create App"**

---

## Step 2: Configure OAuth & Permissions

1. In the left sidebar, click **"OAuth & Permissions"**
2. Scroll to **"Scopes"** section
3. Under **"Bot Token Scopes"**, add these permissions:
   - `chat:write` - Send messages as the bot
   - `commands` - Create slash commands
   - `files:write` - Upload files (for future CSV exports)

4. Scroll to the top and click **"Install to Workspace"**
5. Click **"Allow"**
6. **Copy the "Bot User OAuth Token"** (starts with `xoxb-`)
   - Save this as `SLACK_BOT_TOKEN` in your `.env.local` file

---

## Step 3: Create Slash Command

1. In the left sidebar, click **"Slash Commands"**
2. Click **"Create New Command"**
3. Fill in the details:
   - **Command:** `/analyze`
   - **Request URL:** `https://your-app-url.com/api/slack/command`
     - Replace `your-app-url.com` with your deployed URL (e.g., Vercel URL)
   - **Short Description:** `Analyze YouTube video comments with AI`
   - **Usage Hint:** `https://www.youtube.com/watch?v=...`
4. Click **"Save"**

---

## Step 4: Enable Interactivity (Optional)

1. In the left sidebar, click **"Interactivity & Shortcuts"**
2. Toggle **"Interactivity"** to **ON**
3. Set **Request URL:** `https://your-app-url.com/api/slack/events`
4. Click **"Save Changes"**

---

## Step 5: Get Your Signing Secret

1. In the left sidebar, click **"Basic Information"**
2. Scroll to **"App Credentials"**
3. Find **"Signing Secret"** and click **"Show"**
4. **Copy the signing secret**
   - Save this as `SLACK_SIGNING_SECRET` in your `.env.local` file

---

## Step 6: Configure Environment Variables

Add these variables to your `.env.local` file:

```bash
# Slack Integration
SLACK_BOT_TOKEN=xoxb-your-bot-token-here
SLACK_SIGNING_SECRET=your-signing-secret-here

# Application URL (use your deployed URL)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**Important:**
- For local development, use [ngrok](https://ngrok.com/) to expose your localhost
- Update the slash command Request URL with your ngrok URL

---

## Step 7: Deploy & Test

### For Production (Vercel)

1. Add environment variables to Vercel:
   ```bash
   vercel env add SLACK_BOT_TOKEN
   vercel env add SLACK_SIGNING_SECRET
   vercel env add NEXT_PUBLIC_APP_URL
   ```

2. Deploy:
   ```bash
   vercel --prod
   ```

3. Update Slack app URLs with your Vercel URL

### For Local Testing

1. Install ngrok:
   ```bash
   npm install -g ngrok
   ```

2. Start your app:
   ```bash
   npm run dev
   ```

3. In another terminal, start ngrok:
   ```bash
   ngrok http 3000
   ```

4. Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)

5. Update in Slack app settings:
   - Slash command Request URL: `https://abc123.ngrok.io/api/slack/command`
   - Interactivity Request URL: `https://abc123.ngrok.io/api/slack/events`

6. Update `.env.local`:
   ```bash
   NEXT_PUBLIC_APP_URL=https://abc123.ngrok.io
   ```

7. Restart your Next.js app

---

## Step 8: Test in Slack

1. Go to your Slack workspace
2. In any channel or DM, type:
   ```
   /analyze https://www.youtube.com/watch?v=dQw4w9WgXcQ
   ```

3. You should see:
   - Immediate acknowledgment: "Analyzing YouTube video..."
   - Progress update: "Scraped X comments. Analyzing..."
   - Final results with insights, sentiment, and recommendations

---

## Troubleshooting

### Command not responding
- Check that `NEXT_PUBLIC_APP_URL` matches your deployed URL
- Verify Slack request URL is correct in Slash Commands settings
- Check Vercel logs for errors

### "Invalid request signature" error
- Verify `SLACK_SIGNING_SECRET` is correct
- Make sure there are no extra spaces in the secret
- Check server time is synchronized (for timestamp validation)

### Analysis timeout
- Slack expects responses within 3 seconds
- The bot sends immediate acknowledgment, then updates asynchronously
- Check that your YouTube API and OpenRouter API keys are valid

### Bot not posting updates
- Verify `SLACK_BOT_TOKEN` has `chat:write` scope
- Check that the token starts with `xoxb-`
- Reinstall the app to workspace if scopes changed

---

## Features

### Current Capabilities
- `/analyze <url>` - Analyze any YouTube video
- Real-time progress updates
- Formatted results with:
  - Sentiment breakdown
  - Knowledge gaps
  - Demand signals
  - Pain points
  - Actionable recommendations
- Automatic saving to Firebase history

### Future Enhancements
- CSV export button
- Model selection in Slack
- Thread replies for detailed analysis
- Compare multiple videos
- Scheduled analysis via n8n

---

## Security Notes

- Never commit `.env.local` to version control
- Rotate tokens if accidentally exposed
- Use environment variables in Vercel/deployment platform
- Signing secret verification prevents unauthorized requests
- Bot tokens should have minimal required scopes

---

## API Endpoints

The Slack integration uses these endpoints:

| Endpoint | Purpose |
|----------|---------|
| `POST /api/slack/command` | Handle `/analyze` slash command |
| `POST /api/slack/events` | Handle button clicks and interactivity |

---

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify all environment variables are set
3. Test API endpoints directly with curl/Postman
4. Check Slack app event subscriptions logs

---

## Uninstalling

To remove the Slack integration:
1. Go to https://api.slack.com/apps
2. Select your app
3. Click "Delete App" in the left sidebar under "Settings"
4. Remove Slack environment variables from your deployment
