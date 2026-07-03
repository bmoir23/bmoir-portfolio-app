"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

/**
 * Cloudflare Turnstile widget (client-only).
 *
 * Loads the Turnstile script lazily on mount, renders the challenge into a
 * container div, and surfaces the verified token via `onToken`. Exposes a
 * `reset()` method through the ref so the parent can refresh the widget after
 * a successful submit or error.
 *
 * The site key is public and safe to expose in the client bundle. The matching
 * secret key lives only on the server (`TURNSTILE_SECRET_KEY`) and is used by
 * `src/lib/contact.ts` to verify the token via Cloudflare's siteverify API.
 *
 * If no site key is configured, the component renders nothing — the form then
 * falls back to server-side verification being skipped (dev mode).
 */

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          theme?: "light" | "dark" | "auto";
          appearance?: "always" | "execute" | "manage";
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        },
      ) => string;
      reset: (id?: string) => void;
      remove: (id: string) => void;
    };
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js";
let scriptPromise: Promise<void> | null = null;

function loadTurnstileScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${SCRIPT_SRC}"]`,
    );
    if (existing) {
      if (window.turnstile) {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Failed to load Turnstile script")),
        { once: true },
      );
      return;
    }
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Failed to load Turnstile script"));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export type TurnstileRef = {
  reset: () => void;
};

type Props = {
  siteKey: string;
  onToken: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
  className?: string;
  theme?: "light" | "dark" | "auto";
};

const Turnstile = forwardRef<TurnstileRef, Props>(function Turnstile(
  { siteKey, onToken, onExpire, onError, className, theme = "auto" },
  ref,
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const cbRef = useRef({ onToken, onExpire, onError });
  cbRef.current = { onToken, onExpire, onError };

  useImperativeHandle(
    ref,
    () => ({
      reset: () => {
        const id = widgetIdRef.current;
        if (id && window.turnstile) {
          try {
            window.turnstile.reset(id);
          } catch {
            /* widget may already be removed */
          }
        }
      },
    }),
    [],
  );

  useEffect(() => {
    let cancelled = false;

    loadTurnstileScript()
      .then(() => {
        if (
          cancelled ||
          !containerRef.current ||
          !window.turnstile
        )
          return;
        // Clear any previous widget (HMR / strict-mode double-mount).
        if (widgetIdRef.current) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch {
            /* ignore */
          }
          widgetIdRef.current = null;
        }
        widgetIdRef.current = window.turnstile.render(
          containerRef.current,
          {
            sitekey: siteKey,
            theme,
            callback: (token: string) => cbRef.current.onToken(token),
            "expired-callback": () => cbRef.current.onExpire?.(),
            "error-callback": () => cbRef.current.onError?.(),
          },
        );
      })
      .catch(() => {
        cbRef.current.onError?.();
      });

    return () => {
      cancelled = true;
      const id = widgetIdRef.current;
      if (id && window.turnstile) {
        try {
          window.turnstile.remove(id);
        } catch {
          /* ignore */
        }
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, theme]);

  return (
    <div
      ref={containerRef}
      className={className}
      aria-label="Cloudflare Turnstile verification"
    />
  );
});

export default Turnstile;
