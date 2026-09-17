export type HarvestStatus = "Recorded" | "Approved" | "Added to Inventory";

export type Harvest = {
  id: string;
  code: string;
  crop: string;
  field: string;
  cropCycleId: string;
  date: string;
  quantity: string;
  qualityGrade: string;
  destination: string;
  recordedBy: string;
  status: HarvestStatus;
};

export const harvests: Harvest[] = [
  {
    id: "har-2026-031",
    code: "HAR-2026-031",
    crop: "Mango",
    field: "Orchard Block 3",
    cropCycleId: "klf-crp-2026-001",
    date: "2026-08-20",
    quantity: "180 kg",
    qualityGrade: "Grade A",
    destination: "Product Storage",
    recordedBy: "Farm Manager",
    status: "Added to Inventory",
  },
  {
    id: "har-2026-030",
    code: "HAR-2026-030",
    crop: "Mango",
    field: "Orchard Block 3",
    cropCycleId: "klf-crp-2026-001",
    date: "2026-08-06",
    quantity: "142 kg",
    qualityGrade: "Grade A",
    destination: "Product Storage",
    recordedBy: "Farm Manager",
    status: "Added to Inventory",
  },
  {
    id: "har-2026-029",
    code: "HAR-2026-029",
    crop: "Cashew",
    field: "Cashew Grove",
    cropCycleId: "klf-crp-2026-002",
    date: "2026-07-28",
    quantity: "95 kg",
    qualityGrade: "Grade B",
    destination: "Processing Area",
    recordedBy: "Farm Manager",
    status: "Approved",
  },
  {
    id: "har-2026-028",
    code: "HAR-2026-028",
    crop: "Maize",
    field: "Field A",
    cropCycleId: "klf-crp-2026-004",
    date: "2026-07-15",
    quantity: "1.2 tonnes",
    qualityGrade: "Grade A",
    destination: "Warehouse A",
    recordedBy: "Farm Manager",
    status: "Recorded",
  },
];
