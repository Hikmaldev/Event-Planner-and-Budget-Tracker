// Generates the portfolio cover image (1200x630) for this project.
// Run with: node scripts/generate-cover.mjs
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const svg = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#3B5BDB"/>
  <circle cx="1030" cy="110" r="280" fill="#FFFFFF" opacity="0.06"/>
  <circle cx="120" cy="580" r="240" fill="#FFFFFF" opacity="0.05"/>

  <rect x="80" y="72" width="92" height="92" rx="22" fill="#FFFFFF" opacity="0.12"/>
  <g transform="translate(86,78) scale(1.25)">
    <rect width="64" height="64" rx="14" fill="#3B5BDB"/>
    <rect x="20" y="12" width="6" height="12" rx="3" fill="#FFFFFF"/>
    <rect x="38" y="12" width="6" height="12" rx="3" fill="#FFFFFF"/>
    <rect x="14" y="19" width="36" height="31" rx="6" fill="#FFFFFF"/>
    <path d="M23 34.5 L30.5 42 L42 28" fill="none" stroke="#3B5BDB" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
  </g>

  <text x="80" y="300" font-family="Segoe UI, Arial, sans-serif" font-size="68" font-weight="700" fill="#FFFFFF">Event Planner</text>
  <text x="80" y="378" font-family="Segoe UI, Arial, sans-serif" font-size="68" font-weight="700" fill="#FFFFFF">&amp; Budget Tracker</text>

  <text x="80" y="452" font-family="Segoe UI, Arial, sans-serif" font-size="28" fill="#FFFFFF" opacity="0.85">Vendors · Rupiah budgets · Checklist · H-day timeline</text>
  <text x="80" y="512" font-family="Segoe UI, Arial, sans-serif" font-size="22" fill="#FFFFFF" opacity="0.7">Next.js 16 · Prisma 7 · Neon Postgres · Auth.js v5 · Vitest</text>
  <text x="80" y="572" font-family="Segoe UI, Arial, sans-serif" font-size="20" fill="#FFFFFF" opacity="0.7">event-planner-and-budget-tracker.vercel.app</text>
</svg>
`);

const target = fileURLToPath(
  new URL("../docs/portfolio/cover.png", import.meta.url)
);

await mkdir(path.dirname(target), { recursive: true });
await sharp(svg).png().toFile(target);
const { width, height } = await sharp(target).metadata();
console.log(`Generated cover.png (${width}x${height}) at ${target}`);
