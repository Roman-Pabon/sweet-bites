"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TOTAL_STAMPS } from "@/lib/constants";

type CustomerInfo = {
  username: string;
  stamps: number;
  rewards: number;
};

type AdminStampPanelProps = {
  token: string;
  adminUsername: string;
  initialCustomer: CustomerInfo;
};

export function AdminStampPanel({
  token,
  adminUsername,
  initialCustomer,
}: AdminStampPanelProps) {
  const router = useRouter();
  const [customer, setCustomer] = useState(initialCustomer);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleStamp() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/admin/stamp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo marcar el sello");
        return;
      }

      setCustomer(data.user);
      if (data.earnedReward) {
        setMessage("¡Premio desbloqueado! El cliente completó 10 sellos 🎉");
      } else {
        setMessage(`Sello marcado. Ahora tiene ${data.user.stamps} de ${TOTAL_STAMPS} galletas.`);
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  const stampsRemaining = Math.max(0, TOTAL_STAMPS - customer.stamps);

  return (
    <div className="w-full max-w-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-[var(--sweet-navy)]/50">Admin</p>
          <p className="font-semibold text-[var(--sweet-navy)]">{adminUsername}</p>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-full px-3 py-1.5 text-xs font-medium text-[var(--sweet-navy)]/70 ring-1 ring-[var(--sweet-navy)]/20"
        >
          Salir
        </button>
      </div>

      <div className="mb-6 rounded-2xl border-2 border-[var(--sweet-gold)] bg-[var(--sweet-navy)] p-6 text-center">
        <p className="text-xs uppercase tracking-wider text-[var(--sweet-gold)]/70">Cliente</p>
        <p className="mt-1 text-2xl font-bold text-[var(--sweet-gold)]">{customer.username}</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-[var(--sweet-navy-light)] px-3 py-2">
            <p className="text-[10px] uppercase text-[var(--sweet-gold)]/60">Sellos</p>
            <p className="text-lg font-bold text-[var(--sweet-gold)]">
              {customer.stamps}/{TOTAL_STAMPS}
            </p>
          </div>
          <div className="rounded-xl bg-[var(--sweet-navy-light)] px-3 py-2">
            <p className="text-[10px] uppercase text-[var(--sweet-gold)]/60">Premios</p>
            <p className="text-lg font-bold text-[var(--sweet-gold)]">{customer.rewards}</p>
          </div>
        </div>
        <p className="mt-3 text-sm text-[var(--sweet-gold)]/80">
          Faltan {stampsRemaining} {stampsRemaining === 1 ? "galleta" : "galletas"}
        </p>
      </div>

      {message && (
        <p className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">{message}</p>
      )}
      {error && (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      <button
        onClick={handleStamp}
        disabled={loading || customer.stamps >= TOTAL_STAMPS}
        className="flex w-full min-h-[56px] items-center justify-center gap-2 rounded-2xl bg-[var(--sweet-gold)] px-4 py-4 text-lg font-bold text-[var(--sweet-navy)] shadow-lg active:scale-[0.98] disabled:opacity-50"
      >
        {loading ? "Marcando..." : "🍪 Marcar galleta"}
      </button>

      {customer.stamps >= TOTAL_STAMPS && (
        <p className="mt-3 text-center text-sm text-[var(--sweet-navy)]/60">
          Tarjeta completa. Canjea el premio antes de seguir marcando.
        </p>
      )}
    </div>
  );
}
