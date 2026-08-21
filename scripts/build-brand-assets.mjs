import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const source = (...parts) => path.join(ROOT, ".imagens", ...parts);
const output = (...parts) => path.join(ROOT, "src", "assets", "brand", ...parts);

async function ensureDirectories() {
  await Promise.all(
    ["logo", "engravings", "ornaments", "textures", "backgrounds", "saint-sebastian"].map((folder) =>
      fs.mkdir(output(folder), { recursive: true }),
    ),
  );
}

async function inkCutout(input, destination, options = {}) {
  const { crop, width } = options;
  let pipeline = sharp(input);
  if (crop) pipeline = pipeline.extract(crop);

  const { data, info } = await pipeline.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const result = Buffer.alloc(info.width * info.height * 4);

  for (let pixel = 0; pixel < info.width * info.height; pixel += 1) {
    const offset = pixel * info.channels;
    const red = data[offset];
    const green = data[offset + 1];
    const blue = data[offset + 2];
    const luminance = red * 0.2126 + green * 0.7152 + blue * 0.0722;
    const alpha = Math.max(0, Math.min(255, Math.round((225 - luminance) * 3.4)));
    const target = pixel * 4;
    result[target] = 43;
    result[target + 1] = 42;
    result[target + 2] = 39;
    result[target + 3] = alpha;
  }

  let converted = sharp(result, {
    raw: { width: info.width, height: info.height, channels: 4 },
  }).trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } });

  if (width) converted = converted.resize({ width, withoutEnlargement: true });
  await converted.webp({ quality: 90, alphaQuality: 100 }).toFile(destination);
}

async function lightBackgroundCutout(input, destination, crop, width) {
  const { data, info } = await sharp(input).extract(crop).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  for (let pixel = 0; pixel < info.width * info.height; pixel += 1) {
    const offset = pixel * info.channels;
    const minimum = Math.min(data[offset], data[offset + 1], data[offset + 2]);
    data[offset + 3] = Math.max(0, Math.min(255, Math.round((250 - minimum) * 12.75)));
  }

  await sharp(data, { raw: info })
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 90, alphaQuality: 100 })
    .toFile(destination);
}

async function build() {
  await ensureDirectories();

  const verticalLogo = source("235a1f3c-5aba-46db-8f47-b59e226673b0.png");
  const horizontalLogo = source("658ef473-496f-4936-b13a-1190ab229610.png");

  await Promise.all([
    sharp(verticalLogo).resize({ width: 1024 }).webp({ quality: 90 }).toFile(output("logo", "lockup-vertical.webp")),
    sharp(horizontalLogo).resize({ width: 1536 }).webp({ quality: 90, alphaQuality: 100 }).toFile(output("logo", "lockup-horizontal.webp")),
    lightBackgroundCutout(verticalLogo, output("logo", "crest-full.webp"), { left: 30, top: 50, width: 964, height: 1115 }, 900),
    lightBackgroundCutout(verticalLogo, output("ornaments", "crown-cross.webp"), { left: 325, top: 45, width: 380, height: 260 }, 520),
    lightBackgroundCutout(verticalLogo, output("ornaments", "shield-monogram.webp"), { left: 350, top: 920, width: 330, height: 235 }, 420),
    lightBackgroundCutout(verticalLogo, output("ornaments", "frame-top.webp"), { left: 70, top: 145, width: 880, height: 300 }, 1200),
    lightBackgroundCutout(verticalLogo, output("ornaments", "frame-side.webp"), { left: 45, top: 270, width: 245, height: 650 }, 420),
    lightBackgroundCutout(verticalLogo, output("ornaments", "frame-lower.webp"), { left: 165, top: 815, width: 695, height: 390 }, 1000),
    inkCutout(source("generated-saint-sebastian.png"), output("saint-sebastian", "saint-sebastian-institutional.webp"), { width: 1600 }),
    inkCutout(source("generated-botanical-branch.png"), output("engravings", "botanical-branch.webp"), { width: 2000 }),
    inkCutout(source("generated-arrow-sheet.png"), output("ornaments", "arrow-horizontal.webp"), {
      crop: { left: 45, top: 45, width: 1120, height: 250 },
      width: 1200,
    }),
    inkCutout(source("generated-arrow-sheet.png"), output("ornaments", "arrow-diagonal.webp"), {
      crop: { left: 90, top: 320, width: 1120, height: 615 },
      width: 1200,
    }),
    inkCutout(source("generated-arrow-sheet.png"), output("ornaments", "arrow-vertical.webp"), {
      crop: { left: 1250, top: 35, width: 235, height: 925 },
      width: 320,
    }),
    sharp(source("generated-paper-texture.png")).resize({ width: 1024 }).webp({ quality: 78 }).toFile(output("textures", "paper-ink.webp")),
  ]);
}

build().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
