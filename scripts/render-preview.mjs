import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = fs.readFileSync(path.join(root, "README.md"), "utf8");

const escapeHtml = value => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const slugCounts = new Map();
const slugify = value => {
  const base = value
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-");
  const count = slugCounts.get(base) || 0;
  slugCounts.set(base, count + 1);
  return count ? `${base}-${count}` : base;
};

function inline(value) {
  let output = escapeHtml(value);
  const code = [];
  output = output.replace(/`([^`]+)`/g, (_, text) => {
    code.push(`<code>${text}</code>`);
    return `\u0000CODE${code.length - 1}\u0000`;
  });
  output = output.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g, '<img src="$2" alt="$1">');
  output = output.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g, '<a href="$2">$1</a>');
  output = output.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  output = output.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  output = output.replace(/\u0000CODE(\d+)\u0000/g, (_, index) => code[Number(index)]);
  return output;
}

function isTableSeparator(line) {
  return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
}

function splitTableRow(line) {
  return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map(cell => cell.trim());
}

const lines = source.replace(/\r\n/g, "\n").split("\n");
const rendered = [];
let index = 0;

while (index < lines.length) {
  const line = lines[index];
  if (!line.trim()) {
    index++;
    continue;
  }

  if (line.startsWith("```")) {
    const language = line.slice(3).trim();
    const body = [];
    index++;
    while (index < lines.length && !lines[index].startsWith("```")) body.push(lines[index++]);
    index++;
    rendered.push(`<pre><code class="language-${escapeHtml(language)}">${escapeHtml(body.join("\n"))}</code></pre>`);
    continue;
  }

  const heading = line.match(/^(#{1,6})\s+(.+)$/);
  if (heading) {
    const level = heading[1].length;
    const text = heading[2];
    const plain = text.replace(/!\[[^\]]*\]\([^)]+\)/g, "").trim();
    const id = slugify(plain);
    rendered.push(`<h${level} id="${id}"><a class="anchor" href="#${id}" aria-label="Permalink">#</a>${inline(text)}</h${level}>`);
    index++;
    continue;
  }

  if (/^\s*---+\s*$/.test(line)) {
    rendered.push("<hr>");
    index++;
    continue;
  }

  if (line.includes("|") && index + 1 < lines.length && isTableSeparator(lines[index + 1])) {
    const headers = splitTableRow(line);
    index += 2;
    const rows = [];
    while (index < lines.length && lines[index].includes("|") && lines[index].trim()) {
      rows.push(splitTableRow(lines[index++]));
    }
    rendered.push(`<div class="table-scroll"><table><thead><tr>${headers.map(cell => `<th>${inline(cell)}</th>`).join("")}</tr></thead><tbody>${rows.map(row => `<tr>${headers.map((_, cellIndex) => `<td>${inline(row[cellIndex] || "")}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`);
    continue;
  }

  if (/^\s*[-*]\s+/.test(line)) {
    const items = [];
    while (index < lines.length && /^\s*[-*]\s+/.test(lines[index])) {
      items.push(lines[index++].replace(/^\s*[-*]\s+/, ""));
    }
    rendered.push(`<ul>${items.map(item => `<li>${inline(item)}</li>`).join("")}</ul>`);
    continue;
  }

  if (/^\s*\d+\.\s+/.test(line)) {
    const items = [];
    while (index < lines.length && /^\s*\d+\.\s+/.test(lines[index])) {
      items.push(lines[index++].replace(/^\s*\d+\.\s+/, ""));
    }
    rendered.push(`<ol>${items.map(item => `<li>${inline(item)}</li>`).join("")}</ol>`);
    continue;
  }

  if (/^>\s?/.test(line)) {
    const body = [];
    while (index < lines.length && /^>\s?/.test(lines[index])) body.push(lines[index++].replace(/^>\s?/, ""));
    rendered.push(`<blockquote><p>${inline(body.join(" "))}</p></blockquote>`);
    continue;
  }

  const paragraph = [line.trim()];
  index++;
  while (
    index < lines.length &&
    lines[index].trim() &&
    !/^(#{1,6})\s+/.test(lines[index]) &&
    !/^\s*[-*]\s+/.test(lines[index]) &&
    !/^\s*\d+\.\s+/.test(lines[index]) &&
    !/^>\s?/.test(lines[index]) &&
    !lines[index].startsWith("```") &&
    !(lines[index].includes("|") && index + 1 < lines.length && isTableSeparator(lines[index + 1]))
  ) {
    paragraph.push(lines[index++].trim());
  }
  rendered.push(`<p>${inline(paragraph.join(" "))}</p>`);
}

const template = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Awesome Compute README Preview</title>
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Manrope:wght@600;700&display=swap" rel="stylesheet">
  <style>
    :root { color-scheme: light; --ink:#151923; --muted:#626977; --line:#deddd8; --paper:#fffefa; --brand:#7657d6; --night:#111827; }
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      margin: 0; color: var(--ink);
      background:
        radial-gradient(circle at 85% 0,rgba(118,87,214,.09),transparent 28rem),
        linear-gradient(#f4f2ed,#efede7);
      font: 16px/1.6 "DM Sans",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
    }
    a { color: #5b3db5; text-decoration: none; text-underline-offset: 3px; }
    a:hover { text-decoration: underline; }
    .topbar { position: sticky; top: 0; z-index: 5; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 11px max(18px,calc((100% - 1080px)/2)); border-bottom: 1px solid rgba(255,255,255,.08); color:#aeb7c6; background: rgba(17,24,39,.94); backdrop-filter: blur(10px); font-size: 13px; }
    .topbar strong { color: #fff; font-family: Manrope,sans-serif; }
    .topbar a { color:#c4b5fd; }
    .topbar-links { display: flex; gap: 14px; }
    .markdown-body { width: min(1080px,calc(100% - 36px)); margin: 32px auto 64px; padding: clamp(28px,5vw,64px); border: 1px solid var(--line); border-radius: 20px; background: var(--paper); box-shadow: 0 30px 80px -58px rgba(17,24,39,.65); }
    .markdown-body > p:first-child { margin: calc(clamp(28px,5vw,64px) * -1) calc(clamp(28px,5vw,64px) * -1) 34px; }
    .markdown-body > p:first-child img { display:block; width:100%; border-radius: 19px 19px 0 0; }
    h1,h2,h3,h4,h5,h6 { position: relative; margin-top: 30px; margin-bottom: 15px; font-family: Manrope,sans-serif; font-weight: 700; line-height: 1.22; letter-spacing:-.025em; }
    h1 { padding-bottom: .25em; border-bottom: 0; font-size: clamp(2.2em,5vw,3.35em); letter-spacing:-.055em; }
    h2 { padding-top:.35em; padding-bottom: .35em; border-bottom: 1px solid var(--line); font-size: 1.65em; }
    h3 { font-size: 1.25em; }
    h1:first-child { margin-top: 0; }
    .anchor { position: absolute; left: -24px; width: 20px; color: #8b78ca; opacity: 0; font: 400 17px "JetBrains Mono",monospace; }
    h1:hover .anchor,h2:hover .anchor,h3:hover .anchor { opacity: 1; text-decoration: none; }
    p,blockquote,ul,ol,.table-scroll,pre { margin-top: 0; margin-bottom: 16px; }
    ul,ol { padding-left: 2em; }
    li + li { margin-top: .25em; }
    blockquote { padding: 15px 18px; color: #433479; border: 1px solid #dcd3fb; border-left: 4px solid #8b6ee8; border-radius: 0 10px 10px 0; background:linear-gradient(90deg,#f3efff,#f0faf7); }
    blockquote p { margin: 0; }
    .table-scroll { overflow-x: auto; border:1px solid var(--line); border-radius:12px; box-shadow:0 12px 28px -28px rgba(17,24,39,.7); }
    table { width: max-content; min-width: 100%; border-spacing: 0; border-collapse: collapse; }
    th,td { padding: 10px 13px; border: 0; border-bottom: 1px solid #e8e6e0; text-align: left; vertical-align: top; }
    th { color:#535b69; background:#f3f1ec; font:600 11px/1.4 "JetBrains Mono",monospace; letter-spacing:.055em; text-transform:uppercase; }
    tbody tr:last-child td { border-bottom:0; }
    tr:nth-child(2n) { background: #faf8f3; }
    tbody tr:hover { background:#f4f0ff; }
    code { padding: .2em .4em; border-radius: 5px; color:#4d329d; background: #eee9fa; font: 85% "JetBrains Mono",monospace; }
    pre { overflow: auto; padding: 18px; border-radius: 11px; color:#d8deea; background: var(--night); }
    pre code { padding: 0; background: transparent; font-size: 100%; }
    img { max-width: 100%; }
    h1 img { vertical-align: middle; }
    hr { height: .25em; padding: 0; margin: 24px 0; border: 0; background: #d0d7de; }
    @media (max-width: 700px) {
      .markdown-body { width: 100%; margin: 0; padding: 26px 18px 48px; border: 0; border-radius: 0; }
      .markdown-body > p:first-child { margin:-26px -18px 26px; }
      .markdown-body > p:first-child img { border-radius:0; }
      .topbar { position: static; }
      .anchor { display: none; }
    }
  </style>
</head>
<body>
  <header class="topbar">
    <strong>README.md preview</strong>
    <nav class="topbar-links"><a href="/">Resource site</a><a href="/README.md">Raw Markdown</a></nav>
  </header>
  <article class="markdown-body">${rendered.join("\n")}</article>
</body>
</html>`;

fs.writeFileSync(path.join(root, "preview.html"), template);
console.log(`Rendered README.md to preview.html (${rendered.length} blocks)`);
