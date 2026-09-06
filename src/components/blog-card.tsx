import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import { useMemo } from "react";

// Deterministic gradient palettes for posts without a cover image.
const BLOG_GRADIENTS: { from: string; via: string; to: string; blob: string }[] = [
  { from: "#ec4899", via: "#f43f5e", to: "#f97316", blob: "#fb7185" },
  { from: "#8b5cf6", via: "#ec4899", to: "#f43f5e", blob: "#f472b6" },
  { from: "#6366f1", via: "#a855f7", to: "#ec4899", blob: "#a78bfa" },
  { from: "#0ea5e9", via: "#6366f1", to: "#a855f7", blob: "#60a5fa" },
  { from: "#14b8a6", via: "#0ea5e9", to: "#6366f1", blob: "#2dd4bf" },
  { from: "#f59e0b", via: "#ef4444", to: "#ec4899", blob: "#fbbf24" },
];

function pickGradient(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return BLOG_GRADIENTS[Math.abs(hash) % BLOG_GRADIENTS.length]!;
}

function formatBlogDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function estimateReadingTime(markdown?: string): number | undefined {
  if (!markdown) return undefined;
  const words = markdown.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export type BlogCardPost = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  readingTime?: number;
  coverImageUrl?: string;
  tags?: string[];
  bodyMarkdown?: string;
};

interface BlogCardProps {
  post: BlogCardPost;
  href: string;
  className?: string;
}

export function BlogCard({ post, href, className }: BlogCardProps) {
  const gradient = useMemo(() => pickGradient(post.title), [post.title]);
  const readingTime = post.readingTime ?? estimateReadingTime(post.bodyMarkdown);

  return (
    <a
      href={href}
      className={cn(
        "group flex flex-col h-full border border-border rounded-xl overflow-hidden hover:ring-2 hover:ring-muted transition-all duration-200 cursor-pointer",
        className,
      )}
    >
      <div className="relative shrink-0 h-44 overflow-hidden">
        {post.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImageUrl}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div
            className="relative w-full h-full"
            style={{
              background: `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.via} 50%, ${gradient.to} 100%)`,
            }}
          >
            <div
              className="absolute -top-10 -right-8 h-32 w-32 rounded-full opacity-40 blur-2xl"
              style={{ background: gradient.blob }}
            />
            <div
              className="absolute -bottom-12 -left-8 h-36 w-36 rounded-full opacity-30 blur-2xl"
              style={{ background: gradient.via }}
            />
            <div
              className="absolute inset-0 opacity-[0.18] mix-blend-overlay"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.6) 1px, transparent 1px)",
                backgroundSize: "22px 22px",
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center px-6">
              <span className="text-white text-xl font-bold tracking-tight text-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)] line-clamp-3">
                {post.title}
              </span>
            </div>
          </div>
        )}
      </div>
      <div className="p-6 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <h3 className="font-semibold leading-tight group-hover:text-primary transition-colors">
              {post.title}
            </h3>
            <time className="text-xs text-muted-foreground">
              {formatBlogDate(post.publishedAt)}
              {readingTime ? ` · ${readingTime} min read` : ""}
            </time>
          </div>
          <ArrowUpRight
            className="h-4 w-4 mt-1 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200"
            aria-hidden
          />
        </div>
        {post.excerpt && (
          <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
            {post.excerpt}
          </p>
        )}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-auto">
            {post.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                className="text-[11px] font-medium border border-border h-6 w-fit px-2"
                variant="outline"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </a>
  );
}
