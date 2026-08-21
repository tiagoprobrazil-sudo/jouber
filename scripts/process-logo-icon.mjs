// Crops just the circular crest/medallion (no wordmark) out of the
// vertical logo source, for compact use as a header icon, then removes
// its white background the same way as process-logo.mjs.
import sharp from "sharp";

const SRC = "D:/WEB/Jouber/.imagens/235a1f3c-5aba-46db-8f47-b59e226673b0.png";
const OUT = "D:/WEB/Jouber/src/assets/images/brand/logo-icon.webp";
const WHITE_THRESHOLD = 244;

async function removeBackground(buffer) {
  const image = sharp(buffer).ensureAlpha();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const visited = new Uint8Array(width * height);
  const stack = [];
  const idx = (x, y) => y * width + x;
  const isBg = (x, y) => {
    const i = idx(x, y) * channels;
    return data[i] >= WHITE_THRESHOLD && data[i + 1] >= WHITE_THRESHOLD && data[i + 2] >= WHITE_THRESHOLD;
  };
  for (let x = 0; x < width; x++) stack.push([x, 0], [x, height - 1]);
  for (let y = 0; y < height; y++) stack.push([0, y], [width - 1, y]);
  while (stack.length) {
    const [x, y] = stack.pop();
    if (x < 0 || y < 0 || x >= width || y >= height) continue;
    const p = idx(x, y);
    if (visited[p] || !isBg(x, y)) continue;
    visited[p] = 1;
    data[p * channels + 3] = 0;
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  return sharp(data, { raw: { width, height, channels } }).png().toBuffer();
}

async function run() {
  const cropped = await sharp(SRC).extract({ left: 30, top: 60, width: 970, height: 1100 }).png().toBuffer();
  const cutout = await removeBackground(cropped);
  await sharp(cutout).trim({ threshold: 10 }).resize({ width: 360, withoutEnlargement: true }).webp({ quality: 90 }).toFile(OUT);
  console.log("done");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
