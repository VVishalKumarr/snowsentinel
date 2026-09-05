// sessionConstants.ts — deliberately has zero Node-specific imports (no
// 'crypto', no DB client) so middleware.ts (which runs on the Edge
// runtime) can import the cookie name without pulling in lib/auth.ts's
// Node-only password-hashing code, which Edge can't run.
export const SESSION_COOKIE_NAME = "snowsentinel_session";
export const SESSION_TTL_DAYS = 30;
export const SESSION_TTL_SECONDS = SESSION_TTL_DAYS * 24 * 60 * 60;
