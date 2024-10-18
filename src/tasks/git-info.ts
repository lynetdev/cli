import simpleGit from "simple-git";

import { debug } from "../lib/debug";

import type { ESLintCommandTask } from "./index";

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

export const gitInfo: ESLintCommandTask = {
  title: "Collecting git info",
  task: async (ctx) => {
    const [commit, branch] = await Promise.all([
      sg.log().then((log) => log.latest ?? undefined),
      sg.branch().then((branches) => branches.current),
    ]);

    ctx.gitInfo = {
      commit,
      branch,
    };

    debug("commit", ctx.gitInfo.commit);
    debug("branch", ctx.gitInfo.branch);

    return ctx;
  },
};
