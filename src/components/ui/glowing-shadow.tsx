import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface GlowingShadowProps {
  children: ReactNode;
  className?: string;
}

/**
 * Animated glowing-border wrapper. Styles live in `src/styles/global.css`
 * (`.glow-container` / `.glow-content` / `.glow`) so the CSS is shipped once
 * instead of being duplicated per instance. The wrapper fills its parent —
 * the child content determines the size.
 */
export function GlowingShadow({ children, className }: GlowingShadowProps) {
  return (
    <div className={cn("glow-container", className)}>
      <span className="glow" aria-hidden />
      <div className="glow-content">{children}</div>
    </div>
  );
}
