// One-off seed script: uploads the bundled mock catalog photography to
// Supabase Storage and inserts the current mock data (categories, products,
// reviews, posts) into the real database, so the live site has real content
// once src/lib/data/repository.ts starts reading Supabase instead of the
// localStorage mock. Run once with: node scripts/seed-supabase.mjs
//
// Requires SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY env vars (service role
// bypasses RLS, needed to write as an unauthenticated script).

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars first.");
  process.exit(1);
}

const client = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const PRODUCTS_DIR = path.join(root, "src/assets/images/products");
const EDITORIAL_DIR = path.join(root, "src/assets/images/editorial");

const productImageFiles = {
  ourLady10PearlGold1: "our-lady-aparecida-10in-pearl-gold-1.webp",
  ourLady10PearlGold2: "our-lady-aparecida-10in-pearl-gold-2.webp",
  ourLady11BlueGold1: "our-lady-aparecida-11in-blue-gold-1.webp",
  ourLady11BlueGold2: "our-lady-aparecida-11in-blue-gold-2.webp",
  ourLady11Metallic1: "our-lady-aparecida-11in-metallic-blue-1.webp",
  ourLady11Metallic2: "our-lady-aparecida-11in-metallic-blue-2.webp",
  ourLady11Pink1: "our-lady-aparecida-11in-pink-1.webp",
  ourLady11Pink2: "our-lady-aparecida-11in-pink-2.webp",
  sacredPlaque1: "sacred-plaque-8x8-1.webp",
  sacredPlaque2: "sacred-plaque-8x8-2.webp",
  novenaCandle1: "novena-prayer-candle-1.webp",
  novenaCandle2: "novena-prayer-candle-2.webp",
  archangelCanvas1: "archangel-michael-canvas-1.webp",
  archangelCanvas2: "archangel-michael-canvas-2.webp",
  virginShrineBox1: "virgin-mary-shrine-box-1.webp",
  virginShrineBox2: "virgin-mary-shrine-box-2.webp",
  ourLadyShrineBox1: "our-lady-aparecida-shrine-box-1.webp",
  ourLadyShrineBox2: "our-lady-aparecida-shrine-box-2.webp",
  ourLadyProcessHands1: "our-lady-aparecida-print-i-1.webp",
  ourLadyProcessHands2: "our-lady-aparecida-print-i-2.webp",
  ourLadyPrintII1: "our-lady-aparecida-print-ii-1.webp",
  ourLadyPrintII2: "our-lady-aparecida-print-ii-2.webp",
  saintGeorgePoster1: "saint-george-framed-poster-1.webp",
  saintGeorgePoster2: "saint-george-framed-poster-2.webp",
  saintMichaelMug1: "saint-michael-mug-1.webp",
  saintMichaelMug2: "saint-michael-mug-2.webp",
  saintGeorgeMug1: "saint-george-mug-1.webp",
  saintGeorgeMug2: "saint-george-mug-2.webp",
};

const editorialImageFiles = {
  devotionalPresence: "editorial-detail.webp",
};

async function uploadFile(dir, filename) {
  const bytes = readFileSync(path.join(dir, filename));
  const { error } = await client.storage
    .from("product-images")
    .upload(filename, bytes, { contentType: "image/webp", upsert: true });
  if (error) throw new Error(`upload ${filename}: ${error.message}`);
  return client.storage.from("product-images").getPublicUrl(filename).data.publicUrl;
}

async function uploadAll() {
  const img = {};
  for (const [key, filename] of Object.entries(productImageFiles)) {
    img[key] = await uploadFile(PRODUCTS_DIR, filename);
    process.stdout.write(".");
  }
  const editorial = {};
  for (const [key, filename] of Object.entries(editorialImageFiles)) {
    editorial[key] = await uploadFile(EDITORIAL_DIR, filename);
    process.stdout.write(".");
  }
  console.log(" done uploading images");
  return { img, editorial };
}

const craftsmanshipNote =
  "Handmade and individually finished. Subtle variations in paint and gilding make every piece unique — a mark of the hand that made it, not a flaw to correct.";

