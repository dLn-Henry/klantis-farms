import { equipment, type Equipment } from "@/lib/data/mock/equipment";

export async function getAllEquipment(): Promise<Equipment[]> {
  return equipment;
}

export async function getEquipmentById(id: string): Promise<Equipment | undefined> {
  return equipment.find((e) => e.id === id);
}
