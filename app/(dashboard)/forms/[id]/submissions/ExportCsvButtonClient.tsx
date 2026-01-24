// app/(dashboard)/forms/[id]/submissions/ExportCsvButtonClient.tsx

"use client";

import { useMemo, useState } from "react";

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
        className="rounded-md border px-2 py-1 text-sm"
        value={mode}
        onChange={(e) => setMode(e.target.value as "latest" | "all")}
        aria-label="Export mode"
      >
        <option value="latest">50 dernières</option>
        <option value="all">Toutes</option>
      </select>

      <a
        className="rounded-md bg-black px-3 py-1.5 text-sm text-white hover:opacity-90"
        href={href}
      >
        Export CSV
      </a>
    </div>
  );
}
