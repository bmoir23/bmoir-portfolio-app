import { useEffect, useState } from "react";
import BlurFade from "@/components/magicui/blur-fade";
import { BlogCard, type BlogCardPost } from "@/components/blog-card";
import { DATA } from "@/data/resume";
import { ArrowRight } from "lucide-react";

const BLUR_FADE_DELAY = 0.04;

type PostsResponse = {
  posts: BlogCardPost[];
  configured: boolean;
};

export default function BlogSection() {
  const [state, setState] = useState<PostsResponse>({
    posts: [],
    configured: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/posts.json?limit=3")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<PostsResponse>;
      })
      .then((data) => {
        if (cancelled) return;
        setState(data);
        setIsLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError(true);
        setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const showEmptyState =
    !isLoading && (!state.configured || error || state.posts.length === 0);

  return (
    <div className="flex min-h-0 flex-col gap-y-8">
      <div className="flex flex-col gap-y-4 items-center justify-center">
        <div className="flex items-center w-full">
          <div className="flex-1 h-px bg-linear-to-r from-transparent from-5% via-border via-95% to-transparent" />
          <div className="border bg-primary z-10 rounded-xl px-4 py-1">
            <span className="text-background text-sm font-medium">
              {DATA.sections.blog.label}
            </span>
          </div>
          <div className="flex-1 h-px bg-linear-to-l from-transparent from-5% via-border via-95% to-transparent" />
        </div>
        <div className="flex flex-col gap-y-3 items-center justify-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
            {DATA.sections.blog.heading}
          </h2>
          <p className="text-muted-foreground md:text-lg/relaxed lg:text-base/relaxed xl:text-lg/relaxed text-balance text-center">
            {DATA.sections.blog.text}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 max-w-[1000px] mx-auto auto-rows-fr w-full">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-72 rounded-xl border border-border bg-muted/40 animate-pulse"
            />
          ))}
        </div>
      ) : showEmptyState ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/40 p-8 text-center">
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {!state.configured
              ? "Connect Sanity to publish posts. See BLOG.md in the repo for setup steps."
              : "No posts yet. Check back soon — I'll be publishing notes on AI architecture, agentic systems, and developer infrastructure here."}
          </p>
          <a
            href="/blog"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline underline-offset-4"
          >
            View all posts
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </a>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 max-w-[1000px] mx-auto auto-rows-fr w-full">
            {state.posts.map((post, id) => (
              <BlurFade
                key={post.slug}
                delay={BLUR_FADE_DELAY * 15 + id * 0.05}
                className="h-full"
              >
                <BlogCard post={post} href={`/blog/${post.slug}`} />
              </BlurFade>
            ))}
          </div>
          <div className="flex justify-center">
            <a
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline underline-offset-4"
            >
              Read all posts
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </a>
          </div>
        </>
      )}
    </div>
  );
}
