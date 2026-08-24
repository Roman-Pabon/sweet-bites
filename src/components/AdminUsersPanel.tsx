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
  backHref: string;
};

export function AdminUsersPanel({
  adminUsername,
  initialUsers,
  backHref,
}: AdminUsersPanelProps) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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

  async function handleDelete(user: ListedUser) {
    const ok = window.confirm(
      `¿Eliminar a "${user.username}"? Se borrará su tarjeta y no se puede deshacer.`
    );
    if (!ok) return;

    setDeletingId(user.id);
    setError("");
    setMessage("");

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo eliminar el usuario");
        return;
      }

      setUsers((prev) => prev.filter((item) => item.id !== user.id));
      setMessage(`Usuario "${user.username}" eliminado.`);
    } catch {
      setError("Error de conexión");
    } finally {
      setDeletingId(null);
    }
  }

  const almostReady = users.filter((user) => user.stamps === TOTAL_STAMPS - 1);
  const readyToRedeem = users.filter((user) => user.stamps >= TOTAL_STAMPS);

  return (
    <div className="w-full max-w-sm">
      <div className="mb-6 flex items-center justify-between gap-3">
        <Link
          href={backHref}
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

      {(almostReady.length > 0 || readyToRedeem.length > 0) && (
        <div className="mb-4 space-y-2">
          {almostReady.map((user) => (
            <p
              key={`almost-${user.id}`}
              className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 ring-1 ring-amber-200"
            >
              {user.username} lleva {TOTAL_STAMPS - 1}/{TOTAL_STAMPS}. Alista el premio.
            </p>
          ))}
          {readyToRedeem.map((user) => (
            <p
              key={`ready-${user.id}`}
              className="rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-800 ring-1 ring-green-200"
            >
              {user.username} completó {TOTAL_STAMPS}/{TOTAL_STAMPS}. Listo para canjear.
            </p>
          ))}
        </div>
      )}

      {message && (
        <p className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">{message}</p>
      )}
      {error && (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      {users.length === 0 ? (
        <p className="rounded-2xl bg-[var(--sweet-navy)]/5 px-4 py-6 text-center text-sm text-[var(--sweet-navy)]/60">
          Aún no hay usuarios registrados.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {users.map((user) => {
            const almost = user.stamps === TOTAL_STAMPS - 1;
            const complete = user.stamps >= TOTAL_STAMPS;

            return (
              <li key={user.id}>
                <div
                  className={`flex min-h-[52px] items-center gap-3 rounded-2xl border-2 px-3 py-3 ${
                    complete
                      ? "border-green-400 bg-[var(--sweet-navy)]"
                      : almost
                        ? "border-amber-400 bg-[var(--sweet-navy)]"
                        : "border-[var(--sweet-gold)] bg-[var(--sweet-navy)]"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-[var(--sweet-gold)]">
                      {user.username}
                    </p>
                    {almost && (
                      <p className="text-[11px] font-medium text-amber-300">Alista premio</p>
                    )}
                    {complete && (
                      <p className="text-[11px] font-medium text-green-300">Listo para canjear</p>
                    )}
                  </div>
                  <span className="shrink-0 text-sm font-bold tabular-nums text-[var(--sweet-gold-light)]">
                    {user.stamps}/{TOTAL_STAMPS}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDelete(user)}
                    disabled={deletingId === user.id}
                    className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold text-red-200 ring-1 ring-red-300/40 disabled:opacity-50"
                  >
                    {deletingId === user.id ? "..." : "Eliminar"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
