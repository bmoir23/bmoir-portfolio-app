import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { postSchema, authorSchema } from "./schemas/post";
import { projectSchema } from "./schemas/project";

export default defineConfig({
  name: "default",
  title: "Brian Moir Portfolio",

  projectId: "cv6an3n5",
  dataset: "portoflio-dev-blog",

  plugins: [structureTool(), visionTool()],

  schema: {
    types: [postSchema, authorSchema, projectSchema],
  },
});
