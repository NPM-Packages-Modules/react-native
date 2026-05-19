export type ServFn = (payload: unknown) => unknown | Promise<unknown>;

export class ServBridge {
  private services = new Map<string, ServFn>();
  private channels = new Map<string, Set<(e: unknown) => void>>();

  register(name: string, fn?: ServFn): this {
    if (fn) this.services.set(name, fn);
    return this;
  }

  list(): string[] {
    return [...this.services.keys()].sort();
  }

  async call<T = unknown>(name: string, payload?: unknown): Promise<T> {
    const fn = this.services.get(name);
    if (!fn) throw new Error("servbridge: unknown service " + name);
    return (await fn(payload)) as T;
  }

  on(channel: string, listener: (e: unknown) => void): this {
    let set = this.channels.get(channel);
    if (!set) {
      set = new Set();
      this.channels.set(channel, set);
    }
    set.add(listener);
    return this;
  }

  emit(channel: string, event: unknown): void {
    const set = this.channels.get(channel);
    if (!set) return;
    for (const l of set) l(event);
  }
}

export const servbridge = () => new ServBridge();
