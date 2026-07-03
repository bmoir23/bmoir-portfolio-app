import type { APIRoute } from "astro";
import { handleContact, validateContact, verifyTurnstile } from "@/lib/contact";
import { createPosthogClient } from "@/lib/posthog";

export const prerender = false;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

export const POST: APIRoute = async ({ request, locals, clientAddress }) => {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid JSON body." }, 400);
  }

  const validated = validateContact(payload);
  if (!validated.ok) {
    return json({ ok: false, error: validated.error }, 400);
  }

  let ip: string | undefined;
  try {
    ip =
      request.headers.get("cf-connecting-ip") ??
      clientAddress ??
      undefined;
  } catch {
    ip = undefined;
  }
  const userAgent = request.headers.get("user-agent") ?? undefined;
  const sessionId = request.headers.get("X-PostHog-Session-Id") ?? undefined;

  // Cloudflare Turnstile — verify the token before touching Neon / n8n so we
  // don't burn DB writes or webhook calls on bot traffic. Skipped automatically
  // when no `TURNSTILE_SECRET_KEY` is configured (dev mode).
  const turnstile = await verifyTurnstile(
    locals,
    validated.data.turnstileToken,
    ip,
  );
  if (!turnstile.ok) {
    return json({ ok: false, error: turnstile.error }, 400);
  }

  const result = await handleContact(locals, validated.data, { ip, userAgent });

  const posthog = createPosthogClient(locals);
  const distinctId = validated.data.email;
  try {
    posthog.identify({
      distinctId,
      properties: {
        $set: { name: validated.data.name, email: validated.data.email },
      },
    });
    if (result.ok) {
      await posthog.captureImmediate({
        distinctId,
        event: 'contact message sent',
        properties: {
          subject: validated.data.subject ?? null,
          stored: result.stored,
          forwarded: result.forwarded,
          $ip: ip ?? null,
          $user_agent: userAgent ?? null,
          $session_id: sessionId ?? null,
        },
      });
    } else {
      await posthog.captureImmediate({
        distinctId,
        event: 'contact message failed',
        properties: {
          error: result.error ?? null,
          stored: result.stored,
          forwarded: result.forwarded,
          $ip: ip ?? null,
          $session_id: sessionId ?? null,
        },
      });
    }
  } catch (err) {
    posthog.captureException(err, distinctId);
  } finally {
    await posthog.shutdown();
  }

  if (!result.ok) {
    return json(result, 503);
  }
  return json(result, 200);
};
