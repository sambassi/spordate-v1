import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  typescript: true,
});

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  console.log('[Stripe Webhook] Received webhook event');

  let event: Stripe.Event;

  try {
    // Verify webhook signature if secret is configured
    if (process.env.STRIPE_WEBHOOK_SECRET && sig) {
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } else {
      // For testing without signature verification
      event = JSON.parse(body) as Stripe.Event;
      console.log('[Stripe Webhook] Warning: No signature verification');
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Stripe Webhook] Signature verification failed:', message);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 }
    );
  }

  console.log('[Stripe Webhook] Event type:', event.type);

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('[Stripe Webhook] Processing checkout.session.completed');
      
      try {
        await handleSuccessfulPayment(session);
      } catch (error) {
        console.error('[Stripe Webhook] Error processing payment:', error);
        // Still acknowledge receipt to Stripe
      }
      break;
    }
    
    case 'checkout.session.expired': {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('[Stripe Webhook] Session expired:', session.id);
      
      // Update booking status to failed if exists
      try {
        await prisma.booking.updateMany({
          where: { sessionId: session.id },
          data: { paymentStatus: 'expired' },
        });
      } catch (error) {
        console.log('[Stripe Webhook] No booking found for expired session');
      }
      break;
    }
    
    default:
      console.log('[Stripe Webhook] Unhandled event type:', event.type);
  }

  return NextResponse.json({ received: true });
}

/**
 * Handle successful payment - Create Booking in database
 */
async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  const metadata = session.metadata || {};
  const customerEmail = session.customer_details?.email;
  const amountPaid = (session.amount_total || 0) / 100;

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('💳 CREATING BOOKING IN DATABASE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🔢 Session ID: ${session.id}`);
  console.log(`👤 User ID: ${metadata.userId || 'unknown'}`);
  console.log(`🎟️ Type: ${metadata.ticketType || 'solo'}`);
  console.log(`💰 Amount: ${amountPaid}€`);
  console.log(`👤 Profile: ${metadata.profileName || 'Unknown'}`);
  console.log(`🏃 Sport: ${metadata.sport || 'Afroboost'}`);
  console.log(`📍 Partner: ${metadata.partnerName || 'Non défini'}`);
  console.log(`📧 Email: ${customerEmail || 'Non fourni'}`);

  try {
    // Create booking in database
    const booking = await prisma.booking.create({
      data: {
        sessionId: session.id,
        paymentStatus: 'paid',
        userId: metadata.userId || `user_${Date.now()}`,
        userEmail: customerEmail || null,
        profileId: metadata.profileId || '',
        profileName: metadata.profileName || 'Partenaire',
        sport: metadata.sport || 'Afroboost',
        partnerId: metadata.partnerId || null,
        partnerName: metadata.partnerName || null,
        partnerAddress: metadata.partnerAddress || null,
        ticketType: metadata.ticketType || 'solo',
        amount: amountPaid,
        currency: session.currency?.toUpperCase() || 'EUR',
      },
    });

    console.log('✅ BOOKING CREATED:', booking.id);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return booking;
  } catch (error) {
    console.error('❌ ERROR CREATING BOOKING:', error);
    
    // Check if it's a duplicate (booking already exists)
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      console.log('[Stripe Webhook] Booking already exists for this session');
      return null;
    }
    
    throw error;
  }
}

// GET endpoint for health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    webhook: 'stripe',
    stripeConfigured: !!process.env.STRIPE_SECRET_KEY,
    webhookSecretConfigured: !!process.env.STRIPE_WEBHOOK_SECRET,
  });
}
