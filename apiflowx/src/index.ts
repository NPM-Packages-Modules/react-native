/** Visualize API flows from React Native apps. */
export const apiflowx = {
  inspect(_app: unknown) {
    return { graph: { nodes: [] as string[], edges: [] as string[] } };
  },
};
