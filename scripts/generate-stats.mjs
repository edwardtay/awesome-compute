import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
const outputDirectory = path.join(root, "data", "badges");

const reviewed = readme.match(/\*\*Editorially reviewed:\*\*\s*([^·\n]+)/)?.[1]?.trim();
const entries = readme.match(/\*\*Entries:\*\*\s*(\d+) software projects \+ (\d+) commercial providers/);

if (!reviewed || !entries) {
  throw new Error("README editorial metadata line is missing or malformed.");
}

const projects = Number(entries[1]);
const providers = Number(entries[2]);
const generatedAt = new Date().toISOString();

fs.mkdirSync(outputDirectory, { recursive: true });

const files = {
  "projects.json": { schemaVersion: 1, label: "projects", message: String(projects), color: "7657d6" },
  "providers.json": { schemaVersion: 1, label: "providers", message: String(providers), color: "087f6a" },
  "reviewed.json": { schemaVersion: 1, label: "editorially reviewed", message: reviewed, color: "111827" },
  "snapshot.json": { projects, providers, reviewed, generatedAt }
};

for (const [name, value] of Object.entries(files)) {
  fs.writeFileSync(path.join(outputDirectory, name), `${JSON.stringify(value, null, 2)}\n`);
}

console.log(`Generated ${Object.keys(files).length} stats files for ${projects} projects and ${providers} providers.`);
