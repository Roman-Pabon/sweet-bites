"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TOTAL_STAMPS } from "@/lib/constants";

type ListedUser = {
  id: number;
  username: string;
  stamps: number;
  rewards: number;
};

type AdminUsersPanelProps = {
  adminUsername: string;
  initialUsers: ListedUser[];
};

export function AdminUsersPanel({ adminUsername, initialUsers }: AdminUsersPanelProps) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);

  useEffect(() => {
    async function poll() {
      try {
        const res = await fetch("/api/admin/users", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { users: ListedUser[] };
        setUsers(data.users);
      } catch {
        // ignore polling errors
      }
    }

    const id = setInterval(poll, 4000);
    return () => clearInterval(id);
  }, []);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-6 flex items-center justify-between gap-3">
        <Link
          href="/admin"
          className="rounded-full px-3 py-1.5 text-xs font-medium text-[var(--sweet-navy)]/70 ring-1 ring-[var(--sweet-navy)]/20"
        >
          Volver
        </Link>
        <button
          onClick={handleLogout}
          className="rounded-full px-3 py-1.5 text-xs font-medium text-[var(--sweet-navy)]/70 ring-1 ring-[var(--sweet-navy)]/20"
        >
          Salir
        </button>
      </div>

      <div className="mb-5">
        <p className="text-xs uppercase tracking-wider text-[var(--sweet-navy)]/50">Admin</p>
        <p className="font-semibold text-[var(--sweet-navy)]">{adminUsername}</p>
        <h1 className="mt-3 text-2xl font-bold text-[var(--sweet-navy)]">Usuarios</h1>
        <p className="mt-1 text-sm text-[var(--sweet-navy)]/60">
          {users.length} {users.length === 1 ? "registrado" : "registrados"}
        </p>
      </div>

      {users.length === 0 ? (
        <p className="rounded-2xl bg-[var(--sweet-navy)]/5 px-4 py-6 text-center text-sm text-[var(--sweet-navy)]/60">
          Aún no hay usuarios registrados.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {users.map((user) => (
            <li key={user.id}>
              <div className="flex min-h-[52px] items-center justify-between gap-3 rounded-2xl border-2 border-[var(--sweet-gold)] bg-[var(--sweet-navy)] px-4 py-3">
                <span className="truncate font-semibold text-[var(--sweet-gold)]">
                  {user.username}
                </span>
                <span className="shrink-0 text-sm font-bold tabular-nums text-[var(--sweet-gold-light)]">
                  {user.stamps}/{TOTAL_STAMPS}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
