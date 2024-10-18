#! /usr/bin/env node

import { Command, Option } from "commander";

import { type BaseOptions, eslintCommand } from "./tasks";
import { CLI_VERSION } from "./version";

const program = new Command();

program
  .name("lynet")
  .description("Lynet CLI")
  .configureHelp({
    subcommandTerm: (cmd) => `${cmd.name()} ${cmd.usage()}`,
  })
  .option(
    "-t, --token <token>",
    "Set the Lynet project token",
    process.env["LYNET_TOKEN"],
  )
  .option(
    "-u, --lynet-url <url>",
    "Set the Lynet base URL",
    process.env["LYNET_URL"] ?? "https://app.lynet.dev",
  )
  .version(
    `Lynet CLI v${CLI_VERSION}`,
    "-v, --version",
    "Outputs the Lynet CLI version.",
  );

type ESLintCommandOptions = {
  cwd?: string;
  config?: string;
  allowInlineConfig?: boolean;
  noEslintrc?: boolean;
  cache?: boolean;
  cacheLocation?: string;
  cacheStrategy?: "content" | "metadata";
};

program
  .command("push-build")
  .option("-c, --config <file>", "Use configuration from <file>", "lynet.js")
  .option("--allow-inline-config", "Allow inline configuration comments")
  .option("--cwd <path>", "Specify the current working directory")
  .option("--no-eslintrc", "Disable use of configuration from .eslintrc.*")
  .option("--cache", "Only check changed files")
  .option("--cache-location <path>", "Path to the cache file or directory")
  .addOption(
    new Option("--cache-strategy <strategy>", "Cache strategy").choices([
      "content",
      "metadata",
    ]),
  )
  .arguments("[files...]")
  .hook("preAction", () => {
    console.log(`Lynet CLI v${CLI_VERSION}`);
  })
  .action(
    async (
      files: string[],
      eslintOptions: ESLintCommandOptions,
      command: Command,
    ) => {
      const options = command.parent!.opts<BaseOptions>();

      await eslintCommand({
        cli: {
          version: CLI_VERSION,
        },
        options,
        eslint: {
          options: {
            cwd: eslintOptions.cwd,
            overrideConfigFile: eslintOptions.config,
            allowInlineConfig: eslintOptions.allowInlineConfig,
            useEslintrc: !eslintOptions.config && !eslintOptions.noEslintrc,
            cache: eslintOptions.cache,
            cacheLocation: eslintOptions.cacheLocation,
            cacheStrategy: eslintOptions.cacheStrategy,
          },
          files,
        },
      });
    },
  );

program.parse(process.argv);
