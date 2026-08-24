"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TOTAL_STAMPS } from "@/lib/constants";

type AdminUsersNavButtonProps = {
  from?: string;
};

export function AdminUsersNavButton({ from }: AdminUsersNavButtonProps) {
  const [alertCount, setAlertCount] = useState(0);
  const href = from
    ? `/admin/users?from=${encodeURIComponent(from)}`
    : "/admin/users";

  useEffect(() => {
    async function poll() {
      try {
        const res = await fetch("/api/admin/users", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as {
          users: { stamps: number }[];
        };
        const count = data.users.filter(
          (user) => user.stamps === TOTAL_STAMPS - 1 || user.stamps >= TOTAL_STAMPS
        ).length;
        setAlertCount(count);
      } catch {
        // ignore polling errors
      }
    }

    poll();
    const id = setInterval(poll, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <Link
      href={href}
      className="relative rounded-full bg-[var(--sweet-navy)] px-3 py-1.5 text-xs font-semibold text-[var(--sweet-gold)]"
    >
      Usuarios
      {alertCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FF4D6D] px-1 text-[10px] font-bold text-white">
          {alertCount}
        </span>
      )}
    </Link>
  );
}
