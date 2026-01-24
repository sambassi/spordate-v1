import { NextResponse } from 'next/server';
import { getPartnersWithPricing, getPartnerById } from '@/lib/prisma-helpers';

export const dynamic = 'force-dynamic';

// GET all active partners with pricing
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get('id');
    
    // If ID provided, get single partner
    if (partnerId) {
      const partner = await getPartnerById(partnerId);
      if (!partner) {
        return NextResponse.json(
          { error: 'Partner not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(partner);
    }
    
    // Otherwise, get all active partners
    const partners = await getPartnersWithPricing();
    return NextResponse.json(partners);
  } catch (error) {
    console.error('Error fetching partners:', error);
    return NextResponse.json(
      { error: 'Failed to fetch partners', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
