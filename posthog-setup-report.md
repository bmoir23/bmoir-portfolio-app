# PostHog post-wizard report

The wizard has completed a full client-side and server-side PostHog integration for your Astro + Cloudflare Workers portfolio. A `posthog.astro` snippet component was added and included in the root `Layout.astro`, wiring up browser-side analytics across every page. Four new client-side events were instrumented in React components: resume download clicks, project card clicks, contact form submissions (with session ID forwarded to the server), and social link clicks. The server-side contact route was updated to correlate client sessions via the `$session_id` property. `PUBLIC_POSTHOG_API_KEY` and `PUBLIC_POSTHOG_HOST` environment variables were added to `.env` and documented in `.env.example`.

| Event name | Description | File |
|---|---|---|
| `contact message sent` | A visitor successfully submits a contact form message. | `src/pages/api/contact.ts` |
| `contact message failed` | A contact form submission fails due to a backend error. | `src/pages/api/contact.ts` |
| `blog post viewed` | A visitor opens and views a specific blog post page. | `src/pages/blog/[slug].astro` |
| `resume downloaded` | A visitor clicks the download resume/CV button on the home page. | `src/components/HomePage.tsx` |
| `project link clicked` | A visitor clicks a project card link to view a specific project. | `src/components/project-card.tsx` |
| `contact form submitted` | A visitor initiates a contact form submission from the browser. | `src/components/contact-form.tsx` |
| `social link clicked` | A visitor clicks a social media link from the contact page. | `src/components/contact-socials.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics (wizard) — Dashboard](https://us.posthog.com/project/485027/dashboard/1771737)
- [Resume downloads (30d total)](https://us.posthog.com/project/485027/insights/fPm2ND5J)
- [Resume downloads daily trend](https://us.posthog.com/project/485027/insights/FMMspc9h)
- [Project clicks by project](https://us.posthog.com/project/485027/insights/K4j7UXhE)
- [Contact funnel: submitted vs sent (30d)](https://us.posthog.com/project/485027/insights/iYx19i9w)
- [Social link clicks by platform](https://us.posthog.com/project/485027/insights/e86HpFaO)

## Verify before merging

- [ ] Run a full production build (`pnpm build`) and fix any lint or type errors introduced by the generated code.
- [ ] Run the test suite — call sites that were rewritten or instrumented may need updated mocks or fixtures.
- [ ] Add `PUBLIC_POSTHOG_API_KEY`, `PUBLIC_POSTHOG_HOST`, `POSTHOG_API_KEY`, and `POSTHOG_HOST` as Cloudflare Workers secrets (`wrangler secret put PUBLIC_POSTHOG_API_KEY` etc.) so they're available in the production runtime — `.env` values are only used locally via `astro dev`.
- [ ] Wire source-map upload (`posthog-cli sourcemap` or your bundler's upload step) into CI so production stack traces de-minify.
- [ ] Confirm the returning-visitor path also calls `identify` — the current implementation identifies on contact form submit; any future auth/login flow should also call `posthog.identify()`.

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.
