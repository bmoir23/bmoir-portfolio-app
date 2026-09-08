import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

import "./glowing-shadow.css";

interface GlowingShadowProps {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

/**
 * Wraps arbitrary content (cards, buttons, panels) with an animated
 * hue-cycling gradient border and an orbiting glow halo. The effect is
 * pure CSS (@property-driven keyframes), so it also works when the
 * component is server-rendered without hydration.
 */
export function GlowingShadow({
  children,
  className,
  contentClassName,
}: GlowingShadowProps) {
  return (
    <div className={cn("glow-container", className)}>
      <span className="glow" aria-hidden="true" />
      <div className={cn("glow-content", contentClassName)}>{children}</div>
    </div>
  );
}
