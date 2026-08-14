"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Mode = "login" | "register";

export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("register");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Algo salió mal");
        return;
      }

      router.push("/card");
      router.refresh();
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="font-display text-4xl font-black leading-none tracking-tight text-[var(--sweet-navy)]">
          SWEET
        </h1>
        <h1 className="font-display text-4xl font-black leading-none tracking-tight text-[var(--sweet-navy)]">
          BITES
        </h1>
        <p className="mt-3 text-sm text-[var(--sweet-navy)]/60">Tarjeta de fidelidad</p>
      </div>

      <div className="mb-6 flex rounded-full bg-[var(--sweet-gold)]/30 p-1">
        <button
          type="button"
          onClick={() => { setMode("register"); setError(""); }}
          className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition-colors ${
            mode === "register"
              ? "bg-[var(--sweet-navy)] text-[var(--sweet-gold)] shadow-sm"
              : "text-[var(--sweet-navy)]/70 hover:text-[var(--sweet-navy)]"
          }`}
        >
          Registrarse
        </button>
        <button
          type="button"
          onClick={() => { setMode("login"); setError(""); }}
          className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition-colors ${
            mode === "login"
              ? "bg-[var(--sweet-navy)] text-[var(--sweet-gold)] shadow-sm"
              : "text-[var(--sweet-navy)]/70 hover:text-[var(--sweet-navy)]"
          }`}
        >
          Iniciar sesión
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="mb-1.5 block text-sm font-medium text-[var(--sweet-navy)]">
            Usuario
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={3}
            autoComplete="username"
            className="w-full rounded-xl border border-[var(--sweet-gold-dark)]/40 bg-white/60 px-4 py-3 text-[var(--sweet-navy)] outline-none transition-colors focus:border-[var(--sweet-navy)] focus:ring-2 focus:ring-[var(--sweet-navy)]/15"
            placeholder="Tu nombre de usuario"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-[var(--sweet-navy)]">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={4}
            autoComplete={mode === "register" ? "new-password" : "current-password"}
            className="w-full rounded-xl border border-[var(--sweet-gold-dark)]/40 bg-white/60 px-4 py-3 text-[var(--sweet-navy)] outline-none transition-colors focus:border-[var(--sweet-navy)] focus:ring-2 focus:ring-[var(--sweet-navy)]/15"
            placeholder="Tu contraseña"
          />
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">
            <p>{error}</p>
            {mode === "login" && (
              <p className="mt-2 text-xs text-red-500">
                ¿Eres del staff? Entra por{" "}
                <Link href="/admin/login" className="font-semibold underline">
                  admin
                </Link>
                , no aquí.
              </p>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[var(--sweet-navy)] py-3.5 text-sm font-bold text-[var(--sweet-gold)] transition-colors hover:bg-[var(--sweet-navy-light)] disabled:opacity-60"
        >
          {loading
            ? "Cargando..."
            : mode === "register"
              ? "Crear mi tarjeta"
              : "Ver mi tarjeta"}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-[var(--sweet-navy)]/50">
        ¿Trabajas en Sweet Bites?{" "}
        <Link href="/admin/login" className="font-semibold text-[var(--sweet-navy)]/70 underline">
          Entrar como admin
        </Link>
      </p>
    </div>
  );
}
