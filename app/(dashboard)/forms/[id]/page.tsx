// app/(dashboard)/forms/[id]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { forms } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import DeleteButton from "./DeleteButton";

type Ctx = { params: Promise<{ id: string }> | { id: string } };

function isUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

export default async function FormDetailPage(ctx: Ctx) {
  const { id: raw } = await Promise.resolve(ctx.params);
  const id = String(raw ?? "").trim();
  if (!isUuid(id)) notFound();

  const [form] = await db.select().from(forms).where(eq(forms.id, id)).limit(1);
  if (!form) notFound();

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">{form.name}</h1>
          <div className="text-sm text-gray-600">/{form.slug}</div>
        </div>

        <div className="flex gap-2">
          <Link href="/forms" className="rounded-md border px-3 py-2 text-sm">
            Back
          </Link>
          <DeleteButton id={form.id} />
        </div>
      </div>

      <div className="rounded-md border p-4 space-y-3">
        <div>
          <div className="text-xs text-gray-500">Description</div>
          <div className="text-sm">{form.description ?? "—"}</div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-500">Created</div>
            <div className="text-sm">{new Date(form.createdAt).toLocaleString()}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Updated</div>
            <div className="text-sm">{new Date(form.updatedAt).toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
