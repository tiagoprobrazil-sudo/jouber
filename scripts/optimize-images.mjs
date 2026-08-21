// One-off build helper: takes the raw photos downloaded from the current
// Atelier Saint Sebastian site (src/assets/images/raw) and produces
// resized, compressed WebP copies organized by usage into
// src/assets/images/{products,hero,editorial,artist,journal,instagram}.
//
// Run with: node scripts/optimize-images.mjs
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RAW_DIR = path.join(__dirname, "..", "src", "assets", "images", "raw");
const OUT_ROOT = path.join(__dirname, "..", "src", "assets", "images");

// [sourceFileInRaw, outputSubfolder, outputName, maxWidth]
const jobs = [
  // Hero / homepage editorial
  ["Saint_Agosto_2026.png", "hero", "hero-main", 2000],
  ["02.png", "hero", "hero-alt-1", 1800],
  ["03.png", "hero", "hero-alt-2", 1800],
  ["atelier_saint_sara.png", "editorial", "atelier-intro", 1600],
  ["Atelier_placa_site.png", "artist", "artist-process", 1600],
  ["Nossa_Senhora_Aparecida_Etsy_b3ca49ec-c688-4905-a59d-825cf4d25d0b.png", "editorial", "editorial-feature", 2000],
  ["Nossasenhoraperolas.png", "editorial", "editorial-detail", 1400],

  // Product: 10-Inch Our Lady of Aparecida Statue (Pearl & Gold)
  ["IMG_2477_2.jpg", "products", "our-lady-aparecida-10in-pearl-gold-1", 1400],
  ["IMG_2479_2.jpg", "products", "our-lady-aparecida-10in-pearl-gold-2", 1400],

  // Product: 11-Inch Our Lady of Aparecida Statue (Blue & Gold)
  ["IMG_2447.jpg", "products", "our-lady-aparecida-11in-blue-gold-1", 1400],
  ["IMG_2449.jpg", "products", "our-lady-aparecida-11in-blue-gold-2", 1400],

  // Product: Handcrafted Nossa Senhora Aparecida Statue 11in (Metallic Blue)
  ["il_fullxfull.7739784956_pket.jpg", "products", "our-lady-aparecida-11in-metallic-blue-1", 1400],
  ["il_fullxfull.7739751052_9ep1.jpg", "products", "our-lady-aparecida-11in-metallic-blue-2", 1400],

  // Product: Nossa Senhora Aparecida Pink Statue 11in
  ["IMG_2518.jpg", "products", "our-lady-aparecida-11in-pink-1", 1400],
  ["IMG_2519.jpg", "products", "our-lady-aparecida-11in-pink-2", 1400],

  // Product: Sacred Plaque 8x8
  ["ChatGPT_Image_May_23_2026_07_07_23_PM_431ccce0-078c-4ed7-acfe-54d164ff4188.png", "products", "sacred-plaque-8x8-1", 1400],
  ["ChatGPTImageMay23_2026_06_45_08PM.png", "products", "sacred-plaque-8x8-2", 1400],

  // Product: 9-Day Novena Prayer Candle
  ["e579cd31-3472-4122-8a8e-a4a2e2786e7b.jpg", "products", "novena-prayer-candle-1", 1400],
  ["28cc2738-05a8-48e5-8240-3a1b878de74c.jpg", "products", "novena-prayer-candle-2", 1400],

  // Product: Archangel Michael Slaying Dragon Matte Canvas
  ["4865976454979604308_2048.jpg", "products", "archangel-michael-canvas-1", 1400],
  ["4187289691149885792_2048.jpg", "products", "archangel-michael-canvas-2", 1400],

  // Product: Blessed Virgin Mary Shrine Box
  ["IMG_3170.jpg", "products", "virgin-mary-shrine-box-1", 1400],
  ["IMG_3166.jpg", "products", "virgin-mary-shrine-box-2", 1400],

  // Product: Our Lady of Aparecida Shrine Box
  ["IMG_2548.jpg", "products", "our-lady-aparecida-shrine-box-1", 1400],
  ["IMG_2567.jpg", "products", "our-lady-aparecida-shrine-box-2", 1400],

  // Product: Nossa Senhora Aparecida I (art print)
  ["il_fullxfull.7683353261_l17y.jpg", "products", "our-lady-aparecida-print-i-1", 1400],
  ["il_fullxfull.7629691259_6vux.jpg", "products", "our-lady-aparecida-print-i-2", 1400],

  // Product: Nossa Senhora Aparecida II (art print)
  ["il_fullxfull.7586372948_ml51.jpg", "products", "our-lady-aparecida-print-ii-1", 1400],
  ["il_fullxfull.7581748076_d7mv.jpg", "products", "our-lady-aparecida-print-ii-2", 1400],

  // Product: Saint George Framed Poster
  ["il_fullxfull.7787707077_4txq.jpg", "products", "saint-george-framed-poster-1", 1400],
  ["il_fullxfull.7787707505_8fp3.jpg", "products", "saint-george-framed-poster-2", 1400],

  // Product: Saint Michael Archangel Coffee Mug
  ["11812326646054545531_2048.jpg", "products", "saint-michael-mug-1", 1400],
  ["1122041168879972266_2048.jpg", "products", "saint-michael-mug-2", 1400],

  // Product: Saint George Dragon Slayer Coffee Mug
  ["7784998255666401483_2048.jpg", "products", "saint-george-mug-1", 1400],
  ["11240003171191718237_2048.jpg", "products", "saint-george-mug-2", 1400],

  // Product: Our Lady of Aparecida — Sacred Presence (new statue listing)
  ["Nossa_Senhora_Aparecida_Etsy_b3ca49ec-c688-4905-a59d-825cf4d25d0b.png", "products", "our-lady-aparecida-sacred-presence-1", 1400],

  // Product: Saint Joseph, Protector of the Home
  ["Sao_Jose_etsy_8a7ea67b-fc78-452d-a7e8-760cd7de924d.png", "products", "saint-joseph-protector-1", 1400],
];

async function run() {
  const folders = new Set(jobs.map((j) => j[1]));
  for (const folder of folders) {
    await mkdir(path.join(OUT_ROOT, folder), { recursive: true });
  }

  let ok = 0;
  let fail = 0;
  for (const [src, folder, name, width] of jobs) {
    const inputPath = path.join(RAW_DIR, src);
    const outputPath = path.join(OUT_ROOT, folder, `${name}.webp`);
    try {
      await sharp(inputPath)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(outputPath);
      ok++;
      console.log(`OK  ${src} -> ${folder}/${name}.webp`);
    } catch (err) {
      fail++;
      console.error(`FAIL ${src}: ${err.message}`);
    }
  }
  console.log(`\nDone. ${ok} converted, ${fail} failed.`);
}

run();
