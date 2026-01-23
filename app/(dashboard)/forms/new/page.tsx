// app/(dashboard)/forms/new/page.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewFormPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const n = name.trim();
    const s = slug.trim();
    const d = description.trim();

    if (!n) return setError("Name is required.");
    if (!s) return setError("Slug is required.");

    setSubmitting(true);
    try {
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: n,
          slug: s,
          description: d ? d : null,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Create failed");

      // si ton API renvoie { form: { id } } on redirige vers le détail
      const id = data?.form?.id;
      if (id) router.push(`/forms/${id}`);
      else router.push("/forms");
      router.refresh();
    } catch (err: any) {
      setError(String(err?.message || err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">New form</h1>
        <Link href="/forms" className="rounded-md border px-3 py-2 text-sm">
          Back
        </Link>
      </div>

      <form onSubmit={onSubmit} className="rounded-md border p-4 space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="name">
            Name <span className="text-red-600">*</span>
          </label>
          <input
            id="name"
            className="w-full rounded border px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={submitting}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="slug">
            Slug <span className="text-red-600">*</span>
          </label>
          <input
            id="slug"
            className="w-full rounded border px-3 py-2"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            disabled={submitting}
            placeholder="example: demo"
            required
          />
          <p className="text-xs text-gray-500">Used in /f/&lt;slug&gt;</p>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="description">
            Description (optional)
          </label>
          <textarea
            id="description"
            className="w-full rounded border px-3 py-2 min-h-[90px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={submitting}
          />
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-black px-4 py-2 text-white text-sm disabled:opacity-50"
        >
          {submitting ? "Creating..." : "Create"}
        </button>
      </form>
    </div>
  );
}
