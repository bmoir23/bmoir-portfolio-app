/* eslint-disable @next/next/no-img-element */

import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import Markdown from "react-markdown";

// Deterministic gradient palettes — one is picked per project title so each
// card feels distinct and colorful even when no image is supplied.
const GRADIENT_PALETTES: { from: string; via: string; to: string; blob: string }[] = [
  { from: "#7c3aed", via: "#db2777", to: "#f97316", blob: "#f472b6" }, // violet → pink → orange
  { from: "#2563eb", via: "#06b6d4", to: "#22d3ee", blob: "#38bdf8" }, // blue → cyan
  { from: "#059669", via: "#10b981", to: "#84cc16", blob: "#34d399" }, // emerald → lime
  { from: "#f43f5e", via: "#ec4899", to: "#a855f7", blob: "#fb7185" }, // rose → pink → purple
  { from: "#f59e0b", via: "#f97316", to: "#ef4444", blob: "#fbbf24" }, // amber → orange → red
  { from: "#6366f1", via: "#8b5cf6", to: "#d946ef", blob: "#a78bfa" }, // indigo → violet → fuchsia
  { from: "#0ea5e9", via: "#3b82f6", to: "#6366f1", blob: "#60a5fa" }, // sky → blue → indigo
  { from: "#14b8a6", via: "#0ea5e9", to: "#6366f1", blob: "#2dd4bf" }, // teal → sky → indigo
];

function pickPalette(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % GRADIENT_PALETTES.length;
  return GRADIENT_PALETTES[idx]!;
}

function ProjectImage({ src, alt }: { src: string; alt: string }) {
  const [imageError, setImageError] = useState(false);

  if (!src || imageError) {
    return <ProjectGradient title={alt} />;
  }

  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-48 object-cover"
      onError={() => setImageError(true)}
    />
  );
}

function ProjectGradient({ title }: { title: string }) {
  const p = pickPalette(title);
  // Use inline styles so the gradients render identically in light and dark mode.
  return (
    <div
      className="relative w-full h-48 overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${p.from} 0%, ${p.via} 50%, ${p.to} 100%)`,
      }}
    >
      {/* Soft radial blobs for depth */}
      <div
        className="absolute -top-12 -right-10 h-40 w-40 rounded-full opacity-40 blur-2xl"
        style={{ background: p.blob }}
      />
      <div
        className="absolute -bottom-16 -left-10 h-44 w-44 rounded-full opacity-30 blur-2xl"
        style={{ background: p.via }}
      />
      {/* Subtle grid overlay for texture */}
      <div
        className="absolute inset-0 opacity-[0.18] mix-blend-overlay"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />
      {/* Title watermark — adds personality and context to the placeholder */}
      <div className="absolute inset-0 flex items-center justify-center px-6">
        <span className="text-white text-2xl font-bold tracking-tight text-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)] line-clamp-2">
          {title}
        </span>
      </div>
      {/* Bottom scrim for legibility against card content below */}
      <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/30 to-transparent" />
    </div>
  );
}

interface Props {
  title: string;
  slug: string;
  description: string;
  dates: string;
  tags: readonly string[];
  image?: string;
  video?: string;
  githubUrl?: string;
  websiteUrl?: string;
  className?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function captureProjectClick(title: string, href: string | undefined, linkType: string) {
  (window as any).posthog?.capture("project link clicked", {
    project_title: title,
    project_url: href ?? null,
    link_type: linkType,
  });
}

export function ProjectCard({
  title,
  slug,
  description,
  dates,
  tags,
  image,
  video,
  githubUrl,
  websiteUrl,
  className,
}: Props) {
  const detailHref = `/projects/${slug}`;
  const externalLinks: { icon: React.ReactNode; type: string; href: string }[] = [];
  if (githubUrl) {
    externalLinks.push({
      icon: <Icons.github className="size-3" />,
      type: "GitHub",
      href: githubUrl,
    });
  }
  if (websiteUrl) {
    externalLinks.push({
      icon: <Icons.globe className="size-3" />,
      type: "Website",
      href: websiteUrl,
    });
  }

  return (
    <div
      className={cn(
        "flex flex-col h-full border border-border rounded-xl overflow-hidden hover:ring-2 cursor-pointer hover:ring-muted transition-all duration-200",
        className
      )}
    >
      <div className="relative shrink-0">
        <a
          href={detailHref}
          className="block"
          onClick={() => captureProjectClick(title, detailHref, "image")}
        >
          {video ? (
            <video
              src={video}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-48 object-cover"
            />
          ) : image ? (
            <ProjectImage src={image} alt={title} />
          ) : (
            <ProjectGradient title={title} />
          )}
        </a>
        {externalLinks.length > 0 && (
          <div className="absolute top-2 right-2 flex flex-wrap gap-2">
            {externalLinks.map((link, idx) => (
              <a
                href={link.href}
                key={idx}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  captureProjectClick(title, link.href, link.type);
                }}
              >
                <Badge
                  className="flex items-center gap-1.5 text-xs bg-black text-white hover:bg-black/90"
                  variant="default"
                >
                  {link.icon}
                  {link.type}
                </Badge>
              </a>
            ))}
          </div>
        )}
      </div>
      <div className="p-6 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <h3 className="font-semibold">{title}</h3>
            <time className="text-xs text-muted-foreground">{dates}</time>
          </div>
          <a
            href={detailHref}
            className="text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
            aria-label={`Open ${title}`}
            onClick={() => captureProjectClick(title, detailHref, "title")}
          >
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </a>
        </div>
        <div className="text-xs flex-1 prose max-w-full text-pretty font-sans leading-relaxed text-muted-foreground dark:prose-invert">
          <Markdown>{description}</Markdown>
        </div>
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-auto">
            {tags.map((tag) => (
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
    </div>
  );
}
