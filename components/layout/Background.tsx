"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "@/lib/ThemeContext";

export function Background() {
  const { isDark } = useTheme();
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const targetRef = useRef({ x: 50, y: 50 });
  const rafRef = useRef<number | null>(null);
  const reducedMotion = useMemo(() =>
    typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false
  , []);

  useEffect(() => {
    if (reducedMotion) return; // keep static background if user prefers
    const isSmall = () => window.innerWidth < 640; // disable on very small screens

    const handleMouseMove = (e: MouseEvent) => {
      if (isSmall()) return;
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      targetRef.current = { x, y };
    };

    const tick = () => {
      // Smoothly move toward target (subtle parallax)
      const ease = 0.05; // lower = more subtle
      setMousePosition((prev) => {
        const nx = prev.x + (targetRef.current.x - prev.x) * ease;
        const ny = prev.y + (targetRef.current.y - prev.y) * ease;
        return { x: nx, y: ny };
      });
      rafRef.current = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', handleMouseMove);
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [reducedMotion]);

  return (
    <div aria-hidden>
      <div
        className="absolute inset-0 -z-10 transition-[background] duration-[2000ms] ease-out"
        style={{
          backgroundImage: isDark
            ? `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(123,179,58,0.035), transparent 55%), radial-gradient(circle at ${100 - mousePosition.x}% ${100 - mousePosition.y}%, rgba(145,200,74,0.025), transparent 45%), linear-gradient(135deg, #11140f 0%, #0a0c08 100%)`
            : `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(106,163,41,0.035), transparent 55%), radial-gradient(circle at ${100 - mousePosition.x}% ${100 - mousePosition.y}%, rgba(79,123,56,0.02), transparent 45%), linear-gradient(135deg, #f7faf6 0%, #eef6e8 100%)`,
          backgroundSize: "cover",
        }}
      />
      <div
        className="absolute inset-0 -z-10 opacity-[0.03] animate-[movePattern_120s_linear_infinite]"
        style={{
          backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><circle cx="40" cy="40" r="1" fill="%23ffffff"/></svg>')`,
          backgroundSize: "80px 80px",
        }}
      />
    </div>
  );
}