function buildProducts(img) {
  return [
    {
      slug: "our-lady-of-aparecida-10-inch-pearl-gold-statue",
      title: "Our Lady of Aparecida — 10-Inch Statue",
      excerpt: "Pearl and gold finish, hand-painted in the atelier.",
      description: `A 10-inch statue of Nossa Senhora Aparecida, patroness of Brazil, cast and finished by hand in pearl white and aged gold. Each robe is painted in layers, then gilded along the trim to catch candlelight rather than overwhelm it. ${craftsmanshipNote}`,
      categorySlugs: ["statues", "our-lady"],
      price: 65,
      images: [
        { url: img.ourLady10PearlGold1, alt: "Our Lady of Aparecida, 10-inch pearl and gold statue, front view" },
        { url: img.ourLady10PearlGold2, alt: "Our Lady of Aparecida, 10-inch statue, detail of the painted robe" },
      ],
      dimensions: "10 in (25.4 cm) height",
      material: "Hand-cast resin",
      finish: "Pearl white with aged-gold trim",
      shippingWeightOz: 24, shippingLengthIn: 12, shippingWidthIn: 8, shippingHeightIn: 8,
      sku: "ASS-STA-010-PG", stock: 14, active: true, featured: true, customizable: false,
      createdAt: "2026-02-11",
    },
    {
      slug: "our-lady-of-aparecida-11-inch-blue-gold-statue",
      title: "Our Lady of Aparecida — 11-Inch Statue",
      excerpt: "Deep blue mantle with gold detailing.",
      description: `An 11-inch Nossa Senhora Aparecida finished in a deep devotional blue, the mantle hand-shaded from the shoulder down and edged in gold leaf detail. A larger presence for the home altar or a quiet corner of prayer. ${craftsmanshipNote}`,
      categorySlugs: ["statues", "our-lady"],
      price: 100,
      images: [
        { url: img.ourLady11BlueGold1, alt: "Our Lady of Aparecida, 11-inch statue in blue and gold, front view" },
        { url: img.ourLady11BlueGold2, alt: "Our Lady of Aparecida, 11-inch statue, side detail" },
      ],
      dimensions: "11 in (28 cm) height",
      material: "Hand-cast resin",
      finish: "Devotional blue with gold leaf detail",
      shippingWeightOz: 28, shippingLengthIn: 13, shippingWidthIn: 9, shippingHeightIn: 9,
      sku: "ASS-STA-011-BG", stock: 9, active: true, featured: false, customizable: false,
      createdAt: "2026-02-18",
    },
    {
      slug: "our-lady-of-aparecida-11-inch-metallic-blue-statue",
      title: "Our Lady of Aparecida — Metallic Blue Statue",
      excerpt: "A luminous metallic mantle, 11 inches.",
      description: `The same beloved form of Nossa Senhora Aparecida, given a luminous metallic-blue mantle that shifts gently with the light. Hand-finished crown and base in aged gold. ${craftsmanshipNote}`,
      categorySlugs: ["statues", "our-lady"],
      price: 100,
      images: [
        { url: img.ourLady11Metallic1, alt: "Our Lady of Aparecida statue with metallic blue mantle" },
        { url: img.ourLady11Metallic2, alt: "Our Lady of Aparecida metallic blue statue, close detail" },
      ],
      dimensions: "11 in (28 cm) height",
      material: "Hand-cast resin",
      finish: "Metallic blue with gold accents",
      shippingWeightOz: 28, shippingLengthIn: 13, shippingWidthIn: 9, shippingHeightIn: 9,
      sku: "ASS-STA-011-MB", stock: 7, active: true, featured: true, customizable: false,
      createdAt: "2026-03-02",
    },
    {
      slug: "our-lady-of-aparecida-11-inch-pink-statue",
      title: "Our Lady of Aparecida — Pink Statue",
      excerpt: "A rare rose-toned mantle, 11 inches.",
      description: `A gentler reading of Nossa Senhora Aparecida, her mantle finished in a soft rose rather than the traditional blue — a variation devotees have long asked the atelier for. Hand-painted, gold-trimmed, one of the more requested pieces in the collection. ${craftsmanshipNote}`,
      categorySlugs: ["statues", "our-lady"],
      price: 110,
      images: [
        { url: img.ourLady11Pink1, alt: "Our Lady of Aparecida statue with pink mantle, 11 inches" },
        { url: img.ourLady11Pink2, alt: "Our Lady of Aparecida pink statue, detail of face and crown" },
      ],
      dimensions: "11 in (28 cm) height",
      material: "Hand-cast resin",
      finish: "Rose mantle with gold trim",
      shippingWeightOz: 28, shippingLengthIn: 13, shippingWidthIn: 9, shippingHeightIn: 9,
      sku: "ASS-STA-011-PK", stock: 6, active: true, featured: true, customizable: false,
      createdAt: "2026-03-14",
    },
    {
      slug: "sacred-plaque-vem-senhor-jesus",
      title: 'Sacred Plaque — "Vem, Senhor Jesus"',
      excerpt: "8×8 in wall plaque with Scripture in Portuguese.",
      description:
        "An 8×8 inch sacred plaque carrying the words of Revelation — “O Espírito e a Esposa dizem: Vem, Senhor Jesus” — set against a warm devotional palette, ready to hang beside an entryway, altar, or reading corner.",
      categorySlugs: ["prints-wall-art", "devotional-objects"],
      price: 40,
      images: [
        { url: img.sacredPlaque1, alt: "Sacred plaque with Portuguese Scripture, 8 by 8 inches" },
        { url: img.sacredPlaque2, alt: "Sacred plaque detail, close view of the lettering" },
      ],
      dimensions: "8 x 8 in (20 x 20 cm)",
      material: "Printed wood panel",
      finish: "Matte",
      shippingWeightOz: 16, shippingLengthIn: 9, shippingWidthIn: 9, shippingHeightIn: 2,
      sku: "ASS-PLQ-008", stock: 22, active: true, featured: false, customizable: false,
      createdAt: "2026-05-23",
    },
    {
      slug: "nine-day-novena-prayer-candle",
      title: "Nine-Day Novena Prayer Candle",
      excerpt: "Embossed cross glass, for continuous prayer.",
      description:
        "A tall novena candle in embossed cross glass, made to burn steadily through nine days of prayer. A quiet companion for a novena to Our Lady, an archangel, or any devotion carried over time.",
      categorySlugs: ["devotional-objects"],
      price: 10,
      images: [
        { url: img.novenaCandle1, alt: "Nine-day novena prayer candle with embossed cross glass" },
        { url: img.novenaCandle2, alt: "Novena candle lit, detail of the glass" },
      ],
      dimensions: "8 in (20 cm) height",
      material: "Glass, wax",
      finish: "Embossed cross",
      shippingWeightOz: 20, shippingLengthIn: 4, shippingWidthIn: 4, shippingHeightIn: 9,
      sku: "ASS-CAN-009", stock: 60, active: true, featured: false, customizable: false,
      createdAt: "2026-01-30",
    },
    {
      slug: "archangel-michael-slaying-the-dragon-canvas",
      title: "Archangel Michael Slaying the Dragon — Canvas",
      excerpt: "Matte canvas print, ready to hang.",
      description:
        "Saint Michael the Archangel, sword raised over the dragon, rendered in a matte canvas print for the wall. A visual prayer for protection, printed with archival inks and stretched over a solid wood frame.",
      categorySlugs: ["prints-wall-art", "saints"],
      price: 86.96,
      images: [
        { url: img.archangelCanvas1, alt: "Archangel Michael slaying the dragon, matte canvas print" },
        { url: img.archangelCanvas2, alt: "Archangel Michael canvas, detail of the brushwork" },
      ],
      dimensions: "16 x 20 in (40 x 50 cm)",
      material: "Canvas, wood frame",
      finish: "Matte print",
      shippingWeightOz: 48, shippingLengthIn: 21, shippingWidthIn: 17, shippingHeightIn: 3,
      sku: "ASS-CAN-MICH-16", stock: 11, active: true, featured: true, customizable: false,
      createdAt: "2026-04-02",
    },
    {
      slug: "blessed-virgin-mary-shrine-box",
      title: "Blessed Virgin Mary Shrine Box",
      excerpt: "4.5-inch statue with matching keychain.",
      description:
        "A travel-sized devotion: a wooden shrine box that opens to reveal a 4.5-inch hand-painted statue of the Blessed Virgin Mary, paired with a matching keychain so the devotion can travel with you.",
      categorySlugs: ["devotional-objects", "our-lady", "gifts"],
      price: 25,
      compareAtPrice: 30,
      images: [
        { url: img.virginShrineBox1, alt: "Blessed Virgin Mary shrine box, open, with statue and keychain" },
        { url: img.virginShrineBox2, alt: "Blessed Virgin Mary shrine box, closed" },
      ],
      dimensions: "4.5 in (11.4 cm) statue, boxed",
      material: "Wood, hand-cast resin",
      finish: "Hand-painted",
      shippingWeightOz: 14, shippingLengthIn: 6, shippingWidthIn: 5, shippingHeightIn: 4,
      sku: "ASS-SHB-VM-045", stock: 30, active: true, featured: false, customizable: false,
      createdAt: "2026-05-02",
    },
    {
      slug: "our-lady-of-aparecida-shrine-box",
      title: "Our Lady of Aparecida Shrine Box",
      excerpt: "Statue and matching keychain, boxed.",
      description:
        "The same devotion to Nossa Senhora Aparecida, carried in a wooden shrine box with a matching keychain — one of the atelier's most gifted pieces, for a first communion, confirmation, or simply to carry faith along.",
      categorySlugs: ["devotional-objects", "our-lady", "gifts"],
      price: 25,
      compareAtPrice: 30,
      images: [
        { url: img.ourLadyShrineBox1, alt: "Our Lady of Aparecida shrine box with statue and keychain" },
        { url: img.ourLadyShrineBox2, alt: "Our Lady of Aparecida shrine box, detail" },
      ],
      dimensions: "4.5 in (11.4 cm) statue, boxed",
      material: "Wood, hand-cast resin",
      finish: "Hand-painted",
      shippingWeightOz: 14, shippingLengthIn: 6, shippingWidthIn: 5, shippingHeightIn: 4,
      sku: "ASS-SHB-OLA-045", stock: 27, active: true, featured: true, customizable: false,
      createdAt: "2026-05-08",
    },
    {
      slug: "our-lady-of-aparecida-ivory-gold-statue",
      title: "Our Lady of Aparecida — Ivory & Gold Statue",
      excerpt: "A softer ivory finish, richly gilded.",
      description: `A gentler palette on the same beloved silhouette — ivory robes with rich, dense gilding at every trim. One of the more delicate pieces in the atelier's Aparecida line. ${craftsmanshipNote}`,
      categorySlugs: ["sacred-icons", "our-lady", "statues"],
      price: 68,
      images: [
        { url: img.ourLadyPrintII1, alt: "Our Lady of Aparecida statue, ivory and gold finish" },
        { url: img.ourLadyPrintII2, alt: "Our Lady of Aparecida ivory and gold statue, detail" },
      ],
      dimensions: "10 in (25 cm) height",
      material: "Hand-cast resin",
      finish: "Ivory with dense gold gilding",
      shippingWeightOz: 24, shippingLengthIn: 12, shippingWidthIn: 8, shippingHeightIn: 8,
      sku: "ASS-STA-010-IG", stock: 12, active: true, featured: false, customizable: false,
      createdAt: "2026-03-21",
    },
    {
      slug: "saint-george-framed-poster",
      title: "Saint George, Dragon Slayer — Framed Poster",
      excerpt: "Framed print of the warrior saint.",
      description:
        "Saint George astride his horse, lance drawn against the dragon — framed and ready to hang. A devotion to courage and protection, rendered in the atelier's warm, painterly palette.",
      categorySlugs: ["saints", "prints-wall-art"],
      price: 75,
      images: [
        { url: img.saintGeorgePoster1, alt: "Saint George, Dragon Slayer, framed poster" },
        { url: img.saintGeorgePoster2, alt: "Saint George framed poster, detail of the frame" },
      ],
      dimensions: "18 x 24 in (45 x 60 cm), framed",
      material: "Print, wood frame",
      finish: "Matte, framed",
      shippingWeightOz: 60, shippingLengthIn: 25, shippingWidthIn: 19, shippingHeightIn: 3,
      sku: "ASS-PRT-SG-18", stock: 8, active: true, featured: true, customizable: false,
      createdAt: "2026-04-19",
    },
    {
      slug: "saint-michael-archangel-mug",
      title: "Saint Michael the Archangel — Mug",
      excerpt: "Ceramic mug, 11 or 15 oz.",
      description:
        "A ceramic mug carrying the image of Saint Michael the Archangel — a small devotion for the morning table. Available in 11 oz and 15 oz.",
      categorySlugs: ["gifts", "saints"],
      price: 14.99,
      images: [
        { url: img.saintMichaelMug1, alt: "Saint Michael the Archangel ceramic mug" },
        { url: img.saintMichaelMug2, alt: "Saint Michael mug, side view" },
      ],
      variants: [
        { name: "11 oz", optionLabel: "Size", inStock: true },
        { name: "15 oz", optionLabel: "Size", inStock: true },
      ],
      material: "Ceramic",
      finish: "Glossy print",
      shippingWeightOz: 16, shippingLengthIn: 6, shippingWidthIn: 5, shippingHeightIn: 5,
      sku: "ASS-MUG-SM", stock: 50, active: true, featured: false, customizable: false,
      createdAt: "2026-02-02",
    },
    {
      slug: "saint-george-dragon-slayer-mug",
      title: "Saint George, Dragon Slayer — Mug",
      excerpt: "Ceramic mug, 11 or 15 oz.",
      description:
        "Saint George on horseback, lance raised, printed on a ceramic mug. A small, everyday devotion. Available in 11 oz and 15 oz.",
      categorySlugs: ["gifts", "saints"],
      price: 15.99,
      images: [
        { url: img.saintGeorgeMug1, alt: "Saint George, Dragon Slayer, ceramic mug" },
        { url: img.saintGeorgeMug2, alt: "Saint George mug, side view" },
      ],
      variants: [
        { name: "11 oz", optionLabel: "Size", inStock: true },
        { name: "15 oz", optionLabel: "Size", inStock: true },
      ],
      material: "Ceramic",
      finish: "Glossy print",
      shippingWeightOz: 16, shippingLengthIn: 6, shippingWidthIn: 5, shippingHeightIn: 5,
      sku: "ASS-MUG-SG", stock: 46, active: true, featured: false, customizable: false,
      createdAt: "2026-02-05",
    },
  ];
}

