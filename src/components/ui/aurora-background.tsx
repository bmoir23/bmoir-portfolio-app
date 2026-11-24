"use client";

import { cn } from "@/lib/utils";

interface AuroraBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  colors?: string[];
  speed?: number;
  blur?: number;
  intensity?: number;
  /** When true, freeze blob motion in place (used while the page is scrolling). */
  paused?: boolean;
}

export const AURORA_LIGHT_COLORS = [
  "rgba(147, 197, 253, 0.22)",
  "rgba(196, 181, 253, 0.18)",
  "rgba(110, 231, 183, 0.14)",
  "rgba(249, 168, 212, 0.14)",
  "rgba(253, 224, 71, 0.1)",
];

export const AURORA_DARK_COLORS = [
  "rgba(59, 130, 246, 0.28)",
  "rgba(139, 92, 246, 0.22)",
  "rgba(16, 185, 129, 0.18)",
  "rgba(236, 72, 153, 0.18)",
  "rgba(245, 158, 11, 0.12)",
];

interface BlobConfig {
  color: string;
  size: string;
  initialX: string;
  initialY: string;
  // Named CSS keyframe set — transform-only so scroll can pause via play-state.
  keyframes: string;
  duration: number;
}

function generateBlobs(colors: string[], speed: number): BlobConfig[] {
  return [
    {
      color: colors[0] ?? AURORA_DARK_COLORS[0],
      size: "60%",
      initialX: "10%",
      initialY: "-20%",
      keyframes: "aurora-drift-a",
      duration: 20 / speed,
    },
    {
      color: colors[1] ?? AURORA_DARK_COLORS[1],
      size: "55%",
      initialX: "60%",
      initialY: "60%",
      keyframes: "aurora-drift-b",
      duration: 25 / speed,
    },
    {
      color: colors[2] ?? AURORA_DARK_COLORS[2],
      size: "50%",
      initialX: "80%",
      initialY: "-10%",
      keyframes: "aurora-drift-c",
      duration: 22 / speed,
    },
    {
      color: colors[3] ?? AURORA_DARK_COLORS[3],
      size: "45%",
      initialX: "30%",
      initialY: "70%",
      keyframes: "aurora-drift-d",
      duration: 28 / speed,
    },
    {
      color: colors[4] ?? AURORA_DARK_COLORS[4],
      size: "65%",
      initialX: "50%",
      initialY: "30%",
      keyframes: "aurora-drift-e",
      duration: 18 / speed,
    },
  ];
}

export function AuroraBackground({
  children,
  className,
  colors = AURORA_DARK_COLORS,
  speed = 1,
  blur = 80,
  intensity = 1,
  paused = false,
}: AuroraBackgroundProps) {
  const blobs = generateBlobs(colors, speed);

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-background",
        className,
      )}
      style={{ contain: "paint", isolation: "isolate" }}
    >
      {/*
        CSS keyframes + animation-play-state: paused freezes each blob at its
        current transform instead of snapping back to the first keyframe.
      */}
      <style>{`
        @keyframes aurora-drift-a {
          0% { transform: translate3d(0%, 0%, 0) scale(1); }
          25% { transform: translate3d(40%, 30%, 0) scale(1.2); }
          50% { transform: translate3d(20%, 60%, 0) scale(0.9); }
          75% { transform: translate3d(60%, 10%, 0) scale(1.1); }
          100% { transform: translate3d(0%, 0%, 0) scale(1); }
        }
        @keyframes aurora-drift-b {
          0% { transform: translate3d(0%, 0%, 0) scale(1.1); }
          25% { transform: translate3d(-40%, -40%, 0) scale(0.8); }
          50% { transform: translate3d(20%, -10%, 0) scale(1.3); }
          75% { transform: translate3d(-20%, 20%, 0) scale(0.9); }
          100% { transform: translate3d(0%, 0%, 0) scale(1.1); }
        }
        @keyframes aurora-drift-c {
          0% { transform: translate3d(0%, 0%, 0) scale(0.9); }
          25% { transform: translate3d(-50%, 40%, 0) scale(1.3); }
          50% { transform: translate3d(-20%, 80%, 0) scale(1); }
          75% { transform: translate3d(-70%, 50%, 0) scale(1.2); }
          100% { transform: translate3d(0%, 0%, 0) scale(0.9); }
        }
        @keyframes aurora-drift-d {
          0% { transform: translate3d(0%, 0%, 0) scale(1); }
          25% { transform: translate3d(40%, -60%, 0) scale(1.1); }
          50% { transform: translate3d(-20%, -40%, 0) scale(0.8); }
          75% { transform: translate3d(20%, -10%, 0) scale(1.2); }
          100% { transform: translate3d(0%, 0%, 0) scale(1); }
        }
        @keyframes aurora-drift-e {
          0% { transform: translate3d(0%, 0%, 0) scale(1.2); }
          25% { transform: translate3d(-40%, 30%, 0) scale(0.9); }
          50% { transform: translate3d(20%, -40%, 0) scale(1.1); }
          75% { transform: translate3d(-20%, 20%, 0) scale(0.85); }
          100% { transform: translate3d(0%, 0%, 0) scale(1.2); }
        }
      `}</style>
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        {blobs.map((blob, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: blob.size,
              height: blob.size,
              background: `radial-gradient(circle, ${blob.color} 0%, transparent 70%)`,
              left: blob.initialX,
              top: blob.initialY,
              opacity: intensity,
              // Soft blur — 90–100px forced constant GPU thrash with the fixed dock.
              filter: `blur(${blur}px)`,
              willChange: paused ? "auto" : "transform",
              animationName: blob.keyframes,
              animationDuration: `${blob.duration}s`,
              animationTimingFunction: "ease-in-out",
              animationIterationCount: "infinite",
              animationPlayState: paused ? "paused" : "running",
            }}
          />
        ))}
      </div>

      <div
        className="absolute inset-0 opacity-[0.015] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
        aria-hidden="true"
      />

      {children ? <div className="relative z-10">{children}</div> : null}
    </div>
  );
}
