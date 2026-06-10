import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readmePath = path.join(root, "README.md");
const readme = fs.readFileSync(readmePath, "utf8").replace(/\r\n/g, "\n");
const lines = readme.split("\n");
const failures = [];

const fail = message => failures.push(message);
const splitRow = line => line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map(cell => cell.trim());
const isSeparator = line => /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
const cleanHeading = value => value
  .replace(/!\[[^\]]*]\([^)]+\)/g, "")
  .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
  .replace(/<[^>]+>/g, "")
  .trim();
const slug = value => cleanHeading(value)
  .toLowerCase()
  .replace(/[^\p{L}\p{N}\s-]/gu, "")
  .trim()
  .replace(/\s+/g, "-");

for (const name of ["README.md", "CONTRIBUTING.md", "CODE_OF_CONDUCT.md", "LICENSE"]) {
  if (!fs.existsSync(path.join(root, name))) fail(`Missing required file: ${name}`);
}

if (!readme.startsWith("![Abstract compute topology")) fail("README should start with the project illustration.");
if (!readme.includes("[![Awesome](https://awesome.re/badge.svg)](https://awesome.re)")) fail("Awesome badge is missing.");
if (/^## License$/m.test(readme)) fail("README must not contain a License section; the repository license file is sufficient.");

const contents = readme.match(/^## Contents\n([\s\S]*?)(?=\n## )/m)?.[1] || "";
if (!contents) fail("Contents must be the first README section.");
if (/Contributing/i.test(contents)) fail("Contributing must not appear in Contents under the canonical Awesome rules.");

const headingSlugs = new Set(lines.flatMap(line => {
  const match = line.match(/^#{1,6}\s+(.+)$/);
  return match ? [slug(match[1])] : [];
}));

for (const match of readme.matchAll(/\[[^\]]+]\(#([^)]+)\)/g)) {
  if (!headingSlugs.has(match[1])) fail(`Broken internal heading link: #${match[1]}`);
}

let tableCount = 0;
for (let index = 0; index < lines.length - 1; index++) {
  if (!lines[index].includes("|") || !isSeparator(lines[index + 1])) continue;
  tableCount++;
  const width = splitRow(lines[index]).length;
  let cursor = index + 2;
  while (cursor < lines.length && lines[cursor].trim().startsWith("|")) {
    const rowWidth = splitRow(lines[cursor]).length;
    if (rowWidth !== width) fail(`Malformed table row at README.md:${cursor + 1}; expected ${width} cells, found ${rowWidth}.`);
    cursor++;
  }
}

if (tableCount < 15) fail(`Expected at least 15 decision tables, found ${tableCount}.`);

const projectHeaders = lines.filter(line => splitRow(line).join("|") === "Project|Best for|Why it stands out|Watch for").length;
if (projectHeaders !== 8) fail(`Expected 8 core project tables with trade-offs, found ${projectHeaders}.`);

const externalUrls = [...readme.matchAll(/https?:\/\/[^)\s]+/g)].map(match => match[0]);
const duplicates = [...new Set(externalUrls.filter((url, index) => externalUrls.indexOf(url) !== index))]
  .filter(url => url !== "https://awesome.re");
if (duplicates.length) fail(`Duplicate external URLs: ${duplicates.join(", ")}`);

const metadata = readme.match(/\*\*Entries:\*\*\s*(\d+) software projects \+ (\d+) commercial providers/);
if (!metadata) {
  fail("Entry-count metadata is missing.");
} else {
  const projectRows = lines.filter(line => /^\| \[[^\]]+]\(https:\/\/github\.com\//.test(line)).length;
  const commercialBlock = readme.match(/^## Commercial Compute Providers\n([\s\S]*?)(?=\n## Learning Resources)/m)?.[1] || "";
  const providerRows = commercialBlock.split("\n").filter(line => /^\| \[[^\]]+]\(https?:\/\//.test(line)).length;
  if (projectRows !== Number(metadata[1])) fail(`Project metadata says ${metadata[1]}, but ${projectRows} GitHub project rows were found.`);
  if (providerRows !== Number(metadata[2])) fail(`Provider metadata says ${metadata[2]}, but ${providerRows} provider rows were found.`);
}

if (failures.length) {
  console.error(`README validation failed with ${failures.length} issue(s):`);
  failures.forEach(message => console.error(`- ${message}`));
  process.exit(1);
}

console.log(`README validation passed: ${headingSlugs.size} headings, ${tableCount} tables, ${externalUrls.length} external links.`);
