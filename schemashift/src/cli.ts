import { readFile } from "node:fs/promises";
import pc from "picocolors";
import { diffSampleDocuments, formatMigrationPlan, migrationHealthScore } from "./index.js";

function usage(): never {
  console.error(`Usage:
  schemashift generate <before.json> <after.json>
  schemashift score <before.json> <after.json>`);
  process.exit(1);
}

async function readJson(path: string): Promise<unknown> {
  const raw = await readFile(path, "utf8");
  return JSON.parse(raw);
}

async function main() {
  const [, , cmd, a, b] = process.argv;
  if (!(cmd === "generate" || cmd === "score") || !a || !b) usage();

  const before = await readJson(a);
  const after = await readJson(b);
  const diff = diffSampleDocuments(before, after);

  if (cmd === "score") {
    console.log(String(migrationHealthScore(diff)));
    return;
  }

  console.log(pc.cyan(formatMigrationPlan(diff, `${a} → ${b}`)));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
