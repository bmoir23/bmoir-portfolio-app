# Blog (Sanity CMS)

The blog is powered by [Sanity](https://www.sanity.io). Posts are authored in a
Sanity Studio and fetched at request time by the Astro pages.

## 1. Create a Sanity project

1. Sign up at https://www.sanity.io and create a new project.
2. Note the **Project ID** and **Dataset** (default: `production`).
3. If your dataset is private, generate a **read token** in
   *Manage → API → Tokens*.

## 2. Configure environment

Copy `.env.example` to `.dev.vars` (used by `astro dev` / Wrangler locally):

```bash
cp .env.example .dev.vars
```

Then fill in:

```
SANITY_PROJECT_ID=cv6an3n5
SANITY_DATASET=portoflio-dev-blog
SANITY_API_VERSION=2024-10-01
SANITY_API_TOKEN=optional_read_token
```

For production on Cloudflare, add the same variables as secrets in your
Cloudflare Pages/Workers project dashboard (or via `wrangler secret put`).

## 3. Set up the Sanity Studio

The canonical schemas live in [`sanity/schemas/`](./sanity/schemas/) (`post.ts` +
`project.ts`). The deployed studio is also in [`sanity/`](./sanity/) and is
already wired to:

| Setting | Value |
| --- | --- |
| Project ID | `cv6an3n5` |
| Dataset | `portoflio-dev-blog` |

From the studio folder:

```bash
cd sanity
pnpm install
pnpm dev          # local studio at http://localhost:3333
pnpm deploy       # deploy hosted studio (after `sanity login`)
```

Schemas are registered in `sanity/sanity.config.ts` — the studio imports
`post` and `author` from `sanity/schemas/post.ts` and `project` from
`sanity/schemas/project.ts` so there is a single source of truth.

Required post fields: `title`, `slug`, `publishedAt`. Recommended: `excerpt`,
`bodyMarkdown` (Markdown), `coverImage`, `tags`.

## 4. What gets rendered

- `/blog` — list of posts (newest first) as cards.
- `/blog/[slug]` — full post page rendered from `bodyMarkdown` via
  `react-markdown` + `remark-gfm` + `rehype-pretty-code` (same pipeline as the
  rest of the site).
- The home page shows the latest 3 posts as cards in the **From the Blog**
  section (sits right after Projects).

If `SANITY_PROJECT_ID` is not set, the blog pages render an empty state with a
"Connect Sanity" prompt instead of crashing — handy for first deploy.

---

# Projects (Sanity CMS)

Projects are managed in the same Sanity project as the blog. The homepage grid,
the `/projects` list, and each `/projects/[slug]` detail page fetch them at
request time.

## 1. Register the schema

The schema for the `project` document lives in
[`sanity/schemas/project.ts`](./sanity/schemas/project.ts). Register it in your
studio's `sanity.config.ts` alongside the post schema:

```ts
import { postSchema, authorSchema } from "./schemas/post";
import { projectSchema } from "./schemas/project";

schemaTypes: [postSchema, authorSchema, projectSchema];
```

Fields: `title`, `slug` (required); `excerpt`, `overview` (Markdown), `dates`,
`active`, `coverImage`, `technologies` (Tech Stack), `skills` (Skills Used),
`architectureMarkdown` (Architecture & Design Decisions), `githubUrl`,
`websiteUrl`, `order`, `publishedAt`.

## 2. Seed the starter content (optional)

Starter projects are in
[`sanity/seed/projects.ndjson`](./sanity/seed/projects.ndjson). A sample blog
post is in [`sanity/seed/posts.ndjson`](./sanity/seed/posts.ndjson). Import
from the studio folder (requires `sanity login`):

```bash
cd sanity
pnpm seed              # imports projects + sample posts
# or individually:
pnpm seed:projects
pnpm seed:posts
```

Equivalent from the repo root:

```bash
SANITY_API_TOKEN=... pnpm seed:sanity
```

Then edit each document in the Studio — in particular fill in the
**Architecture & Design Decisions** body and any project-specific
`githubUrl` / `websiteUrl`. (The SynccOS doc is pre-wired to
`https://github.com/bmoir23/syncc-liinkd-frontend`.)

## 3. What gets rendered

- The homepage **Things I've architected & shipped** section fetches projects
  from `/api/projects.json` and renders them as cards.
- `/projects` — full list of projects as cards.
- `/projects/[slug]` — detail page with Overview, Tech Stack, Skills Used, and
  Architecture & Design Decisions sections, each in a card matching the contact
  page styling.
- Each card links internally to its detail page; the GitHub and Website badges
  open the external URLs in a new tab.

If `SANITY_PROJECT_ID` is not set, the projects surfaces render an empty state
instead of crashing.
