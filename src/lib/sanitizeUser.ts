const SENSITIVE_USER_FIELDS = [
  'password',
  'emailVerificationToken',
  'passwordResetToken',
  'otp',
] as const

/**
 * Defensive standing practice: strip fields that must never be rendered, stored,
 * logged, or passed through, even if a backend response nests them unexpectedly.
 */
export function stripSensitiveFields<T extends object>(obj: T): T {
  const clean = { ...obj } as Record<string, unknown>
  for (const field of SENSITIVE_USER_FIELDS) delete clean[field]
  return clean as T
}
