import { config } from 'dotenv';
config({ path: '.env.local' });
import { neon } from '@neondatabase/serverless';

async function main() {
  try {
    const sql = neon(process.env.NEON_DATABASE_URL!);
    await sql`DROP TABLE IF EXISTS auto_reply_rules CASCADE;`;
    console.log("Table dropped successfully.");
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}

main();
