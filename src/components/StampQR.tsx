"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

type StampQRProps = {
  stampUrl: string;
};

export function StampQR({ stampUrl }: StampQRProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    QRCode.toDataURL(stampUrl, {
      width: 200,
      margin: 1,
      color: { dark: "#1E2430", light: "#F0E6C8" },
    }).then(setQrDataUrl);
  }, [stampUrl]);

  return (
    <div className="flex flex-col items-center">
      <div className="rounded-xl bg-[var(--sweet-gold-light)] p-3">
        {qrDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={qrDataUrl}
            alt="QR para marcar sello"
            className="h-[140px] w-[140px]"
          />
        ) : (
          <div className="flex h-[140px] w-[140px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--sweet-navy)] border-t-transparent" />
          </div>
        )}
      </div>
      <p className="mt-2 text-center text-[10px] text-[var(--sweet-gold)]/70">
        Muestra este QR al comprar
      </p>
    </div>
  );
}
