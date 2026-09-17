export type SupplierCategory = "Feed" | "Fertilizer" | "Equipment" | "Packaging" | "Veterinary Supplies";
export type SupplierStatus = "Active" | "Inactive";

export type SupplierPurchase = {
  date: string;
  item: string;
  amount: number;
};

export type Supplier = {
  id: string;
  code: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  category: SupplierCategory;
  paymentTerms: string;
  status: SupplierStatus;
  recentPurchases: SupplierPurchase[];
};

export const suppliers: Supplier[] = [
  {
    id: "sup-eastern-feed",
    code: "SUP-001",
    name: "Eastern Feed Co.",
    contactPerson: "Emmanuel Osei",
    phone: "+233 24 555 7712",
    email: "sales@easternfeed.example.com",
    category: "Feed",
    paymentTerms: "Net 30",
    status: "Active",
    recentPurchases: [
      { date: "2026-08-01", item: "Cattle Feed — 500kg", amount: 2100 },
      { date: "2026-06-10", item: "Cattle Feed — 500kg", amount: 2050 },
    ],
  },
  {
    id: "sup-ghana-agrochem",
    code: "SUP-002",
    name: "Ghana AgroChem",
    contactPerson: "Comfort Amoah",
    phone: "+233 20 555 3341",
    email: "orders@ghanaagrochem.example.com",
    category: "Fertilizer",
    paymentTerms: "Net 14",
    status: "Active",
    recentPurchases: [
      { date: "2026-04-15", item: "NPK Fertilizer — 300kg", amount: 1650 },
    ],
  },
  {
    id: "sup-accra-packaging",
    code: "SUP-003",
    name: "Accra Packaging Ltd.",
    contactPerson: "Kojo Frimpong",
    phone: "+233 26 555 9087",
    email: "info@accrapackaging.example.com",
    category: "Packaging",
    paymentTerms: "Net 30",
    status: "Active",
    recentPurchases: [
      { date: "2026-07-01", item: "Produce Crates — 100 pieces", amount: 850 },
    ],
  },
  {
    id: "sup-koforidua-vet",
    code: "SUP-004",
    name: "Koforidua Veterinary Supplies",
    contactPerson: "Dr. Yaa Asantewaa",
    phone: "+233 27 555 2298",
    email: "supply@koforiduavet.example.com",
    category: "Veterinary Supplies",
    paymentTerms: "Net 14",
    status: "Inactive",
    recentPurchases: [
      { date: "2026-02-20", item: "Vaccination supplies", amount: 640 },
    ],
  },
];
