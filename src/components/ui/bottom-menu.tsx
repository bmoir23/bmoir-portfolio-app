"use client";

import {
  HouseIcon,
  ShareIcon,
  GithubIcon,
  LinkedinIcon,
  MailIcon,
  MessageCircleIcon,
  ContrastIcon,
  SunIcon,
  MoonIcon,
  LaptopMinimalIcon,
  SearchIcon,
  BookOpenIcon,
  FolderIcon,
  FilterIcon,
  TrendingUpIcon,
} from "@animateicons/react/lucide";
import { useIconHover, type IconHandle } from "@animateicons/react";
import {
  useMemo,
  useState,
  useRef,
  useEffect,
  type ReactNode,
  type Ref,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import useMeasure from "react-use-measure";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { DATA } from "@/data/resume";

type MenuView = "default" | "home" | "search" | "notifications" | "theme";

type AnimateIconComponent =
  | typeof HouseIcon
  | typeof ShareIcon
  | typeof GithubIcon
  | typeof LinkedinIcon
  | typeof MailIcon
  | typeof MessageCircleIcon
  | typeof ContrastIcon
  | typeof SunIcon
  | typeof MoonIcon
  | typeof LaptopMinimalIcon
  | typeof SearchIcon
  | typeof BookOpenIcon
  | typeof FolderIcon
  | typeof FilterIcon
  | typeof TrendingUpIcon;

type NavItem =
  | {
      name: "home" | "search" | "notifications" | "theme";
      label: string;
      kind: "menu";
      Icon: AnimateIconComponent;
    }
  | {
      name: "chat";
      label: string;
      kind: "action";
      Icon: AnimateIconComponent;
    };

const MAIN_NAV: NavItem[] = [
  { Icon: HouseIcon, name: "home", label: "Home", kind: "menu" },
  { Icon: SearchIcon, name: "search", label: "Search", kind: "menu" },
  { Icon: ShareIcon, name: "notifications", label: "Social", kind: "menu" },
  { Icon: MessageCircleIcon, name: "chat", label: "AI Assistant", kind: "action" },
  { Icon: ContrastIcon, name: "theme", label: "Theme", kind: "menu" },
];

const HOME_ITEMS: {
  Icon: AnimateIconComponent;
  text: string;
  href: string;
}[] = [
  { Icon: HouseIcon, text: "Home", href: "/" },
  { Icon: BookOpenIcon, text: "Blog", href: "/blog" },
  { Icon: FolderIcon, text: "Projects", href: "/projects" },
  { Icon: MailIcon, text: "Contact", href: "/contact" },
];

const SEARCH_OPTIONS: {
  Icon: AnimateIconComponent;
  text: string;
  href: string;
}[] = [
  { Icon: FilterIcon, text: "Blog", href: "/blog" },
  { Icon: TrendingUpIcon, text: "Projects", href: "/projects" },
];

const SOCIAL_ICON_MAP: Record<string, AnimateIconComponent> = {
  GitHub: GithubIcon,
  LinkedIn: LinkedinIcon,
  email: MailIcon,
};

const THEME_OPTIONS = [
  { key: "light" as const, Icon: SunIcon, text: "Light" },
  { key: "dark" as const, Icon: MoonIcon, text: "Dark" },
  { key: "system" as const, Icon: LaptopMinimalIcon, text: "System" },
];

const CLOSE_DELAY_MS = 180;

export type BottomMenuProps = {
  onOpenChat?: () => void;
  className?: string;
};

type DockIconButtonProps = {
  label: string;
  active?: boolean;
  expanded?: boolean;
  onOpen?: () => void;
  onClick: () => void;
  children: (ref: Ref<IconHandle>) => ReactNode;
};

function DockIconButton({
  label,
  active = false,
  expanded,
  onOpen,
  onClick,
  children,
}: DockIconButtonProps) {
  const { ref, triggerProps } = useIconHover({ trigger: "hover" });

  return (
    <motion.button
      type="button"
      aria-label={label}
      aria-expanded={expanded}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 420, damping: 24 }}
      className={`p-3 rounded-[16px] transition-colors ${
        active ? "bg-accent" : "hover:bg-muted"
      }`}
      onMouseEnter={(event) => {
        triggerProps.onMouseEnter?.(event);
        onOpen?.();
      }}
      onMouseLeave={(event) => {
        triggerProps.onMouseLeave?.(event);
      }}
      onFocus={() => onOpen?.()}
      onClick={onClick}
    >
      {children(ref)}
    </motion.button>
  );
}

