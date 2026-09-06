import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function GlassmorphismNavigation({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative rounded-full border border-zinc-700/70 bg-zinc-900/85 text-zinc-100 shadow-[0_10px_35px_-18px_rgba(0,0,0,0.9)] backdrop-blur-3xl dark:border-zinc-300/80 dark:bg-zinc-100/85 dark:text-zinc-900",
        className,
      )}
    >
      {children}
    </div>
  );
}

export const GLASS_NAV_ICON_BASE =
  "rounded-2xl cursor-pointer size-full bg-zinc-950/85 p-0 text-zinc-100 border border-zinc-700/70 transition-all duration-200 hover:-translate-y-0.5 hover:bg-zinc-800/95 dark:bg-white/90 dark:text-zinc-900 dark:border-zinc-300 dark:hover:bg-white";

export const GLASS_NAV_ACTIVE_ICON =
  "bg-zinc-800/95 text-[var(--active-color)] shadow-[0_0_16px_-5px_var(--active-color)] ring-1 ring-[color:var(--active-color)] dark:bg-white dark:text-[var(--active-color-dark)] dark:shadow-[0_0_16px_-5px_var(--active-color-dark)] dark:ring-[color:var(--active-color-dark)]";
