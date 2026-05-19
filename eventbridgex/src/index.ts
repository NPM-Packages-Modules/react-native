export const eventbridgex = {
  async emit(event: string, payload?: unknown): Promise<{ event: string; payload: unknown }> {
    return { event, payload: payload ?? null };
  },
};
