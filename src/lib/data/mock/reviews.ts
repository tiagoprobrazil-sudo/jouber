import type { Review } from "@/lib/data/types";

// Real customer feedback, carried over from the atelier's existing storefront
// (its Judge.me review widget) rather than invented — locations weren't part
// of that data, so they're left blank instead of fabricated.
export const reviews: Review[] = [
  {
    id: "rev-01",
    author: "bob",
    rating: 5,
    text: "Lovely spiritual art and energy.",
    productSlug: "our-lady-of-aparecida-10-inch-pearl-gold-statue",
    createdAt: "2026-04-02",
  },
  {
    id: "rev-02",
    author: "Fernanda",
    rating: 5,
    text: "Beautiful and great quality. Will definitely recommend.",
    productSlug: "our-lady-of-aparecida-11-inch-metallic-blue-statue",
    createdAt: "2026-05-14",
  },
  {
    id: "rev-03",
    author: "Julia Silva",
    location: "Brazil",
    rating: 5,
    text: "Trabalho maravilhoso e atendimento excelente! Super indico.",
    productSlug: "our-lady-of-aparecida-shrine-box",
    createdAt: "2026-05-29",
  },
  {
    id: "rev-04",
    author: "Luis",
    rating: 5,
    text: "She is absolutely gorgeous, a work of art quite literally. I've been dying to have her since I ever saw her at the age 17, and I'm 25 now — I'm just really happy.",
    productSlug: "our-lady-of-aparecida-11-inch-pink-statue",
    createdAt: "2026-06-03",
  },
  {
    id: "rev-05",
    author: "alex vera",
    rating: 5,
    text: "Great statue, very well crafted, beautiful.",
    productSlug: "archangel-michael-slaying-the-dragon-canvas",
    createdAt: "2026-06-20",
  },
  {
    id: "rev-06",
    author: "Sebastian",
    rating: 5,
    text: "Beautiful, my mom loved it! Came very well protected as well.",
    productSlug: "blessed-virgin-mary-shrine-box",
    createdAt: "2026-07-01",
  },
];
