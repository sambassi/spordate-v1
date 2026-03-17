/**
 * Spordateur V2 — Bookings API (Firestore)
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  // In V2, bookings are read directly from Firestore on the client
  // This API is kept for backwards compatibility
  return NextResponse.json({
    message: 'Use Firestore client SDK for real-time bookings',
    userId,
  });
}
