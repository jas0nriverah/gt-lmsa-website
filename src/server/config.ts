export function authConfigured() {
  return ["DATABASE_URL", "BETTER_AUTH_URL", "BETTER_AUTH_SECRET", "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"].every(key => Boolean(process.env[key]) && !process.env[key]!.startsWith("replace-")) && (process.env.BETTER_AUTH_SECRET?.length ?? 0) >= 32;
}
export function membershipApprovalEnabled() { return process.env.MEMBERSHIP_APPROVAL_ENABLED === "true"; }
