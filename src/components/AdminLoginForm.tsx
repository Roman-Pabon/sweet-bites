"use client";

import { useState } from "react";
import Link from "next/link";

type AdminLoginFormProps = {
  redirectTo?: string;
};

export function AdminLoginForm({ redirectTo = "/admin" }: AdminLoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al iniciar sesión");
        return;
      }

      window.location.href = redirectTo;
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="rounded-xl bg-[var(--sweet-navy)]/5 px-4 py-3 text-center text-xs text-[var(--sweet-navy)]/70">
        Esta es la entrada solo para staff. No uses tu cuenta de cliente aquí.
      </p>
      <div>
        <label htmlFor="admin-user" className="mb-1.5 block text-sm font-medium text-[var(--sweet-navy)]">
          Usuario admin
        </label>
        <input
          id="admin-user"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="w-full rounded-xl border border-[var(--sweet-gold-dark)]/40 bg-white/60 px-4 py-3 text-[var(--sweet-navy)] outline-none focus:border-[var(--sweet-navy)] focus:ring-2 focus:ring-[var(--sweet-navy)]/15"
          placeholder="Tu usuario de admin"
        />
      </div>
      <div>
        <label htmlFor="admin-pass" className="mb-1.5 block text-sm font-medium text-[var(--sweet-navy)]">
          Contraseña
        </label>
        <input
          id="admin-pass"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full rounded-xl border border-[var(--sweet-gold-dark)]/40 bg-white/60 px-4 py-3 text-[var(--sweet-navy)] outline-none focus:border-[var(--sweet-navy)] focus:ring-2 focus:ring-[var(--sweet-navy)]/15"
          placeholder="Tu contraseña"
        />
      </div>
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-[var(--sweet-navy)] py-3.5 text-sm font-bold text-[var(--sweet-gold)] disabled:opacity-60"
      >
        {loading ? "Entrando..." : "Entrar como admin"}
      </button>
    </form>
  );
}
