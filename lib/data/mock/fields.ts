export type FieldStatus = "In Use" | "Fallow" | "Preparing";

export type FieldHistoryEntry = {
  season: string;
  crop: string;
  outcome: string;
};

export type Field = {
  id: string;
  code: string;
  name: string;
  area: string;
  soilType: string;
  irrigationType: string;
  currentCrop: string;
  status: FieldStatus;
  history: FieldHistoryEntry[];
};

export const fields: Field[] = [
  {
    id: "field-a",
    code: "FLD-A",
    name: "Field A",
    area: "5 acres",
    soilType: "Sandy loam",
    irrigationType: "Drip irrigation",
    currentCrop: "Maize (Obatanpa)",
    status: "In Use",
    history: [
      { season: "2026 Major", crop: "Maize", outcome: "In progress" },
      { season: "2025 Minor", crop: "Cassava", outcome: "3.1 tonnes harvested" },
      { season: "2025 Major", crop: "Maize", outcome: "2.8 tonnes harvested" },
    ],
  },
  {
    id: "field-b",
    code: "FLD-B",
    name: "Field B",
    area: "4 acres",
    soilType: "Clay loam",
    irrigationType: "Rain-fed",
    currentCrop: "Yam (Pona)",
    status: "In Use",
    history: [
      { season: "2026 Major", crop: "Yam", outcome: "In progress" },
      { season: "2025 Minor", crop: "Maize", outcome: "2.2 tonnes harvested" },
    ],
  },
  {
    id: "orchard-block-3",
    code: "ORC-3",
    name: "Orchard Block 3",
    area: "8 acres",
    soilType: "Loam",
    irrigationType: "Drip irrigation",
    currentCrop: "Mango (Keitt)",
    status: "In Use",
    history: [
      { season: "2026 Main", crop: "Mango", outcome: "Harvesting" },
      { season: "2025 Main", crop: "Mango", outcome: "4.6 tonnes harvested" },
    ],
  },
  {
    id: "cashew-grove",
    code: "CSH-1",
    name: "Cashew Grove",
    area: "6 acres",
    soilType: "Sandy loam",
    irrigationType: "Rain-fed",
    currentCrop: "Cashew (Local Improved)",
    status: "In Use",
    history: [
      { season: "2026 Main", crop: "Cashew", outcome: "In progress" },
      { season: "2025 Main", crop: "Cashew", outcome: "1.9 tonnes harvested" },
    ],
  },
  {
    id: "field-c",
    code: "FLD-C",
    name: "Field C",
    area: "3 acres",
    soilType: "Sandy loam",
    irrigationType: "Rain-fed",
    currentCrop: "—",
    status: "Fallow",
    history: [
      { season: "2025 Minor", crop: "Groundnut", outcome: "1.1 tonnes harvested" },
    ],
  },
];
