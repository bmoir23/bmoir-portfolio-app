import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: "cv6an3n5",
    dataset: "portoflio-dev-blog",
  },
  deployment: {
    appId: "irv3mb3d9ky70ff2261k5jqa",
    autoUpdates: true,
  },
});
