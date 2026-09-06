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
 */
export default function AuroraShell() {
  const [isDark, setIsDark] = useState(false);

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

  return (
    <AuroraBackground
      className="pointer-events-none fixed inset-0 z-0 min-h-dvh bg-transparent"
      colors={isDark ? AURORA_DARK_COLORS : AURORA_LIGHT_COLORS}
      speed={0.75}
      blur={isDark ? 90 : 100}
      intensity={isDark ? 0.85 : 0.65}
    />
  );
}
