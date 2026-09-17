export type InventoryCategory = "Produce" | "Input" | "Packaging" | "Equipment";
export type InventoryStatus = "Normal" | "Low Stock" | "Out of Stock";

export type InventoryTransaction = {
  date: string;
  type: "Purchase" | "Harvest" | "Consumption" | "Sale" | "Adjustment";
  quantityChange: string; // signed, e.g. "+180 kg" or "-45 kg"
  reference: string;
};

export type InventoryItem = {
  id: string;
  sku: string;
  name: string;
  category: InventoryCategory;
  quantity: number;
  unit: string;
  reorderLevel: number;
  location: string;
  transactions: InventoryTransaction[];
};

export const inventoryItems: InventoryItem[] = [
  {
    id: "inv-fresh-mangoes",
    sku: "KLF-INV-0041",
    name: "Fresh Mangoes",
    category: "Produce",
    quantity: 322,
    unit: "kg",
    reorderLevel: 50,
    location: "Product Storage",
    transactions: [
      { date: "2026-08-20", type: "Harvest", quantityChange: "+180 kg", reference: "HAR-2026-031" },
      { date: "2026-08-06", type: "Harvest", quantityChange: "+142 kg", reference: "HAR-2026-030" },
      { date: "2026-08-18", type: "Sale", quantityChange: "-64 kg", reference: "Orders KF-1042 – KF-1058" },
    ],
  },
  {
    id: "inv-raw-cashew",
    sku: "KLF-INV-0038",
    name: "Raw Cashew Nuts",
    category: "Produce",
    quantity: 95,
    unit: "kg",
    reorderLevel: 40,
    location: "Processing Area",
    transactions: [
      { date: "2026-07-28", type: "Harvest", quantityChange: "+95 kg", reference: "HAR-2026-029" },
    ],
  },
  {
    id: "inv-dried-maize",
    sku: "KLF-INV-0022",
    name: "Dried Maize",
    category: "Produce",
    quantity: 1200,
    unit: "kg",
    reorderLevel: 300,
    location: "Warehouse A",
    transactions: [
      { date: "2026-07-15", type: "Harvest", quantityChange: "+1,200 kg", reference: "HAR-2026-028" },
    ],
  },
  {
    id: "inv-cattle-feed",
    sku: "KLF-INV-0009",
    name: "Cattle Feed",
    category: "Input",
    quantity: 85,
    unit: "kg",
    reorderLevel: 150,
    location: "Warehouse A",
    transactions: [
      { date: "2026-08-19", type: "Consumption", quantityChange: "-45 kg", reference: "Daily feeding — Livestock Unit" },
      { date: "2026-08-12", type: "Consumption", quantityChange: "-45 kg", reference: "Daily feeding — Livestock Unit" },
      { date: "2026-08-01", type: "Purchase", quantityChange: "+500 kg", reference: "Supplier: Eastern Feed Co." },
    ],
  },
  {
    id: "inv-fertilizer",
    sku: "KLF-INV-0015",
    name: "NPK Fertilizer",
    category: "Input",
    quantity: 210,
    unit: "kg",
    reorderLevel: 100,
    location: "Feed Store",
    transactions: [
      { date: "2026-05-02", type: "Consumption", quantityChange: "-90 kg", reference: "Applied — Orchard Block 3" },
      { date: "2026-04-15", type: "Purchase", quantityChange: "+300 kg", reference: "Supplier: Ghana AgroChem" },
    ],
  },
  {
    id: "inv-packaging-crates",
    sku: "KLF-INV-0051",
    name: "Produce Crates",
    category: "Packaging",
    quantity: 40,
    unit: "pieces",
    reorderLevel: 50,
    location: "Warehouse A",
    transactions: [
      { date: "2026-08-15", type: "Consumption", quantityChange: "-20 pieces", reference: "Mango packaging" },
      { date: "2026-07-01", type: "Purchase", quantityChange: "+100 pieces", reference: "Supplier: Accra Packaging Ltd." },
    ],
  },
];

export function getInventoryStatus(item: InventoryItem): InventoryStatus {
  if (item.quantity <= 0) return "Out of Stock";
  if (item.quantity <= item.reorderLevel) return "Low Stock";
  return "Normal";
}
