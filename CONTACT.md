# Contact form, chatbot & scheduling

This portfolio ships a `/contact` page with three things:

1. **A "Leave a message" form** that POSTs to `/api/contact`.
2. **Social icon buttons** (GitHub, LinkedIn, Email) with brand hover colors.
3. **A Cal.com inline booking widget**.

It also renders a **chatbot shell** (floating button, bottom-right) on every
page. The chatbot is a **UI placeholder only** — its logic is meant to be built
in n8n and wired up later.

---

## 1. Contact form → Neon (and/or n8n)

The endpoint lives at `src/pages/api/contact.ts` and the logic in
`src/lib/contact.ts`. On submit it will, depending on which env vars are set:

- **Insert directly into Neon Postgres** when `NEON_DATABASE_URL` (or
  `DATABASE_URL`) is set, using `@neondatabase/serverless` (Workers-compatible).
- **Forward the payload to an n8n webhook** when `N8N_CONTACT_WEBHOOK_URL` is set
  — your n8n flow can then sync to Notion and route an email via a Worker.

If neither is set, the form returns a friendly "not configured yet" error.

### Env vars

Add these to `.dev.vars` (local) and to your Cloudflare project secrets (prod):

```bash
NEON_DATABASE_URL="postgresql://user:pass@ep-xxxx-pooler.region.aws.neon.tech/dbname?sslmode=require"
# optional, fires in addition to / instead of Neon:
N8N_CONTACT_WEBHOOK_URL="https://<your-n8n-host>/webhook/contact"
```

> Use the **pooled** Neon connection string (host contains `-pooler`) for
> serverless/edge environments like Cloudflare Workers.

### Spam protection — Cloudflare Turnstile

The form is gated by a [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/)
challenge. The flow:

1. `src/components/turnstile.tsx` loads the Turnstile script and renders the
   widget inside `src/components/contact-form.tsx`. The verified token is
   captured and sent with the form payload as `turnstileToken`.
2. `src/pages/api/contact.ts` calls `verifyTurnstile()` from `src/lib/contact.ts`
   **before** any Neon insert or n8n webhook fire — bots are rejected without
   touching your database or downstream automations.
3. `verifyTurnstile()` POSTs the token to Cloudflare's `siteverify` endpoint
   with the matching secret key and the visitor's IP. On success the request
   proceeds; on failure a 400 is returned.

Env vars:

```bash
# Public — embedded in the client bundle (PUBLIC_ prefix → import.meta.env).
PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
# Secret — server only, read via cloudflare:workers env. NEVER prefix with PUBLIC_.
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
```

Cloudflare's test keys above always pass — handy for local dev. Create a real
widget at [dash.cloudflare.com → Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile)
and swap in the production keys (site key in `.env` / client, secret key in
`.dev.vars` locally and `wrangler secret put TURNSTILE_SECRET_KEY` for prod).

When **both** keys are unset, the widget is hidden and server verification is
skipped (pure dev mode). When the site key is set but the secret key is missing,
verification is also skipped — useful for previewing the widget UI locally
without blocking submits.

### Neon table schema

Run this once against your Neon database (SQL editor or `psql`):

```sql
CREATE TABLE IF NOT EXISTS contact_messages (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name        TEXT        NOT NULL,
  email       TEXT        NOT NULL,
  subject     TEXT,
  message     TEXT        NOT NULL,
  source      TEXT        NOT NULL DEFAULT 'portfolio',
  ip          TEXT,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS contact_messages_created_at_idx
  ON contact_messages (created_at DESC);
```

### Suggested architecture (your stack)

```
[Contact form] → POST /api/contact (Cloudflare Worker)
       ├── INSERT into Neon (contact_messages)
       └── POST → n8n webhook
                     ├── upsert row into a Notion database
                     └── send email (Worker / Resend / SMTP) to your inbox
```

You can drive everything from n8n instead (set only `N8N_CONTACT_WEBHOOK_URL`)
or keep Neon as the system of record and use n8n only for notifications.

---

## 2. Cal.com widget

Configured in `src/data/config.ts`:

```ts
contact: {
  calLink: "brianmoir/30min", // the "username/event" from cal.com/<calLink>
  calLayout: "month_view",
}
```

Set `calLink` to your real Cal.com link. Leave it empty (`""`) to hide the
scheduling section. The embed (`src/components/CalEmbed.astro`) uses Cal.com's
official inline script — no extra npm dependency required.

---

## 3. Chatbot shell (placeholder)

The chatbot is a `src/components/ChatbotPanel.tsx` panel that is toggled from a
button in the floating navbar (`src/components/navbar.tsx`). The input and send
button are intentionally disabled while the n8n backend is being built.

To connect it to n8n later:

1. Expose an n8n webhook (or a Worker route) that accepts `{ message }` and
   returns the assistant reply.
2. In `ChatbotPanel.tsx`, replace the no-op `handleSend` with a `fetch` to that
   endpoint, move `messages` into real state, and remove the `disabled` flags.
