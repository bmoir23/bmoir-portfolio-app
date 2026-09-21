import type { APIRoute } from "astro";

export const prerender = false;

// First-party reverse proxy for PostHog ingestion.
//
// Browser analytics is initialized against the site's own `/ingest` path (see
// src/components/posthog.astro), so every capture/decide/asset request goes to
// the site's own origin instead of `*.i.posthog.com`. Serving capture
// first-party stops ad/tracker blockers — which block the third-party PostHog
// domains by hostname — from silently dropping `$pageview` and other browser
// events.
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

  // Build a fresh upstream request rather than reusing the incoming edge
  // request. Reusing it carried this site's cookies and Cloudflare-internal
  // request metadata to PostHog; under the Worker's `global_fetch_strictly_public`
  // flag that subrequest fails and the route returns a 500. Copying into a plain
  // Headers also drops the site Host so `fetch` derives the upstream Host from
  // `upstreamUrl`.
  const headers = new Headers(request.headers);
  headers.delete("cookie");
  headers.delete("host");

  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  const init: RequestInit & { duplex?: "half" } = { method: request.method, headers };
  if (hasBody) {
    // `duplex` is required to stream a request body with `fetch`.
    init.body = request.body;
    init.duplex = "half";
  }

  return fetch(upstreamUrl, init);
};
