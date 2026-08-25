"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useRouter } from "next/navigation";

type UserMenuProps = {
  username: string;
  avatarUrl: string | null;
};

function AvatarFallback({ username }: { username: string }) {
  return (
    <span className="text-base font-bold text-[var(--sweet-gold)]">
      {username.charAt(0).toUpperCase()}
    </span>
  );
}

export function UserMenu({ username, avatarUrl: initialAvatarUrl }: UserMenuProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [photoStep, setPhotoStep] = useState(false);
  const [viewingAvatar, setViewingAvatar] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open && !viewingAvatar) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, viewingAvatar]);

  function closeMenu() {
    setOpen(false);
    setPhotoStep(false);
    setViewingAvatar(false);
    setError("");
  }

  function closeAvatarPreview() {
    setViewingAvatar(false);
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetch("/api/user/avatar", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al subir la foto");
        return;
      }

      setAvatarUrl(data.avatarUrl);
      closeMenu();
      router.refresh();
    } catch {
      setError("Error de conexión");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (cameraInputRef.current) cameraInputRef.current.value = "";
    }
  }

  const menu = open ? (
    <div className="fixed inset-0 z-[9999]">
      <button
        type="button"
        aria-label="Cerrar menú"
        className="absolute inset-0 bg-black/45"
        onClick={closeMenu}
      />

      <div className="absolute inset-x-0 bottom-0 rounded-t-[24px] bg-[var(--sweet-gold-light)] px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 shadow-2xl">
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-[var(--sweet-navy)]/20" />

        <div className="mb-6 flex items-center gap-4">
          <button
            type="button"
            onClick={() => {
              if (avatarUrl) setViewingAvatar(true);
            }}
            aria-label={avatarUrl ? "Ver foto de perfil" : "Sin foto de perfil"}
            className={`relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[var(--sweet-gold-dark)] bg-[var(--sweet-navy)] ${
              avatarUrl ? "active:scale-95" : ""
            }`}
          >
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={`Foto de ${username}`}
                fill
                className="object-cover"
                sizes="64px"
                unoptimized
              />
            ) : (
              <span className="text-2xl font-bold text-[var(--sweet-gold)]">
                {username.charAt(0).toUpperCase()}
              </span>
            )}
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-bold text-[var(--sweet-navy)]">{username}</p>
            <p className="text-sm text-[var(--sweet-navy)]/60">
              {avatarUrl ? "Toca la foto para verla" : "Mi cuenta"}
            </p>
          </div>
        </div>

        {error && (
          <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        )}

        <div className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            capture="user"
            className="hidden"
            onChange={handlePhotoChange}
          />

          {!photoStep ? (
            <>
              <button
                type="button"
                disabled={uploading}
                onClick={() => {
                  setError("");
                  setPhotoStep(true);
                }}
                className="flex w-full min-h-[52px] items-center justify-center gap-3 rounded-2xl bg-[var(--sweet-navy)] px-4 py-3.5 text-base font-semibold text-[var(--sweet-gold)] active:bg-[var(--sweet-navy-light)] disabled:opacity-60"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" strokeLinecap="round" />
                  <path d="M3 16.5V18a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-1.5" strokeLinecap="round" />
                  <path d="M16 6l-4-4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 2v12" strokeLinecap="round" />
                </svg>
                Cambiar foto de perfil
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full min-h-[52px] items-center justify-center gap-3 rounded-2xl border-2 border-[var(--sweet-navy)]/20 px-4 py-3.5 text-base font-semibold text-[var(--sweet-navy)] active:bg-[var(--sweet-navy)]/5"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="16 17 21 12 16 7" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="21" y1="12" x2="9" y2="12" strokeLinecap="round" />
                </svg>
                Cerrar sesión
              </button>

              <button
                type="button"
                onClick={closeMenu}
                className="flex w-full min-h-[48px] items-center justify-center rounded-2xl py-3 text-sm font-medium text-[var(--sweet-navy)]/60 active:bg-[var(--sweet-navy)]/5"
              >
                Cancelar
              </button>
            </>
          ) : (
            <>
              <p className="pb-1 text-center text-sm font-medium text-[var(--sweet-navy)]/70">
                ¿Cómo quieres cambiar tu foto?
              </p>

              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full min-h-[52px] items-center justify-center gap-3 rounded-2xl bg-[var(--sweet-navy)] px-4 py-3.5 text-base font-semibold text-[var(--sweet-gold)] active:bg-[var(--sweet-navy-light)] disabled:opacity-60"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {uploading ? "Subiendo..." : "Elegir de la galería"}
              </button>

              <button
                type="button"
                disabled={uploading}
                onClick={() => cameraInputRef.current?.click()}
                className="flex w-full min-h-[52px] items-center justify-center gap-3 rounded-2xl border-2 border-[var(--sweet-navy)]/20 px-4 py-3.5 text-base font-semibold text-[var(--sweet-navy)] active:bg-[var(--sweet-navy)]/5 disabled:opacity-60"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                {uploading ? "Subiendo..." : "Tomar foto"}
              </button>

              <button
                type="button"
                disabled={uploading}
                onClick={() => {
                  setPhotoStep(false);
                  setError("");
                }}
                className="flex w-full min-h-[48px] items-center justify-center rounded-2xl py-3 text-sm font-medium text-[var(--sweet-navy)]/60 active:bg-[var(--sweet-navy)]/5 disabled:opacity-60"
              >
                Volver
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  ) : null;

  const avatarPreview =
    viewingAvatar && avatarUrl ? (
      <div className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-black/92 px-6">
        <button
          type="button"
          aria-label="Cerrar foto"
          className="absolute inset-0"
          onClick={closeAvatarPreview}
        />
        <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-5">
          <p className="text-sm font-semibold text-white/80">{username}</p>
          <div className="relative aspect-square w-[min(78vw,320px)] overflow-hidden rounded-full border-4 border-white/25 shadow-2xl">
            <Image
              src={avatarUrl}
              alt={`Foto de perfil de ${username}`}
              fill
              className="object-cover"
              sizes="320px"
              unoptimized
              priority
            />
          </div>
          <button
            type="button"
            onClick={closeAvatarPreview}
            className="rounded-full bg-white/15 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm active:bg-white/25"
          >
            Cerrar
          </button>
        </div>
      </div>
    ) : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Menú de usuario"
        className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[var(--sweet-gold-dark)] bg-[var(--sweet-navy)] shadow-md ring-2 ring-[var(--sweet-gold)] active:scale-95"
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={`Foto de ${username}`}
            fill
            className="object-cover"
            sizes="44px"
            unoptimized
          />
        ) : (
          <AvatarFallback username={username} />
        )}
      </button>

      {mounted && menu && createPortal(menu, document.body)}
      {mounted && avatarPreview && createPortal(avatarPreview, document.body)}
    </>
  );
}
