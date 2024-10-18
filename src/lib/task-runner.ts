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
    console.log(task.title);
    debug("task", task.title);
    debug("contextBefore", context);
    try {
      context = await task.task(context);
      debug("contextAfter", context);
    } catch (error) {
      console.error(`Error in task: ${task.title}`);
      throw error;
    }
  }

  return context;
};
