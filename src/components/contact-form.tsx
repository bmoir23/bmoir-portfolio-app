"use client";

import { useRef, useState } from "react";
import { Loader2, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Turnstile, { type TurnstileRef } from "@/components/turnstile";

type Status = "idle" | "submitting" | "success" | "error";

const FIELD_CLASS =
  "w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60";

// Public site key — safe to expose in the client bundle. Set
// `PUBLIC_TURNSTILE_SITE_KEY` in `.env` (Vite reads it at build time). When
// unset, the widget is skipped and server-side verification is also bypassed
// (dev mode). Cloudflare's "always passes" test key is `1x00000000000000000000AA`.
const TURNSTILE_SITE_KEY = import.meta.env
  .PUBLIC_TURNSTILE_SITE_KEY as string | undefined;

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileRef | null>(null);

  const turnstileRequired = Boolean(TURNSTILE_SITE_KEY);
  const turnstileMissing = turnstileRequired && !turnstileToken;

  async function submit(form: HTMLFormElement) {
    if (status === "submitting") return;
    if (turnstileMissing) {
      setError("Please complete the security check before sending.");
      setStatus("error");
      return;
    }

    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      subject: String(data.get("subject") ?? "").trim(),
      message: String(data.get("message") ?? "").trim(),
      turnstileToken: turnstileToken ?? "",
    };

    setStatus("submitting");
    setError(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).posthog?.capture("contact form submitted", {
      has_subject: Boolean(payload.subject),
      session_id: (window as any).posthog?.get_session_id?.() ?? undefined,
    });

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sessionId = (window as any).posthog?.get_session_id?.() ?? "";
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-PostHog-Session-Id": sessionId,
        },
        body: JSON.stringify(payload),
      });
      const body = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok || !body.ok) {
        throw new Error(body.error || `Something went wrong (${res.status}).`);
      }
      setStatus("success");
      form.reset();
      setTurnstileToken(null);
      turnstileRef.current?.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Failed to send message.");
      // Token is single-use — refresh the widget so the user can retry.
      setTurnstileToken(null);
      turnstileRef.current?.reset();
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-6 py-10 text-center">
        <CheckCircle2 className="size-10 text-emerald-500" />
        <h3 className="text-lg font-semibold text-foreground">Message sent</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          Thanks for reaching out — I'll get back to you as soon as I can.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-2 text-sm font-medium text-emerald-600 underline-offset-4 hover:underline dark:text-emerald-400"
        >
          Send another message
        </button>
      </div>
    );
  }

  const submitting = status === "submitting";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void submit(e.currentTarget);
      }}
      className="flex flex-col gap-4"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-sm font-medium text-foreground">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            maxLength={200}
            autoComplete="name"
            disabled={submitting}
            placeholder="Your name"
            className={FIELD_CLASS}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            maxLength={320}
            autoComplete="email"
            disabled={submitting}
            placeholder="you@example.com"
            className={FIELD_CLASS}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="subject" className="text-sm font-medium text-foreground">
          Subject <span className="text-muted-foreground">(optional)</span>
        </label>
        <input
          id="subject"
          name="subject"
          type="text"
          maxLength={300}
          disabled={submitting}
          placeholder="What's this about?"
          className={FIELD_CLASS}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="message" className="text-sm font-medium text-foreground">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          maxLength={5000}
          rows={5}
          disabled={submitting}
          placeholder="Leave me a message…"
          className={cn(FIELD_CLASS, "resize-y min-h-32")}
        />
      </div>

      {TURNSTILE_SITE_KEY && (
        <div className="flex flex-col gap-1.5">
          <Turnstile
            ref={turnstileRef}
            siteKey={TURNSTILE_SITE_KEY}
            onToken={setTurnstileToken}
            onExpire={() => setTurnstileToken(null)}
            onError={() => setTurnstileToken(null)}
            className="min-h-[65px]"
          />
        </div>
      )}

      {status === "error" && error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || turnstileMissing}
        className={cn(
          "inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70",
        )}
      >
        {submitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Sending…
          </>
        ) : (
          <>
            <Send className="size-4" />
            Send message
          </>
        )}
      </button>
    </form>
  );
}
