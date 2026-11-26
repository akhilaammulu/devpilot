"use client";

import React, { useState, useCallback } from "react";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTiltDeg?: number;
}

/**
 * Subtle 3D perspective tilt wrapper for featured metric cards.
 * Automatically disables motion when prefers-reduced-motion is active.
 */
export function TiltCard({ children, className = "", maxTiltDeg = 2.5 }: TiltCardProps) {
  const [transform, setTransform] = useState<string>("perspective(900px) rotateX(0deg) rotateY(0deg)");

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rotateY = (x - 0.5) * (maxTiltDeg * 2);
      const rotateX = (0.5 - y) * (maxTiltDeg * 2);
      setTransform(
        `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-2px)`
      );
    },
    [maxTiltDeg]
  );

  const handleMouseLeave = useCallback(() => {
    setTransform("perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0px)");
  }, []);

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform }}
      className={`transition-transform duration-200 ease-out will-change-transform ${className}`}
    >
      {children}
    </div>
  );
}
