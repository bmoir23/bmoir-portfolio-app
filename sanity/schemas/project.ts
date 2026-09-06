// ─── Sanity schema for projects ──────────────────────────────────────────────
// Drop this file into your Sanity Studio's `schemas/` folder and register it
// in your studio's `schemaTypes` array. The portfolio site expects these
// fields to exist on a `project` document.
//
// Quick start:
//   1. Copy this file into your studio's `schemas/project.ts`
//   2. Register it: `schemaTypes: [postSchema, authorSchema, projectSchema]`
//   3. Run `sanity deploy` to publish your studio
//
// Field reference (what the portfolio reads):
//   - title                 string (required)
//   - slug                  slug (required, unique)
//   - excerpt               text  (short summary shown on cards)
//   - overview              text  (Markdown — rendered with react-markdown + remark-gfm)
//   - dates                 string (e.g. "2023 - Present")
//   - active                boolean
//   - coverImage            image (optional — falls back to gradient placeholder)
//   - technologies          array<string> (Tech Stack section)
//   - skills                array<string> (Skills Used section)
//   - architectureMarkdown  text  (Markdown — Architecture & Design Decisions section)
//   - githubUrl             url   (optional)
//   - websiteUrl            url   (optional)
//   - order                 number (controls homepage grid ordering)
//   - publishedAt           datetime (sorting fallback)

import { defineType, defineField } from "sanity";

export const projectSchema = defineType({
  name: "project",
  title: "Project",
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
      description: "Short summary shown on the project card.",
      validation: (Rule) => Rule.max(280),
    }),
    defineField({
      name: "overview",
      title: "Overview (Markdown)",
      type: "text",
      rows: 12,
      description:
        "Full project overview in Markdown. GFM (tables, task lists, etc.) is supported.",
    }),
    defineField({
      name: "dates",
      title: "Dates",
      type: "string",
      description: 'e.g. "2023 - Present" or "2024".',
    }),
    defineField({
      name: "active",
      title: "Active",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "coverImage",
      title: "Cover image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "technologies",
      title: "Tech Stack",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "skills",
      title: "Skills Used",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "architectureMarkdown",
      title: "Architecture & Design Decisions (Markdown)",
      type: "text",
      rows: 16,
      description:
        "Deep dive into the architecture and key design decisions. Markdown with GFM support.",
    }),
    defineField({
      name: "githubUrl",
      title: "GitHub URL",
      type: "url",
    }),
    defineField({
      name: "websiteUrl",
      title: "Website URL",
      type: "url",
    }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      description: "Controls ordering in the homepage grid (lower shows first).",
    }),
    defineField({
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
  ],
  orderings: [
    {
      title: "Manual order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "title", subtitle: "dates", media: "coverImage" },
  },
});
