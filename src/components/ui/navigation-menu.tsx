"use client";

import * as React from "react";
import {
  motion,
  useScroll,
  useMotionValueEvent,
  type Variants,
} from "motion/react";
import { Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { DATA } from "@/data/resume";

const navItems = [
  { name: "Home", href: "/" },
  { name: "Projects", href: "/projects" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "/contact" },
];

const EXPAND_SCROLL_THRESHOLD = 80;
const COLLAPSE_SCROLL_Y = 150;
const TOP_EXPAND_Y = 48;

const containerVariants: Variants = {
  expanded: {
    y: 0,
    opacity: 1,
    width: "auto",
    transition: {
      y: { type: "spring", damping: 18, stiffness: 250 },
      opacity: { duration: 0.25 },
      type: "spring",
      damping: 22,
      stiffness: 280,
      staggerChildren: 0.06,
      delayChildren: 0.12,
    },
  },
  collapsed: {
    y: 0,
    opacity: 1,
    width: "11.5rem",
    transition: {
      type: "spring",
      damping: 22,
      stiffness: 280,
      when: "afterChildren",
      staggerChildren: 0.04,
      staggerDirection: -1,
    },
  },
};

const logoVariants: Variants = {
  expanded: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { type: "spring", damping: 16, stiffness: 260 },
  },
  collapsed: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { type: "spring", damping: 16, stiffness: 260 },
  },
};

const itemVariants: Variants = {
  expanded: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { type: "spring", damping: 15 },
  },
  collapsed: {
    opacity: 0,
    x: -12,
    scale: 0.96,
    transition: { duration: 0.18 },
  },
};

const mailVariants: Variants = {
  expanded: {
    opacity: 0,
    scale: 0.85,
    transition: { duration: 0.15 },
  },
  collapsed: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      damping: 16,
      stiffness: 280,
      delay: 0.12,
    },
  },
};

export function AnimatedNavFramer({ className }: { className?: string }) {
  const [isExpanded, setExpanded] = React.useState(true);
  const [pathname, setPathname] = React.useState("/");

  const { scrollY } = useScroll();
  const lastScrollY = React.useRef(0);
  const scrollPositionOnCollapse = React.useRef(0);

  React.useEffect(() => {
    setPathname(window.location.pathname || "/");
  }, []);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = lastScrollY.current;

    if (latest <= TOP_EXPAND_Y) {
      setExpanded(true);
    } else if (isExpanded && latest > previous && latest > COLLAPSE_SCROLL_Y) {
      setExpanded(false);
      scrollPositionOnCollapse.current = latest;
    } else if (
      !isExpanded &&
      latest < previous &&
      scrollPositionOnCollapse.current - latest > EXPAND_SCROLL_THRESHOLD
    ) {
      setExpanded(true);
    }

    lastScrollY.current = latest;
  });

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center pt-4 sm:pt-6",
        className,
      )}
    >
      <div className="pointer-events-auto">
        <motion.nav
          initial={{ y: -80, opacity: 0 }}
          animate={isExpanded ? "expanded" : "collapsed"}
          variants={containerVariants}
          aria-label="Primary"
          aria-expanded={isExpanded}
          className={cn(
            "relative flex h-12 items-center overflow-hidden rounded-full border border-border bg-background/80 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.45)] backdrop-blur-xl",
            isExpanded ? "justify-start" : "justify-between px-2",
          )}
        >
          <motion.a
            href="/"
            variants={logoVariants}
            aria-label={`${DATA.name} home`}
            className={cn(
              "flex flex-shrink-0 items-center",
              isExpanded ? "pl-3 pr-1.5" : "pl-1",
            )}
          >
            <img
              src="/brand-logo.png"
              alt=""
              width={32}
              height={32}
              className="size-8 object-contain"
            />
          </motion.a>

          <motion.div
            className={cn(
              "flex items-center gap-0.5 pr-3 sm:gap-1 sm:pr-4",
              !isExpanded && "pointer-events-none absolute opacity-0",
            )}
            aria-hidden={!isExpanded}
          >
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <motion.a
                  key={item.name}
                  href={item.href}
                  variants={itemVariants}
                  onClick={() => {
                    if (!item.href.includes("#")) {
                      setPathname(item.href);
                    }
                  }}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative px-2.5 py-1 text-sm font-medium transition-colors sm:px-3",
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.name}
                  {active && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full bg-[hsl(152_95%_55%)]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </motion.a>
              );
            })}
          </motion.div>

          <motion.a
            href="/contact"
            variants={mailVariants}
            animate={isExpanded ? "expanded" : "collapsed"}
            aria-label="Contact"
            aria-hidden={isExpanded}
            tabIndex={isExpanded ? -1 : 0}
            className={cn(
              "grid size-9 place-items-center rounded-full text-foreground transition-colors hover:bg-muted",
              isExpanded && "pointer-events-none absolute right-2",
            )}
          >
            <Mail className="size-5" strokeWidth={2} />
          </motion.a>
        </motion.nav>
      </div>
    </header>
  );
}
