// app/(dashboard)/settings/page.tsx
import { db } from "@/lib/db";
import { integrationBacklogConnections } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSessionEmail } from "@/lib/auth/getSessionEmail";
import { safeBoolHasApiKey } from "@/lib/backlog/validators";
import SettingsClient from "./SettingsClient";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const email = await getSessionEmail();
  if (!email) redirect("/login");

  let connectionData: {
    spaceUrl: string;
    defaultProjectKey: string;
    hasApiKey: boolean;
  } | null = null;

  const rows = await db
    .select({
      spaceUrl: integrationBacklogConnections.spaceUrl,
      defaultProjectKey: integrationBacklogConnections.defaultProjectKey,
      apiKey: integrationBacklogConnections.apiKey,
    })
    .from(integrationBacklogConnections)
    .where(eq(integrationBacklogConnections.userEmail, email))
    .limit(1);

  const row = rows[0];
  if (row) {
    connectionData = {
      spaceUrl: row.spaceUrl,
      defaultProjectKey: row.defaultProjectKey,
      hasApiKey: safeBoolHasApiKey(row.apiKey),
    };
  }

  return <SettingsClient connectionData={connectionData} />;
}
