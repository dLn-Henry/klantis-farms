export type VetReportStatus = "Submitted" | "Under Review" | "Approved" | "Rejected" | "Changes Requested";

export type VetReport = {
  id: string;
  code: string;
  animalTag: string;
  animalId: string;
  submittedBy: string;
  visitDate: string;
  reason: string;
  findings: string;
  diagnosis: string;
  treatmentPlan: string;
  status: VetReportStatus;
  reviewedBy?: string;
  reviewedAt?: string;
};

export const vetReports: VetReport[] = [
  {
    id: "vt-0042",
    code: "VT-0042",
    animalTag: "KLF-COW-0021",
    animalId: "klf-cow-0021",
    submittedBy: "Dr. Adjei",
    visitDate: "2026-08-13",
    reason: "Reported difficulty breathing, reduced appetite",
    findings: "Elevated respiratory rate, mild nasal discharge, temperature slightly above normal",
    diagnosis: "Suspected respiratory infection",
    treatmentPlan: "5-day course of antibiotics, isolate from herd, recheck in 3 days",
    status: "Under Review",
  },
  {
    id: "vt-0041",
    code: "VT-0041",
    animalTag: "KLF-COW-0012",
    animalId: "klf-cow-0012",
    submittedBy: "Dr. Adjei",
    visitDate: "2026-08-11",
    reason: "Routine pregnancy check",
    findings: "Pregnancy confirmed, approximately 3 months along, animal in good condition",
    diagnosis: "Healthy pregnancy",
    treatmentPlan: "Continue routine monitoring, no intervention needed",
    status: "Approved",
    reviewedBy: "Farm Manager",
    reviewedAt: "2026-08-11",
  },
  {
    id: "vt-0040",
    code: "VT-0040",
    animalTag: "KLF-COW-0028",
    animalId: "klf-cow-0028",
    submittedBy: "Dr. Adjei",
    visitDate: "2026-08-09",
    reason: "New arrival — quarantine assessment",
    findings: "No visible signs of illness, standard 14-day quarantine recommended before mixing with herd",
    diagnosis: "No concerns identified",
    treatmentPlan: "Quarantine period, recheck at day 14",
    status: "Approved",
    reviewedBy: "Farm Manager",
    reviewedAt: "2026-08-10",
  },
  {
    id: "vt-0039",
    code: "VT-0039",
    animalTag: "KLF-COW-0013",
    animalId: "klf-cow-0013",
    submittedBy: "Dr. Adjei",
    visitDate: "2026-07-30",
    reason: "Minor limp observed by farm staff",
    findings: "Slight swelling on rear left hoof, no signs of infection",
    diagnosis: "Minor hoof injury",
    treatmentPlan: "Topical treatment, monitor for 1 week",
    status: "Rejected",
    reviewedBy: "Farm Manager",
    reviewedAt: "2026-07-31",
  },
];
