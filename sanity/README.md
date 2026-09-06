# Sanity Studio for starfolio

This folder contains the Sanity Studio for the portfolio site. Schemas live in `schemas/` and starter content lives in `seed/`.

## Quick start

```bash
cd sanity
pnpm install
pnpm dev          # local studio at http://localhost:3333
pnpm deploy       # deploy hosted studio (after `sanity login`)
```

## Schema reference

- `post` — Blog posts (`sanity/schemas/post.ts`)
- `author` — Blog authors (`sanity/schemas/post.ts`)
- `project` — Projects (`sanity/schemas/project.ts`)

## Seeding starter content

From the studio folder:

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
