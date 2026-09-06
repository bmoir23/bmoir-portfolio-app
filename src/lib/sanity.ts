import { createClient, type SanityClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { getEnv } from "@/lib/runtime-env";

/**
 * Sanity client for fetching blog/project content.
 *
 * Required env vars (see `.env.example`):
 *   - SANITY_PROJECT_ID
 *   - SANITY_DATASET        (default: "production")
 *   - SANITY_API_VERSION    (default: "2024-10-01")
 *   - SANITY_API_TOKEN      (optional — only needed for private datasets)
 *
 * On Cloudflare these live on the runtime env binding — `Astro.locals.runtime.env`
 * (populated from `.dev.vars` during `astro dev` / `wrangler`, and from the
 * project's secret bindings in prod). They are NOT on `process.env`, so the
 * client must be created lazily per request with `locals` threaded in. Creating
 * it eagerly at module load with an empty `projectId` makes `@sanity/client`
 * throw "Configuration must contain `projectId`" and 500s every route.
 */
function sanityEnv(locals: unknown, key: string): string | undefined {
  const fromRuntime = getEnv(locals, key);
  if (fromRuntime) return fromRuntime;
  const fromImport = (import.meta.env as Record<string, string | undefined>)[key];
  return fromImport && fromImport.length > 0 ? fromImport : undefined;
}

let cachedClient: SanityClient | null = null;
let cachedProjectId: string | null = null;

export function getSanityClient(locals: unknown): SanityClient | null {
  const projectId = sanityEnv(locals, "SANITY_PROJECT_ID");
  if (!projectId) return null;
  if (cachedClient && cachedProjectId === projectId) return cachedClient;

  cachedClient = createClient({
    projectId,
    dataset: sanityEnv(locals, "SANITY_DATASET") ?? "production",
    apiVersion: sanityEnv(locals, "SANITY_API_VERSION") ?? "2024-10-01",
    useCdn: true,
    token: sanityEnv(locals, "SANITY_API_TOKEN"),
    perspective: "published",
  });
  cachedProjectId = projectId;
  return cachedClient;
}

export function urlFor(locals: unknown, source: SanityImageSource) {
  const client = getSanityClient(locals);
  if (!client) return null;
  return imageUrlBuilder(client).image(source).auto("format").fit("max").width(1200);
}

export function urlForSquare(locals: unknown, source: SanityImageSource, size = 600) {
  const client = getSanityClient(locals);
  if (!client) return null;
  return imageUrlBuilder(client)
    .image(source)
    .auto("format")
    .fit("crop")
    .width(size)
    .height(size);
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type BlogPostSummary = {
  _id: string;
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  readingTime?: number;
  coverImageUrl?: string;
  tags: string[];
};

export type BlogPostFull = BlogPostSummary & {
  bodyMarkdown: string;
  author?: { name?: string; avatarUrl?: string };
};

export type ProjectSummary = {
  _id: string;
  slug: string;
  title: string;
  excerpt: string;
  dates: string;
  active: boolean;
  coverImageUrl?: string;
  technologies: string[];
  githubUrl?: string;
  websiteUrl?: string;
  order?: number;
};

export type ProjectFull = ProjectSummary & {
  overview: string;
  skills: string[];
  architectureMarkdown: string;
};

// ─── Queries ──────────────────────────────────────────────────────────────────

const SUMMARY_PROJECTION = `
  _id,
  "slug": slug.current,
  title,
  excerpt,
  publishedAt,
  "readingTime": readingTime,
  "coverImageUrl": coverImage.asset->url,
  "tags": tags[]
`;

const POSTS_LIST_QUERY = `
  *[_type == "post" && defined(slug.current) && !(_id in path("drafts.**"))]
  | order(publishedAt desc)[0...20]
  { ${SUMMARY_PROJECTION} }
`;

const POST_BY_SLUG_QUERY = `
  *[_type == "post" && slug.current == $slug && !(_id in path("drafts.**"))][0]
  {
    ${SUMMARY_PROJECTION},
    bodyMarkdown,
    "author": author-> { name, "avatarUrl": avatar.asset->url }
  }
`;

const SLUGS_QUERY = `
  *[_type == "post" && defined(slug.current) && !(_id in path("drafts.**"))].slug.current
`;

function normalizeSummary(raw: any): BlogPostSummary {
  return {
    _id: raw._id,
    slug: raw.slug,
    title: raw.title ?? "Untitled",
    excerpt: raw.excerpt ?? "",
    publishedAt: raw.publishedAt ?? new Date().toISOString(),
    readingTime: typeof raw.readingTime === "number" ? raw.readingTime : undefined,
    coverImageUrl: raw.coverImageUrl ?? undefined,
    tags: Array.isArray(raw.tags) ? raw.tags.filter(Boolean) : [],
  };
}

export async function getPosts(locals: unknown, limit = 20): Promise<BlogPostSummary[]> {
  const client = getSanityClient(locals);
  if (!client) return [];
  const raw = await client.fetch(POSTS_LIST_QUERY, {});
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeSummary).slice(0, limit);
}

export async function getPostBySlug(
  locals: unknown,
  slug: string,
): Promise<BlogPostFull | null> {
  const client = getSanityClient(locals);
  if (!client) return null;
  const raw = await client.fetch(POST_BY_SLUG_QUERY, { slug });
  if (!raw) return null;
  return {
    ...normalizeSummary(raw),
    bodyMarkdown: raw.bodyMarkdown ?? "",
    author: raw.author
      ? { name: raw.author.name, avatarUrl: raw.author.avatarUrl }
      : undefined,
  };
}

export async function getAllSlugs(locals: unknown): Promise<string[]> {
  const client = getSanityClient(locals);
  if (!client) return [];
  const slugs = await client.fetch(SLUGS_QUERY, {});
  return Array.isArray(slugs) ? slugs.filter(Boolean) : [];
}

export function isSanityConfigured(locals: unknown): boolean {
  return Boolean(sanityEnv(locals, "SANITY_PROJECT_ID"));
}

// ─── Projects ───────────────────────────────────────────────────────────────

const PROJECT_SUMMARY_PROJECTION = `
  _id,
  "slug": slug.current,
  title,
  excerpt,
  dates,
  active,
  "coverImageUrl": coverImage.asset->url,
  "technologies": technologies[],
  githubUrl,
  websiteUrl,
  order
`;

const PROJECTS_LIST_QUERY = `
  *[_type == "project" && defined(slug.current) && !(_id in path("drafts.**"))]
  | order(order asc, publishedAt desc)[0...50]
  { ${PROJECT_SUMMARY_PROJECTION} }
`;

const PROJECT_BY_SLUG_QUERY = `
  *[_type == "project" && slug.current == $slug && !(_id in path("drafts.**"))][0]
  {
    ${PROJECT_SUMMARY_PROJECTION},
    overview,
    "skills": skills[],
    architectureMarkdown
  }
`;

const PROJECT_SLUGS_QUERY = `
  *[_type == "project" && defined(slug.current) && !(_id in path("drafts.**"))].slug.current
`;

function normalizeProjectSummary(raw: any): ProjectSummary {
  return {
    _id: raw._id,
    slug: raw.slug,
    title: raw.title ?? "Untitled",
    excerpt: raw.excerpt ?? "",
    dates: raw.dates ?? "",
    active: Boolean(raw.active),
    coverImageUrl: raw.coverImageUrl ?? undefined,
    technologies: Array.isArray(raw.technologies) ? raw.technologies.filter(Boolean) : [],
    githubUrl: raw.githubUrl ?? undefined,
    websiteUrl: raw.websiteUrl ?? undefined,
    order: typeof raw.order === "number" ? raw.order : undefined,
  };
}

export async function getProjects(locals: unknown, limit = 50): Promise<ProjectSummary[]> {
  const client = getSanityClient(locals);
  if (!client) return [];
  const raw = await client.fetch(PROJECTS_LIST_QUERY, {});
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeProjectSummary).slice(0, limit);
}

export async function getProjectBySlug(
  locals: unknown,
  slug: string,
): Promise<ProjectFull | null> {
  const client = getSanityClient(locals);
  if (!client) return null;
  const raw = await client.fetch(PROJECT_BY_SLUG_QUERY, { slug });
  if (!raw) return null;
  return {
    ...normalizeProjectSummary(raw),
    overview: raw.overview ?? "",
    skills: Array.isArray(raw.skills) ? raw.skills.filter(Boolean) : [],
    architectureMarkdown: raw.architectureMarkdown ?? "",
  };
}

export async function getAllProjectSlugs(locals: unknown): Promise<string[]> {
  const client = getSanityClient(locals);
  if (!client) return [];
  const slugs = await client.fetch(PROJECT_SLUGS_QUERY, {});
  return Array.isArray(slugs) ? slugs.filter(Boolean) : [];
}
