const STATUS_STYLES: Record<string, string> = {
  Active: "bg-[#E8F5E9] text-[#2E7D32]",
  Growing: "bg-[#E8F5E9] text-[#2E7D32]",
  Planted: "bg-[#E8F5E9] text-[#2E7D32]",
  Completed: "bg-[#E8F5E9] text-[#2E7D32]",
  "In Use": "bg-[#E8F5E9] text-[#2E7D32]",
  Approved: "bg-[#E8F5E9] text-[#2E7D32]",
  "Added to Inventory": "bg-[#E8F5E9] text-[#2E7D32]",
  Normal: "bg-[#E8F5E9] text-[#2E7D32]",
  Delivered: "bg-[#E8F5E9] text-[#2E7D32]",
  Paid: "bg-[#E8F5E9] text-[#2E7D32]",
  Ready: "bg-[#E8F5E9] text-[#2E7D32]",
  Operational: "bg-[#E8F5E9] text-[#2E7D32]",
  Published: "bg-[#E8F5E9] text-[#2E7D32]",

  Sick: "bg-[#FDECEA] text-[#C62828]",
  Deceased: "bg-[#FDECEA] text-[#C62828]",
  Rejected: "bg-[#FDECEA] text-[#C62828]",
  "Out of Stock": "bg-[#FDECEA] text-[#C62828]",
  Cancelled: "bg-[#FDECEA] text-[#C62828]",
  Refunded: "bg-[#FDECEA] text-[#C62828]",
  "Under Repair": "bg-[#FDECEA] text-[#C62828]",

  Pregnant: "bg-[#FDF3E3] text-[#B4801F]",
  Harvesting: "bg-[#FDF3E3] text-[#B4801F]",
  Planned: "bg-[#FDF3E3] text-[#B4801F]",
  Preparing: "bg-[#FDF3E3] text-[#B4801F]",
  Recorded: "bg-[#FDF3E3] text-[#B4801F]",
  Submitted: "bg-[#FDF3E3] text-[#B4801F]",
  "Under Review": "bg-[#FDF3E3] text-[#B4801F]",
  "Changes Requested": "bg-[#FDF3E3] text-[#B4801F]",
  "Low Stock": "bg-[#FDF3E3] text-[#B4801F]",
  Pending: "bg-[#FDF3E3] text-[#B4801F]",
  Processing: "bg-[#FDF3E3] text-[#B4801F]",
  Confirmed: "bg-[#FDF3E3] text-[#B4801F]",
  "Pending Payment": "bg-[#FDF3E3] text-[#B4801F]",
  Scheduled: "bg-[#FDF3E3] text-[#B4801F]",
  Draft: "bg-surface text-ink-soft",
  "Maintenance Due": "bg-[#FDF3E3] text-[#B4801F]",

  Quarantined: "bg-[#EAF1F8] text-[#2878A8]",
  Invited: "bg-[#EAF1F8] text-[#2878A8]",
  Sold: "bg-surface text-ink-soft",
  Fallow: "bg-surface text-ink-soft",
  Inactive: "bg-surface text-ink-soft",
};

export function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? "bg-surface text-ink-soft";
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${style}`}>
      {status}
    </span>
  );
}
