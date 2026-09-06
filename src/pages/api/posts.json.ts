import type { APIRoute } from "astro";
import { getPosts, isSanityConfigured } from "@/lib/sanity";

export const prerender = false;

export const GET: APIRoute = async ({ url, locals }) => {
  const limitParam = url.searchParams.get("limit");
  const limit = limitParam ? Math.min(50, Math.max(1, Number(limitParam) || 10)) : 10;

  const configured = isSanityConfigured(locals);
  if (!configured) {
    return new Response(
      JSON.stringify({ posts: [], configured: false }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      },
    );
  }

  try {
    const posts = await getPosts(locals, limit);
    return new Response(
      JSON.stringify({ posts, configured: true }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
        },
      },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        posts: [],
        configured: true,
        error: err instanceof Error ? err.message : "Failed to fetch posts",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      },
    );
  }
};
