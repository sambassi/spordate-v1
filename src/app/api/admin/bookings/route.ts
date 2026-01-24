import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

// GET all bookings with user info
export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

// GET statistics
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'stats') {
      // Get statistics
      const totalBookings = await prisma.booking.count();
      const totalRevenue = await prisma.booking.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          paymentStatus: 'paid',
        },
      });
      
      const totalUsers = await prisma.user.count();
      const totalPartners = await prisma.partner.count();

      return NextResponse.json({
        totalBookings,
        totalRevenue: totalRevenue._sum.amount || 0,
        totalUsers,
        totalPartners,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