function buildReviews(slugToId) {
  return [
    { author: "bob", rating: 5, text: "Lovely spiritual art and energy.", productSlug: "our-lady-of-aparecida-10-inch-pearl-gold-statue", createdAt: "2026-04-02" },
    { author: "Fernanda", rating: 5, text: "Beautiful and great quality. Will definitely recommend.", productSlug: "our-lady-of-aparecida-11-inch-metallic-blue-statue", createdAt: "2026-05-14" },
    { author: "Julia Silva", location: "Brazil", rating: 5, text: "Trabalho maravilhoso e atendimento excelente! Super indico.", productSlug: "our-lady-of-aparecida-shrine-box", createdAt: "2026-05-29" },
    { author: "Luis", rating: 5, text: "She is absolutely gorgeous, a work of art quite literally. I've been dying to have her since I ever saw her at the age 17, and I'm 25 now — I'm just really happy.", productSlug: "our-lady-of-aparecida-11-inch-pink-statue", createdAt: "2026-06-03" },
    { author: "alex vera", rating: 5, text: "Great statue, very well crafted, beautiful.", productSlug: "archangel-michael-slaying-the-dragon-canvas", createdAt: "2026-06-20" },
    { author: "Sebastian", rating: 5, text: "Beautiful, my mom loved it! Came very well protected as well.", productSlug: "blessed-virgin-mary-shrine-box", createdAt: "2026-07-01" },
  ].map((r) => ({
    product_id: slugToId.get(r.productSlug) ?? null,
    author: r.author,
    location: r.location ?? null,
    rating: r.rating,
    body: r.text,
    created_at: r.createdAt,
  }));
}

