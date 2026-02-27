// app/(dashboard)/forms/[id]/submissions/ExportCsvButtonClient.tsx

"use client";

import { useMemo, useState } from "react";
import { t } from "@/lib/i18n";

type Props = {
  formId: string;
  latestLimit?: number; // default 50
};

export default function ExportCsvButtonClient({ formId, latestLimit = 50 }: Props) {
  const [mode, setMode] = useState<"latest" | "all">("latest");

  const href = useMemo(() => {
    const qs = new URLSearchParams();
    qs.set("mode", mode);
    if (mode === "latest") qs.set("limit", String(latestLimit));
    return `/api/forms/${encodeURIComponent(formId)}/submissions/export?${qs.toString()}`;
  }, [formId, mode, latestLimit]);

  return (
    <div className="flex items-center gap-2">
      <select
        className="input"
        style={{ width: "auto", padding: "var(--space-2) var(--space-3)", fontSize: "0.875rem" }}
        value={mode}
        onChange={(e) => setMode(e.target.value as "latest" | "all")}
        aria-label="Export mode"
      >
        <option value="latest">{t.submissions.exportLatest}</option>
        <option value="all">{t.submissions.exportAll}</option>
      </select>

      <a
        className="btn btn-primary btn-sm"
        href={href}
      >
        {t.submissions.exportCsv}
      </a>
    </div>
  );
}
