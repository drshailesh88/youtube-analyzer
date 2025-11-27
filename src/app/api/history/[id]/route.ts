import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Analysis ID is required' },
        { status: 400 }
      );
    }

    // Get document from Firestore
    const docRef = doc(db, 'analyses', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json(
        { success: false, error: 'Analysis not found' },
        { status: 404 }
      );
    }

    const data = docSnap.data();

    return NextResponse.json({
      success: true,
      analysis: {
        id: docSnap.id,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        videoId: data.videoId,
        videoTitle: data.videoTitle,
        videoChannel: data.videoChannel,
        videoUrl: data.videoUrl,
        modelUsed: data.modelUsed,
        totalComments: data.totalComments,
        analysis: data.analysis,
        tokensUsed: data.tokensUsed,
      },
    });
  } catch (error) {
    console.error('Error fetching analysis:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch analysis'
      },
      { status: 500 }
    );
  }
}
