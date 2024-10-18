import { debug } from "./debug";

export type Task<Context> = {
  title: string;
  task: (ctx: Context) => Context | Promise<Context>;
};

export const runTasks = async <Context extends Record<string, unknown>>(
  tasks: Task<Context>[],
  ctx: Context,
): Promise<Context> => {
  let context: Context = { ...ctx };
  for (const task of tasks) {
    console.log(`\u001b[33m${task.title}\u001b[0m...`);

    debug("task", task.title);
    debug("contextBefore", context);
    try {
      context = await task.task(context);
      debug("contextAfter", context);
    } catch (error) {
      console.error(`Error in task: ${task.title}`);
      throw error;
    }
    console.log(`\u001b[32m\u2714 ${task.title}\u001b[0m`);
  }

  return context;
};
