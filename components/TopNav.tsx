"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function TopNav({ locale }: { locale: "ro" | "en" }) {
  const pathname = usePathname();
  const other = locale === "ro" ? "en" : "ro";
  const switchHref = `/${other}${pathname.replace(/^\/(ro|en)/, "")}`;

  return (
    <header className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-4">
      <Link href={`/${locale}`} className="text-sm font-semibold tracking-tight">
        effiplanner
      </Link>
      <nav className="flex items-center gap-3 text-sm">
        <Link href={`/${locale}/settings`} className="opacity-80 hover:opacity-100">
          {locale === "ro" ? "Setări" : "Settings"}
        </Link>
        <Link
          href={switchHref}
          className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs hover:bg-black/5"
          aria-label="Switch language"
        >
          {other.toUpperCase()}
        </Link>
      </nav>
    </header>
  );
}
