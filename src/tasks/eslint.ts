import { type ESLint } from "eslint";
import path from "node:path";
import semver from "semver";

import { debug } from "../lib/debug";
import { resolveFrom } from "../lib/module";

import type { ESLintCommandTask } from "./index";

export type ESLintTaskContext = {
  eslint: {
    files: string[];
    options: ESLintOptions;
    results?: ESLint.LintResult[];
    data?: ESLint.LintResultData;
    version?: string;
  };
};

// We support a subset of ESLint options
export type ESLintOptions = {
  cwd?: string;
  allowInlineConfig?: boolean;
  overrideConfigFile?: string;
  useEslintrc?: boolean;
  cache?: boolean;
  cacheLocation?: string;
  cacheStrategy?: "content" | "metadata";
};

export const eslint: ESLintCommandTask = {
  title: "Running ESLint",
  task: async (ctx) => {
    const { eslint, version } = await loadESLint(ctx.eslint.options);
    debug("eslintVersion", version);
    debug("eslintOptions", ctx.eslint.options);

    // If no files are provided, default to ['.']
    const targetFiles = ctx.eslint.files.length > 0 ? ctx.eslint.files : ["."];
    debug("targetFiles", targetFiles);

    const results = await eslint.lintFiles(targetFiles);

    const data: ESLint.LintResultData = {
      cwd: ctx.eslint.options.cwd ?? process.cwd(),
      rulesMeta: eslint.getRulesMetaForResults(results),
    };

    ctx.eslint.results = results;
    ctx.eslint.data = data;
    ctx.eslint.version = version;

    return ctx;
  },
};

const loadESLint = async (options: ESLintOptions) => {
  let eslintModule: typeof import("eslint");
  try {
    const eslintModulePath = resolveFrom(
      options.cwd ?? process.cwd(),
      "eslint",
    );
    debug("eslintModulePath", eslintModulePath);

    eslintModule = await Promise.resolve(require(eslintModulePath));
  } catch {
    throw new Error("ESLint is not installed. Please install ESLint.");
  }

  const eslintVersion = eslintModule.ESLint.version;
  const baseOptions = {
    // We don't want to throw on unmatched patterns, as we may have globs that don't match any files
    errorOnUnmatchedPattern: false,
  };

  if (semver.gte(eslintVersion, "9.0.0")) {
    const { useEslintrc, ...optionsV9 } = options;
    return {
      eslint: new eslintModule.ESLint({
        ...baseOptions,
        ...optionsV9,
      }),
      version: eslintVersion,
    };
  }

  // loadESLint is >= 8.57.0
  // PR https://github.com/eslint/eslint/pull/18098
  // Release https://github.com/eslint/eslint/releases/tag/v8.57.0
  if (!semver.satisfies(eslintVersion, ">=8.57.0")) {
    throw new Error(`ESLint >=8.57.0 is required. Found: ${eslintVersion}.`);
  }

  // If V9 config was found, use flat config, or else use legacy.
  const useFlatConfig = options.overrideConfigFile
    ? path.basename(options.overrideConfigFile).startsWith("eslint.")
    : false;

  debug("useFlatConfig", useFlatConfig);

  const ESLintOrLegacyESLint = await eslintModule.loadESLint({
    useFlatConfig,
  });

  const { useEslintrc, ...optionsV8 } = options;

  return {
    eslint: new ESLintOrLegacyESLint(
      useFlatConfig
        ? {
            ...baseOptions,
            ...optionsV8,
          }
        : {
            ...baseOptions,
            ...optionsV8,
            useEslintrc,
          },
    ),
    version: eslintVersion,
  };
};
