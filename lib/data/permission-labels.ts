// Human wording for permission keys ("finance.view" -> "Finance: view").
// Purely presentational: what is *enforced* is the role_permissions table.
export const MODULE_LABELS: Record<string, string> = {
  livestock: "Livestock", crops: "Crops", fields: "Fields", harvests: "Harvests",
  veterinary: "Veterinary", inventory: "Inventory", equipment: "Equipment",
  suppliers: "Suppliers", tasks: "Tasks", customers: "Customers", orders: "Orders",
  products: "Products", finance: "Finance", content: "Blog & content", media: "Media library",
  settings: "Settings", team: "Team", audit: "Audit log", reports: "Reports",
};

export const ACTION_LABELS: Record<string, string> = {
  view: "view", create: "create", edit: "edit", delete: "delete",
  approve: "approve", review: "review & approve", adjust: "adjust stock", complete: "complete assigned",
  publish: "publish", view_contact: "see emails", assign_roles: "assign roles",
  operations: "operations", financial: "financial", sales: "sales",
};

export function summarizePermissions(keys: string[]): { module: string; actions: string[] }[] {
  const byModule = new Map<string, string[]>();
  for (const k of keys) {
    const [m, a] = k.split(".");
    if (!byModule.has(m)) byModule.set(m, []);
    byModule.get(m)!.push(ACTION_LABELS[a] ?? a);
  }
  return Array.from(byModule.entries())
    .map(([m, actions]) => ({ module: MODULE_LABELS[m] ?? m, actions }))
    .sort((a, b) => a.module.localeCompare(b.module));
}
