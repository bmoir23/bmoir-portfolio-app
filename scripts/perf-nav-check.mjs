#!/usr/bin/env node
/**
 * Local performance + dock navigation checks against a running preview/dev server.
 *
 * Usage:
 *   BASE_URL=http://127.0.0.1:4321 node scripts/perf-nav-check.mjs
 *
 * Exit 0 on pass, 1 on failure. Prints a JSON report to stdout.
 */
import { chromium } from "playwright";

const BASE_URL = process.env.BASE_URL ?? "http://127.0.0.1:4321";
const MAX_LCP_MS = Number(process.env.MAX_LCP_MS ?? 3500);
const MAX_DOCK_APPEAR_MS = Number(process.env.MAX_DOCK_APPEAR_MS ?? 2500);
// Long-task budget during scroll (PerformanceObserver), not raw rAF gaps —
// scrollBy-in-rAF probes are too noisy in headless CI.
const MAX_SCROLL_LONGTASK_MS = Number(process.env.MAX_SCROLL_LONGTASK_MS ?? 80);

const report = {
  baseUrl: BASE_URL,
  checks: [],
  metrics: {},
  ok: true,
};

function check(name, pass, detail = {}) {
  report.checks.push({ name, pass, ...detail });
  if (!pass) report.ok = false;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  const consoleErrors = [];
  page.on("pageerror", (err) => consoleErrors.push(String(err)));

  const started = Date.now();
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 60_000 });

  // Top nav must be gone; dock is primary navigation.
  const topNav = await page.locator('header[aria-label="Primary"]').count();
  check("no-top-nav", topNav === 0, { count: topNav });

  // Dock-specific control — Theme only exists in the dock, not the footer sitemap.
  const dockTheme = page.getByRole("navigation", { name: "Primary dock" }).getByRole(
    "button",
    { name: "Theme" },
  );
  let dockAppearedAt = null;
  try {
    await dockTheme.waitFor({ state: "visible", timeout: MAX_DOCK_APPEAR_MS });
    dockAppearedAt = Date.now() - started;
  } catch {
    dockAppearedAt = null;
  }

  const hasDock = (await dockTheme.count()) > 0 && (await dockTheme.isVisible());
  check("dock-present", hasDock, { appearMs: dockAppearedAt });
  if (dockAppearedAt != null) {
    check("dock-appear-budget", dockAppearedAt <= MAX_DOCK_APPEAR_MS, {
      appearMs: dockAppearedAt,
      budgetMs: MAX_DOCK_APPEAR_MS,
    });
  } else {
    check("dock-appear-budget", false, {
      appearMs: null,
      budgetMs: MAX_DOCK_APPEAR_MS,
      reason: "dock Theme control never became visible",
    });
  }

  // Hero SSR content should be in the first HTML paint path (text in DOM early).
  const heroText = await page.locator("#hero, main").first().innerText();
  check("hero-content", /Hi, I'm|Brian|Resume/i.test(heroText), {
    sample: heroText.slice(0, 120),
  });

  // Collect web vitals via PerformanceObserver where available.
  const vitals = await page.evaluate(async () => {
    const nav = performance.getEntriesByType("navigation")[0];
    const paints = performance.getEntriesByType("paint");
    const fcp = paints.find((p) => p.name === "first-contentful-paint")?.startTime;

    let lcp = null;
    await new Promise((resolve) => {
      try {
        const po = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const last = entries[entries.length - 1];
          if (last) lcp = last.startTime;
        });
        po.observe({ type: "largest-contentful-paint", buffered: true });
        // Nudge layout so LCP can settle on hero text/image.
        requestAnimationFrame(() => {
          setTimeout(() => {
            po.disconnect();
            resolve(null);
          }, 2000);
        });
      } catch {
        resolve(null);
      }
    });

    return {
      fcp,
      lcp,
      domContentLoaded: nav?.domContentLoadedEventEnd,
      loadEventEnd: nav?.loadEventEnd,
      transferSize: nav?.transferSize,
    };
  });
  report.metrics = vitals;

  if (typeof vitals.lcp === "number") {
    check("lcp-budget", vitals.lcp <= MAX_LCP_MS, {
      lcpMs: vitals.lcp,
      budgetMs: MAX_LCP_MS,
    });
  } else {
    check("lcp-budget", false, {
      lcpMs: null,
      budgetMs: MAX_LCP_MS,
      reason: "LCP was not measurable",
    });
  }

  // Scroll jank probe: long tasks while the page scrolls under a fixed dock.
  // Ignore buffered longtasks that occurred before the probe starts.
  const scrollProbe = await page.evaluate(async () => {
    const longTasks = [];
    const probeStart = performance.now();
    let observer = null;
    try {
      observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.startTime >= probeStart) {
            longTasks.push(entry.duration);
          }
        }
      });
      // buffered:false so we only capture tasks from this scroll window.
      observer.observe({ type: "longtask", buffered: false });
    } catch {
      // longtask not supported in some engines — fall through with empty list
    }

    const startY = window.scrollY;
    const target = Math.min(
      document.documentElement.scrollHeight - window.innerHeight,
      startY + 1600,
    );
    const steps = 24;
    for (let i = 1; i <= steps; i++) {
      window.scrollTo(0, startY + ((target - startY) * i) / steps);
      await new Promise((r) => requestAnimationFrame(r));
      await new Promise((r) => setTimeout(r, 16));
    }

    await new Promise((r) => setTimeout(r, 200));
    observer?.disconnect();

    const maxLongTask = longTasks.length ? Math.max(...longTasks) : 0;
    return {
      maxLongTask,
      longTaskCount: longTasks.length,
      longTasks: longTasks.slice(0, 10),
      probeStart,
    };
  });
  report.metrics.scroll = scrollProbe;
  check(
    "scroll-longtask-budget",
    scrollProbe.maxLongTask <= MAX_SCROLL_LONGTASK_MS,
    {
      maxLongTaskMs: scrollProbe.maxLongTask,
      longTaskCount: scrollProbe.longTaskCount,
      budgetMs: MAX_SCROLL_LONGTASK_MS,
    },
  );

  // Dock should stay fixed (not scroll away) — compare y before/after scroll.
  const dockBoxBefore = await dockTheme.boundingBox();
  await page.evaluate(() => window.scrollTo(0, 1200));
  await page.waitForTimeout(200);
  const dockBoxAfter = await dockTheme.boundingBox();
  const dockStuck =
    dockBoxBefore &&
    dockBoxAfter &&
    Math.abs(dockBoxBefore.y - dockBoxAfter.y) < 2;
  check("dock-fixed-while-scrolling", Boolean(dockStuck), {
    beforeY: dockBoxBefore?.y,
    afterY: dockBoxAfter?.y,
  });

  // Open theme submenu and ensure it closes (not sticky-open).
  await dockTheme.click();
  await page.waitForTimeout(100);
  const themeOpen = await page.getByRole("button", { name: "Dark" }).count();
  check("theme-menu-opens", themeOpen > 0, { count: themeOpen });
  await page.mouse.move(10, 10);
  await page.waitForTimeout(350);
  const themeStillOpen = await page.getByRole("button", { name: "Dark" }).count();
  check("theme-menu-closes", themeStillOpen === 0, { count: themeStillOpen });

  check("no-page-errors", consoleErrors.length === 0, { consoleErrors });

  await browser.close();
  console.log(JSON.stringify(report, null, 2));
  process.exit(report.ok ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
