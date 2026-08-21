import type { Post } from "@/lib/data/types";
import { editorialImages, productImages } from "@/lib/data/mock/images";

export const posts: Post[] = [
  {
    id: "post-01",
    slug: "the-origin-of-the-atelier",
    title: "The Origin of the Atelier",
    subtitle: "Why a devotional workshop begins with a name, not a product",
    excerpt:
      "Atelier Saint Sebastian did not begin as a shop. It began as a question about what it means to make something sacred by hand, in an age that no longer expects it.",
    coverImage: {
      id: "post-01-cover",
      url: editorialImages.heroStatue,
      alt: "A hand-painted devotional statue in soft studio light",
    },
    content: `
      <p>Every piece that leaves the atelier begins the same way — not at a workbench, but at a question. What does it mean to make something sacred with your hands, in an age that has largely stopped expecting objects to be made that way at all?</p>
      <p>The name Saint Sebastian was chosen deliberately. He is remembered as a figure of endurance — pierced, and still standing. There is something of that patience in this work: the layering of paint that has to dry before the next layer can begin, the gilding that cannot be rushed, the days a single statue asks for before it is ready to leave.</p>
      <blockquote>Devotional art is not decoration. It is a form of company — something that stays in a room and holds its quiet, year after year.</blockquote>
      <p>The atelier grew slowly, piece by piece, out of a relationship between faith, memory and craft that goes back further than the workshop itself — to grandmothers' altars, to processions, to the particular blue of Our Lady's mantle that everyone who grew up around it can recognize without being told.</p>
      <img src="${editorialImages.processHands}" alt="Gloved hands finishing the paint on a devotional statue" />
      <p>This Journal exists to keep some of that story visible — the saints behind the statues, the choices behind a finish, the collections as they take shape. Thank you for reading, and for letting a small part of the atelier into your home.</p>
    `,
    category: "atelier",
    status: "published",
    publishedAt: "2026-01-15",
    createdAt: "2026-01-10",
    updatedAt: "2026-01-15",
  },
  {
    id: "post-02",
    slug: "the-story-of-our-lady-of-aparecida",
    title: "The Story of Our Lady of Aparecida",
    subtitle: "How a broken statue pulled from a river became Brazil's patroness",
    excerpt:
      "In 1717, three fishermen on the Paraíba River pulled up a small, dark, headless statue of Our Lady before their nets began to fill. The story has not stopped being told since.",
    coverImage: {
      id: "post-02-cover",
      url: productImages.ourLady11BlueGold1,
      alt: "Statue of Our Lady of Aparecida",
    },
    content: `
      <p>In 1717, three fishermen on the Paraíba do Sul river were struggling to catch anything at all. On one cast of the net, they pulled up the body of a small terracotta statue of Our Lady of the Immaculate Conception — dark from the river, and without its head. On the next cast, the head appeared.</p>
      <p>From that point, the story goes, the nets began to fill. The fishermen kept the statue, and devotion to it — under the name Nossa Senhora Aparecida, "Our Lady who appeared" — spread through the region and, eventually, the country. She was declared Patroness of Brazil in 1930.</p>
      <h2>Why the dark clay and the blue mantle</h2>
      <p>The statue's dark tone, a result of the river and the clay itself, has become inseparable from her identity — she is instantly recognizable by color and form alone. The atelier's statues follow this same silhouette closely, while allowing small variations in mantle tone that devotees have long personalized on their own home altars.</p>
      <blockquote>She was found broken, in pieces, in water that had given nothing that day. Devotion, more than once, begins exactly there.</blockquote>
      <p>Every October 12th, her feast is marked across Brazil with processions that fill the Basílica in Aparecida do Norte to its edges. It is one of the largest annual gatherings of faith in the world — and one small statue's very long second life.</p>
    `,
    category: "saints",
    status: "published",
    publishedAt: "2026-02-20",
    createdAt: "2026-02-14",
    updatedAt: "2026-02-20",
  },
  {
    id: "post-03",
    slug: "inside-the-hand-painting-process",
    title: "Inside the Hand-Painting Process",
    subtitle: "From bare cast to finished statue, layer by layer",
    excerpt:
      "A statue leaves the mold pale and featureless. What happens between that moment and the piece that reaches your door takes days, not minutes — here is what that looks like.",
    coverImage: {
      id: "post-03-cover",
      url: editorialImages.processHands,
      alt: "Hands finishing the detail on a devotional statue",
    },
    content: `
      <p>A statue leaves its mold pale, matte, and featureless — closer to a blank page than a finished devotion. Everything that gives it presence happens afterward, by hand, over the course of several days.</p>
      <h2>Base coat and shading</h2>
      <p>The base coat is applied first and left to cure fully before any detail begins — rushing this step is the single most common cause of a finish that looks flat rather than alive. Shading follows, built in thin layers from the folds outward, the same technique used across the atelier's statues, plaques and canvases.</p>
      <h2>Gilding</h2>
      <p>Gold is the last element added, and the most restrained. It is used at trims, hems and small accents — never as a wash across the whole piece. The goal is for gold to catch the light in specific places, the way it would on a vestment or an old processional statue, rather than to dominate the object.</p>
      <blockquote>The gold should be found, not announced. — Jouber</blockquote>
      <p>Because every stage is done by hand, no two pieces are ever perfectly identical — a small variation in a fold of paint, a slightly different weight of gold at the hem. The atelier considers this a feature of the work, not an inconsistency to eliminate.</p>
    `,
    category: "process",
    status: "published",
    publishedAt: "2026-03-10",
    createdAt: "2026-03-05",
    updatedAt: "2026-03-10",
  },
  {
    id: "post-04",
    slug: "the-meaning-behind-the-shrine-box",
    title: "The Meaning Behind the Shrine Box",
    subtitle: "A small devotion, made to travel",
    excerpt:
      "Not every devotion stays on a shelf. The shrine box was designed for the pieces that need to travel — to a dorm room, a hospital bedside, a new home.",
    coverImage: {
      id: "post-04-cover",
      url: productImages.ourLadyShrineBox1,
      alt: "Our Lady of Aparecida shrine box, open, with statue and keychain",
    },
    content: `
      <p>Not every devotion is meant to stay in one place. The shrine box was designed for the pieces of faith that need to travel — into a dorm room, a hospital bedside table, a first apartment, a new country.</p>
      <p>Each box opens like a small cabinet to reveal a hand-painted statue at its center, with a matching keychain tucked beside it — so a piece of the same devotion can stay on a set of keys, even when the box itself is left behind on a shelf.</p>
      <img src="${productImages.virginShrineBox2}" alt="Shrine box closed, wood grain detail" />
      <p>It has become one of the atelier's most gifted pieces — for confirmations, graduations, and the quiet, in-between moments of someone leaving home for the first time.</p>
    `,
    category: "collections",
    status: "published",
    publishedAt: "2026-05-15",
    createdAt: "2026-05-10",
    updatedAt: "2026-05-15",
  },
  {
    id: "post-05",
    slug: "saint-michael-and-saint-george-a-shared-iconography",
    title: "Saint Michael and Saint George: A Shared Iconography",
    subtitle: "Why two very different saints are so often painted the same way",
    excerpt:
      "An archangel and a soldier-martyr, separated by centuries, are painted almost identically across Christian art: sword or lance raised, a dragon underfoot. Here is why.",
    coverImage: {
      id: "post-05-cover",
      url: productImages.archangelCanvas1,
      alt: "Archangel Michael slaying the dragon, canvas print",
    },
    content: `
      <p>Look at enough devotional art and you'll notice it: Saint Michael the Archangel and Saint George, a soldier-martyr who lived centuries apart from any archangel, are painted in almost the same pose across most of Christian art — weapon raised, a dragon underfoot, wings or armor catching the light.</p>
      <p>The dragon, in both cases, is symbolic rather than literal — a stand-in for chaos, temptation, or evil defeated by faith and courage rather than force alone. Michael's battle is described in the Book of Revelation; George's dragon comes from a much later medieval legend layered onto his martyrdom under Diocletian.</p>
      <h2>Why the atelier paints them side by side</h2>
      <p>Placed together, the two works read less like a coincidence and more like a lineage — protection as a devotional theme that outlives any single century. Many collectors choose to hang them as a pair.</p>
    `,
    category: "saints",
    status: "published",
    publishedAt: "2026-06-08",
    createdAt: "2026-06-01",
    updatedAt: "2026-06-08",
    gallery: [
      { id: "post-05-g1", url: productImages.archangelCanvas2, alt: "Archangel Michael canvas, detail" },
      { id: "post-05-g2", url: productImages.saintGeorgePoster1, alt: "Saint George framed poster" },
      { id: "post-05-g3", url: productImages.saintGeorgePoster2, alt: "Saint George framed poster, detail" },
    ],
  },
  {
    id: "post-06",
    slug: "a-note-on-the-atelier-behind-the-scenes",
    title: "A Note on the Atelier",
    subtitle: "What a working week looks like, behind the photographs",
    excerpt:
      "Draft notes from the workshop floor — what a working week looks like between orders, restocks, and the pieces still drying on the shelf.",
    coverImage: {
      id: "post-06-cover",
      url: editorialImages.devotionalPresence,
      alt: "A view inside the Atelier Saint Sebastian workshop",
    },
    content: `
      <p>A short note from the workshop floor this month — less a finished story, more a look at what a working week actually looks like between orders. Several statues are drying on the back shelf, waiting for a coat of gold that can't be rushed by a shipping deadline.</p>
      <p>Thank you, as always, for the patience that comes with ordering something made by hand rather than pulled from a warehouse shelf. More stories, saints, and finished pieces soon.</p>
    `,
    category: "atelier",
    status: "draft",
    createdAt: "2026-08-12",
    updatedAt: "2026-08-14",
  },
];
