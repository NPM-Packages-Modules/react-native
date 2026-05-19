export const socketmesh = {
  channel(name: string) {
    return {
      name,
      emit(_event: string, _payload?: unknown) {
        return undefined;
      },
    };
  },
};
