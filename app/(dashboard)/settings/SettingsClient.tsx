// app/(dashboard)/settings/SettingsClient.tsx
"use client";

import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";
import BacklogConnectionForm from "@/components/backlog/BacklogConnectionForm";

type Props = {
  connectionData: {
    spaceUrl: string;
    defaultProjectKey: string;
    hasApiKey: boolean;
  } | null;
};

export default function SettingsClient({ connectionData }: Props) {
  const router = useRouter();
  const s = t.settings;

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-8">
      <div className="page-header">
        <div>
          <h1 className="page-header-title">{s.title}</h1>
        </div>
      </div>

      <div className="card space-y-6">
        <h2
          className="text-lg font-semibold"
          style={{ color: "var(--color-neutral-800)" }}
        >
          {s.backlogConnection}
        </h2>

        <BacklogConnectionForm
          initialData={connectionData}
          onSaved={() => router.refresh()}
        />
      </div>
    </div>
  );
}
