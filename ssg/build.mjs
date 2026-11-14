// LittleLink-style SSG: configs in, one self-contained HTML out.
//
// Tree-shaking here is literal: only icons named in links.json are read from
// assets/icons and inlined as SVG, everything else never touches the output.
// CSS is inlined and minified (comments and redundant whitespace dropped), so
// the page ships as a single file with no requests of its own.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");
const site = JSON.parse(read("site.json"));
const allLinks = JSON.parse(read("links.json"));
// Entries without a URL are placeholders for links not yet remembered; they
// are reported and skipped, so the page never ships dead buttons.
const links = allLinks.filter((l) => l.url && l.url.trim());
for (const l of allLinks.filter((l) => !l.url || !l.url.trim())) {
  console.warn(`skipping "${l.label}" — no url yet`);
}

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function minifyCss(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,>])\s*/g, "$1")
    .replace(/;}/g, "}")
    .trim();
}

function icon(name) {
  if (!name) return "";
  const file = join(root, "assets", "icons", `${name}.svg`);
  if (!existsSync(file)) {
    console.warn(`icon "${name}" missing — falling back to a letter badge`);
    return "";
  }
  return readFileSync(file, "utf8")
    .replace(/<\?xml[^>]*\?>/g, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function renderLink({ label, url, icon: iconName, color }) {
  const svg = icon(iconName);
  const mark = svg || `<span class="badge">${esc(label.slice(0, 1))}</span>`;
  const safeUrl = /^(https?:|mailto:|matrix:)/i.test(url) ? url : "#";
  const style = color ? ` style="--brand:${esc(color)}"` : "";
  return `    <a class="link" href="${esc(safeUrl)}" rel="me noopener"${style}>${mark}<span>${esc(label)}</span></a>`;
}

// The avatar is inlined as a data URI so the page stays a single file with no
// extra requests; it is read only when site.avatar is set.
function avatarTag(site) {
  if (!site.avatar) return "";
  const file = join(root, site.avatar);
  if (!existsSync(file)) { console.warn(`avatar ${site.avatar} missing`); return ""; }
  const b64 = readFileSync(file).toString("base64");
  return `  <img class="avatar" src="data:image/png;base64,${b64}" alt="${esc(site.title)}" width="96" height="96">\n`;
}

const themeVars = Object.entries(site.theme ?? {})
  .map(([k, v]) => `--${k}:${v}`)
  .join(";");

const html = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(site.title)} — ${esc(site.subtitle ?? "links")}</title>
<style>:root{${themeVars}}${minifyCss(read("assets/style.css"))}</style>
</head>
<body>
${avatarTag(site)}  <h1>${esc(site.title)}</h1>
  <div class="sub">${esc(site.subtitle ?? "")}</div>
  <div class="links">
${links.map(renderLink).join("\n")}
  </div>
  <footer>${esc(site.footer ?? "")}${site.footerUrl ? ` · <a href="${esc(site.footerUrl)}">репозиторий</a>` : ""}</footer>
</body>
</html>
`;

mkdirSync(join(root, "dist"), { recursive: true });
writeFileSync(join(root, "dist", "index.html"), html);
const used = links.filter((l) => l.icon && existsSync(join(root, "assets", "icons", `${l.icon}.svg`))).length;
console.log(`built dist/index.html — ${html.length} bytes, ${links.length} links, ${used} inlined icons`);
