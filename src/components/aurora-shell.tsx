"use client";

import { useEffect, useState } from "react";
import {
  AuroraBackground,
  AURORA_DARK_COLORS,
  AURORA_LIGHT_COLORS,
} from "@/components/ui/aurora-background";

/**
 * Full-viewport aurora backdrop that tracks the site's light/dark theme.
 * Reads `document.documentElement.classList` so it stays in sync with the
 * ThemeProvider in NavbarIsland without needing its own provider tree.
 *
 * Motion pauses while the user scrolls so the fixed dock doesn't "stick"
 * against continuously animating blurred layers.
 */
export default function AuroraShell() {
  const [isDark, setIsDark] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const sync = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    sync();

    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const onScroll = () => {
      setPaused(true);
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setPaused(false), 180);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  return (
    <AuroraBackground
      className="pointer-events-none fixed inset-0 z-0 min-h-dvh bg-transparent"
      colors={isDark ? AURORA_DARK_COLORS : AURORA_LIGHT_COLORS}
      speed={0.55}
      blur={isDark ? 56 : 64}
      intensity={isDark ? 0.85 : 0.65}
      paused={paused || reducedMotion}
    />
  );
}
