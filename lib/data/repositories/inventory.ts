import { createClient } from "@/lib/supabase/server";
import type { InventoryItem, InventoryTransaction } from "@/lib/data/mock/inventory";

// ============================================================================
// Real queries replacing the mock array. Note: inventory_items.quantity is
// NOT set directly anywhere in the app — it's kept in sync by the
// apply_inventory_transaction trigger (migration 0003) whenever a row is
// inserted into inventory_transactions. This repository just reads the
// current (correct) cached value plus the full ledger for the detail view.
// ============================================================================

type InventoryItemRow = {
  id: string;
  sku: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  reorder_level: number;
  location: string | null;
};

type TransactionRow = {
  inventory_item_id: string;
  transaction_date: string;
  transaction_type: string;
  quantity_change: number;
  reference: string | null;
};

async function getTransactionsMap(
  itemIds: string[],
  unitByItem: Map<string, string>
): Promise<Map<string, InventoryTransaction[]>> {
  const map = new Map<string, InventoryTransaction[]>();
  if (itemIds.length === 0) return map;

  const supabase = createClient();
  const { data } = await supabase
    .from("inventory_transactions")
    .select("inventory_item_id, transaction_date, transaction_type, quantity_change, reference")
    .in("inventory_item_id", itemIds)
    .order("transaction_date", { ascending: false });

  for (const row of (data ?? []) as TransactionRow[]) {
    const unit = unitByItem.get(row.inventory_item_id) ?? "";
    const sign = row.quantity_change >= 0 ? "+" : "";
    const list = map.get(row.inventory_item_id) ?? [];
    list.push({
      date: row.transaction_date,
      type: row.transaction_type as InventoryTransaction["type"],
      quantityChange: `${sign}${row.quantity_change} ${unit}`.trim(),
      reference: row.reference ?? "",
    });
    map.set(row.inventory_item_id, list);
  }
  return map;
}

function mapItemRow(row: InventoryItemRow, transactions: InventoryTransaction[]): InventoryItem {
  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    category: row.category as InventoryItem["category"],
    quantity: row.quantity,
    unit: row.unit,
    reorderLevel: row.reorder_level,
    location: row.location ?? "—",
    transactions,
  };
}

export async function getAllInventoryItems(): Promise<InventoryItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("inventory_items")
    .select("id, sku, name, category, quantity, unit, reorder_level, location")
    .order("name");

  if (error) throw error;
  const rows = (data ?? []) as InventoryItemRow[];
  const unitByItem = new Map(rows.map((r) => [r.id, r.unit]));
  const transactionsMap = await getTransactionsMap(rows.map((r) => r.id), unitByItem);
  return rows.map((row) => mapItemRow(row, transactionsMap.get(row.id) ?? []));
}

export async function getInventoryItemById(id: string): Promise<InventoryItem | undefined> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("inventory_items")
    .select("id, sku, name, category, quantity, unit, reorder_level, location")
    .eq("id", id)
    .single();

  if (error || !data) return undefined;
  const unitByItem = new Map([[data.id, data.unit]]);
  const transactionsMap = await getTransactionsMap([id], unitByItem);
  return mapItemRow(data, transactionsMap.get(id) ?? []);
}
