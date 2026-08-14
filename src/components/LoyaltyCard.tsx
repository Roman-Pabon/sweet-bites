"use client";

import { StampIcon } from "./StampIcon";
import { SweetBitesLogo } from "./SweetBitesLogo";
import { StampQR } from "./StampQR";

const TOTAL_STAMPS = 10;

type LoyaltyCardProps = {
  username: string;
  stamps: number;
  rewards: number;
  stampUrl: string;
};

export function LoyaltyCard({ username, stamps, rewards, stampUrl }: LoyaltyCardProps) {
  const stampsRemaining = Math.max(0, TOTAL_STAMPS - stamps);

  return (
    <div className="wallet-scene w-full max-w-[380px]">
      <div className="wallet-card">
        <div className="wallet-section wallet-section--header bg-[var(--sweet-navy)] px-6 py-8 text-center">
          <div className="wallet-logo">
            <SweetBitesLogo size="lg" />
          </div>
          <p className="mt-3 text-sm text-[var(--sweet-gold)]/85">Hola, {username}</p>
        </div>

        <div className="wallet-section wallet-section--stamps bg-[var(--sweet-gold-light)] px-4 py-5">
          <div className="grid grid-cols-5 gap-3">
            {Array.from({ length: TOTAL_STAMPS }, (_, i) => (
              <div key={i} className="aspect-square p-0.5">
                <StampIcon filled={i < stamps} index={i} />
              </div>
            ))}
          </div>
        </div>

        <div className="wallet-section wallet-section--stats grid grid-cols-2 gap-4 bg-[var(--sweet-navy)] px-6 py-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--sweet-gold)]/75">
              Te faltan...
            </p>
            <p className="text-xl font-bold text-[var(--sweet-gold)]">
              {stampsRemaining} {stampsRemaining === 1 ? "sello" : "sellos"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--sweet-gold)]/75">
              Bubble tea grátis
            </p>
            <p className="text-xl font-bold text-[var(--sweet-gold)]">
              {rewards} {rewards === 1 ? "premio" : "premios"}
            </p>
          </div>
        </div>

        <div className="wallet-section wallet-section--barcode bg-[var(--sweet-navy)] px-6 pb-6 pt-2">
          <StampQR stampUrl={stampUrl} />
          {rewards > 0 && (
            <p className="mt-3 text-center text-sm font-semibold text-[var(--sweet-gold)] wallet-prize">
              ¡Tienes {rewards} {rewards === 1 ? "premio" : "premios"} para canjear! 🎉
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
