import { products, getProductsByCategory, type Product } from "@/lib/data/mock/products";

export async function getAllProducts(): Promise<Product[]> {
  return products;
}

export async function getProductsInCategory(categorySlug: string): Promise<Product[]> {
  return getProductsByCategory(categorySlug);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  return products.find((p) => p.slug === slug);
}
