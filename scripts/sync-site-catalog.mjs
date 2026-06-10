import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readme = fs
  .readFileSync(path.join(root, "README.md"), "utf8")
  .replace(/\r\n/g, "\n");
const sitePath = path.join(root, "index.html");
const site = fs.readFileSync(sitePath, "utf8");

const categories = new Map([
  ["Cluster Orchestration and Scheduling", "Orchestration"],
  ["Distributed Computing", "Distributed"],
  ["Serverless and Elastic Compute", "Serverless"],
  ["GPU and AI Compute", "GPU & AI"],
  ["Workflow Orchestration", "Workflows"],
  ["Container and Isolation Runtimes", "Runtimes"],
  ["Compute Observability", "Observability"],
  ["Decentralized and Data-Local Compute", "Decentralized"],
]);

const splitRow = (line) =>
  line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());

const projects = [];
for (const [heading, category] of categories) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const block =
    readme.match(
      new RegExp(`^## ${escaped}\\n([\\s\\S]*?)(?=\\n## )`, "m"),
    )?.[1] || "";
  for (const line of block.split("\n")) {
    const cells = splitRow(line);
    if (cells.length !== 4) continue;
    const project = cells[0].match(
      /^\[([^\]]+)]\(https:\/\/github\.com\/([^)]+)\)$/,
    );
    if (!project) continue;
    projects.push({
      name: project[1],
      repo: project[2],
      category,
      best: cells[1],
      desc: cells[2],
      tradeoff: cells[3],
      rank: projects.length + 1,
    });
  }
}

if (!projects.length)
  throw new Error("No project rows were parsed from README.md.");

const catalogPattern =
  /^([ \t]*)const projects = \[[\s\S]*?^\1\];\n\n^\1const audits/m;
if (!catalogPattern.test(site))
  throw new Error("Could not locate the site catalog block.");

const updated = site.replace(catalogPattern, (_, indent) => {
  const generated = JSON.stringify(projects, null, 2)
    .split("\n")
    .map((line, index) => (index ? `${indent}${line}` : line))
    .join("\n");
  return `${indent}const projects = ${generated};\n\n${indent}const audits`;
});
if (updated !== site) fs.writeFileSync(sitePath, updated);
console.log(
  `${updated === site ? "Verified" : "Synced"} ${projects.length} README projects in index.html.`,
);
