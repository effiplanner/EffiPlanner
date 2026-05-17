import { TopNav } from "@/components/TopNav";
import { SUPPORTED_LOCALES, type Locale } from "@/lib/i18n";

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: Locale };
}) {
  const locale = SUPPORTED_LOCALES.includes(params.locale) ? params.locale : "ro";
  return (
    <div className="min-h-screen">
      <TopNav locale={locale} />
      {children}
      <footer className="mx-auto w-full max-w-4xl px-4 pb-10 pt-10 text-xs opacity-60">
        effiplanner MVP • calm food decisions
      </footer>
    </div>
  );
}

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}
