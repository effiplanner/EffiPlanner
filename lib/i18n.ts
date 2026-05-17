import en from "@/messages/en.json";
import ro from "@/messages/ro.json";

export type Locale = "en" | "ro";
export const SUPPORTED_LOCALES: Locale[] = ["ro", "en"];

const DICTS: Record<Locale, Record<string, string>> = { en, ro };

export function getDict(locale: Locale) {
  return DICTS[locale] ?? DICTS.ro;
}

export function t(locale: Locale, key: string) {
  const dict = getDict(locale);
  return dict[key] ?? key;
}
