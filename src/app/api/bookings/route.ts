import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/bookings - List bookings for a user
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const sessionId = searchParams.get('sessionId');

  try {
    if (sessionId) {
      // Get specific booking by session ID
      const booking = await prisma.booking.findUnique({
        where: { sessionId },
      });

      if (!booking) {
        return NextResponse.json(
          { error: 'Booking not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(booking);
    }

    if (userId) {
      // Get all bookings for a user
      const bookings = await prisma.booking.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json(bookings);
    }

    return NextResponse.json(
      { error: 'userId or sessionId required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[Bookings API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}
