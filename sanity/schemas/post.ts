// ─── Sanity schema for the blog ──────────────────────────────────────────────
// Drop this file into your Sanity Studio's `schemas/` folder and register it
// in your studio's `schemaTypes` array. The portfolio site expects these
// fields to exist on a `post` document.
//
// Quick start:
//   1. Create a Sanity project at https://www.sanity.io/manage
//   2. Run `npm create sanity@latest` in a sibling folder (e.g. `../blog-studio`)
//   3. Copy this file into that studio's `schemas/post.ts`
//   4. Register it: `schemaTypes: [postSchema]` in sanity.config.ts
//   5. Run `sanity deploy` to publish your studio
//   6. Add SANITY_PROJECT_ID + SANITY_DATASET to `.dev.vars` here
//
// Field reference (what the portfolio reads):
//   - title         string (required)
//   - slug          slug (required, must be unique)
//   - excerpt       text  (short summary shown on cards)
//   - bodyMarkdown  text  (full post body as Markdown — rendered with react-markdown + remark-gfm)
//   - publishedAt   datetime
//   - readingTime   number (optional — minutes; auto-calc if omitted)
//   - coverImage    image  (optional — used as the card/cover image)
//   - tags          array<string>
//   - author        reference -> author (optional)

import { defineType, defineField } from "sanity";

export const postSchema = defineType({
  name: "post",
  title: "Blog Post",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required().max(140),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 120, isUnique: () => true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 4,
      validation: (Rule) => Rule.max(280),
    }),
    defineField({
      name: "bodyMarkdown",
      title: "Body (Markdown)",
      type: "text",
      rows: 20,
      description:
        "Write the full post in Markdown. GFM (tables, task lists, etc.) is supported.",
    }),
    defineField({
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "readingTime",
      title: "Reading time (minutes)",
      type: "number",
      description: "Optional. If omitted, the site estimates it from the body.",
    }),
    defineField({
      name: "coverImage",
      title: "Cover image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "reference",
      to: [{ type: "author" }],
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "publishedAt", media: "coverImage" },
  },
});

export const authorSchema = defineType({
  name: "author",
  title: "Author",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string" }),
    defineField({ name: "avatar", title: "Avatar", type: "image" }),
  ],
  preview: { select: { title: "name", media: "avatar" } },
});
