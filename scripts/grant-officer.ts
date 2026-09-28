import { Pool } from "pg";
async function main() {
// Explicit out-of-band bootstrap only. No HTTP endpoint or first-user promotion.
const userId = process.argv[2];
if (!userId || !process.env.DATABASE_URL || !process.argv.includes("--confirm")) throw new Error("Usage: npm run db:grant-officer -- VERIFIED_USER_ID --confirm (owner-approved action)");
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
try {
  const result = await pool.query(`INSERT INTO officers(user_id) SELECT id FROM "user" WHERE id=$1 AND "emailVerified"=true ON CONFLICT DO NOTHING RETURNING user_id`, [userId]);
  console.info(result.rowCount ? "Officer access granted." : "No change: identity is unverified, missing, or already an officer.");
} finally { await pool.end(); }
}
main().catch(() => { console.error("Officer grant failed. Verify configuration, identity, and explicit approval."); process.exitCode = 1; });