function buildPosts(img, editorial) {
  return [
    {
      slug: "the-origin-of-the-atelier",
      title: "The Origin of the Atelier",
      subtitle: "Why a devotional workshop begins with a name, not a product",
      excerpt: "Atelier Saint Sebastian did not begin as a shop. It began as a question about what it means to make something sacred by hand, in an age that no longer expects it.",
      cover_image_url: img.ourLady11Metallic1,
      cover_image_alt: "A hand-painted devotional statue in soft studio light",
      content: `
      <p>Every piece that leaves the atelier begins the same way — not at a workbench, but at a question. What does it mean to make something sacred with your hands, in an age that has largely stopped expecting objects to be made that way at all?</p>
      <p>The name Saint Sebastian was chosen deliberately. He is remembered as a figure of endurance — pierced, and still standing. There is something of that patience in this work: the layering of paint that has to dry before the next layer can begin, the gilding that cannot be rushed, the days a single statue asks for before it is ready to leave.</p>
      <blockquote>Devotional art is not decoration. It is a form of company — something that stays in a room and holds its quiet, year after year.</blockquote>
      <p>The atelier grew slowly, piece by piece, out of a relationship between faith, memory and craft that goes back further than the workshop itself — to grandmothers' altars, to processions, to the particular blue of Our Lady's mantle that everyone who grew up around it can recognize without being told.</p>
      <img src="${img.ourLadyProcessHands1}" alt="Gloved hands finishing the paint on a devotional statue" />
      <p>This Journal exists to keep some of that story visible — the saints behind the statues, the choices behind a finish, the collections as they take shape. Thank you for reading, and for letting a small part of the atelier into your home.</p>
    `,
      category: "atelier", status: "published", published_at: "2026-01-15", created_at: "2026-01-10", updated_at: "2026-01-15",
    },
    {
      slug: "the-story-of-our-lady-of-aparecida",
      title: "The Story of Our Lady of Aparecida",
      subtitle: "How a broken statue pulled from a river became Brazil's patroness",
      excerpt: "In 1717, three fishermen on the Paraíba River pulled up a small, dark, headless statue of Our Lady before their nets began to fill. The story has not stopped being told since.",
      cover_image_url: img.ourLady11BlueGold1,
      cover_image_alt: "Statue of Our Lady of Aparecida",
      content: `
      <p>In 1717, three fishermen on the Paraíba do Sul river were struggling to catch anything at all. On one cast of the net, they pulled up the body of a small terracotta statue of Our Lady of the Immaculate Conception — dark from the river, and without its head. On the next cast, the head appeared.</p>
      <p>From that point, the story goes, the nets began to fill. The fishermen kept the statue, and devotion to it — under the name Nossa Senhora Aparecida, "Our Lady who appeared" — spread through the region and, eventually, the country. She was declared Patroness of Brazil in 1930.</p>
      <h2>Why the dark clay and the blue mantle</h2>
      <p>The statue's dark tone, a result of the river and the clay itself, has become inseparable from her identity — she is instantly recognizable by color and form alone. The atelier's statues follow this same silhouette closely, while allowing small variations in mantle tone that devotees have long personalized on their own home altars.</p>
      <blockquote>She was found broken, in pieces, in water that had given nothing that day. Devotion, more than once, begins exactly there.</blockquote>
      <p>Every October 12th, her feast is marked across Brazil with processions that fill the Basílica in Aparecida do Norte to its edges. It is one of the largest annual gatherings of faith in the world — and one small statue's very long second life.</p>
    `,
      category: "saints", status: "published", published_at: "2026-02-20", created_at: "2026-02-14", updated_at: "2026-02-20",
    },
    {
      slug: "inside-the-hand-painting-process",
      title: "Inside the Hand-Painting Process",
      subtitle: "From bare cast to finished statue, layer by layer",
      excerpt: "A statue leaves the mold pale and featureless. What happens between that moment and the piece that reaches your door takes days, not minutes — here is what that looks like.",
      cover_image_url: img.ourLadyProcessHands1,
      cover_image_alt: "Hands finishing the detail on a devotional statue",
      content: `
      <p>A statue leaves its mold pale, matte, and featureless — closer to a blank page than a finished devotion. Everything that gives it presence happens afterward, by hand, over the course of several days.</p>
      <h2>Base coat and shading</h2>
      <p>The base coat is applied first and left to cure fully before any detail begins — rushing this step is the single most common cause of a finish that looks flat rather than alive. Shading follows, built in thin layers from the folds outward, the same technique used across the atelier's statues, plaques and canvases.</p>
      <h2>Gilding</h2>
      <p>Gold is the last element added, and the most restrained. It is used at trims, hems and small accents — never as a wash across the whole piece. The goal is for gold to catch the light in specific places, the way it would on a vestment or an old processional statue, rather than to dominate the object.</p>
      <blockquote>The gold should be found, not announced. — Jouber</blockquote>
      <p>Because every stage is done by hand, no two pieces are ever perfectly identical — a small variation in a fold of paint, a slightly different weight of gold at the hem. The atelier considers this a feature of the work, not an inconsistency to eliminate.</p>
    `,
      category: "process", status: "published", published_at: "2026-03-10", created_at: "2026-03-05", updated_at: "2026-03-10",
    },
    {
      slug: "the-meaning-behind-the-shrine-box",
      title: "The Meaning Behind the Shrine Box",
      subtitle: "A small devotion, made to travel",
      excerpt: "Not every devotion stays on a shelf. The shrine box was designed for the pieces that need to travel — to a dorm room, a hospital bedside, a new home.",
      cover_image_url: img.ourLadyShrineBox1,
      cover_image_alt: "Our Lady of Aparecida shrine box, open, with statue and keychain",
      content: `
      <p>Not every devotion is meant to stay in one place. The shrine box was designed for the pieces of faith that need to travel — into a dorm room, a hospital bedside table, a first apartment, a new country.</p>
      <p>Each box opens like a small cabinet to reveal a hand-painted statue at its center, with a matching keychain tucked beside it — so a piece of the same devotion can stay on a set of keys, even when the box itself is left behind on a shelf.</p>
      <img src="${img.virginShrineBox2}" alt="Shrine box closed, wood grain detail" />
      <p>It has become one of the atelier's most gifted pieces — for confirmations, graduations, and the quiet, in-between moments of someone leaving home for the first time.</p>
    `,
      category: "collections", status: "published", published_at: "2026-05-15", created_at: "2026-05-10", updated_at: "2026-05-15",
    },
    {
      slug: "saint-michael-and-saint-george-a-shared-iconography",
      title: "Saint Michael and Saint George: A Shared Iconography",
      subtitle: "Why two very different saints are so often painted the same way",
      excerpt: "An archangel and a soldier-martyr, separated by centuries, are painted almost identically across Christian art: sword or lance raised, a dragon underfoot. Here is why.",
      cover_image_url: img.archangelCanvas1,
      cover_image_alt: "Archangel Michael slaying the dragon, canvas print",
      content: `
      <p>Look at enough devotional art and you'll notice it: Saint Michael the Archangel and Saint George, a soldier-martyr who lived centuries apart from any archangel, are painted in almost the same pose across most of Christian art — weapon raised, a dragon underfoot, wings or armor catching the light.</p>
      <p>The dragon, in both cases, is symbolic rather than literal — a stand-in for chaos, temptation, or evil defeated by faith and courage rather than force alone. Michael's battle is described in the Book of Revelation; George's dragon comes from a much later medieval legend layered onto his martyrdom under Diocletian.</p>
      <h2>Why the atelier paints them side by side</h2>
      <p>Placed together, the two works read less like a coincidence and more like a lineage — protection as a devotional theme that outlives any single century. Many collectors choose to hang them as a pair.</p>
    `,
      category: "saints", status: "published", published_at: "2026-06-08", created_at: "2026-06-01", updated_at: "2026-06-08",
      gallery: [
        { id: "post-05-g1", url: img.archangelCanvas2, alt: "Archangel Michael canvas, detail" },
        { id: "post-05-g2", url: img.saintGeorgePoster1, alt: "Saint George framed poster" },
        { id: "post-05-g3", url: img.saintGeorgePoster2, alt: "Saint George framed poster, detail" },
      ],
    },
    {
      slug: "a-note-on-the-atelier-behind-the-scenes",
      title: "A Note on the Atelier",
      subtitle: "What a working week looks like, behind the photographs",
      excerpt: "Draft notes from the workshop floor — what a working week looks like between orders, restocks, and the pieces still drying on the shelf.",
      cover_image_url: editorial.devotionalPresence,
      cover_image_alt: "A view inside the Atelier Saint Sebastian workshop",
      content: `
      <p>A short note from the workshop floor this month — less a finished story, more a look at what a working week actually looks like between orders. Several statues are drying on the back shelf, waiting for a coat of gold that can't be rushed by a shipping deadline.</p>
      <p>Thank you, as always, for the patience that comes with ordering something made by hand rather than pulled from a warehouse shelf. More stories, saints, and finished pieces soon.</p>
    `,
      category: "atelier", status: "draft", created_at: "2026-08-12", updated_at: "2026-08-14",
    },
  ];
}

