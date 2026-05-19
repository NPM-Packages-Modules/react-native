export const servqueue = {
  async add(name: string, payload: unknown): Promise<{ name: string; payload: unknown; id: string }> {
    return { name, payload, id: `${name}-${Date.now()}` };
  },
};
