import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET || process.env.SVIX_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env');
    return new Response('Error occured -- no webhook secret', {
      status: 500
    });
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: any;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    });
  }

  const eventType = evt.type;
  
  if (eventType === 'subscription.created' || eventType === 'subscription.updated' || eventType === 'subscription.deleted') {
    const data = evt.data;
    
    // Clerk usually provides user_id for user-level subscriptions
    const clerkUserId = data.user_id || data.clerk_id;
    
    let plan = 'free';
    if (eventType !== 'subscription.deleted' && data.status === 'active') {
        const productName = (data.product_name || data.tier_name || data.plan_name || '').toLowerCase();
        if (productName.includes('business')) plan = 'business';
        else if (productName.includes('pro')) plan = 'pro';
        else plan = 'free';
    }

    if (clerkUserId) {
        try {
            await db.update(users)
              .set({ plan, updatedAt: new Date() })
              .where(eq(users.clerkId, clerkUserId));
            console.log(`Updated user ${clerkUserId} to plan ${plan}`);
        } catch (e) {
            console.error('Error updating DB:', e);
            return new Response('Database error', { status: 500 });
        }
    }
  }

  return new Response('', { status: 200 });
}