async function main() {
  console.log("Uploading images...");
  const { img, editorial } = await uploadAll();

  console.log("Seeding product_categories...");
  const productCategories = [
    { slug: "statues", name: "Statues", description: "Hand-painted devotional statues, cast and finished individually in the atelier." },
    { slug: "sacred-icons", name: "Sacred Icons", description: "Iconographic works portraying the saints and the Holy Family." },
    { slug: "our-lady", name: "Our Lady", description: "Devotions to the Blessed Virgin Mary, from Aparecida to Fátima." },
    { slug: "saints", name: "Saints", description: "Works dedicated to the archangels and the communion of saints." },
    { slug: "devotional-objects", name: "Devotional Objects", description: "Shrine boxes, candles and small pieces for prayer and the home altar." },
    { slug: "prints-wall-art", name: "Prints & Wall Art", description: "Canvas and framed works for the wall, printed and finished with care." },
    { slug: "gifts", name: "Gifts", description: "Small devotional pieces to carry the atelier beyond the home altar." },
  ];
  { const { error } = await client.from("product_categories").upsert(productCategories, { onConflict: "slug" }); if (error) throw error; }

  console.log("Seeding post_categories...");
  const postCategories = [
    { slug: "atelier", name: "Atelier" },
    { slug: "saints", name: "Saints & Stories" },
    { slug: "process", name: "Process" },
    { slug: "collections", name: "Collections" },
  ];
  { const { error } = await client.from("post_categories").upsert(postCategories, { onConflict: "slug" }); if (error) throw error; }

  console.log("Seeding products...");
  const slugToId = new Map();
  for (const p of buildProducts(img)) {
    const { data: row, error } = await client
      .from("products")
      .upsert(
        {
          slug: p.slug, title: p.title, excerpt: p.excerpt, description: p.description,
          price: p.price, compare_at_price: p.compareAtPrice ?? null,
          dimensions: p.dimensions ?? null, material: p.material ?? null, finish: p.finish ?? null,
          shipping_weight_oz: p.shippingWeightOz ?? null, shipping_length_in: p.shippingLengthIn ?? null,
          shipping_width_in: p.shippingWidthIn ?? null, shipping_height_in: p.shippingHeightIn ?? null,
          sku: p.sku, stock: p.stock, active: p.active, featured: p.featured, customizable: p.customizable,
          created_at: p.createdAt,
        },
        { onConflict: "slug" },
      )
      .select()
      .single();
    if (error) throw new Error(`product ${p.slug}: ${error.message}`);
    slugToId.set(p.slug, row.id);

    await client.from("product_category_map").delete().eq("product_id", row.id);
    await client.from("product_category_map").insert(p.categorySlugs.map((slug) => ({ product_id: row.id, category_slug: slug })));

    await client.from("product_images").delete().eq("product_id", row.id);
    await client.from("product_images").insert(p.images.map((im, i) => ({ product_id: row.id, url: im.url, alt: im.alt, position: i })));

    await client.from("product_variants").delete().eq("product_id", row.id);
    if (p.variants?.length) {
      await client.from("product_variants").insert(
        p.variants.map((v) => ({ product_id: row.id, name: v.name, option_label: v.optionLabel, in_stock: v.inStock })),
      );
    }
    process.stdout.write(".");
  }
  console.log(" done");

  console.log("Seeding reviews...");
  { const { error } = await client.from("reviews").insert(buildReviews(slugToId)); if (error) throw error; }

  console.log("Seeding posts...");
  for (const post of buildPosts(img, editorial)) {
    const { error } = await client.from("posts").upsert(post, { onConflict: "slug" });
    if (error) throw new Error(`post ${post.slug}: ${error.message}`);
  }

  console.log("Seed complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
