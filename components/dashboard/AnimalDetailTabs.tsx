"use client";

import { useState } from "react";
import type { Animal } from "@/lib/data/mock/animals";

const TABS = ["Overview", "Health & Events", "Timeline"] as const;
type Tab = (typeof TABS)[number];

const HEALTH_TYPES = new Set(["Health Check", "Treatment", "Vaccination", "Veterinary Visit"]);

export function AnimalDetailTabs({ animal }: { animal: Animal }) {
  const [tab, setTab] = useState<Tab>("Overview");
  const healthEvents = animal.events.filter((e) => HEALTH_TYPES.has(e.type));

  return (
    <div>
      <div className="flex gap-1 border-b border-border mb-6">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-3 text-sm font-bold border-b-2 -mb-px transition-colors ${
              tab === t ? "border-green text-green" : "border-transparent text-ink-soft hover:text-ink"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            ["Species", animal.species],
            ["Breed", animal.breed],
            ["Sex", animal.sex],
            ["Date of Birth", animal.dob],
            ["Age", animal.ageLabel],
            ["Current Weight", animal.weight],
            ["Location", animal.location],
            ["Status", animal.status],
          ].map(([label, value]) => (
            <div key={label} className="bg-white border border-border rounded-md p-4">
              <span className="text-[11px] font-bold text-ink-soft uppercase tracking-wide">{label}</span>
              <p className="text-sm font-bold mt-1">{value}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "Health & Events" && (
        <div className="bg-white border border-border rounded-md overflow-hidden">
          {healthEvents.length === 0 && (
            <p className="p-5 text-sm text-ink-soft">No health events recorded yet.</p>
          )}
          {healthEvents.map((e, i) => (
            <div key={i} className="flex gap-4 px-5 py-4 border-b border-border last:border-b-0">
              <span className="text-xs font-bold text-green w-24 flex-shrink-0">{e.date}</span>
              <div>
                <b className="text-sm block">{e.type}</b>
                <span className="text-xs text-ink-soft">{e.detail}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "Timeline" && (
        <div className="relative">
          {animal.events.map((e, i) => (
            <div key={i} className="flex gap-5 pb-7 relative">
              {i < animal.events.length - 1 && (
                <span className="absolute left-[7px] top-4 bottom-0 w-px bg-border" />
              )}
              <span className="w-4 h-4 rounded-full bg-green flex-shrink-0 mt-1 z-10 ring-4 ring-white" />
              <div>
                <div className="flex items-center gap-2.5">
                  <b className="text-sm">{e.type}</b>
                  <span className="text-xs text-ink-soft">{e.date}</span>
                </div>
                <p className="text-xs text-ink-soft mt-0.5">{e.detail}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
