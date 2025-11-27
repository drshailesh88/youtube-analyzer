import { NextRequest, NextResponse } from 'next/server';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limitCount = parseInt(searchParams.get('limit') || '50');

    // Query Firestore for recent analyses
    const q = query(
      collection(db, 'analyses'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const analyses = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        videoTitle: data.videoTitle,
        videoChannel: data.videoChannel,
        modelUsed: data.modelUsed,
        totalComments: data.totalComments,
      };
    });

    return NextResponse.json({
      success: true,
      analyses,
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch history'
      },
      { status: 500 }
    );
  }
}
