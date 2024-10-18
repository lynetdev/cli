import { Listr } from "listr2";

import { envInfo, type EnvTaskContext } from "./env";
import { eslint, type ESLintTaskContext } from "./eslint";
import { gitInfo, type GitInfoTaskContext } from "./git-info";
import { pushBuild } from "./push-build";

export type BaseOptions = {
  lynetUrl: string;
  token?: string;
};

export type ESLintCommandContext = {
  cli: {
    version: string;
  };
  options: BaseOptions;
} & GitInfoTaskContext &
  ESLintTaskContext &
  EnvTaskContext;

export const eslintCommand = new Listr<ESLintCommandContext>([
  envInfo,
  gitInfo,
  eslint,
  pushBuild,
]);
