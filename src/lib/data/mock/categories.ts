import type { ProductCategory, PostCategory } from "@/lib/data/types";

export const productCategories: ProductCategory[] = [
  {
    id: "cat-statues",
    slug: "statues",
    name: "Statues",
    description: "Hand-painted devotional statues, cast and finished individually in the atelier.",
  },
  {
    id: "cat-sacred-icons",
    slug: "sacred-icons",
    name: "Sacred Icons",
    description: "Iconographic works portraying the saints and the Holy Family.",
  },
  {
    id: "cat-our-lady",
    slug: "our-lady",
    name: "Our Lady",
    description: "Devotions to the Blessed Virgin Mary, from Aparecida to Fátima.",
  },
  {
    id: "cat-saints",
    slug: "saints",
    name: "Saints",
    description: "Works dedicated to the archangels and the communion of saints.",
  },
  {
    id: "cat-devotional-objects",
    slug: "devotional-objects",
    name: "Devotional Objects",
    description: "Shrine boxes, candles and small pieces for prayer and the home altar.",
  },
  {
    id: "cat-prints",
    slug: "prints-wall-art",
    name: "Prints & Wall Art",
    description: "Canvas and framed works for the wall, printed and finished with care.",
  },
  {
    id: "cat-gifts",
    slug: "gifts",
    name: "Gifts",
    description: "Small devotional pieces to carry the atelier beyond the home altar.",
  },
];

export const postCategories: PostCategory[] = [
  { id: "pcat-atelier", slug: "atelier", name: "Atelier" },
  { id: "pcat-saints", slug: "saints", name: "Saints & Stories" },
  { id: "pcat-process", slug: "process", name: "Process" },
  { id: "pcat-collections", slug: "collections", name: "Collections" },
];
