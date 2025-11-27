import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AnalysisResult } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      videoId,
      videoTitle,
      videoChannel,
      videoUrl,
      modelUsed,
      totalComments,
      analysis,
      tokensUsed
    } = body;

    // Validate required fields
    if (!videoId || !videoTitle || !analysis) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Save to Firestore
    const docRef = await addDoc(collection(db, 'analyses'), {
      videoId,
      videoTitle,
      videoChannel,
      videoUrl,
      modelUsed,
      totalComments,
      analysis,
      tokensUsed: tokensUsed || null,
      createdAt: serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      id: docRef.id,
      message: 'Analysis saved successfully',
    });
  } catch (error) {
    console.error('Error saving analysis:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save analysis'
      },
      { status: 500 }
    );
  }
}
