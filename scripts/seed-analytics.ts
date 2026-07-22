import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../lib/db/schema';
import { eq } from 'drizzle-orm';
import 'dotenv/config';

const sql = neon(process.env.NEON_DATABASE_URL!);
const db = drizzle(sql, { schema });

async function seed() {
  const results = await db.select().from(schema.postPlatformResults);
  
  console.log(`Found ${results.length} results to seed with mock analytics data...`);
  
  for (const row of results) {
    // Generate some random realistic numbers based on platform
    let reachMultiplier = 1;
    let engagementMultiplier = 1;
    
    if (row.platform === 'twitter') {
      reachMultiplier = 500;
      engagementMultiplier = 0.05;
    } else if (row.platform === 'instagram') {
      reachMultiplier = 1000;
      engagementMultiplier = 0.15;
    } else if (row.platform === 'linkedin') {
      reachMultiplier = 300;
      engagementMultiplier = 0.25;
    }
    
    const reach = Math.floor(Math.random() * reachMultiplier * 10) + 50;
    const impressions = Math.floor(reach * (1 + Math.random() * 0.5));
    const likes = Math.floor(reach * engagementMultiplier * Math.random());
    const comments = Math.floor(likes * Math.random() * 0.3);
    const shares = Math.floor(likes * Math.random() * 0.1);
    
    await db.update(schema.postPlatformResults)
      .set({
        reach,
        impressions,
        likes,
        comments,
        shares,
      })
      .where(eq(schema.postPlatformResults.id, row.id));
  }
  
  console.log('Seeding complete!');
}

seed().catch(console.error);
