export const cronpilot = {
  schedule(cron: string, task: () => void | Promise<void>) {
    return { cron, task, scheduled: true as const };
  },
};
