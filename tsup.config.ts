import { existsSync, writeFileSync } from "node:fs";
import { defineConfig } from "tsup";

if (!existsSync("./src/version.ts")) {
  const packageJson = require("./package.json");
  const version = packageJson.version;
  const content = `export const CLI_VERSION = "${version}";\n`;
  writeFileSync("./src/version.ts", content);
}

export default defineConfig({
  entry: { lynet: "src/index.ts" },
  clean: true,
  minify: true,
  minifyWhitespace: true,
  minifyIdentifiers: true,
  minifySyntax: true,
  bundle: true,
});
