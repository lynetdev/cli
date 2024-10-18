import { createRequire } from "module";
import { realpathSync } from "node:fs";
import { join, resolve } from "node:path";

export const resolveFrom = (fromDirectory: string, moduleId: string) => {
  try {
    fromDirectory = realpathSync(fromDirectory);
  } catch (error: unknown) {
    if (isError(error) && error.code === "ENOENT") {
      fromDirectory = resolve(fromDirectory);
    } else {
      throw error;
    }
  }

  const fromFile = join(fromDirectory, "noop.js");
  const requireFromDirectory = createRequire(fromFile);

  return requireFromDirectory.resolve(moduleId);
};

const isError = (error: unknown): error is NodeJS.ErrnoException =>
  error instanceof Error;
