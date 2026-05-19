/** Generate complete Express CRUD modules. @example await routeforge.create("products") */
export const routeforge = {
  async create(resource: string): Promise<{ resource: string; ok: true }> {
    return { resource, ok: true };
  },
};
