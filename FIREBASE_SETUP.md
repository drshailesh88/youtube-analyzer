# Firebase Setup Instructions

Your Firebase project is configured and the code is ready! You just need to set up the Firestore security rules.

## Step 1: Set Firestore Security Rules

1. Go to https://console.firebase.google.com/
2. Select your project: **comment-analyzer-5bf9e**
3. Click **"Build"** → **"Firestore Database"** in the left sidebar
4. Click the **"Rules"** tab at the top
5. Replace the existing rules with the following:

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Allow public read/write access to analyses collection
    match /analyses/{analysisId} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

6. Click **"Publish"** button

## Why These Rules?

- **Public Read**: Anyone can view analyses (needed for the history panel)
- **Public Write**: Anyone can create new analyses (needed when saving)
- This is appropriate for a public app where users don't need accounts
- If you want to add authentication later, you can update these rules

## Step 2: Test the Application

1. Open http://localhost:3002 in your browser
2. You should see:
   - Main analysis interface in the center
   - Collapsible history panel on the right (ChatGPT-style)
3. Try analyzing a YouTube video:
   - Enter a YouTube URL
   - Click "Analyze Comments"
   - Wait for the analysis to complete
4. Check the history panel:
   - Your analysis should appear in the right panel
   - Click on it to reload that analysis
   - The panel should be collapsible (click the arrow to hide/show)

## Firestore Collections

Your database has one collection:

### `analyses`
Stores all YouTube comment analyses with the following fields:

- `videoId` (string): YouTube video ID
- `videoTitle` (string): Video title
- `videoChannel` (string): Channel name
- `videoUrl` (string): Full YouTube URL
- `modelUsed` (string): AI model used for analysis
- `totalComments` (number): Number of comments analyzed
- `analysis` (object): Complete analysis results
- `tokensUsed` (object): Token usage stats (optional)
- `createdAt` (timestamp): When the analysis was created

## Troubleshooting

### If history panel is empty:
1. Create a new analysis first
2. Check browser console for errors (F12 → Console tab)
3. Verify Firestore rules are published

### If saving fails:
1. Check Firestore rules are set correctly
2. Check browser console for error messages
3. Verify Firebase config in `.env.local` is correct

### If Firebase errors appear:
1. Make sure you published the security rules
2. Check that Firestore Database is enabled in Firebase Console
3. Verify all environment variables in `.env.local` are correct

## Features

✅ **ChatGPT-Style History Panel**
- Collapsible right sidebar
- Shows all past analyses
- Click to reload any analysis
- Automatically saves every analysis
- Real-time timestamps ("Just now", "5m ago", "Yesterday", etc.)
- Refresh button to reload history

✅ **Automatic Saving**
- Every analysis is automatically saved to Firebase
- No manual save button needed
- Works silently in the background

✅ **Persistent Storage**
- All analyses stored in Firestore
- Available across sessions
- Accessible from any device (if you deploy)

## Next Steps

After testing locally:

1. Deploy to Vercel (your app is already connected)
2. Add Firebase environment variables to Vercel:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
3. Test production deployment

## Free Tier Limits

Firebase Free Tier includes:
- 1 GB storage (≈1 million analyses)
- 10 GB/month bandwidth
- 50K reads/day
- 20K writes/day

This is **more than enough** for your use case!
