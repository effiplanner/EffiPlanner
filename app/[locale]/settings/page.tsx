import type { Locale } from "@/lib/i18n";
import { SettingsForm } from "./settingsForm";

export default function SettingsPage({ params }: { params: { locale: Locale } }) {
  return (
    <main>
      <SettingsForm locale={params.locale} />
    </main>
  );
}
