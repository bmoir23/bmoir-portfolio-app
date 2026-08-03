import { useEffect, useState } from "react";
import { Dock, DockIcon } from "@/components/magicui/dock";
import { ModeToggle } from "@/components/mode-toggle";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DATA } from "@/data/resume";
import { cn } from "@/lib/utils";
import ChatbotPanel from "@/components/ChatbotPanel";
import { Bot } from "lucide-react";
import type { CSSProperties } from "react";
import {
  GlassmorphismNavigation,
  GLASS_NAV_ACTIVE_ICON,
  GLASS_NAV_ICON_BASE,
} from "@/components/ui/glassmorphism-navigation";

type HoverStyle = {
  hoverBg?: string;
  hoverFg?: string;
  hoverBgDark?: string;
  hoverFgDark?: string;
};

function hoverStyleVars(item: HoverStyle): CSSProperties {
  const vars: Record<string, string> = {};
  if (item.hoverBg) vars["--hover-bg"] = item.hoverBg;
  if (item.hoverFg) vars["--hover-fg"] = item.hoverFg;
  if (item.hoverBgDark) vars["--hover-bg-dark"] = item.hoverBgDark;
  if (item.hoverFgDark) vars["--hover-fg-dark"] = item.hoverFgDark;
  if (item.hoverBg && !item.hoverBgDark) vars["--hover-bg-dark"] = item.hoverBg;
  if (item.hoverFg && !item.hoverFgDark) vars["--hover-fg-dark"] = item.hoverFg;
  vars["--active-color"] = item.hoverBg ?? "hsl(var(--primary))";
  vars["--active-color-dark"] = item.hoverBgDark ?? item.hoverBg ?? "hsl(var(--primary))";
  return vars as CSSProperties;
}

function isActivePath(itemHref: string, pathname: string): boolean {
  if (!itemHref.startsWith("/")) return false;
  if (itemHref === "/") return pathname === "/";
  return pathname === itemHref || pathname.startsWith(`${itemHref}/`);
}

const HOVER_ICON_CLASSES = cn(
  "transition-colors duration-200",
  "hover:[background-color:var(--hover-bg)] hover:[color:var(--hover-fg)]",
  "dark:hover:[background-color:var(--hover-bg-dark)] dark:hover:[color:var(--hover-fg-dark)]",
  "[&>svg]:hover:[color:var(--hover-fg)] [&>svg]:dark:hover:[color:var(--hover-fg-dark)]",
);

export default function Navbar() {
  const [chatOpen, setChatOpen] = useState(false);
  const [pathname, setPathname] = useState("/");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const syncPath = () => setPathname(window.location.pathname || "/");
    syncPath();
    window.addEventListener("popstate", syncPath);
    return () => window.removeEventListener("popstate", syncPath);
  }, []);

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-30">
        <GlassmorphismNavigation className="z-50 pointer-events-auto w-fit mx-auto">
          <Dock className="relative h-14 p-2 w-fit mx-auto flex gap-2 border-0 bg-transparent shadow-none">
            {DATA.navbar.map((item) => {
              const isExternal = item.href.startsWith("http");
              const hasHover = Boolean((item as HoverStyle).hoverBg);
              const hover = hoverStyleVars(item as HoverStyle);
              const isActive = isActivePath(item.href, pathname);
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <a
                      href={item.href}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                      aria-label={item.label}
                      style={hover}
                      className="group"
                      onClick={() => {
                        if (!isExternal) setPathname(item.href);
                      }}
                    >
                      <DockIcon
                        className={cn(
                          GLASS_NAV_ICON_BASE,
                          hasHover
                            ? HOVER_ICON_CLASSES
                            : "hover:bg-zinc-800/95 dark:hover:bg-white",
                          isActive && GLASS_NAV_ACTIVE_ICON,
                        )}
                      >
                        <item.icon className="size-full rounded-sm overflow-hidden object-contain" />
                      </DockIcon>
                    </a>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    sideOffset={8}
                    className="rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]"
                  >
                    <p>{item.label}</p>
                    <TooltipArrow className="fill-primary" />
                  </TooltipContent>
                </Tooltip>
              );
            })}
            <Separator
              orientation="vertical"
              className="h-2/3 m-auto w-px bg-zinc-600/60 dark:bg-zinc-300"
            />
            {Object.entries(DATA.contact.social)
              .filter(([_, social]) => social.navbar)
              .map(([name, social], index) => {
                const isExternal = social.url.startsWith("http");
                const IconComponent = social.icon;
                const hover = hoverStyleVars(social as HoverStyle);
                return (
                  <Tooltip key={`social-${name}-${index}`}>
                    <TooltipTrigger asChild>
                      <a
                        href={social.url}
                        target={isExternal ? "_blank" : undefined}
                        rel={isExternal ? "noopener noreferrer" : undefined}
                        aria-label={social.name}
                        style={hover}
                        className="group"
                      >
                        <DockIcon className={cn(GLASS_NAV_ICON_BASE, HOVER_ICON_CLASSES)}>
                          <IconComponent className="size-full rounded-sm overflow-hidden object-contain" />
                        </DockIcon>
                      </a>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      sideOffset={8}
                      className="rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]"
                    >
                      <p>{name}</p>
                      <TooltipArrow className="fill-primary" />
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            <Separator
              orientation="vertical"
              className="h-2/3 m-auto w-px bg-zinc-600/60 dark:bg-zinc-300"
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => setChatOpen((v) => !v)}
                  aria-label={chatOpen ? "Close chat assistant" : "Open chat assistant"}
                  className="group relative"
                >
                  <DockIcon className={cn(GLASS_NAV_ICON_BASE, "hover:bg-zinc-800/95 dark:hover:bg-white") }>
                    <Bot className="size-full rounded-sm overflow-hidden object-contain" />
                  </DockIcon>
                  <span className="absolute -right-0.5 -top-0.5 flex size-3.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex size-3.5 rounded-full border-2 border-card bg-emerald-500" />
                  </span>
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                sideOffset={8}
                className="rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]"
              >
                <p>AI Assistant</p>
                <TooltipArrow className="fill-primary" />
              </TooltipContent>
            </Tooltip>
            <Separator
              orientation="vertical"
              className="h-2/3 m-auto w-px bg-zinc-600/60 dark:bg-zinc-300"
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <DockIcon className={cn(GLASS_NAV_ICON_BASE, "hover:bg-zinc-800/95 dark:hover:bg-white") }>
                  <ModeToggle className="size-full cursor-pointer" />
                </DockIcon>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                sideOffset={8}
                className="rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]"
              >
                <p>Theme</p>
                <TooltipArrow className="fill-primary" />
              </TooltipContent>
            </Tooltip>
          </Dock>
        </GlassmorphismNavigation>
      </div>

      <div className="pointer-events-auto fixed bottom-24 right-4 z-40">
        <ChatbotPanel open={chatOpen} onClose={() => setChatOpen(false)} />
      </div>
    </>
  );
}
