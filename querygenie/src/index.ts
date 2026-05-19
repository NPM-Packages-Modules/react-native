export type QueryResult = { model: unknown; query: Record<string, unknown> };

export function querygenie<T = unknown>(model: T) {
  return {
    filter(query: Record<string, unknown>): QueryResult {
      return { model, query };
    },
  };
}
