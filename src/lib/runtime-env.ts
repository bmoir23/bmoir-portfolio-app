import { env as cloudflareEnv } from "cloudflare:workers";

/**
 * Read environment variables / secrets across runtimes.
 *
 * Astro v6 + @astrojs/cloudflare exposes secrets and vars through the
 * `cloudflare:workers` `env` object — populated from `.dev.vars` during
 * `astro dev` / `wrangler`, and from the project's secret bindings in prod.
 * `Astro.locals.runtime.env` was removed in Astro v6 (accessing it throws),
 * so we read from `cloudflareEnv` and fall back to `process.env` for plain
 * Node contexts (scripts, tests).
 *
 * The `locals` argument is kept for call-site compatibility but is no longer
 * used to source the value.
 */
export function getEnv(_locals: unknown, key: string): string | undefined {
  const fromRuntime = (
    cloudflareEnv as unknown as Record<string, unknown> | undefined
  )?.[key];
  if (typeof fromRuntime === "string" && fromRuntime.length > 0) {
    return fromRuntime;
  }

  const fromProcess =
    typeof process !== "undefined" ? process.env?.[key] : undefined;
  if (typeof fromProcess === "string" && fromProcess.length > 0) {
    return fromProcess;
  }

  return undefined;
}
