export type CropStatus = "Planned" | "Planted" | "Growing" | "Harvesting" | "Completed";

export type CropEvent = {
  date: string;
  type: string;
  detail: string;
};

export type CropCycle = {
  id: string;
  code: string;
  crop: string;
  variety: string;
  field: string;
  season: string;
  plantingDate: string;
  expectedHarvest: string;
  area: string;
  status: CropStatus;
  events: CropEvent[];
};

export const cropCycles: CropCycle[] = [
  {
    id: "klf-crp-2026-001",
    code: "KLF-CRP-2026-001",
    crop: "Mango",
    variety: "Keitt",
    field: "Orchard Block 3",
    season: "2026 Main Season",
    plantingDate: "Established orchard",
    expectedHarvest: "2026-09-15",
    area: "8 acres",
    status: "Harvesting",
    events: [
      { date: "2026-08-20", type: "Harvest", detail: "First harvest pass — 180kg collected" },
      { date: "2026-07-10", type: "Irrigation", detail: "Irrigation cycle completed" },
      { date: "2026-05-02", type: "Fertilization", detail: "Fertilizer applied — Block 3" },
    ],
  },
  {
    id: "klf-crp-2026-002",
    code: "KLF-CRP-2026-002",
    crop: "Cashew",
    variety: "Local Improved",
    field: "Cashew Grove",
    season: "2026 Main Season",
    plantingDate: "Established grove",
    expectedHarvest: "2026-10-01",
    area: "6 acres",
    status: "Growing",
    events: [
      { date: "2026-08-01", type: "Inspection", detail: "Pest inspection — no issues found" },
    ],
  },
  {
    id: "klf-crp-2026-003",
    code: "KLF-CRP-2026-003",
    crop: "Yam",
    variety: "Pona",
    field: "Field B",
    season: "2026 Major Season",
    plantingDate: "2026-04-12",
    expectedHarvest: "2026-11-20",
    area: "4 acres",
    status: "Growing",
    events: [
      { date: "2026-08-15", type: "Weeding", detail: "Field B weeding completed" },
      { date: "2026-04-12", type: "Planting", detail: "Yam planted — Field B" },
    ],
  },
  {
    id: "klf-crp-2026-004",
    code: "KLF-CRP-2026-004",
    crop: "Maize",
    variety: "Obatanpa",
    field: "Field A",
    season: "2026 Major Season",
    plantingDate: "2026-05-01",
    expectedHarvest: "2026-09-05",
    area: "5 acres",
    status: "Planted",
    events: [
      { date: "2026-05-01", type: "Planting", detail: "Maize planted — Field A" },
    ],
  },
];
