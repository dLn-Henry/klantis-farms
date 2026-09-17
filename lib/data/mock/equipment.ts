export type EquipmentStatus = "Operational" | "Maintenance Due" | "Under Repair";

export type MaintenanceRecord = {
  date: string;
  type: string;
  cost: number;
  notes: string;
};

export type Equipment = {
  id: string;
  code: string;
  name: string;
  category: string;
  manufacturer: string;
  model: string;
  purchaseDate: string;
  condition: "Good" | "Fair" | "Needs Repair";
  location: string;
  status: EquipmentStatus;
  maintenance: MaintenanceRecord[];
};

export const equipment: Equipment[] = [
  {
    id: "eq-tractor-01",
    code: "TR-001",
    name: "Tractor",
    category: "Tractor",
    manufacturer: "Massey Ferguson",
    model: "MF 240",
    purchaseDate: "2022-03-01",
    condition: "Good",
    location: "Equipment Shed",
    status: "Operational",
    maintenance: [
      { date: "2026-06-12", type: "Routine Service", cost: 450, notes: "Oil change, filter replacement" },
      { date: "2026-02-20", type: "Repair", cost: 820, notes: "Hydraulic hose replacement" },
    ],
  },
  {
    id: "eq-water-pump-01",
    code: "PMP-001",
    name: "Irrigation Pump",
    category: "Pump",
    manufacturer: "Honda",
    model: "WB30XT",
    purchaseDate: "2023-05-14",
    condition: "Fair",
    location: "Orchard Block 3",
    status: "Maintenance Due",
    maintenance: [
      { date: "2026-01-10", type: "Routine Service", cost: 180, notes: "Standard maintenance" },
    ],
  },
  {
    id: "eq-generator-01",
    code: "GEN-001",
    name: "Generator",
    category: "Generator",
    manufacturer: "Mikano",
    model: "MK-15",
    purchaseDate: "2021-11-02",
    condition: "Needs Repair",
    location: "Warehouse A",
    status: "Under Repair",
    maintenance: [
      { date: "2026-08-10", type: "Repair", cost: 0, notes: "Diagnosed — awaiting replacement part" },
      { date: "2025-09-15", type: "Routine Service", cost: 220, notes: "Standard service" },
    ],
  },
  {
    id: "eq-sprayer-01",
    code: "SPR-001",
    name: "Boom Sprayer",
    category: "Sprayer",
    manufacturer: "Jacto",
    model: "PJH-400",
    purchaseDate: "2024-01-20",
    condition: "Good",
    location: "Equipment Shed",
    status: "Operational",
    maintenance: [],
  },
];
