import { type ListrTask } from "listr2";
import simpleGit from "simple-git";

import { debug } from "../lib/debug";

import type { ESLintCommandContext } from "./index";
const sg = simpleGit();

export type GitInfoTaskContext = {
  gitInfo?: {
    commit?: {
      hash: string;
      date: string;
      message: string;
      refs: string;
      body: string;
      author_name: string;
      author_email: string;
    };
    branch?: string;
  };
};

export const gitInfo: ListrTask<ESLintCommandContext> = {
  title: "Collecting git info",
  task: (_ctx, task) =>
    task.newListr(
      [
        {
          title: "Getting latest commit",
          task: async (ctx) => {
            const commit = await sg.log().then((log) => log.latest);
            ctx.gitInfo = {
              ...ctx.gitInfo,
              commit: commit ?? undefined,
            };

            debug("commit", ctx.gitInfo.commit);
          },
        },
        {
          title: "Getting branch name",
          task: async (ctx) => {
            const branches = await sg.branch().then((branches) => branches);
            ctx.gitInfo = {
              ...ctx.gitInfo,
              branch: branches.current,
            };

            debug("branch", ctx.gitInfo.branch);
          },
        },
      ],
      { concurrent: true },
    ),
};
