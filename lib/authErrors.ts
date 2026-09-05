// authErrors.ts — stable error codes shared between the auth API routes
// and the client. The server always returns a `code` (plus an English
// `error` string for logs/debugging); the client maps `code` to a
// translation key so login/register errors render in whatever language
// is selected, instead of leaking the server's English string straight
// into the UI.

import type { TranslationKey } from "./i18n/en";

export type AuthErrorCode =
  | "INVALID_BODY"
  | "NAME_REQUIRED"
  | "USERNAME_REQUIRED"
  | "USERNAME_TOO_SHORT"
  | "PASSWORD_TOO_SHORT"
  | "PASSWORD_MISMATCH"
  | "USERNAME_TAKEN"
  | "MISSING_CREDENTIALS"
  | "INVALID_CREDENTIALS"
  | "UNKNOWN";

export const AUTH_ERROR_KEY: Record<AuthErrorCode, TranslationKey> = {
  INVALID_BODY: "authUnableToCreate",
  NAME_REQUIRED: "authNameRequired",
  USERNAME_REQUIRED: "authUsernameRequired",
  USERNAME_TOO_SHORT: "authUsernameTooShort",
  PASSWORD_TOO_SHORT: "authPasswordTooShort",
  PASSWORD_MISMATCH: "authPasswordMismatch",
  USERNAME_TAKEN: "authUsernameTaken",
  MISSING_CREDENTIALS: "authMissingCredentials",
  INVALID_CREDENTIALS: "authInvalidCredentials",
  UNKNOWN: "authSomethingWentWrong",
};

export class AuthApiError extends Error {
  code: AuthErrorCode;
  constructor(code: AuthErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}
