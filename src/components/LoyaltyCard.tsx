"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
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
  const [celebrating, setCelebrating] = useState(false);
  const prevStamps = useRef(initialStamps);
  const prevRewards = useRef(initialRewards);
  const celebratingRef = useRef(false);

  useEffect(() => {
    async function poll() {
      try {
        const res = await fetch("/api/user", { cache: "no-store" });
        if (!res.ok) return;

        const data = (await res.json()) as {
          stamps: number;
          rewards: number;
        };

        if (celebratingRef.current) {
          prevStamps.current = data.stamps;
          prevRewards.current = data.rewards;
          return;
        }

        const earnedPrize = data.rewards > prevRewards.current;

        if (earnedPrize) {
          celebratingRef.current = true;
          setCelebrating(true);
          setPrizeFlash(true);
          setNewStampIndex(TOTAL_STAMPS - 1);
          setRemainingPulse(true);
          setStamps(TOTAL_STAMPS);
          setRewards(data.rewards);

          setTimeout(() => {
            setNewStampIndex(null);
            setRemainingPulse(false);
          }, 1800);

          setTimeout(() => {
            celebratingRef.current = false;
            setCelebrating(false);
            setPrizeFlash(false);
            setStamps(data.stamps);
            setRewards(data.rewards);
          }, 4200);
        } else if (data.stamps > prevStamps.current) {
          setNewStampIndex(data.stamps - 1);
          setRemainingPulse(true);
          setTimeout(() => {
            setNewStampIndex(null);
            setRemainingPulse(false);
          }, 1800);
          setStamps(data.stamps);
          setRewards(data.rewards);
        } else {
          setStamps(data.stamps);
          setRewards(data.rewards);
        }

        prevStamps.current = data.stamps;
        prevRewards.current = data.rewards;
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
      <div className={`wallet-card ${celebrating ? "wallet-card--celebrate" : ""}`}>
        {celebrating && <PrizeBurst />}
        <div className="wallet-section wallet-section--header bg-[var(--sweet-navy)] px-6 py-8 text-center">
          <div className="wallet-logo mx-auto">
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
              Sweet fries gratis
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
              ¡Completaste 10 sellos! Canjea tus Sweet fries 🎉
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

const BURST_PIECES = [
  { x: -42, y: -88, rot: -28, delay: 0.05, color: "#E8D5A8", size: 8 },
  { x: 18, y: -96, rot: 16, delay: 0.08, color: "#C89440", size: 6 },
  { x: 48, y: -72, rot: 38, delay: 0.12, color: "#F2D898", size: 7 },
  { x: -58, y: -54, rot: -42, delay: 0.16, color: "#3D2314", size: 5 },
  { x: 62, y: -40, rot: 22, delay: 0.1, color: "#E8C878", size: 9 },
  { x: -22, y: -78, rot: -8, delay: 0.2, color: "#F0E6C8", size: 6 },
  { x: 36, y: -58, rot: 48, delay: 0.24, color: "#8B5A20", size: 5 },
  { x: -70, y: -18, rot: -18, delay: 0.14, color: "#E8D5A8", size: 7 },
  { x: 74, y: -8, rot: 30, delay: 0.18, color: "#C89440", size: 6 },
  { x: -36, y: -36, rot: -52, delay: 0.28, color: "#F2D898", size: 8 },
  { x: 8, y: -108, rot: 6, delay: 0.06, color: "#E8C878", size: 5 },
  { x: 54, y: -92, rot: 24, delay: 0.22, color: "#3D2314", size: 4 },
  { x: -80, y: -64, rot: -34, delay: 0.26, color: "#D4C090", size: 6 },
  { x: 80, y: -52, rot: 44, delay: 0.3, color: "#F0E6C8", size: 7 },
  { x: -12, y: -50, rot: 12, delay: 0.11, color: "#8B5A20", size: 5 },
  { x: 28, y: -84, rot: -14, delay: 0.19, color: "#E8D5A8", size: 8 },
];

function PrizeBurst() {
  return (
    <div className="prize-burst" aria-hidden="true">
      {BURST_PIECES.map((piece, i) => (
        <span
          key={i}
          className="prize-burst-piece"
          style={
            {
              "--burst-x": `${piece.x}px`,
              "--burst-y": `${piece.y}px`,
              "--burst-rot": `${piece.rot}deg`,
              "--burst-delay": `${piece.delay}s`,
              "--burst-size": `${piece.size}px`,
              "--burst-color": piece.color,
            } as CSSProperties
          }
        />
      ))}
      <div className="prize-burst-banner">
        <p className="prize-burst-title">¡Premio!</p>
        <p className="prize-burst-sub">Sweet fries gratis</p>
      </div>
    </div>
  );
}
