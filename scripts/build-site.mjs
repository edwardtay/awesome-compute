import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "dist");
const files = [
  "index.html",
  "preview.html",
  "README.md",
  "favicon.svg",
  "manifest.webmanifest"
];

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

for (const file of files) {
  fs.copyFileSync(path.join(root, file), path.join(output, file));
}
for (const directory of ["assets", "data"]) {
  fs.cpSync(path.join(root, directory), path.join(output, directory), {
    recursive: true
  });
}
fs.writeFileSync(path.join(output, ".nojekyll"), "");

console.log(`Built static site in ${output}.`);
