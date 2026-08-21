// Central import map for the real Atelier Saint Sebastian photography
// (downloaded from the current site's product listings and optimized
// to WebP — see scripts/optimize-images.mjs). Only genuine, unedited
// product/process photographs are used here — the current site's
// marketing banner graphics (with headlines and CTAs baked into the
// image itself) were deliberately excluded, since this redesign uses
// its own typography rather than reusing the old site's graphics.

import ourLady10PearlGold1 from "@/assets/images/products/our-lady-aparecida-10in-pearl-gold-1.webp";
import ourLady10PearlGold2 from "@/assets/images/products/our-lady-aparecida-10in-pearl-gold-2.webp";
import ourLady11BlueGold1 from "@/assets/images/products/our-lady-aparecida-11in-blue-gold-1.webp";
import ourLady11BlueGold2 from "@/assets/images/products/our-lady-aparecida-11in-blue-gold-2.webp";
import ourLady11Metallic1 from "@/assets/images/products/our-lady-aparecida-11in-metallic-blue-1.webp";
import ourLady11Metallic2 from "@/assets/images/products/our-lady-aparecida-11in-metallic-blue-2.webp";
import ourLady11Pink1 from "@/assets/images/products/our-lady-aparecida-11in-pink-1.webp";
import ourLady11Pink2 from "@/assets/images/products/our-lady-aparecida-11in-pink-2.webp";
import sacredPlaque1 from "@/assets/images/products/sacred-plaque-8x8-1.webp";
import sacredPlaque2 from "@/assets/images/products/sacred-plaque-8x8-2.webp";
import novenaCandle1 from "@/assets/images/products/novena-prayer-candle-1.webp";
import novenaCandle2 from "@/assets/images/products/novena-prayer-candle-2.webp";
import archangelCanvas1 from "@/assets/images/products/archangel-michael-canvas-1.webp";
import archangelCanvas2 from "@/assets/images/products/archangel-michael-canvas-2.webp";
import virginShrineBox1 from "@/assets/images/products/virgin-mary-shrine-box-1.webp";
import virginShrineBox2 from "@/assets/images/products/virgin-mary-shrine-box-2.webp";
import ourLadyShrineBox1 from "@/assets/images/products/our-lady-aparecida-shrine-box-1.webp";
import ourLadyShrineBox2 from "@/assets/images/products/our-lady-aparecida-shrine-box-2.webp";
// "Print I" is, in the source photography, a hand-painting process shot
// (gloved hands, brushes and pigments) rather than a flat print — it
// does double duty here as the atelier's process photography.
import ourLadyProcessHands1 from "@/assets/images/products/our-lady-aparecida-print-i-1.webp";
import ourLadyProcessHands2 from "@/assets/images/products/our-lady-aparecida-print-i-2.webp";
import ourLadyPrintII1 from "@/assets/images/products/our-lady-aparecida-print-ii-1.webp";
import ourLadyPrintII2 from "@/assets/images/products/our-lady-aparecida-print-ii-2.webp";
import saintGeorgePoster1 from "@/assets/images/products/saint-george-framed-poster-1.webp";
import saintGeorgePoster2 from "@/assets/images/products/saint-george-framed-poster-2.webp";
import saintMichaelMug1 from "@/assets/images/products/saint-michael-mug-1.webp";
import saintMichaelMug2 from "@/assets/images/products/saint-michael-mug-2.webp";
import saintGeorgeMug1 from "@/assets/images/products/saint-george-mug-1.webp";
import saintGeorgeMug2 from "@/assets/images/products/saint-george-mug-2.webp";
// A genuine, textless devotional still life (statue, candles, a
// stained-glass Sacred Heart in the background) used for full-bleed
// editorial moments across the site.
import devotionalPresence from "@/assets/images/editorial/editorial-detail.webp";

export const productImages = {
  ourLady10PearlGold1,
  ourLady10PearlGold2,
  ourLady11BlueGold1,
  ourLady11BlueGold2,
  ourLady11Metallic1,
  ourLady11Metallic2,
  ourLady11Pink1,
  ourLady11Pink2,
  sacredPlaque1,
  sacredPlaque2,
  novenaCandle1,
  novenaCandle2,
  archangelCanvas1,
  archangelCanvas2,
  virginShrineBox1,
  virginShrineBox2,
  ourLadyShrineBox1,
  ourLadyShrineBox2,
  ourLadyProcessHands1,
  ourLadyProcessHands2,
  ourLadyPrintII1,
  ourLadyPrintII2,
  saintGeorgePoster1,
  saintGeorgePoster2,
  saintMichaelMug1,
  saintMichaelMug2,
  saintGeorgeMug1,
  saintGeorgeMug2,
};

/** Editorial imagery reused across Home/Artist/Journal — all genuine
 * photographs, none carrying baked-in marketing text. */
export const editorialImages = {
  /** Dramatic full-bleed statue portrait — the Home hero background. */
  heroStatue: ourLady11Metallic1,
  /** Gloved hands mid-brushstroke — the atelier's process photography. */
  processHands: ourLadyProcessHands1,
  /** Candlelit devotional still life for full-bleed "presence" moments. */
  devotionalPresence,
  /** Three finished statues together — used for wide artist-page banners. */
  statueGroup: ourLadyShrineBox1,
  /** A single statue against roses — the artist teaser portrait. */
  artistPortraitPiece: ourLadyPrintII1,
  /** Devotional still life — candle, sacred plaque, crucifix and roses —
   * for the Handcrafted section's second frame. (Not a macro "paint
   * detail" shot: the product line's own close-up angles turned out to
   * be full-object lifestyle photos on a staged tabletop, not texture
   * detail, so this atmospheric still life reads far better here.) */
  devotionalStillLife: sacredPlaque2,
};

/** One representative photograph per collection, used only for the Home
 * category teasers — not tied to a specific product, just the visual
 * signature of that part of the catalogue. */
export const categoryTeaserImages = {
  statues: ourLady11BlueGold1,
  sacredIcons: archangelCanvas1,
  devotionalObjects: sacredPlaque1,
};
