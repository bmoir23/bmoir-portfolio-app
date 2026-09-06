import { DATA } from "@/data/resume";
import { cn } from "@/lib/utils";
import type { CSSProperties } from "react";

type Social = {
  name: string;
  url: string;
  icon: (props: { className?: string }) => React.ReactNode;
  hoverBg?: string;
  hoverFg?: string;
  hoverBgDark?: string;
  hoverFgDark?: string;
};

function hoverVars(s: Social): CSSProperties {
  const vars: Record<string, string> = {};
  if (s.hoverBg) vars["--hover-bg"] = s.hoverBg;
  if (s.hoverFg) vars["--hover-fg"] = s.hoverFg;
  vars["--hover-bg-dark"] = s.hoverBgDark ?? s.hoverBg ?? "";
  vars["--hover-fg-dark"] = s.hoverFgDark ?? s.hoverFg ?? "";
  return vars as CSSProperties;
}

const ICON_CLASSES = cn(
  "group flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 text-foreground transition-colors duration-200",
  "hover:[background-color:var(--hover-bg)] hover:[color:var(--hover-fg)]",
  "dark:hover:[background-color:var(--hover-bg-dark)] dark:hover:[color:var(--hover-fg-dark)]",
);

export default function ContactSocials() {
  const socials = Object.values(DATA.contact.social) as Social[];

  return (
    <div className="flex flex-col gap-3">
      {socials.map((s) => {
        const isExternal = s.url.startsWith("http");
        const Icon = s.icon;
        return (
          <a
            key={s.name}
            href={s.url}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            aria-label={s.name}
            style={hoverVars(s)}
            className={ICON_CLASSES}
            onClick={() => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (window as any).posthog?.capture("social link clicked", {
                platform: s.name,
                url: s.url,
              });
            }}
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-card transition-colors group-hover:border-transparent group-hover:bg-white/10">
              <Icon className="size-4" />
            </span>
            <span className="text-sm font-medium">{s.name}</span>
          </a>
        );
      })}
    </div>
  );
}
