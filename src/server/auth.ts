import { betterAuth } from "better-auth";
import { getPool } from "./db";
import { authConfigured } from "./config";
import { PlatformError } from "./errors";
import { normalizeEmail, type Actor } from "./validation";

function createAuth() {
  const baseURL = process.env.BETTER_AUTH_URL!;
  if (process.env.NODE_ENV === "production" && !baseURL.startsWith("https://")) throw new PlatformError("NOT_CONFIGURED", "Secure sign-in is not configured.", 503);
  return betterAuth({
    database: getPool(), baseURL, secret: process.env.BETTER_AUTH_SECRET!,
    trustedOrigins: [new URL(baseURL).origin],
    emailAndPassword: { enabled: false },
    socialProviders: { google: { clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET!, prompt: "select_account" } },
    account: { accountLinking: { enabled: false }, encryptOAuthTokens: true },
    session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24, cookieCache: { enabled: false } },
    rateLimit: { enabled: true, storage: "database", window: 60, max: 30 },
    databaseHooks: { user: {
      create: { before: async user => ({ data: { ...user, email: normalizeEmail(user.email) } }) },
      update: { before: async user => ({ data: { ...user, ...(user.email ? { email: normalizeEmail(user.email) } : {}) } }) },
    } },
    logger: { disabled: true }, // Driver/provider errors can contain private values. HTTP logs contain only metadata.
  });
}
let instance: ReturnType<typeof createAuth> | undefined;
export function getAuth() {
  if (!authConfigured()) throw new PlatformError("NOT_CONFIGURED", "Secure sign-in is not available yet. Please contact the chapter.", 503);
  return instance ??= createAuth();
}
export async function requireActor(headers: Headers): Promise<Actor> {
  const session = await getAuth().api.getSession({ headers });
  if (!session?.user || !session.user.emailVerified) throw new PlatformError("SIGN_IN_REQUIRED", "Sign in with a verified account to continue.", 401);
  return { userId: session.user.id, email: normalizeEmail(session.user.email), emailVerified: true };
}
