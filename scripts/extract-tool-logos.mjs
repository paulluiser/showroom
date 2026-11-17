// Copies the official tool marks out of the icon packages into src/assets/tools.
// Run: node scripts/extract-tool-logos.mjs
import { readFileSync, writeFileSync, copyFileSync } from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const out = new URL("../src/assets/tools/", import.meta.url);

const iconify = (pkg, name, file) => {
  const set = require(`${pkg}/icons.json`);
  const ic = set.icons[name];
  const w = ic.width ?? set.width ?? 16, h = ic.height ?? set.height ?? 16;
  writeFileSync(new URL(file, out), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${ic.body}</svg>`);
};
const lobe = (name, file) => copyFileSync(require.resolve(`@lobehub/icons-static-svg/icons/${name}.svg`), new URL(file, out));

iconify("@iconify-json/logos", "jira", "jira.svg");
iconify("@iconify-json/logos", "trello", "trello.svg");
iconify("@iconify-json/logos", "figma", "figma.svg");
iconify("@iconify-json/logos", "google-icon", "gsuite.svg");
iconify("@iconify-json/logos", "n8n-icon", "n8n.svg");
iconify("@iconify-json/vscode-icons", "file-type-excel2", "excel.svg");
iconify("@iconify-json/logos", "linkedin-icon", "linkedin.svg");
lobe("claudecode-color", "claude-code.svg");
lobe("codex-color", "codex.svg");
lobe("antigravity-color", "antigravity.svg");
console.log("done");
