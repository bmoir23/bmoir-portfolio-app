import type { APIRoute } from "astro";
import { getProjects, isSanityConfigured } from "@/lib/sanity";

export const prerender = false;

export const GET: APIRoute = async ({ url, locals }) => {
  const limitParam = url.searchParams.get("limit");
  const limit = limitParam ? Math.min(50, Math.max(1, Number(limitParam) || 10)) : 50;

  const configured = isSanityConfigured(locals);
  if (!configured) {
    return new Response(
      JSON.stringify({ projects: [], configured: false }),
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
    const projects = await getProjects(locals, limit);
    return new Response(
      JSON.stringify({ projects, configured: true }),
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
        projects: [],
        configured: true,
        error: err instanceof Error ? err.message : "Failed to fetch projects",
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
