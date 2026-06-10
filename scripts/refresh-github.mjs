import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
const outputPath = path.join(root, "data", "github-snapshot.json");
const repositories = [
  ...new Set(
    readme.split(/\r?\n/).flatMap((line) => {
      const match = line.match(
        /^\| \[[^\]]+]\(https:\/\/github\.com\/([^)]+)\)/,
      );
      return match ? [match[1]] : [];
    }),
  ),
];

const headers = {
  Accept: "application/vnd.github+json",
  "User-Agent": "awesome-compute-metadata",
  "X-GitHub-Api-Version": "2022-11-28",
};
if (process.env.GITHUB_TOKEN)
  headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

const snapshot = {};
const failures = [];
const queue = [...repositories];

async function worker() {
  while (queue.length) {
    const repo = queue.shift();
    const response = await fetch(`https://api.github.com/repos/${repo}`, {
      headers,
    });
    if (!response.ok) {
      failures.push(`${repo}: HTTP ${response.status}`);
      continue;
    }
    const data = await response.json();
    snapshot[repo] = {
      full_name: data.full_name,
      html_url: data.html_url,
      stargazers_count: data.stargazers_count,
      forks_count: data.forks_count,
      open_issues_count: data.open_issues_count,
      language: data.language,
      archived: data.archived,
      pushed_at: data.pushed_at,
      updated_at: data.updated_at,
      default_branch: data.default_branch,
      license: data.license ? { spdx_id: data.license.spdx_id } : null,
    };
  }
}

await Promise.all(Array.from({ length: 5 }, worker));
if (failures.length)
  throw new Error(`GitHub metadata refresh failed:\n${failures.join("\n")}`);

const output = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  source: "GitHub REST API",
  repositories: snapshot,
};
fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(`Refreshed metadata for ${repositories.length} repositories.`);
