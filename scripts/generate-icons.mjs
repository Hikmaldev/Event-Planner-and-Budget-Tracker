// Generates the Apple touch icon PNG from src/app/icon.svg.
// Run with: node scripts/generate-icons.mjs
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const source = fileURLToPath(new URL("../src/app/icon.svg", import.meta.url));
const target = fileURLToPath(
  new URL("../src/app/apple-icon.png", import.meta.url)
);

const svg = await readFile(source);
await sharp(svg, { density: 300 }).resize(180, 180).png().toFile(target);

const { width, height } = await sharp(target).metadata();
console.log(`Generated apple-icon.png (${width}x${height}) at ${target}`);
