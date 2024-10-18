import { ESLint } from "eslint";

const parseMessage = ({
  ruleId,
  column,
  line,
  endLine,
  message,
  messageId,
  nodeType,
  fatal,
  severity,
  fix,
}: ESLint.LintResult["messages"][number]) => ({
  ruleId,
  column,
  line,
  endLine,
  message,
  messageId,
  nodeType,
  fatal,
  severity,
  fixable: Boolean(fix),
});

/**
 * `source` field is removed to avoid sending source code to the server and to reduce payload weight
 *
 * The full filepath should be considered sensitive information: `filePath` is rewritten to avoid
 * sending such information to the server.
 */
const parseResult =
  (cwd?: string) =>
  ({ filePath, messages }: ESLint.LintResult) => ({
    filePath: cwd ? filePath.replace(`${cwd}`, "") : filePath,
    violations: messages.map(parseMessage),
  });

export const parseResults = (results: ESLint.LintResult[], cwd?: string) =>
  results.map(parseResult(cwd));
