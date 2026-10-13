import { useEffect, useState } from "react";
import BlurFade from "@/components/magicui/blur-fade";
import { FocusCity, type FocusDay } from "@/components/ui/focus-city";
import { DATA } from "@/data/resume";

const BLUR_FADE_DELAY = 0.04;

function deriveGithubUsername(url: string): string | undefined {
  if (!url) return undefined;
  const match = url.match(/github\.com\/([^/?#]+)/);
  return match?.[1];
}

type Contribution = { date: string; count: number };

/**
 * Scale a day's commit count onto Focus City's minute levels
 * (under 60 / 120 / 180, then 3h+). One contribution is half an hour,
 * capped so a very busy day still reads as the top of the skyline.
 */
function minutesFromContributions(count: number): number {
  if (count <= 0) return 0;
  return Math.min(240, count * 30);
}

function toFocusDays(contributions: Contribution[]): FocusDay[] {
  return contributions.flatMap((entry) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.date)) return [];
    const count = Number.isFinite(entry.count) ? Math.max(0, Math.round(entry.count)) : 0;
    return [
      {
        date: entry.date,
        sessions:
          count > 0
            ? [
                {
                  id: entry.date,
                  title:
                    count === 1
                      ? "1 GitHub contribution"
                      : `${count} GitHub contributions`,
                  minutes: minutesFromContributions(count),
                },
              ]
            : [],
      },
    ];
  });
}

async function fetchContributions(username: string): Promise<FocusDay[]> {
  const res = await fetch(
    `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(username)}`,
  );
  if (!res.ok) {
    throw new Error(
      `Could not fetch contributions for "${username}" (${res.status})`,
    );
  }
  const json = (await res.json()) as { contributions?: Contribution[] };
  return toFocusDays(json.contributions ?? []);
}

export default function GithubActivitySection() {
  const username = deriveGithubUsername(DATA.contact.social.GitHub?.url);
  const copy = DATA.sections.githubActivity;
  const [days, setDays] = useState<FocusDay[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!username) return;
    let cancelled = false;
    fetchContributions(username)
      .then((next) => {
        if (!cancelled) setDays(next);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [username]);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <section id="github-activity">
      <div className="flex min-h-0 flex-col gap-y-6">
        <div className="flex flex-col gap-y-3 items-center justify-center">
          <div className="flex items-center w-full">
            <div className="flex-1 h-px bg-linear-to-r from-transparent from-5% via-border via-95% to-transparent" />
            <div className="border bg-primary z-10 rounded-xl px-4 py-1">
              <span className="text-background text-sm font-medium">
                {copy.label}
              </span>
            </div>
            <div className="flex-1 h-px bg-linear-to-l from-transparent from-5% via-border via-95% to-transparent" />
          </div>
          <div className="flex flex-col gap-y-2 items-center justify-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
              {copy.heading}
            </h2>
            <p className="text-muted-foreground md:text-lg/relaxed lg:text-base/relaxed xl:text-lg/relaxed text-balance text-center">
              {copy.text}
            </p>
          </div>
        </div>
        <BlurFade delay={BLUR_FADE_DELAY * 3.5}>
          <div className="w-full">
            {!username ? (
              <p className="text-center text-sm text-muted-foreground">
                Add a GitHub URL to{" "}
                <code className="text-foreground">DATA.contact.social.GitHub</code>{" "}
                to display your contribution graph.
              </p>
            ) : error ? (
              <p className="text-center text-sm text-muted-foreground">
                The contribution skyline could not be loaded. Refresh the page
                to try again.
              </p>
            ) : days === null ? (
              <div
                className="mx-auto h-[560px] w-full max-w-[720px] animate-pulse rounded-[14px] border border-border bg-muted/50"
                aria-hidden="true"
              />
            ) : (
              <FocusCity
                days={days}
                endDate={today}
                title="Contribution skyline"
                description="Each building is one day. Height tracks how many contributions landed that day."
                defaultView="city"
                theme="auto"
              />
            )}
          </div>
        </BlurFade>
      </div>
    </section>
  );
}
