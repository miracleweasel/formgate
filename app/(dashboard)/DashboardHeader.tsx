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

  // Get user initial for avatar
  const initial = email ? email[0].toUpperCase() : "?";

  return (
    <header style={{ borderBottom: "1px solid var(--color-neutral-150)", background: "var(--color-neutral-0)" }}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/forms" className="font-semibold text-lg" style={{ color: "var(--color-neutral-900)" }}>
          {t.common.appName}
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-4 py-2 text-sm transition-colors relative"
              style={
                isActive(item.href)
                  ? {
                      color: "var(--color-accent-600)",
                      fontWeight: 500,
                    }
                  : {
                      color: "var(--color-neutral-500)",
                    }
              }
            >
              {item.label}
              {isActive(item.href) && (
                <span
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full"
                  style={{
                    width: "60%",
                    background: "var(--color-accent-600)",
                  }}
                />
              )}
            </Link>
          ))}
        </nav>

        {/* User / Logout */}
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
            style={{
              background: "var(--color-accent-100)",
              color: "var(--color-accent-700)",
            }}
            title={email}
          >
            {initial}
          </div>
          <span
            className="text-sm hidden sm:inline max-w-[140px] truncate"
            style={{ color: "var(--color-neutral-500)" }}
          >
            {email}
          </span>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="btn btn-tertiary btn-sm"
          >
            {loggingOut ? "..." : t.nav.logout}
          </button>
        </div>
      </div>
    </header>
  );
}
