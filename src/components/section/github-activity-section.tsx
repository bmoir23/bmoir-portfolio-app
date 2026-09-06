import BlurFade from "@/components/magicui/blur-fade";
import { GithubCalendar } from "@/components/ui/retro-space-shooter-git-hub-calendar";
import { DATA } from "@/data/resume";

const BLUR_FADE_DELAY = 0.04;

// Derive the GitHub username from the configured social URL.
function deriveGithubUsername(url: string): string | undefined {
  if (!url) return undefined;
  const match = url.match(/github\.com\/([^/?#]+)/);
  return match?.[1];
}

export default function GithubActivitySection() {
  const username = deriveGithubUsername(DATA.contact.social.GitHub?.url);

  return (
    <section id="github-activity">
      <div className="flex min-h-0 flex-col gap-y-6">
        <div className="flex flex-col gap-y-3 items-center justify-center">
          <div className="flex items-center w-full">
            <div className="flex-1 h-px bg-linear-to-r from-transparent from-5% via-border via-95% to-transparent" />
            <div className="border bg-primary z-10 rounded-xl px-4 py-1">
              <span className="text-background text-sm font-medium">
                Open Source
              </span>
            </div>
            <div className="flex-1 h-px bg-linear-to-l from-transparent from-5% via-border via-95% to-transparent" />
          </div>
          <div className="flex flex-col gap-y-2 items-center justify-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
              GitHub Activity
            </h2>
            <p className="text-muted-foreground md:text-lg/relaxed lg:text-base/relaxed xl:text-lg/relaxed text-balance text-center">
              My contribution graph over the last year. Flip on{" "}
              <span className="text-foreground font-medium">Game Mode</span>{" "}
              to blast through it retro-space-shooter style.
            </p>
          </div>
        </div>
        <BlurFade delay={BLUR_FADE_DELAY * 3.5}>
          <div className="w-full overflow-x-auto">
            {username ? (
              <GithubCalendar
                username={username}
                cellSize={12}
                cellGap={3}
                className="mx-auto"
              />
            ) : (
              <p className="text-center text-sm text-muted-foreground">
                Add a GitHub URL to{" "}
                <code className="text-foreground">DATA.contact.social.GitHub</code>{" "}
                to display your contribution graph.
              </p>
            )}
          </div>
        </BlurFade>
      </div>
    </section>
  );
}
