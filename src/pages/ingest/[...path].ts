import type { APIRoute } from "astro";

export const prerender = false;

// First-party reverse proxy for PostHog ingestion.
//
// Browser analytics is initialized against `https://<site>/ingest` (see
// `PUBLIC_POSTHOG_HOST`), so every capture/decide/asset request goes to the
// site's own origin instead of `*.i.posthog.com`. Serving capture first-party
// stops ad/tracker blockers — which block the third-party PostHog domains by
// hostname — from silently dropping `$pageview` and other browser events.
//
// This runs on the same Cloudflare Worker that serves the site. Requests to
// `/ingest/static/*` are forwarded to the assets host (array.js, recorder,
// surveys, toolbar bundles); everything else goes to the event/decide host.
const API_HOST = "us.i.posthog.com";
const ASSET_HOST = "us-assets.i.posthog.com";

export const ALL: APIRoute = async ({ request }) => {
  const url = new URL(request.url);

  // Strip the `/ingest` mount prefix; forward the remainder upstream verbatim.
  const path = url.pathname.replace(/^\/ingest/, "") || "/";
  const upstreamHost = path.startsWith("/static/") ? ASSET_HOST : API_HOST;
  const upstreamUrl = `https://${upstreamHost}${path}${url.search}`;

  // Reuse the incoming method/body/headers, but let `fetch` set the upstream
  // Host from the URL and never forward this site's cookies to PostHog.
  const proxied = new Request(upstreamUrl, request);
  proxied.headers.delete("cookie");
  proxied.headers.delete("host");

  return fetch(proxied);
};
