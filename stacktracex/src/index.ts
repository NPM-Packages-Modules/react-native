/** Distributed tracing hooks for React Native apps. */
export const stacktracex = {
  track(_root: unknown) {
    return { enabled: true as const };
  },
};

export function track(root: unknown) {
  return stacktracex.track(root);
}
