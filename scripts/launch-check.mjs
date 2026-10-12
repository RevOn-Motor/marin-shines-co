// Lists every LAUNCH-BLOCKER placeholder left in src/. Exits 1 while any remain,
// so it can gate a deploy.
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../src/", import.meta.url));
const MARKER = "LAUNCH-BLOCKER:";

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else if (/\.(ts|tsx|css)$/.test(entry.name)) yield path;
  }
}

const hits = [];
for (const file of walk(root)) {
  readFileSync(file, "utf8")
    .split("\n")
    .forEach((line, index) => {
      const at = line.indexOf(MARKER);
      if (at !== -1) hits.push(`${relative(process.cwd(), file)}:${index + 1}  ${line.slice(at).trim()}`);
    });
}

if (hits.length > 0) {
  console.log(`${hits.length} launch blocker(s) left:\n\n${hits.join("\n")}`);
  process.exit(1);
}
console.log("No LAUNCH-BLOCKER markers left in src/.");