const BottomMenu = ({ onOpenChat, className }: BottomMenuProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [elementRef] = useMeasure();
  const [hiddenRef, hiddenBounds] = useMeasure();
  const [view, setView] = useState<MenuView>("default");
  const [searchQuery, setSearchQuery] = useState("");
  const { theme, setTheme } = useTheme();

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const openView = (next: MenuView) => {
    clearCloseTimer();
    setView(next);
  };

  const scheduleClose = () => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      setView("default");
      closeTimerRef.current = null;
    }, CLOSE_DELAY_MS);
  };

  useEffect(() => {
    return () => clearCloseTimer();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setView("default");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const activeTheme = (theme ?? "light") as "light" | "dark" | "system";

  const socialLinks = useMemo(
    () =>
      Object.entries(DATA.contact.social)
        .filter(([, social]) => social.navbar)
        .map(([key, social]) => ({
          key,
          name: social.name,
          url: social.url,
          Icon: SOCIAL_ICON_MAP[key] ?? MailIcon,
        })),
    [],
  );

  const sharedHover =
    "group transition-all duration-75 px-3 py-2 text-[15px] text-muted-foreground w-full text-left rounded-[12px] hover:bg-muted/80 hover:text-foreground";

  const content = useMemo(() => {
    switch (view) {
      case "default":
        return null;

      case "home":
        return (
          <div className="space-y-0.5 min-w-[210px] p-[6px] py-0.5">
            {HOME_ITEMS.map(({ Icon, text, href }) => (
              <a
                key={text}
                href={href}
                className={`${sharedHover} flex items-center gap-3`}
                onClick={() => setView("default")}
              >
                <Icon
                  size={20}
                  className="text-muted-foreground group-hover:text-foreground transition-all duration-75"
                />
                <span className="transition-all duration-75">{text}</span>
              </a>
            ))}
          </div>
        );

      case "search":
        return (
          <div className="space-y-2 min-w-[270px] p-[8px] py-1">
            <form
              className="relative"
              onSubmit={(event) => {
                event.preventDefault();
                const q = searchQuery.trim();
                window.location.href = q
                  ? `/blog?q=${encodeURIComponent(q)}`
                  : "/blog";
              }}
            >
              <SearchIcon
                size={17}
                isAnimated={false}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search blog..."
                className="w-full pl-9 pr-3 py-[6px] text-[14.5px] text-foreground bg-muted/80 border border-border rounded-[12px] focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent placeholder:text-muted-foreground/50"
              />
            </form>
            <div className="flex gap-1.5">
              {SEARCH_OPTIONS.map(({ Icon, text, href }) => (
                <a
                  key={text}
                  href={href}
                  className={`${sharedHover} flex-1 flex items-center justify-center gap-1.5 bg-muted hover:bg-accent`}
                  onClick={() => setView("default")}
                >
                  <Icon
                    size={14}
                    className="text-muted-foreground group-hover:text-foreground transition-all duration-75"
                  />
                  <span className="transition-all duration-75">{text}</span>
                </a>
              ))}
            </div>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-0.5 min-w-[210px] p-[6px] py-0.5">
            {socialLinks.map(({ key, name, url, Icon }) => {
              const isExternal = url.startsWith("http");
              return (
                <a
                  key={key}
                  href={url}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                  className={`${sharedHover} flex items-center gap-3`}
                  onClick={() => setView("default")}
                >
                  <Icon
                    size={20}
                    className="text-muted-foreground group-hover:text-foreground transition-all duration-75"
                  />
                  <span className="transition-all duration-75">{name}</span>
                </a>
              );
            })}
          </div>
        );

      case "theme":
        return (
          <div className="flex items-center justify-between gap-1.5 min-w-[270px] p-[6px] py-0.5">
            {THEME_OPTIONS.map(({ key, Icon, text }) => (
              <button
                key={key}
                type="button"
                onClick={() => setTheme(key)}
                className={`flex items-center justify-center gap-2 rounded-[12px] px-3 py-2 transition-all duration-100 ${
                  activeTheme === key
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <Icon
                  size={18}
                  className={`transition-all duration-75 ${
                    activeTheme === key
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                />
                <span>{text}</span>
              </button>
            ))}
          </div>
        );

      default: {
        const _exhaustive: never = view;
        return _exhaustive;
      }
    }
  }, [view, activeTheme, searchQuery, socialLinks, setTheme]);

  return (
    <div
      ref={containerRef}
      className={cn("relative flex flex-col items-center", className)}
      onMouseEnter={clearCloseTimer}
      onMouseLeave={scheduleClose}
    >
      {/* Hidden for measurement */}
      <div
        ref={hiddenRef}
        className="absolute left-[-9999px] top-[-9999px] invisible pointer-events-none"
        aria-hidden
      >
        <div className="rounded-[18px] bg-background/95 border border-border py-1">
          {content}
        </div>
      </div>

      {/* Animated submenu */}
      <AnimatePresence mode="wait">
        {view !== "default" && (
          <motion.div
            key="submenu"
            initial={{
              opacity: 0,
              scaleY: 0.9,
              scaleX: 0.95,
              height: 0,
              width: 0,
              originY: 1,
              originX: 0.5,
            }}
            animate={{
              opacity: 1,
              scaleY: 1,
              scaleX: 1,
              height: hiddenBounds.height || "auto",
              width: hiddenBounds.width || "auto",
              originY: 1,
              originX: 0.5,
            }}
            exit={{
              opacity: 0,
              scaleY: 0.9,
              scaleX: 0.95,
              height: 0,
              width: 0,
              originY: 1,
              originX: 0.5,
            }}
            transition={{
              duration: 0.3,
              ease: [0.45, 0, 0.25, 1],
            }}
            style={{
              transformOrigin: "bottom center",
            }}
            className="absolute bottom-[70px] overflow-hidden"
          >
            <div
              ref={elementRef}
              className="rounded-[18px] bg-background/95 backdrop-blur-xl border border-border shadow-[0_10px_40px_-18px_rgba(0,0,0,0.45)]"
            >
              <AnimatePresence initial={false} mode="popLayout">
                <motion.div
                  key={view}
                  initial={{
                    opacity: 0,
                    scale: 0.96,
                    filter: "blur(10px)",
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    filter: "blur(0px)",
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.95,
                    filter: "blur(12px)",
                  }}
                  transition={{
                    duration: 0.25,
                    ease: [0.42, 0, 0.58, 1],
                  }}
                  className="py-1"
                >
                  {content}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center gap-1 bg-background/95 backdrop-blur-xl border border-border rounded-[18px] p-1 mt-3 z-10 shadow-[0_10px_40px_-18px_rgba(0,0,0,0.45)]"
      >
        {MAIN_NAV.map((item) => {
          const isMenu = item.kind === "menu";
          const isActive = isMenu && view === item.name;
          const Icon = item.Icon;

          return (
            <DockIconButton
              key={item.name}
              label={item.label}
              active={isActive}
              expanded={isMenu ? isActive : undefined}
              onOpen={
                isMenu
                  ? () => openView(item.name)
                  : undefined
              }
              onClick={() => {
                if (item.kind === "action") {
                  setView("default");
                  onOpenChat?.();
                  return;
                }
                openView(view === item.name ? "default" : item.name);
              }}
            >
              {(ref) => (
                <Icon
                  ref={ref}
                  size={22}
                  className={`transition-colors ${
                    isActive ? "text-foreground" : "text-muted-foreground"
                  }`}
                />
              )}
            </DockIconButton>
          );
        })}
      </motion.div>
    </div>
  );
};

export default BottomMenu;
