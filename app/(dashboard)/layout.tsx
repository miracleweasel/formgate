// app/(dashboard)/layout.tsx

import { redirect } from "next/navigation";
import { getSessionEmail } from "@/lib/auth/getSessionEmail";
import DashboardHeader from "./DashboardHeader";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const email = await getSessionEmail();

  if (!email) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader email={email} />
      <main>{children}</main>
    </div>
  );
}
