import { enUS, fr } from "date-fns/locale"
import type { Locale } from "date-fns"

// Kinyarwanda has no date-fns locale — falls back to English formatting.
export function getDateFnsLocale(lng: string): Locale {
  return lng === "fr" ? fr : enUS
}

// For native Intl calls (toLocaleDateString/toLocaleTimeString/toLocaleString),
// which also don't recognize "rw" as a formatting locale.
export function getIntlLocale(lng: string): string {
  return lng === "fr" ? "fr-FR" : "en-US"
}
