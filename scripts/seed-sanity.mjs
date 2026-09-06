#!/usr/bin/env node
/**
 * Seed Sanity with projects + sample posts from sanity/seed/*.ndjson
 *
 * Requires a token with write access:
 *   SANITY_API_TOKEN=... node scripts/seed-sanity.mjs
 *
 * Or after `sanity login` from the studio folder:
 *   cd sanity && pnpm seed
 */
import { createClient } from "@sanity/client";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const projectId = process.env.SANITY_PROJECT_ID ?? "cv6an3n5";
const dataset = process.env.SANITY_DATASET ?? "portoflio-dev-blog";
const token = process.env.SANITY_API_TOKEN;

if (!token) {
  console.error(
    "SANITY_API_TOKEN is required for seeding. Run `sanity login` and use:\n" +
      "  cd sanity && pnpm seed\n" +
      "Or set SANITY_API_TOKEN with a write-capable token.",
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: process.env.SANITY_API_VERSION ?? "2024-10-01",
  token,
  useCdn: false,
});

function loadNdjson(path) {
  return readFileSync(path, "utf8")
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

async function seed() {
  const files = [
    join(root, "sanity/seed/projects.ndjson"),
    join(root, "sanity/seed/posts.ndjson"),
  ];

  const docs = files.flatMap(loadNdjson);
  console.log(`Seeding ${docs.length} documents into ${projectId}/${dataset}...`);

  const tx = client.transaction();
  for (const doc of docs) {
    tx.createOrReplace(doc);
  }
  await tx.commit();

  console.log("Done.");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
