import { cookies } from "next/headers";

export function getProfileIdFromCookies(): string | null {
  const c = cookies().get("effi_profile");
  return c?.value ?? null;
}

export function getLocaleFromCookies(): "ro" | "en" {
  const c = cookies().get("effi_locale")?.value;
  return c === "en" ? "en" : "ro";
}
