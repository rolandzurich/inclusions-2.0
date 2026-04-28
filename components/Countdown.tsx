"use client";

import { useState, useEffect } from "react";

const TARGET = new Date("2026-10-03T13:00:00+02:00");

function getTimeLeft() {
  const now = new Date();
  const diff = TARGET.getTime() - now.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, isPast: false };
}

function Pad({ value }: { value: number }) {
  return <span className="tabular-nums">{String(value).padStart(2, "0")}</span>;
}

export function Countdown() {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center gap-2 md:gap-4 mb-6 md:mb-8 animate-fade-in">
        <div className="flex gap-2 md:gap-4">
          {[0, 0, 0, 0].map((_, i) => (
            <div
              key={i}
              className="rounded-xl bg-white/10 border border-white/20 px-3 py-2 md:px-5 md:py-3 min-w-[4rem] md:min-w-[5rem]"
            >
              <div className="text-2xl md:text-3xl font-bold text-white [text-shadow:_2px_2px_4px_rgb(0_0_0_/_80%)]">
                00
              </div>
              <div className="text-[10px] md:text-xs uppercase tracking-wider text-white/70 mt-0.5">
                {["Tage", "Std", "Min", "Sek"][i]}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (timeLeft.isPast) {
    return null;
  }

  const units = [
    { value: timeLeft.days, label: "Tage" },
    { value: timeLeft.hours, label: "Std" },
    { value: timeLeft.minutes, label: "Min" },
    { value: timeLeft.seconds, label: "Sek" },
  ];

  return (
    <div className="flex items-center justify-center gap-2 md:gap-4 mb-6 md:mb-8 animate-fade-in">
      <div className="flex gap-2 md:gap-4">
        {units.map(({ value, label }) => (
          <div
            key={label}
            className="rounded-xl bg-white/10 border border-white/20 px-3 py-2 md:px-5 md:py-3 min-w-[4rem] md:min-w-[5rem] text-center"
          >
            <div className="text-2xl md:text-3xl font-bold text-white [text-shadow:_2px_2px_4px_rgb(0_0_0_/_80%)]">
              <Pad value={value} />
            </div>
            <div className="text-[10px] md:text-xs uppercase tracking-wider text-white/70 mt-0.5">
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
