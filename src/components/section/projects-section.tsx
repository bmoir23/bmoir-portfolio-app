import { useEffect, useState } from "react";
import BlurFade from "@/components/magicui/blur-fade";
import { ProjectCard } from "@/components/project-card";
import { DATA } from "@/data/resume";
import type { ProjectSummary } from "@/lib/sanity";
import { ArrowRight } from "lucide-react";

const BLUR_FADE_DELAY = 0.04;

type ProjectsResponse = {
  projects: ProjectSummary[];
  configured: boolean;
  error?: string;
};

export default function ProjectsSection() {
  const [state, setState] = useState<ProjectsResponse>({
    projects: [],
    configured: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/projects.json")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<ProjectsResponse>;
      })
      .then((data) => {
        if (cancelled) return;
        setState(data);
        if (data.error) setError(true);
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
    !isLoading && (!state.configured || error || state.projects.length === 0);

  return (
    <div className="flex min-h-0 flex-col gap-y-8">
        <div className="flex flex-col gap-y-4 items-center justify-center">
          <div className="flex items-center w-full">
            <div className="flex-1 h-px bg-linear-to-r from-transparent from-5% via-border via-95% to-transparent" />
            <div className="border bg-primary z-10 rounded-xl px-4 py-1">
              <span className="text-background text-sm font-medium">
                {DATA.sections.projects.label}
              </span>
            </div>
            <div className="flex-1 h-px bg-linear-to-l from-transparent from-5% via-border via-95% to-transparent" />
          </div>
          <div className="flex flex-col gap-y-3 items-center justify-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
              {DATA.sections.projects.heading}
            </h2>
            <p className="text-muted-foreground md:text-lg/relaxed lg:text-base/relaxed xl:text-lg/relaxed text-balance text-center">
              {DATA.sections.projects.text}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 max-w-[800px] mx-auto auto-rows-fr w-full">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-80 rounded-xl border border-border bg-muted/40 animate-pulse"
              />
            ))}
          </div>
        ) : showEmptyState ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/40 p-8 text-center">
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {!state.configured
                ? "Connect Sanity to publish projects. See BLOG.md in the repo for setup steps."
                : error
                ? "Something went wrong loading projects. Please try again later."
                : "No projects yet. Check back soon — I'll be showcasing the AI platforms and pipelines I've built here."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 max-w-[800px] mx-auto auto-rows-fr">
            {state.projects.map((project, id) => (
              <BlurFade
                key={project.slug}
                delay={BLUR_FADE_DELAY * 12 + id * 0.05}
                className="h-full"
              >
                <ProjectCard
                  slug={project.slug}
                  title={project.title}
                  description={project.excerpt}
                  dates={project.dates}
                  tags={project.technologies}
                  image={project.coverImageUrl}
                  githubUrl={project.githubUrl}
                  websiteUrl={project.websiteUrl}
                />
              </BlurFade>
            ))}
          </div>
        )}

        {!isLoading && !showEmptyState && (
          <div className="flex justify-center">
            <a
              href="/projects"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline underline-offset-4"
            >
              View all projects
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </a>
          </div>
        )}
    </div>
  );
}
