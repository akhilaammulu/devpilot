"use client";

import React, { useEffect, useState } from "react";

interface AnimatedCounterProps {
  value: number;
  durationMs?: number;
  className?: string;
}

export function AnimatedCounter({ value, durationMs = 600, className = "" }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState<number>(value);

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplayValue(value);
      return;
    }

    let frameId: number;
    const startTime = performance.now();
    const startValue = 0;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(startValue + (value - startValue) * eased));

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [value, durationMs]);

  return <span className={className}>{displayValue}</span>;
}
