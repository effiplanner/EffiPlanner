import { NextRequest, NextResponse } from "next/server";

const SUPPORTED_LOCALES = ["ro", "en"] as const;
const DEFAULT_LOCALE = process.env.DEFAULT_LOCALE && SUPPORTED_LOCALES.includes(process.env.DEFAULT_LOCALE as any)
  ? (process.env.DEFAULT_LOCALE as (typeof SUPPORTED_LOCALES)[number])
  : "ro";

function isSupportedLocale(value: string): value is (typeof SUPPORTED_LOCALES)[number] {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

function uuid(): string {
  // Lightweight UUIDv4-ish for cookies (good enough for MVP guest IDs).
  // In production, prefer crypto.randomUUID() (available in most runtimes).
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  const s: string[] = [];
  const hex = "0123456789abcdef";
  for (let i = 0; i < 36; i++) s.push(hex[Math.floor(Math.random() * 16)]);
  s[14] = "4";
  // @ts-ignore
  s[19] = hex[(parseInt(s[19], 16) & 0x3) | 0x8];
  s[8] = s[13] = s[18] = s[23] = "-";
  return s.join("");
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip Next internals
  if (pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname.includes(".")) {
    return NextResponse.next();
  }

  const parts = pathname.split("/").filter(Boolean);
  const maybeLocale = parts[0];

  // Ensure locale prefix
  if (!maybeLocale || !isSupportedLocale(maybeLocale)) {
    const url = req.nextUrl.clone();
    url.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`;
    const res = NextResponse.redirect(url);
    // Set guest profile cookie if absent
    if (!req.cookies.get("effi_profile")) res.cookies.set("effi_profile", uuid(), { path: "/", httpOnly: false });
    res.cookies.set("effi_locale", DEFAULT_LOCALE, { path: "/", httpOnly: false });
    return res;
  }

  const res = NextResponse.next();

  // Ensure guest profile cookie
  if (!req.cookies.get("effi_profile")) res.cookies.set("effi_profile", uuid(), { path: "/", httpOnly: false });

  // Remember locale
  res.cookies.set("effi_locale", maybeLocale, { path: "/", httpOnly: false });

  return res;
}

export const config = {
  matcher: ["/((?!_next|api).*)"],
};
