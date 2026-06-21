import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en.json";
import rw from "./locales/rw.json";
import fr from "./locales/fr.json";

export const LANGUAGE_STORAGE_KEY = "imara_language";

export interface SupportedLanguage {
  code: "en" | "rw" | "fr";
  label: string;
  nativeLabel: string;
}

// Language names are always shown in their own language, never translated.
export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "rw", label: "Kinyarwanda", nativeLabel: "Ikinyarwanda" },
  { code: "fr", label: "French", nativeLabel: "Français" },
];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      rw: { translation: rw },
      fr: { translation: fr },
    },
    fallbackLng: "en",
    supportedLngs: SUPPORTED_LANGUAGES.map((lang) => lang.code),
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
      caches: ["localStorage"],
    },
    interpolation: {
      escapeValue: false,
    },
  });

i18n.on("languageChanged", (lng) => {
  document.documentElement.lang = lng;
});

export default i18n;
