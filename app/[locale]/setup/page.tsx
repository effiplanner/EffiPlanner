import { SetupWizard } from "@/components/SetupWizard";
import type { Locale } from "@/lib/i18n";

export default function SetupPage({ params }: { params: { locale: Locale } }) {
  return (
    <main>
      <SetupWizard locale={params.locale} />
    </main>
  );
}
