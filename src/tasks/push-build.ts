import { push, type PushBuildPayload } from "../lib/build";
import { debug } from "../lib/debug";
import { parseResults } from "../lib/parse";

import type { ESLintCommandTask } from "./index";

export const pushBuild: ESLintCommandTask = {
  title: "Pushing build to Lynet",
  task: async (ctx) => {
    if (!ctx.options.token) {
      console.warn("No token provided, skipping pushing build to Lynet");
      return ctx;
    }

    if (!ctx.gitInfo || !ctx.gitInfo.commit || !ctx.gitInfo.branch) {
      console.warn("No git info found, skipping pushing build to Lynet");
      return ctx;
    }

    if (!ctx.eslint.results) {
      console.warn("No ESLint results found, skipping pushing build to Lynet");
      return ctx;
    }

    const commit = {
      author: {
        name: ctx.gitInfo.commit.author_name,
        email: ctx.gitInfo.commit.author_email,
      },
      message: ctx.gitInfo.commit.message,
      date: ctx.gitInfo.commit.date,
      sha: ctx.gitInfo.commit.hash,
      branch: ctx.gitInfo.branch,
    };

    const payload: PushBuildPayload = {
      source: "cli",
      version: ctx.cli.version,
      git:
        ctx.env?.isCi && ctx.env.provider === "github"
          ? {
              provider: ctx.env.provider,
              serverUrl: ctx.env.serverUrl,
              repositorySlug: ctx.env.repositorySlug,
              commit,
            }
          : {
              provider: "unknown",
              commit,
            },
      linter: {
        linterId: "eslint",
        version: ctx.eslint.version,
        results: parseResults(ctx.eslint.results, ctx.eslint.data?.cwd),
        rules: ctx.eslint.data?.rulesMeta,
      },
    };

    debug("payload", JSON.stringify(payload, null, 2));

    let pushBuiltResult: Awaited<ReturnType<typeof push>>;

    try {
      console.log("Pushing results...");
      pushBuiltResult = await push({
        projectToken: ctx.options.token,
        serverUrl: ctx.options.lynetUrl,
        payload,
      });
      debug("pushBuiltResult", pushBuiltResult);
    } catch (error) {
      throw new Error("Error while making request to Lynet");
    }

    if (pushBuiltResult.ok) {
      console.log("Build pushed successfully!");
      console.log(`Build ID: ${pushBuiltResult.payload.buildId}`);
      console.log(`Trace ID: ${pushBuiltResult.payload.traceId}`);
      return ctx;
    }

    console.error("Error while pushing results to Lynet", pushBuiltResult);
    throw new Error("Error while pushing results to Lynet");
  },
};
