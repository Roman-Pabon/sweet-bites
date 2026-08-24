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
  const latestRef = useRef({ stamps: initialStamps, rewards: initialRewards });
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

        latestRef.current = data;

        // Durante el festejo no tocamos la UI; al terminar aplicamos el estado real.
        if (celebratingRef.current) {
          return;
        }

        const earnedPrize =
          data.rewards > prevRewards.current && data.stamps >= TOTAL_STAMPS;

        if (earnedPrize) {
          celebratingRef.current = true;
          setCelebrating(true);
          setPrizeFlash(true);
          setNewStampIndex(TOTAL_STAMPS - 1);
          setRemainingPulse(true);
          setStamps(data.stamps);
          setRewards(data.rewards);
          prevStamps.current = data.stamps;
          prevRewards.current = data.rewards;

          setTimeout(() => {
            setNewStampIndex(null);
            setRemainingPulse(false);
          }, 1800);

          setTimeout(() => {
            celebratingRef.current = false;
            setCelebrating(false);
            setPrizeFlash(false);
            setStamps(latestRef.current.stamps);
            setRewards(latestRef.current.rewards);
            prevStamps.current = latestRef.current.stamps;
            prevRewards.current = latestRef.current.rewards;
          }, 5600);
        } else if (data.stamps > prevStamps.current) {
          setNewStampIndex(data.stamps - 1);
          setRemainingPulse(true);
          setTimeout(() => {
            setNewStampIndex(null);
            setRemainingPulse(false);
          }, 1800);
          setStamps(data.stamps);
          setRewards(data.rewards);
          prevStamps.current = data.stamps;
          prevRewards.current = data.rewards;
        } else {
          setStamps(data.stamps);
          setRewards(data.rewards);
          prevStamps.current = data.stamps;
          prevRewards.current = data.rewards;
        }
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
          <div className={`grid grid-cols-5 gap-3 ${celebrating ? "stamps-celebrate" : ""}`}>
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
              {stampsRemaining === 0 ? "Estado" : "Te faltan..."}
            </p>
            <p
              className={`text-xl font-bold text-[var(--sweet-gold)] ${
                remainingPulse ? "stamps-remaining--updated" : ""
              }`}
              key={stampsRemaining}
            >
              {stampsRemaining === 0
                ? "Completa"
                : `${stampsRemaining} ${stampsRemaining === 1 ? "sello" : "sellos"}`}
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
          {stamps >= TOTAL_STAMPS && (
            <p
              className={`mt-3 text-center text-sm font-semibold text-[var(--sweet-gold)] ${
                prizeFlash ? "stamp-prize-flash" : "wallet-prize"
              }`}
            >
              ¡Tienes 1 premio para canjear! 🎉
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

const FEST_COLORS = [
  "#FF4D6D",
  "#FF8FA3",
  "#FFD60A",
  "#FF9F1C",
  "#2EC4B6",
  "#4CC9F0",
  "#7B2CBF",
  "#F72585",
  "#80ED99",
  "#F8F9FA",
  "#E8D5A8",
  "#C77DFF",
  "#00BBF9",
  "#F94144",
];

const CONFETTI_SHAPES = ["rect", "circle", "ribbon", "star", "diamond"] as const;
const FLOATERS = ["🍪", "🎉", "✨", "⭐", "🎊", "💛", "🍟"];

function PrizeBurst() {
  const confetti = Array.from({ length: 56 }, (_, i) => ({
    left: `${(i * 17 + 9) % 100}%`,
    delay: `${(i % 28) * 0.11}s`,
    duration: `${2.1 + (i % 6) * 0.28}s`,
    color: FEST_COLORS[i % FEST_COLORS.length],
    size: `${7 + (i % 9) * 1.6}px`,
    rot: `${(i * 41) % 360}deg`,
    drift: `${((i % 9) - 4) * 22}px`,
    shape: CONFETTI_SHAPES[i % CONFETTI_SHAPES.length],
  }));

  const bursts = Array.from({ length: 32 }, (_, i) => {
    const angle = (i / 32) * Math.PI * 2;
    const dist = 110 + (i % 6) * 28;
    return {
      x: `${Math.cos(angle) * dist}px`,
      y: `${Math.sin(angle) * dist}px`,
      delay: `${0.04 + (i % 8) * 0.035}s`,
      color: FEST_COLORS[(i + 3) % FEST_COLORS.length],
      size: `${6 + (i % 7) * 2}px`,
      rot: `${(i * 23) % 360}deg`,
      shape: CONFETTI_SHAPES[(i + 2) % CONFETTI_SHAPES.length],
    };
  });

  const sparkles = Array.from({ length: 18 }, (_, i) => ({
    left: `${8 + ((i * 29) % 84)}%`,
    top: `${10 + ((i * 37) % 72)}%`,
    delay: `${0.2 + (i % 9) * 0.12}s`,
    size: `${10 + (i % 5) * 6}px`,
  }));

  return (
    <div className="prize-fest" aria-hidden="true">
      <div className="prize-fest-vignette" />
      <div className="prize-fest-flash" />
      <div className="prize-fest-rings">
        <span />
        <span />
        <span />
        <span />
      </div>

      {confetti.map((piece, i) => (
        <span
          key={`c-${i}`}
          className={`prize-fest-confetti prize-fest-shape--${piece.shape}`}
          style={
            {
              left: piece.left,
              "--fest-delay": piece.delay,
              "--fest-duration": piece.duration,
              "--fest-color": piece.color,
              "--fest-size": piece.size,
              "--fest-rot": piece.rot,
              "--fest-drift": piece.drift,
            } as CSSProperties
          }
        />
      ))}

      {bursts.map((piece, i) => (
        <span
          key={`b-${i}`}
          className={`prize-fest-burst prize-fest-shape--${piece.shape}`}
          style={
            {
              "--burst-x": piece.x,
              "--burst-y": piece.y,
              "--burst-delay": piece.delay,
              "--burst-color": piece.color,
              "--burst-size": piece.size,
              "--burst-rot": piece.rot,
            } as CSSProperties
          }
        />
      ))}

      {sparkles.map((sparkle, i) => (
        <span
          key={`s-${i}`}
          className="prize-fest-sparkle"
          style={
            {
              left: sparkle.left,
              top: sparkle.top,
              "--spark-delay": sparkle.delay,
              "--spark-size": sparkle.size,
            } as CSSProperties
          }
        />
      ))}

      {FLOATERS.map((emoji, i) => (
        <span
          key={`e-${i}`}
          className="prize-fest-floater"
          style={
            {
              "--float-delay": `${0.15 + i * 0.14}s`,
              "--float-x": `${-42 + i * 14}%`,
              "--float-rot": `${i % 2 === 0 ? -18 : 16}deg`,
            } as CSSProperties
          }
        >
          {emoji}
        </span>
      ))}

      <div className="prize-fest-banner">
        <p className="prize-fest-kicker">10 / 10 sellos</p>
        <p className="prize-fest-title">¡Premio!</p>
        <p className="prize-fest-sub">Sweet fries gratis</p>
      </div>
    </div>
  );
}
