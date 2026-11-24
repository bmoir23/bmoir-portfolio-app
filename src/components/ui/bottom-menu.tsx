"use client";

import {
  House,
  Mail,
  MessageCircle,
  Contrast,
  Sun,
  Moon,
  LaptopMinimal,
  Search,
  BookOpen,
  Folder,
  Filter,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import {
  useCallback,
  useMemo,
  useState,
  useRef,
  useEffect,
  type ComponentType,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type SVGProps,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { DATA } from "@/data/resume";
import { Icons, type IconProps } from "@/components/icons";

type DockIcon = LucideIcon | ComponentType<IconProps | SVGProps<SVGSVGElement>>;

type MenuView = "default" | "home" | "search" | "social" | "theme";

type NavItem =
  | {
      name: "home" | "search" | "theme";
      label: string;
      kind: "menu";
      Icon: DockIcon;
    }
  | {
      name: "chat";
      label: string;
      kind: "action";
      Icon: DockIcon;
    }
  | {
      name: "contact";
      label: string;
      kind: "link";
      href: string;
      menu: "social";
      Icon: DockIcon;
    };

const MAIN_NAV: NavItem[] = [
  { Icon: House, name: "home", label: "Home", kind: "menu" },
  {
    Icon: Mail,
    name: "contact",
    label: "Contact",
    kind: "link",
    href: "/contact",
    menu: "social",
  },
  { Icon: Search, name: "search", label: "Search", kind: "menu" },
  { Icon: MessageCircle, name: "chat", label: "AI Assistant", kind: "action" },
  { Icon: Contrast, name: "theme", label: "Theme", kind: "menu" },
];

function menuTarget(item: NavItem): MenuView | null {
  switch (item.kind) {
    case "menu":
      return item.name;
    case "link":
      return item.menu;
    case "action":
      return null;
    default: {
      const _exhaustive: never = item;
      return _exhaustive;
    }
  }
}

const HOME_ITEMS: {
  Icon: DockIcon;
  text: string;
  href: string;
}[] = [
  { Icon: House, text: "Home", href: "/" },
  { Icon: BookOpen, text: "Blog", href: "/blog" },
  { Icon: Folder, text: "Projects", href: "/projects" },
  { Icon: Mail, text: "Contact", href: "/contact" },
];

const SEARCH_OPTIONS: {
  Icon: DockIcon;
  text: string;
  href: string;
}[] = [
  { Icon: Filter, text: "Blog", href: "/blog" },
  { Icon: TrendingUp, text: "Projects", href: "/projects" },
];

const SOCIAL_ICON_MAP: Record<string, DockIcon> = {
  GitHub: Icons.github,
  LinkedIn: Icons.linkedin,
  email: Mail,
};

const THEME_OPTIONS = [
  { key: "light" as const, Icon: Sun, text: "Light" },
  { key: "dark" as const, Icon: Moon, text: "Dark" },
  { key: "system" as const, Icon: LaptopMinimal, text: "System" },
];

const CLOSE_DELAY_MS = 180;

export type BottomMenuProps = {
  onOpenChat?: () => void;
  className?: string;
};

type DockIconButtonProps = {
  label: string;
  active?: boolean;
  current?: boolean;
  expanded?: boolean;
  href?: string;
  onOpen?: () => void;
  onClick: (event: ReactMouseEvent<HTMLElement>) => void;
  buttonRef?: (node: HTMLElement | null) => void;
  children: ReactNode;
};

function DockIconButton({
  label,
  active = false,
  current = false,
  expanded,
  href,
  onOpen,
  onClick,
  buttonRef,
  children,
}: DockIconButtonProps) {
  const className = `p-1.5 sm:p-3 rounded-[16px] transition-colors ${
    active ? "bg-accent" : "hover:bg-muted"
  }`;
  const interaction = {
    whileHover: { scale: 1.06 },
    whileTap: { scale: 0.96 },
    transition: { type: "spring" as const, stiffness: 420, damping: 24 },
    className,
    onMouseEnter: () => onOpen?.(),
    onFocus: () => onOpen?.(),
    onClick,
  };

  if (href) {
    return (
      <motion.a
        ref={buttonRef}
        href={href}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={expanded}
        aria-current={current ? "page" : undefined}
        {...interaction}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      ref={buttonRef}
      type="button"
      aria-label={label}
      aria-expanded={expanded}
      {...interaction}
    >
      {children}
    </motion.button>
  );
}

const BottomMenu = ({ onOpenChat, className }: BottomMenuProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const anchorRefs = useRef<Partial<Record<string, HTMLElement | null>>>({});
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [view, setView] = useState<MenuView>("default");
  const [openedBy, setOpenedBy] = useState<string | null>(null);
  const [pathname, setPathname] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { theme, setTheme } = useTheme();

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const closeMenu = useCallback(() => {
    setView("default");
    setOpenedBy(null);
  }, []);

  const openView = (next: MenuView, source: string) => {
    clearCloseTimer();
    setView(next);
    setOpenedBy(source);
  };

  const scheduleClose = () => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      closeMenu();
      closeTimerRef.current = null;
    }, CLOSE_DELAY_MS);
  };

  useEffect(() => {
    return () => clearCloseTimer();
  }, []);

  useEffect(() => {
    setPathname(window.location.pathname);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setView("default");
        setOpenedBy(null);
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
          Icon: SOCIAL_ICON_MAP[key] ?? Mail,
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
                onClick={closeMenu}
              >
                <Icon
                  width={20}
                  height={20}
                  className="size-5 text-muted-foreground group-hover:text-foreground transition-all duration-75"
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
              <Search
                className="absolute left-3 top-1/2 size-[17px] -translate-y-1/2 text-muted-foreground pointer-events-none"
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
                  onClick={closeMenu}
                >
                  <Icon
                    width={14}
                    height={14}
                    className="size-3.5 text-muted-foreground group-hover:text-foreground transition-all duration-75"
                  />
                  <span className="transition-all duration-75">{text}</span>
                </a>
              ))}
            </div>
          </div>
        );

      case "social":
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
                  onClick={closeMenu}
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
                  width={18}
                  height={18}
                  className={`size-[18px] transition-all duration-75 ${
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
  }, [view, activeTheme, searchQuery, socialLinks, setTheme, closeMenu]);

  const menuShift = (() => {
    if (view !== "social" || typeof window === "undefined") return 0;
    const button = anchorRefs.current.contact;
    const container = containerRef.current;
    if (!button || !container) return 0;
    const containerBox = container.getBoundingClientRect();
    const buttonBox = button.getBoundingClientRect();
    return (
      buttonBox.left +
      buttonBox.width / 2 -
      (containerBox.left + containerBox.width / 2)
    );
  })();

  return (
    <div
      ref={containerRef}
      className={cn("relative flex flex-col items-center", className)}
      onMouseEnter={clearCloseTimer}
      onMouseLeave={scheduleClose}
    >
      {/*
        Submenu: opacity + translate only (no height/width/filter animations).
        Animating filter/size on a fixed dock was a major cause of scroll sticking.
      */}
      <AnimatePresence>
        {view !== "default" && (
          <motion.div
            key="submenu"
            initial={{ opacity: 0, y: 8, x: menuShift }}
            animate={{ opacity: 1, y: 0, x: menuShift }}
            exit={{ opacity: 0, y: 6, x: menuShift }}
            transition={{
              duration: 0.18,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="absolute bottom-[70px]"
          >
            <div className="rounded-[18px] bg-background/95 backdrop-blur-md border border-border shadow-[0_10px_40px_-18px_rgba(0,0,0,0.45)] py-1">
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center gap-0 sm:gap-1 bg-background/95 backdrop-blur-md border border-border rounded-[18px] p-1 mt-3 z-10 shadow-[0_10px_40px_-18px_rgba(0,0,0,0.45)]"
      >
        {MAIN_NAV.map((item) => {
          const target = menuTarget(item);
          const isMenuActive =
            target !== null && view === target && openedBy === item.name;
          const onContactPage =
            item.kind === "link" &&
            (pathname === item.href || pathname.startsWith(`${item.href}/`));
          const isActive = isMenuActive || onContactPage;
          const Icon = item.Icon;

          return (
            <DockIconButton
              key={item.name}
              label={item.label}
              href={item.kind === "link" ? item.href : undefined}
              active={isActive}
              current={onContactPage}
              expanded={target ? isMenuActive : undefined}
              buttonRef={
                item.kind === "link"
                  ? (node) => {
                      anchorRefs.current[item.name] = node;
                    }
                  : undefined
              }
              onOpen={
                target ? () => openView(target, item.name) : undefined
              }
              onClick={(event) => {
                switch (item.kind) {
                  case "action":
                    closeMenu();
                    onOpenChat?.();
                    return;
                  case "link": {
                    const canHover = window.matchMedia(
                      "(hover: hover) and (pointer: fine)",
                    ).matches;
                    if (canHover) return;
                    if (view === item.menu && openedBy === item.name) return;
                    event.preventDefault();
                    openView(item.menu, item.name);
                    return;
                  }
                  case "menu":
                    if (view === item.name && openedBy === item.name) {
                      closeMenu();
                    } else {
                      openView(item.name, item.name);
                    }
                    return;
                  default: {
                    const _exhaustive: never = item;
                    return _exhaustive;
                  }
                }
              }}
            >
              <Icon
                size={20}
                width={20}
                height={20}
                className={`size-5 transition-colors ${
                  isActive ? "text-foreground" : "text-muted-foreground"
                }`}
              />
            </DockIconButton>
          );
        })}
      </motion.div>
    </div>
  );
};

export default BottomMenu;
