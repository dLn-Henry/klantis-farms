// Permission-key constants safe to import from client components
// (lib/auth/access.ts pulls in server-only code).
export const REPORT_PERMISSIONS = ["reports.operations", "reports.financial", "reports.sales"] as const;
