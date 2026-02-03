// app/(dashboard)/DashboardHeader.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { t } from "@/lib/i18n";

type Props = {
  email: string;
};

export default function DashboardHeader({ email }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  }

  const navItems = [
    { href: "/forms", label: t.nav.forms },
    { href: "/billing", label: t.nav.billing },
  ];

  function isActive(href: string) {
    if (href === "/forms") {
      return pathname === "/forms" || pathname.startsWith("/forms/");
    }
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <header className="border-b bg-white">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/forms" className="font-semibold text-lg">
          {t.common.appName}
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-2 text-sm rounded-md transition-colors ${
                isActive(item.href)
                  ? "bg-gray-100 font-medium"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User / Logout */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 hidden sm:inline">
            {email}
          </span>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="px-3 py-1.5 text-sm rounded-md border hover:bg-gray-50 disabled:opacity-50"
          >
            {loggingOut ? "..." : t.nav.logout}
          </button>
        </div>
      </div>
    </header>
  );
}
