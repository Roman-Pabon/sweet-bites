"use client";

import { useState } from "react";
import Link from "next/link";
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
  const [loadingAction, setLoadingAction] = useState<"stamp" | "unstamp" | "redeem" | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const loading = loadingAction !== null;

  async function handleStamp() {
    setLoadingAction("stamp");
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
      setLoadingAction(null);
    }
  }

  async function handleUnstamp() {
    setLoadingAction("unstamp");
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/admin/unstamp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo quitar el sello");
        return;
      }

      setCustomer(data.user);
      if (data.removedReward) {
        setMessage(
          `Marca quitada. Ahora tiene ${data.user.stamps} de ${TOTAL_STAMPS} galletas y se deshizo el premio.`
        );
      } else {
        setMessage(`Marca quitada. Ahora tiene ${data.user.stamps} de ${TOTAL_STAMPS} galletas.`);
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleRedeem() {
    setLoadingAction("redeem");
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/admin/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo reiniciar la tarjeta");
        return;
      }

      setCustomer(data.user);
      setMessage("Premio entregado. La tarjeta quedó en 0 sellos.");
    } catch {
      setError("Error de conexión");
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  const stampsRemaining = Math.max(0, TOTAL_STAMPS - customer.stamps);
  const cardComplete = customer.stamps >= TOTAL_STAMPS;

  return (
    <div className="w-full max-w-sm">
      <div className="mb-6 flex items-center justify-between gap-3">
        <Link
          href="/admin/users"
          className="rounded-full bg-[var(--sweet-navy)] px-3 py-1.5 text-xs font-semibold text-[var(--sweet-gold)]"
        >
          Usuarios
        </Link>
        <button
          onClick={handleLogout}
          className="rounded-full px-3 py-1.5 text-xs font-medium text-[var(--sweet-navy)]/70 ring-1 ring-[var(--sweet-navy)]/20"
        >
          Salir
        </button>
      </div>
      <div className="mb-6">
        <p className="text-xs uppercase tracking-wider text-[var(--sweet-navy)]/50">Admin</p>
        <p className="font-semibold text-[var(--sweet-navy)]">{adminUsername}</p>
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
          {cardComplete
            ? "Tarjeta completa. Entrega el premio en físico."
            : `Faltan ${stampsRemaining} ${stampsRemaining === 1 ? "galleta" : "galletas"}`}
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
        disabled={loading || cardComplete}
        className="flex w-full min-h-[56px] items-center justify-center gap-2 rounded-2xl bg-[var(--sweet-gold)] px-4 py-4 text-lg font-bold text-[var(--sweet-navy)] shadow-lg active:scale-[0.98] disabled:opacity-50"
      >
        {loadingAction === "stamp" ? "Marcando..." : "🍪 Marcar galleta"}
      </button>

      <button
        onClick={handleUnstamp}
        disabled={loading || customer.stamps <= 0}
        className="mt-3 flex w-full min-h-[56px] items-center justify-center gap-2 rounded-2xl bg-transparent px-4 py-4 text-lg font-bold text-[var(--sweet-navy)] ring-2 ring-[var(--sweet-navy)]/25 active:scale-[0.98] disabled:opacity-50"
      >
        {loadingAction === "unstamp" ? "Quitando..." : "Quitar marca"}
      </button>

      {cardComplete && (
        <>
          <p className="mt-3 text-center text-sm text-[var(--sweet-navy)]/60">
            Entrega el premio en físico y luego reinicia la tarjeta.
          </p>
          <button
            onClick={handleRedeem}
            disabled={loading || customer.rewards < 1}
            className="mt-3 flex w-full min-h-[56px] items-center justify-center gap-2 rounded-2xl bg-[var(--sweet-navy)] px-4 py-4 text-lg font-bold text-[var(--sweet-gold)] shadow-lg ring-2 ring-[var(--sweet-gold)] active:scale-[0.98] disabled:opacity-50"
          >
            {loadingAction === "redeem" ? "Reiniciando..." : "Reiniciar tarjeta"}
          </button>
        </>
      )}
    </div>
  );
}
