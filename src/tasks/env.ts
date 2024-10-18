import { debug } from "../lib/debug";

import type { ESLintCommandTask } from "./index";

export type EnvTaskContext = {
  env?:
    | {
        isCi: false;
      }
    | {
        isCi: true;
        provider: "github";
        serverUrl: string;
        repositorySlug: string;
      }
    | {
        isCi: true;
        provider: "unknown";
      };
};

export const envInfo: ESLintCommandTask = {
  title: "Collecting env info",
  task: (ctx) => {
    if (process.env["GITHUB_ACTIONS"]) {
      ctx.env = {
        isCi: true,
        provider: "github",
        serverUrl: process.env["GITHUB_SERVER_URL"] ?? "",
        repositorySlug: process.env["GITHUB_REPOSITORY"] ?? "",
      };
    } else if (process.env["CI"]) {
      ctx.env = {
        isCi: true,
        provider: "unknown",
      };
    } else {
      ctx.env = {
        isCi: false,
      };
    }

    debug("options", ctx.options);
    debug("env", ctx.env);

    return ctx;
  },
};
