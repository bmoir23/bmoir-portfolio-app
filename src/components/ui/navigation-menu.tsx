"use client";

import * as React from "react";
import {
  motion,
  useScroll,
  useMotionValueEvent,
  type Variants,
} from "motion/react";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { DATA } from "@/data/resume";

const navItems = [
  { name: "Home", href: "/" },
  { name: "About", href: "/#about" },
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
      opacity: { duration: 0.3 },
      type: "spring",
      damping: 20,
      stiffness: 300,
      staggerChildren: 0.07,
      delayChildren: 0.2,
    },
  },
  collapsed: {
    y: 0,
    opacity: 1,
    width: "3rem",
    transition: {
      type: "spring",
      damping: 20,
      stiffness: 300,
      when: "afterChildren",
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

const logoVariants: Variants = {
  expanded: {
    opacity: 1,
    x: 0,
    rotate: 0,
    transition: { type: "spring", damping: 15 },
  },
  collapsed: {
    opacity: 0,
    x: -25,
    rotate: -180,
    transition: { duration: 0.3 },
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
    x: -20,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};

const collapsedIconVariants: Variants = {
  expanded: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
  collapsed: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      damping: 15,
      stiffness: 300,
      delay: 0.15,
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

  const handleNavClick = (e: React.MouseEvent) => {
    if (!isExpanded) {
      e.preventDefault();
      setExpanded(true);
    }
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/#")) return pathname === "/";
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
          whileHover={!isExpanded ? { scale: 1.08 } : undefined}
          whileTap={!isExpanded ? { scale: 0.95 } : undefined}
          onClick={handleNavClick}
          aria-label="Primary"
          aria-expanded={isExpanded}
          className={cn(
            "relative flex h-12 items-center overflow-hidden rounded-full border border-border bg-background/80 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.45)] backdrop-blur-xl",
            !isExpanded && "cursor-pointer justify-center",
          )}
        >
          <motion.a
            href="/"
            variants={logoVariants}
            onClick={(e) => e.stopPropagation()}
            aria-label={`${DATA.name} home`}
            className="flex flex-shrink-0 items-center gap-2 pl-3.5 pr-2 font-semibold tracking-tight text-foreground"
          >
            <img
              src="/brand-logo.svg"
              alt=""
              width={28}
              height={28}
              className="size-7 rounded-lg"
            />
            <span className="hidden text-sm sm:inline">{DATA.initials}</span>
          </motion.a>

          <motion.div
            className={cn(
              "flex items-center gap-0.5 pr-3 sm:gap-1 sm:pr-4",
              !isExpanded && "pointer-events-none",
            )}
          >
            {navItems.map((item) => (
              <motion.a
                key={item.name}
                href={item.href}
                variants={itemVariants}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!item.href.includes("#")) {
                    setPathname(item.href);
                  }
                }}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "rounded-full px-2.5 py-1 text-sm font-medium transition-colors sm:px-3",
                  isActive(item.href)
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.name}
              </motion.a>
            ))}
          </motion.div>

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <motion.div
              variants={collapsedIconVariants}
              animate={isExpanded ? "expanded" : "collapsed"}
              aria-hidden={!isExpanded ? undefined : true}
            >
              <Menu className="h-5 w-5 text-foreground" />
              <span className="sr-only">Open navigation</span>
            </motion.div>
          </div>
        </motion.nav>
      </div>
    </header>
  );
}
