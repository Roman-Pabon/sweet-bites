"use client";

import { useEffect, useRef, useState } from "react";
import { StampIcon } from "./StampIcon";
import { SweetBitesLogo } from "./SweetBitesLogo";
import { StampQR } from "./StampQR";
import { TOTAL_STAMPS } from "@/lib/constants";

type LoyaltyCardProps = {
  username: string;
  stamps: number;
  rewards: number;
  stampUrl: string;
};

export function LoyaltyCard({
  username,
  stamps: initialStamps,
  rewards: initialRewards,
  stampUrl,
}: LoyaltyCardProps) {
  const [stamps, setStamps] = useState(initialStamps);
  const [rewards, setRewards] = useState(initialRewards);
  const [newStampIndex, setNewStampIndex] = useState<number | null>(null);
  const [remainingPulse, setRemainingPulse] = useState(false);
  const [prizeFlash, setPrizeFlash] = useState(false);
  const prevStamps = useRef(initialStamps);
  const prevRewards = useRef(initialRewards);

  useEffect(() => {
    async function poll() {
      try {
        const res = await fetch("/api/user", { cache: "no-store" });
        if (!res.ok) return;

        const data = (await res.json()) as {
          stamps: number;
          rewards: number;
        };

        if (data.stamps > prevStamps.current) {
          setNewStampIndex(data.stamps - 1);
          setRemainingPulse(true);
          setTimeout(() => {
            setNewStampIndex(null);
            setRemainingPulse(false);
          }, 1800);
        }

        if (data.rewards > prevRewards.current) {
          setPrizeFlash(true);
          setTimeout(() => setPrizeFlash(false), 2500);
        }

        prevStamps.current = data.stamps;
        prevRewards.current = data.rewards;
        setStamps(data.stamps);
        setRewards(data.rewards);
      } catch {
        // ignore polling errors
      }
    }

    poll();
    const id = setInterval(poll, 2500);
    return () => clearInterval(id);
  }, []);

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
                <StampIcon
                  filled={i < stamps}
                  index={i}
                  justFilled={newStampIndex === i}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="wallet-section wallet-section--stats grid grid-cols-2 gap-4 bg-[var(--sweet-navy)] px-6 py-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--sweet-gold)]/75">
              Te faltan...
            </p>
            <p
              className={`text-xl font-bold text-[var(--sweet-gold)] ${
                remainingPulse ? "stamps-remaining--updated" : ""
              }`}
              key={stampsRemaining}
            >
              {stampsRemaining} {stampsRemaining === 1 ? "sello" : "sellos"}
            </p>
            {remainingPulse && stampsRemaining > 0 && (
              <p className="mt-1 text-xs font-medium text-[var(--sweet-gold)]/90 animate-[wallet-section-reveal_0.4s_ease_both]">
                ¡Uno más! 🍪
              </p>
            )}
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
          {prizeFlash && (
            <p className="mt-3 text-center text-sm font-semibold text-[var(--sweet-gold)] stamp-prize-flash">
              ¡Completaste 10 sellos! Canjea tu bubble tea 🎉
            </p>
          )}
          {!prizeFlash && rewards > 0 && (
            <p className="mt-3 text-center text-sm font-semibold text-[var(--sweet-gold)] wallet-prize">
              ¡Tienes {rewards} {rewards === 1 ? "premio" : "premios"} para canjear! 🎉
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
