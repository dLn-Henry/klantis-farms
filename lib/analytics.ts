import { getAllAnimals } from "@/lib/data/repositories/animals";
import { getAllCropCycles } from "@/lib/data/repositories/crop-cycles";
import { getAllHarvests } from "@/lib/data/repositories/harvests";
import { getAllInventoryItems } from "@/lib/data/repositories/inventory";
import { getInventoryStatus } from "@/lib/data/mock/inventory";
import { getAllOrders } from "@/lib/data/repositories/orders";
import { orderTotal } from "@/lib/data/mock/orders";

export async function getLivestockByStatus() {
  const animals = await getAllAnimals();
  const counts: Record<string, number> = {};
  for (const a of animals) counts[a.status] = (counts[a.status] ?? 0) + 1;
  return Object.entries(counts).map(([status, count]) => ({ status, count }));
}

export async function getCropYieldSummary() {
  const cycles = await getAllCropCycles();
  const harvests = await getAllHarvests();

  return cycles.map((cycle) => {
    const cycleHarvests = harvests.filter((h) => h.cropCycleId === cycle.id);
    const harvestedCount = cycleHarvests.length;
    return {
      crop: cycle.crop,
      field: cycle.field,
      status: cycle.status,
      harvestedCount,
    };
  });
}

export async function getInventoryStatusSummary() {
  const items = await getAllInventoryItems();
  const counts: Record<string, number> = { Normal: 0, "Low Stock": 0, "Out of Stock": 0 };
  for (const item of items) {
    const status = getInventoryStatus(item);
    counts[status] = (counts[status] ?? 0) + 1;
  }
  return Object.entries(counts).map(([status, count]) => ({ status, count }));
}

export async function getSalesByProduct() {
  const orders = await getAllOrders();
  const totals: Record<string, number> = {};
  for (const order of orders) {
    if (order.status === "Cancelled") continue;
    for (const item of order.items) {
      totals[item.name] = (totals[item.name] ?? 0) + item.quantity * item.unitPrice;
    }
  }
  return Object.entries(totals)
    .map(([product, revenue]) => ({ product, revenue }))
    .sort((a, b) => b.revenue - a.revenue);
}

export async function getOrdersByStatus() {
  const orders = await getAllOrders();
  const counts: Record<string, number> = {};
  for (const o of orders) counts[o.status] = (counts[o.status] ?? 0) + 1;
  return Object.entries(counts).map(([status, count]) => ({ status, count }));
}

export async function getTotalOrderRevenue() {
  const orders = await getAllOrders();
  return orders.filter((o) => o.status !== "Cancelled").reduce((sum, o) => sum + orderTotal(o), 0);
}
