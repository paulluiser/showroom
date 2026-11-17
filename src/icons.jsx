// Line icons (24px grid, stroke = currentColor). Each subject gets its own glyph.

const P = {
  // three languages
  code: "M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14",
  briefcase: "M4 8h16v11H4zM9 8V5.5h6V8M4 13h16",
  users: "M9 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM2.5 20c.6-3.4 3.2-5.5 6.5-5.5s5.9 2.1 6.5 5.5M16 4.3a3.5 3.5 0 010 6.4M18 14.8c2 .7 3.2 2.5 3.5 5.2",
  // competencies
  route: "M6 19a2 2 0 100-4 2 2 0 000 4zM18 9a2 2 0 100-4 2 2 0 000 4zM8 17h7a3 3 0 000-6H9a3 3 0 010-6h7",
  doc: "M14 3H6v18h12V7zM14 3v4h4M9 12h6M9 16h6",
  sparkles: "M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8zM19 15l.8 2.2 2.2.8-2.2.8L19 21l-.8-2.2-2.2-.8 2.2-.8z",
  cpu: "M7 7h10v10H7zM10 10h4v4h-4zM10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4",
  // projects
  package: "M12 3l8 4.5v9L12 21l-8-4.5v-9zM4 7.5l8 4.5 8-4.5M12 12v9",
  play: "M12 21a9 9 0 100-18 9 9 0 000 18zM10 8.5v7l6-3.5z",
  pin: "M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0113 0c0 5.4-6.5 11-6.5 11zM12 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z",
  // education & awards
  cap: "M2.5 9L12 4.5 21.5 9 12 13.5zM6.5 11v5c0 1.4 2.5 3 5.5 3s5.5-1.6 5.5-3v-5M21.5 9v5",
  trophy: "M8 4h8v6a4 4 0 01-8 0zM8 6H4.5c0 3 1.5 4.5 3.7 4.8M16 6h3.5c0 3-1.5 4.5-3.7 4.8M12 14v3M8.5 20h7l-.7-3H9.2z",
  leaf: "M5 19C5 10 10 5 20 4c0 10-5 15-14 15zM5 19l8-8",
  bulb: "M9 17h6M10 20.5h4M12 3a6 6 0 00-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0012 3z",
  pen: "M4 20l4-1 11-11-3-3L5 16zM14 6l3 3",
  shield: "M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6zM9 12l2 2 4-4",
  scan: "M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4M8 12h8",
  layers: "M12 3l9 5-9 5-9-5zM3 13l9 5 9-5",
  zap: "M13 3L5 13h6l-1 8 8-10h-6z",
  search: "M11 18a7 7 0 100-14 7 7 0 000 14zM20 20l-4-4",
  checkCircle: "M12 21a9 9 0 100-18 9 9 0 000 18zM8 12.5l3 3 5-6",
  userCheck: "M9 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM2.5 20c.6-3.4 3.2-5.5 6.5-5.5 1.5 0 2.8.4 3.9 1.2M15 18l2 2 4-4",
  idCard: "M3 6h18v12H3zM8.5 12.5a2 2 0 100-4 2 2 0 000 4zM5.5 15.5c.5-1.5 1.6-2.2 3-2.2s2.5.7 3 2.2M14 10h4M14 13h4",
  copy: "M8 8h11v12H8zM5 16V4h11",
  arrowUpRight: "M7 17L17 7M8 7h9v9",
  arrowDown: "M12 4v15M6 13l6 6 6-6",
  menu: "M4 8h16M4 16h16",
  truck: "M3 6h11v10H3zM14 9h4l3 3.5V16h-7M7.5 18.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM17.5 18.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z",
  receipt: "M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6M9 16h3",
  ledger: "M5 4h14v16H5zM9 4v16M12 9h4M12 13h4",
  // ui
  mail: "M3.5 6h17v12h-17zM3.5 6.5l8.5 6.5 8.5-6.5",
  download: "M12 4v11M7.5 10.5L12 15l4.5-4.5M5 19.5h14",
  external: "M10 5H5v14h14v-5M14 4h6v6M20 4l-9 9",
  check: "M5 12.5l4.5 4.5L19 7.5",
  calendar: "M4 6h16v14H4zM4 10h16M8 3.5V7M16 3.5V7",
};

export function Icon({ name, size = 24, className = "" }) {
  return (
    <svg className={`ic ${className}`} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={P[name]} />
    </svg>
  );
}

// Tools: official marks (Iconify "logos" CC0, VS Code icons MIT, LobeHub icons MIT), extracted by scripts/extract-tool-logos.mjs.
import jira from "./assets/tools/jira.svg";
import trello from "./assets/tools/trello.svg";
import figma from "./assets/tools/figma.svg";
import excel from "./assets/tools/excel.svg";
import gsuite from "./assets/tools/gsuite.svg";
import claudeCode from "./assets/tools/claude-code.svg";
import codex from "./assets/tools/codex.svg";
import antigravity from "./assets/tools/antigravity.svg";
import n8n from "./assets/tools/n8n.svg";

export const TOOLS = [
  { name: "Jira", src: jira },
  { name: "Trello", src: trello },
  { name: "Figma", src: figma },
  { name: "Excel", src: excel },
  // Microsoft's official MS Project icon, served from Microsoft's Office (Fluent UI) brand-icon CDN.
  { name: "MS Project", src: "https://res.cdn.office.net/files/fabric-cdn-prod_20230815.002/assets/brand-icons/product/svg/project_48x1.svg" },
  { name: "G Suite", src: gsuite },
  { name: "Claude Code", src: claudeCode },
  { name: "Codex", src: codex },
  { name: "Antigravity", src: antigravity },
  { name: "n8n", src: n8n },
];
