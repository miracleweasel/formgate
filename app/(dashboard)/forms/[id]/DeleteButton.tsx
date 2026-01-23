// app/(dashboard)/forms/[id]/DeleteButton.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function onDelete() {
    if (!confirm("Delete this form?")) return;

    setDeleting(true);
    const res = await fetch(`/api/forms/${id}`, { method: "DELETE" });
    setDeleting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data?.error ?? "Error");
      return;
    }

    router.push("/forms");
    router.refresh();
  }

  return (
    <button
      onClick={onDelete}
      disabled={deleting}
      className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 disabled:opacity-60"
    >
      {deleting ? "Deleting…" : "Delete"}
    </button>
  );
}
