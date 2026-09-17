export type PostStatus = "Published" | "Draft" | "Scheduled";

export type Post = {
  slug: string;
  category: string;
  title: string;
  date: string;
  excerpt: string;
  body: string[];
  author: string;
  readingTime: string;
  status: PostStatus;
};

const POSTS: Post[] = [
  {
    slug: "managing-herd-health-dry-season",
    category: "Livestock",
    title: "Managing Herd Health Through the Dry Season",
    date: "May 20, 2026",
    excerpt:
      "How Klantis Farms adjusts grazing rotation, water access and veterinary checks once the dry season sets in — and what we track to catch problems early.",
    author: "Farm Manager",
    readingTime: "6 min read",
    status: "Published",
    body: [
      "Once the dry season sets in, the biggest risk to the herd isn't any single disease — it's water access and feed quality quietly declining until it becomes a problem. Here's how we manage through it.",
      "We shorten the rotation cycle so cattle move to fresh pasture more frequently, since regrowth slows down significantly without rain. Blocks that would normally rest for three weeks might only get two.",
      "Every water point on the farm gets checked daily during the dry months rather than weekly. It's a small operational change that catches problems — a blocked trough, a dropping water table — before they affect the herd.",
      "Weight checks become more frequent, and any animal showing signs of stress gets flagged for a closer look. All of this gets logged against the individual animal, not just noted informally — it's what lets us catch a slow decline early instead of after the fact.",
    ],
  },
  {
    slug: "mango-harvest-2026",
    category: "Crops",
    title: "Getting the Most From This Year's Mango Harvest",
    date: "May 18, 2026",
    excerpt: "What went into this season's mango harvest across our three orchard blocks.",
    author: "Farm Manager",
    readingTime: "4 min read",
    status: "Published",
    body: [
      "This season's mango harvest across our three orchard blocks came in ahead of last year's, and a lot of that comes down to timing the irrigation more tightly around flowering.",
      "We staggered harvest across the three blocks by roughly two weeks each, which spreads the sorting and grading workload instead of trying to process everything at once.",
    ],
  },
  {
    slug: "crop-rotation-yam-fields",
    category: "Crops",
    title: "Why Crop Rotation Matters for Our Yam Fields",
    date: "May 15, 2026",
    excerpt: "The rotation plan behind our yam fields, and why we don't plant the same field twice in a row.",
    author: "Farm Manager",
    readingTime: "5 min read",
    status: "Published",
    body: [
      "We never plant yam in the same field two seasons running. Rotating with maize gives the soil time to recover the nutrients yam draws down heavily.",
      "It costs us some short-term convenience, but the yield difference over a three-year cycle makes it worth it.",
    ],
  },
  {
    slug: "field-to-table-traceability",
    category: "Farm Business",
    title: "From Field to Table: How We Trace Every Batch",
    date: "May 10, 2026",
    excerpt: "A look at the batch numbering system behind every product we sell.",
    author: "Farm Manager",
    readingTime: "5 min read",
    status: "Published",
    body: [
      "Every product that leaves Klantis Farms carries a batch number assigned at harvest, not at the point of sale.",
      "That distinction matters — it means the record exists before the product is even packaged, rather than being created retroactively.",
    ],
  },
  {
    slug: "herd-health-check-basics",
    category: "Livestock",
    title: "What We Look for During a Herd Health Check",
    date: "May 5, 2026",
    excerpt: "The basics of a routine health check, and why we do them on a fixed schedule.",
    author: "Farm Manager",
    readingTime: "4 min read",
    status: "Published",
    body: [
      "A routine health check isn't just about spotting sickness — it's a baseline. Weight, coat condition, gait, and general alertness all get noted.",
    ],
  },
  {
    slug: "cashew-season-quality",
    category: "Crops",
    title: "Cashew Season: What Makes a Good Harvest",
    date: "Apr 28, 2026",
    excerpt: "What separates a good cashew harvest from a mediocre one, from our experience.",
    author: "Farm Manager",
    readingTime: "5 min read",
    status: "Published",
    body: [
      "Cashew is unforgiving about timing — harvest too early and the nut hasn't matured, too late and you lose product to spoilage on the ground.",
    ],
  },
  {
    slug: "soil-testing-before-planting",
    category: "Crops",
    title: "Why We Soil-Test Before Every Planting Season",
    date: "Sep 2026",
    excerpt: "A draft look at how soil testing shapes what we plant where, and when.",
    author: "Farm Manager",
    readingTime: "4 min read",
    status: "Draft",
    body: [
      "This one's still being written — draft notes on our soil testing process ahead of the next planting cycle.",
    ],
  },
  {
    slug: "dry-season-water-planning-2027",
    category: "Farm Business",
    title: "Planning Water Access Ahead of Next Year's Dry Season",
    date: "Jan 5, 2027",
    excerpt: "Scheduled for early January — how we're planning water infrastructure ahead of time this year.",
    author: "Farm Manager",
    readingTime: "5 min read",
    status: "Scheduled",
    body: [
      "Scheduled to publish in January — a look ahead at water infrastructure planning before the dry season hits.",
    ],
  },
];

export async function getAllPosts(): Promise<Post[]> {
  return POSTS;
}

export async function getPublishedPosts(): Promise<Post[]> {
  return POSTS.filter((p) => p.status === "Published");
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  return POSTS.find((p) => p.slug === slug);
}

export async function getRelatedPosts(currentSlug: string, limit = 3): Promise<Post[]> {
  return POSTS.filter((p) => p.slug !== currentSlug && p.status === "Published").slice(0, limit);
}
