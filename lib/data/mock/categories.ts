export type Category = {
  slug: string;
  name: string;
  description: string;
  productCount: number;
};

export const categories: Category[] = [
  {
    slug: "cattle-livestock",
    name: "Cattle & Livestock",
    description: "Grass-reared herd, raised on rotational pasture.",
    productCount: 5,
  },
  {
    slug: "mangoes",
    name: "Mangoes",
    description: "Seasonal harvest from our orchard blocks.",
    productCount: 12,
  },
  {
    slug: "cashew-nuts-seeds",
    name: "Cashew Nuts & Seeds",
    description: "Raw, graded cashew from our own groves.",
    productCount: 4,
  },
  {
    slug: "yams",
    name: "Yams",
    description: "Field-fresh tubers, harvested to order.",
    productCount: 6,
  },
  {
    slug: "maize-grains",
    name: "Maize & Grains",
    description: "Dried and bagged, ready for bulk or retail.",
    productCount: 3,
  },
];
