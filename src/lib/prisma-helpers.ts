import { PrismaClient } from '@prisma/client';

// Prisma client singleton
const globalForPrisma = global as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Partner interface for API
export interface PartnerWithPricing {
  id: string;
  name: string;
  address: string;
  city: string;
  type: string;
  photoUrl?: string | null;
  mapsUrl?: string | null;
  priceSolo: number;
  priceDuo: number;
  active: boolean;
}

/**
 * Get all active partners with pricing
 */
export async function getPartnersWithPricing(): Promise<PartnerWithPricing[]> {
  try {
    const partners = await prisma.partner.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
    });
    
    return partners.map(p => ({
      id: p.id,
      name: p.name,
      address: p.address,
      city: p.city,
      type: p.type,
      photoUrl: p.photoUrl,
      mapsUrl: p.mapsUrl,
      priceSolo: p.priceSolo,
      priceDuo: p.priceDuo,
      active: p.active,
    }));
  } catch (error) {
    console.error('Error fetching partners from Prisma:', error);
    // Return empty array if DB not configured
    return [];
  }
}

/**
 * Get partner by ID with pricing
 */
export async function getPartnerById(partnerId: string): Promise<PartnerWithPricing | null> {
  try {
    const partner = await prisma.partner.findUnique({
      where: { id: partnerId },
    });
    
    if (!partner) return null;
    
    return {
      id: partner.id,
      name: partner.name,
      address: partner.address,
      city: partner.city,
      type: partner.type,
      photoUrl: partner.photoUrl,
      mapsUrl: partner.mapsUrl,
      priceSolo: partner.priceSolo,
      priceDuo: partner.priceDuo,
      active: partner.active,
    };
  } catch (error) {
    console.error('Error fetching partner by ID:', error);
    return null;
  }
}
