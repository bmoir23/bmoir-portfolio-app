import { type FormEvent } from "react";
import { FlickeringGrid } from "@/components/magicui/flickering-grid";
import { DATA } from "@/data/resume";

const SITEMAP = [
  { href: "/", label: "Home" },
  { href: "/#about", label: "About" },
  { href: "/#work", label: "Work" },
  { href: "/#skills", label: "Skills" },
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
] as const;

const GRID_FADE = {
  maskImage: "linear-gradient(to bottom, black, transparent)",
  WebkitMaskImage: "linear-gradient(to bottom, black, transparent)",
};

function onWorkWithMe(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const email = String(data.get("email") ?? "").trim();
  const params = new URLSearchParams({ intent: "work" });
  if (email) params.set("email", email);
  window.location.href = `/contact?${params.toString()}`;
}

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer id="contact" className="w-full">
      <div className="relative rounded-2xl border border-border bg-card">
        <div className="absolute -top-4 left-1/2 z-10 -translate-x-1/2 rounded-xl border bg-primary px-4 py-1">
          <span className="text-sm font-medium text-background">
            {DATA.sections.contact.label}
          </span>
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 overflow-hidden rounded-t-2xl">
          <FlickeringGrid
            className="h-full w-full"
            squareSize={2}
            gridGap={2}
            style={GRID_FADE}
          />
        </div>

        <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-8 p-6 sm:p-8 lg:p-10">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl lg:text-5xl">
              {DATA.sections.contact.heading}
            </h2>
            <p className="mt-3 text-balance text-muted-foreground">
              {DATA.sections.contact.text}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-10">
            <div className="flex min-w-0 items-start gap-4">
              {/* Replace public/brand-logo.svg when the finished brand mark is ready. */}
              <img
                src="/brand-logo.svg"
                alt="Brian Moir brand logo placeholder"
                width={64}
                height={64}
                className="size-16 shrink-0 rounded-2xl border border-dashed border-muted-foreground/50 bg-background object-contain"
              />
              <div className="min-w-0 text-left">
                <p className="font-semibold tracking-tight">{DATA.name}</p>
                <p className="mt-1 line-clamp-3 text-sm text-pretty text-muted-foreground">
                  {DATA.description}
                </p>
              </div>
            </div>

            <nav aria-label="Sitemap" className="min-w-0">
              <h3 className="text-sm font-semibold">Sitemap</h3>
              <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2">
                {SITEMAP.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <form
              onSubmit={onWorkWithMe}
              className="flex min-w-0 flex-col gap-3 md:col-span-2 lg:col-span-1"
            >
              <div>
                <h3 className="text-sm font-semibold">Work with me</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Leave your email and continue on the contact page.
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
                <label htmlFor="footer-email" className="sr-only">
                  Email
                </label>
                <input
                  id="footer-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  maxLength={320}
                  placeholder="you@company.com"
                  className="h-10 w-full min-w-0 flex-1 rounded-lg border border-input bg-background px-3.5 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <button
                  type="submit"
                  className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
                >
                  Work with me
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="relative flex flex-col gap-2 border-t border-border px-6 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <p>
            © {year} {DATA.name}
          </p>
          <a
            href={`mailto:${DATA.contact.email}`}
            className="break-all transition-colors hover:text-foreground"
          >
            {DATA.contact.email}
          </a>
        </div>
      </div>
    </footer>
  );
}
