export type ProductStatus = "Active" | "Draft" | "Out of Stock";

export type Product = {
  slug: string;
  sku: string;
  name: string;
  categorySlug: string;
  price: number;
  unit: string;
  rating: number;
  reviewCount: number;
  badge?: string;
  status: ProductStatus;
  inventoryItemId?: string;
};

export const products: Product[] = [
  {
    slug: "grade-a-cattle",
    sku: "KLF-PRD-001",
    name: "Grade-A Cattle",
    categorySlug: "cattle-livestock",
    price: 0,
    unit: "head (market price)",
    rating: 4.9,
    reviewCount: 36,
    badge: "Best Seller",
    status: "Active",
  },
  {
    slug: "fresh-mangoes",
    sku: "KLF-PRD-002",
    name: "Fresh Mangoes",
    categorySlug: "mangoes",
    price: 12,
    unit: "kg",
    rating: 4.8,
    reviewCount: 128,
    badge: "In Season",
    status: "Active",
    inventoryItemId: "66666666-0000-0000-0000-000000000001",
  },
  {
    slug: "fresh-mangoes-sliced",
    sku: "KLF-PRD-003",
    name: "Fresh Mangoes — Sliced Pack",
    categorySlug: "mangoes",
    price: 15,
    unit: "pack",
    rating: 4.7,
    reviewCount: 42,
    status: "Active",
    inventoryItemId: "66666666-0000-0000-0000-000000000001",
  },
  {
    slug: "fresh-mangoes-export",
    sku: "KLF-PRD-004",
    name: "Fresh Mangoes — Export Grade",
    categorySlug: "mangoes",
    price: 18,
    unit: "kg",
    rating: 4.9,
    reviewCount: 31,
    badge: "In Season",
    status: "Draft",
    inventoryItemId: "66666666-0000-0000-0000-000000000001",
  },
  {
    slug: "raw-cashew-nuts",
    sku: "KLF-PRD-005",
    name: "Raw Cashew Nuts",
    categorySlug: "cashew-nuts-seeds",
    price: 28,
    unit: "kg",
    rating: 4.7,
    reviewCount: 74,
    status: "Active",
    inventoryItemId: "66666666-0000-0000-0000-000000000002",
  },
  {
    slug: "fresh-yams",
    sku: "KLF-PRD-006",
    name: "Fresh Yams",
    categorySlug: "yams",
    price: 8,
    unit: "tuber",
    rating: 4.9,
    reviewCount: 96,
    status: "Active",
  },
  {
    slug: "dried-maize",
    sku: "KLF-PRD-007",
    name: "Dried Maize",
    categorySlug: "maize-grains",
    price: 220,
    unit: "bag",
    rating: 4.6,
    reviewCount: 61,
    status: "Active",
    inventoryItemId: "66666666-0000-0000-0000-000000000004",
  },
];

export function getProductsByCategory(categorySlug: string): Product[] {
  return products.filter((p) => p.categorySlug === categorySlug);
}
