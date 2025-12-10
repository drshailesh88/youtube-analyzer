# 🎯 YouTube Comment Analyzer

A powerful web application that analyzes YouTube comments to uncover deep audience insights. Uses AI to extract sentiments, knowledge gaps, demand signals, myths, and pain points from viewer feedback.

![YouTube Comment Analyzer](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)

## ✨ Features

- **🔍 Deep Comment Analysis**: Scrapes up to 2,000 comments per video
- **🎭 Sentiment Breakdown**: Positive, negative, neutral with drivers
- **❓ Knowledge Gaps**: What viewers don't understand
- **💡 Demand Signals**: What content viewers are asking for
- **⚠️ Myths & Misconceptions**: False beliefs in comments
- **😤 Pain Points**: Viewer frustrations and problems
- **👍👎 Resonance Analysis**: What worked vs. what fell flat
- **📊 Export**: JSON and CSV download options
- **🤖 Multiple AI Models**: Gemini, Claude, GPT-4o via OpenRouter
- **💬 Slack Integration**: Use `/analyze` slash command in Slack

## 🚀 Quick Deploy to Vercel

### Step 1: Get Your API Keys

1. **YouTube Data API v3 Key** (for scraping YouTube comments)
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing
   - Enable YouTube Data API v3
   - Create credentials (API Key)
   - Free tier: 10,000 quota units/day (~100 videos)

2. **OpenRouter API Key** (for AI analysis)
   - Go to [openrouter.ai](https://openrouter.ai) and sign up
   - Add credits ($5 minimum recommended)
   - Go to Keys and create a new API key
   - Copy the key

3. **Firebase Project** (for analysis history)
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create a new project
   - Add a web app and copy configuration keys

### Step 2: Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/youtube-comment-analyzer&env=APIFY_API_KEY,OPENROUTER_API_KEY&envDescription=API%20keys%20required%20for%20the%20app&envLink=https://github.com/YOUR_USERNAME/youtube-comment-analyzer%23-quick-deploy-to-vercel)

Or manually:

1. Push this code to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click "New Project" and import your repository
4. Add Environment Variables:
   - `YOUTUBE_API_KEY` = your YouTube Data API key
   - `OPENROUTER_API_KEY` = your OpenRouter key
   - `NEXT_PUBLIC_FIREBASE_*` = your Firebase config keys
5. Click "Deploy"

### Step 3: Share with Your Team

Once deployed, Vercel gives you a URL like `https://your-app.vercel.app`. Share this with your team!

## 💻 Local Development

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/youtube-comment-analyzer.git
cd youtube-comment-analyzer

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Add your API keys to .env.local
# YOUTUBE_API_KEY=your_key_here
# OPENROUTER_API_KEY=your_key_here
# NEXT_PUBLIC_FIREBASE_*=your_firebase_config

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 🔧 Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `YOUTUBE_API_KEY` | Yes | YouTube Data API v3 key for scraping |
| `OPENROUTER_API_KEY` | Yes | OpenRouter API key for AI analysis |
| `NEXT_PUBLIC_FIREBASE_*` | Yes | Firebase configuration (6 variables) |
| `SLACK_BOT_TOKEN` | No | For Slack integration (see SLACK_SETUP.md) |
| `SLACK_SIGNING_SECRET` | No | For Slack integration (see SLACK_SETUP.md) |
| `NEXT_PUBLIC_APP_URL` | No | Your deployed URL (required for Slack) |
| `DEFAULT_MODEL` | No | Default AI model (default: `google/gemini-2.0-flash-exp:free`) |

### Available AI Models

| Model | Cost (Input/Output) | Best For |
|-------|---------------------|----------|
| Gemini 2.5 Pro | $0.003/$0.015 per 1K tokens | Highest quality analysis |
| Gemini 2.5 Flash | $0.0003/$0.001 per 1K tokens | Fast, cost-effective |
| Claude Sonnet 4 | $0.003/$0.015 per 1K tokens | Nuanced understanding |
| GPT-4o | $0.003/$0.012 per 1K tokens | General purpose |

## 💬 Slack Integration

Use the analyzer directly in Slack with the `/analyze` command!

```
/analyze https://www.youtube.com/watch?v=VIDEO_ID
```

See **[SLACK_SETUP.md](./SLACK_SETUP.md)** for complete setup instructions.

## 💰 Cost Estimation

For a video with **2,000 comments**:

| Model | Estimated Cost |
|-------|---------------|
| Gemini 2.0 Flash (FREE) | $0.00 |
| Grok 4.1 Fast (FREE) | $0.00 |
| Gemini 2.5 Pro | ~$0.15-0.20 |
| Claude Sonnet 4 | ~$0.15-0.20 |
| GPT-4o | ~$0.15-0.18 |

YouTube Data API is **FREE** (10,000 quota units/day)

## 📁 Project Structure

```
youtube-comment-analyzer/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── scrape/route.ts        # YouTube comment scraping
│   │   │   ├── analyze/route.ts       # AI analysis endpoint
│   │   │   ├── history/               # Analysis history (Firebase)
│   │   │   └── slack/                 # Slack integration
│   │   │       ├── command/route.ts   # /analyze slash command
│   │   │       └── events/route.ts    # Interactive events
│   │   ├── globals.css                # Global styles
│   │   ├── layout.tsx                 # Root layout
│   │   └── page.tsx                   # Main page
│   ├── components/
│   │   ├── InsightCard.tsx            # Insight display card
│   │   ├── LoadingState.tsx           # Loading indicators
│   │   ├── ResultsDisplay.tsx         # Results dashboard
│   │   ├── SentimentChart.tsx         # Sentiment pie chart
│   │   └── HistoryPanel.tsx           # Analysis history sidebar
│   └── lib/
│       ├── prompts.ts                 # AI prompt templates
│       ├── types.ts                   # TypeScript types
│       └── firebase.ts                # Firebase config
├── .env.example                       # Environment template
├── SLACK_SETUP.md                     # Slack integration guide
├── package.json
└── README.md
```

## 🔒 Security Notes

- API keys are stored as environment variables, never in code
- Keys are only accessible server-side (API routes)
- Vercel encrypts environment variables at rest

## 🐛 Troubleshooting

### "Failed to scrape comments"
- Check your YouTube API key is correct
- Verify quota hasn't been exceeded (10,000 units/day)
- Ensure YouTube Data API v3 is enabled in Google Cloud Console

### "AI analysis failed"
- Verify your OpenRouter API key
- Check you have OpenRouter credits (if using paid models)
- Try a free model (Gemini 2.0 Flash, Grok 4.1 Fast)

### "Scraping timed out"
- Very popular videos (100K+ comments) may timeout
- Try videos with fewer comments

### Comments not loading
- Ensure the video has comments enabled
- Check the video URL format is correct

### Slack command not working
- See [SLACK_SETUP.md](./SLACK_SETUP.md) for troubleshooting

## 📝 License

MIT License - feel free to use and modify!

## 🙏 Credits

- [YouTube Data API](https://developers.google.com/youtube/v3) - Comment scraping
- [OpenRouter](https://openrouter.ai) - AI model access
- [Firebase](https://firebase.google.com) - Data persistence
- [Slack API](https://api.slack.com) - Slack integration
- [Next.js](https://nextjs.org) - React framework
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Recharts](https://recharts.org) - Charts
- [Lucide](https://lucide.dev) - Icons
