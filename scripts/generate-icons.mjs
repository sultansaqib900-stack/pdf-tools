import sharp from "sharp";
import { readFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const svg192 = readFileSync(join(root, "public/icons/icon-192.svg"));
const svg512 = readFileSync(join(root, "public/icons/icon-512.svg"));

mkdirSync(join(root, "public/icons"), { recursive: true });

await Promise.all([
  sharp(svg192).resize(192, 192).png().toFile(join(root, "public/icons/icon-192.png")),
  sharp(svg512).resize(512, 512).png().toFile(join(root, "public/icons/icon-512.png")),
]);

console.log("PNG icons generated.");
