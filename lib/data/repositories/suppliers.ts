import { suppliers, type Supplier } from "@/lib/data/mock/suppliers";

export async function getAllSuppliers(): Promise<Supplier[]> {
  return suppliers;
}

export async function getSupplierById(id: string): Promise<Supplier | undefined> {
  return suppliers.find((s) => s.id === id);
}
