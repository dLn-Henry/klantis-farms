"use client";

import { useState } from "react";
import { CheckCircle2, ArrowRight, XCircle } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { OrderStatus } from "@/lib/data/mock/orders";

const FLOW: OrderStatus[] = ["Pending", "Confirmed", "Processing", "Ready", "Delivered"];

export function OrderStatusActions({ initialStatus }: { initialStatus: OrderStatus }) {
  const [status, setStatus] = useState<OrderStatus>(initialStatus);
  const isCancelled = status === "Cancelled";
  const currentIndex = FLOW.indexOf(status);
  const nextStatus = !isCancelled && currentIndex < FLOW.length - 1 ? FLOW[currentIndex + 1] : null;

  return (
    <div className="bg-white border border-border rounded-md p-5">
      <h3 className="text-sm font-extrabold uppercase tracking-wide mb-5">Fulfillment Status</h3>

      {isCancelled ? (
        <div className="flex items-center gap-2.5 text-[#C62828] text-sm font-semibold mb-5">
          <XCircle size={18} /> This order was cancelled.
        </div>
      ) : (
        <div className="flex items-center mb-6">
          {FLOW.map((step, i) => (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${
                    i <= currentIndex ? "bg-green text-white" : "bg-surface border border-border text-ink-soft"
                  }`}
                >
                  {i <= currentIndex ? <CheckCircle2 size={14} /> : i + 1}
                </span>
                <span className={`text-[10.5px] font-semibold text-center ${i <= currentIndex ? "text-ink" : "text-ink-soft"}`}>
                  {step}
                </span>
              </div>
              {i < FLOW.length - 1 && (
                <span className={`flex-1 h-0.5 mx-1.5 -mt-4 ${i < currentIndex ? "bg-green" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3">
        <span className="text-xs text-ink-soft font-semibold">Current status:</span>
        <StatusBadge status={status} />
      </div>

      {(nextStatus || !isCancelled) && (
        <div className="flex flex-wrap gap-3 mt-5">
          {nextStatus && (
            <button onClick={() => setStatus(nextStatus)} className="btn-solid">
              Mark as {nextStatus} <ArrowRight size={15} />
            </button>
          )}
          {status !== "Delivered" && !isCancelled && (
            <button
              onClick={() => setStatus("Cancelled")}
              className="inline-flex items-center gap-2 text-sm font-bold px-6 py-3.5 rounded-sm border border-border text-ink hover:border-[#C62828] hover:text-[#C62828]"
            >
              <XCircle size={15} /> Cancel Order
            </button>
          )}
        </div>
      )}
    </div>
  );
}
