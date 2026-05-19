/** Infer a coarse JSON type label for diffing document shapes. */
export function typeLabel(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

/** Flatten dot-paths for nested object keys; arrays are treated as leaves. */
export function flattenShape(obj: unknown, prefix = ""): Map<string, string> {
  const out = new Map<string, string>();
  if (obj === null || typeof obj !== "object" || Array.isArray(obj)) {
    if (prefix) out.set(prefix, typeLabel(obj));
    return out;
  }
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === "object" && !Array.isArray(v)) {
      for (const [p, t] of flattenShape(v, path)) out.set(p, t);
    } else {
      out.set(path, typeLabel(v));
    }
  }
  return out;
}

export type SchemaDiff = {
  addedPaths: string[];
  removedPaths: string[];
  typeChanges: { path: string; from: string; to: string }[];
};

/** Compare two representative documents (or embedded subdocs) like Mongo samples. */
export function diffSampleDocuments(before: unknown, after: unknown): SchemaDiff {
  const a = flattenShape(before);
  const b = flattenShape(after);
  const addedPaths: string[] = [];
  const removedPaths: string[] = [];
  const typeChanges: SchemaDiff["typeChanges"] = [];

  for (const p of b.keys()) {
    if (!a.has(p)) addedPaths.push(p);
  }
  for (const p of a.keys()) {
    if (!b.has(p)) removedPaths.push(p);
  }
  for (const p of a.keys()) {
    if (b.has(p)) {
      const ta = a.get(p)!;
      const tb = b.get(p)!;
      if (ta !== tb) typeChanges.push({ path: p, from: ta, to: tb });
    }
  }

  addedPaths.sort();
  removedPaths.sort();
  typeChanges.sort((x, y) => x.path.localeCompare(y.path));
  return { addedPaths, removedPaths, typeChanges };
}

/** 0–100 heuristic: removed fields and type changes are higher risk than additive paths. */
export function migrationHealthScore(diff: SchemaDiff): number {
  let s = 100;
  s -= diff.removedPaths.length * 18;
  s -= diff.typeChanges.length * 12;
  s -= diff.addedPaths.length * 3;
  return Math.max(0, Math.min(100, s));
}

/** Human-readable migration plan stub for dry-runs and CI. */
export function formatMigrationPlan(diff: SchemaDiff, name = "unnamed"): string {
  const lines: string[] = [`Plan: ${name}`, `Health score: ${migrationHealthScore(diff)}/100`];
  if (diff.removedPaths.length) lines.push("Breaking — removed paths:", ...diff.removedPaths.map((p) => `  - ${p}`));
  if (diff.typeChanges.length) {
    lines.push("Breaking — type changes:");
    lines.push(...diff.typeChanges.map((c) => `  - ${c.path}: ${c.from} → ${c.to}`));
  }
  if (diff.addedPaths.length) lines.push("Additive — new paths:", ...diff.addedPaths.map((p) => `  + ${p}`));
  return lines.join("\n");
}

/** Scaffold entry for migration generation workflows. */
export async function generate(): Promise<{ ok: true; plan: string }> {
  return { ok: true, plan: formatMigrationPlan({ addedPaths: [], removedPaths: [], typeChanges: [] }) };
}

export const schemashift = { generate, diffSampleDocuments, migrationHealthScore, formatMigrationPlan };
