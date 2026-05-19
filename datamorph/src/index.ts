type Op =
  | { kind: "hide"; key: string }
  | { kind: "rename"; from: string; to: string }
  | { kind: "map"; key: string; fn: (v: unknown) => unknown };

export class Datamorph {
  private ops: Op[] = [];

  hide(key: string): this {
    this.ops.push({ kind: "hide", key });
    return this;
  }

  rename(from: string, to: string): this {
    this.ops.push({ kind: "rename", from, to });
    return this;
  }

  mapField(key: string, fn: (v: unknown) => unknown): this {
    this.ops.push({ kind: "map", key, fn });
    return this;
  }

  apply<T extends Record<string, unknown>>(row: T): Record<string, unknown> {
    let out: Record<string, unknown> = { ...row };
    for (const op of this.ops) {
      if (op.kind === "hide") {
        const { [op.key]: _, ...rest } = out;
        void _;
        out = rest;
      } else if (op.kind === "rename") {
        if (op.from in out) {
          const v = out[op.from];
          const { [op.from]: _r, ...rest } = out;
          void _r;
          out = { ...rest, [op.to]: v };
        }
      } else if (op.kind === "map" && op.key in out) {
        out = { ...out, [op.key]: op.fn(out[op.key]) };
      }
    }
    return out;
  }
}

export const datamorph = () => new Datamorph();
