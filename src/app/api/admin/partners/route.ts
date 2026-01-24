import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

// GET all partners
export async function GET() {
  try {
    const partners = await prisma.partner.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(partners);
  } catch (error) {
    console.error('Error fetching partners:', error);
    return NextResponse.json(
      { error: 'Failed to fetch partners' },
      { status: 500 }
    );
  }
}

// POST create new partner
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, address, city, type, photoUrl, mapsUrl, priceSolo, priceDuo } = body;

    if (!name || !address || !city) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const partner = await prisma.partner.create({
      data: {
        name,
        address,
        city,
        type: type || 'gym',
        photoUrl,
        mapsUrl,
        priceSolo: parseFloat(priceSolo) || 25,
        priceDuo: parseFloat(priceDuo) || 50,
        referralId: `partner_${Date.now()}`,
      },
    });

    return NextResponse.json(partner, { status: 201 });
  } catch (error) {
    console.error('Error creating partner:', error);
    return NextResponse.json(
      { error: 'Failed to create partner' },
      { status: 500 }
    );
  }
}

// PUT update partner
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, address, city, type, photoUrl, mapsUrl, priceSolo, priceDuo, active } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Partner ID is required' },
        { status: 400 }
      );
    }

    const partner = await prisma.partner.update({
      where: { id },
      data: {
        name,
        address,
        city,
        type,
        photoUrl,
        mapsUrl,
        priceSolo: priceSolo !== undefined ? parseFloat(priceSolo) : undefined,
        priceDuo: priceDuo !== undefined ? parseFloat(priceDuo) : undefined,
        active: active !== undefined ? active : undefined,
      },
    });

    return NextResponse.json(partner);
  } catch (error) {
    console.error('Error updating partner:', error);
    return NextResponse.json(
      { error: 'Failed to update partner' },
      { status: 500 }
    );
  }
}

// DELETE partner
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Partner ID is required' },
        { status: 400 }
      );
    }

    await prisma.partner.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting partner:', error);
    return NextResponse.json(
      { error: 'Failed to delete partner' },
      { status: 500 }
    );
  }
}
