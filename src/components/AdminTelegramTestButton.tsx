"use client";

import { useState } from "react";

export function AdminTelegramTestButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleTest() {
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/admin/telegram-test", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo enviar la prueba");
        return;
      }
      setMessage("Mensaje de prueba enviado a Telegram.");
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={handleTest}
        disabled={loading}
        className="w-full rounded-2xl px-4 py-3 text-sm font-semibold text-[var(--sweet-navy)] ring-2 ring-[var(--sweet-navy)]/20 active:scale-[0.98] disabled:opacity-50"
      >
        {loading ? "Enviando..." : "Probar aviso de Telegram"}
      </button>
      {message && <p className="mt-2 text-sm text-green-700">{message}</p>}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
