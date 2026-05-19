export const deploysense = {
  async verify(): Promise<{ ok: true; score: number }> {
    return { ok: true, score: 100 };
  },
};
