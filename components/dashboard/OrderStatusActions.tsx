"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ArrowRight, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { OrderStatus } from "@/lib/data/mock/orders";
import { updateOrderStatus } from "@/lib/actions/orders";

const FLOW: OrderStatus[] = ["Pending", "Confirmed", "Processing", "Ready", "Delivered"];

export function OrderStatusActions({ orderId, initialStatus }: { orderId: string; initialStatus: OrderStatus }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<OrderStatus>(initialStatus);

  const isCancelled = status === "Cancelled";
  const currentIndex = FLOW.indexOf(status);
  const nextStatus = !isCancelled && currentIndex < FLOW.length - 1 ? FLOW[currentIndex + 1] : null;

  function handleUpdate(next: OrderStatus) {
    setError(null);
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, next);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setStatus(next);
      router.refresh();
    });
  }

  return (
    <div className="bg-white border border-border rounded-md p-5">
      <h3 className="text-sm font-extrabold uppercase tracking-wide mb-5">Fulfillment Status</h3>

      {error && (
        <div className="flex items-center gap-2.5 bg-[#FDEDED] border border-[#F3C6C6] rounded-md px-3.5 py-3 mb-5">
          <AlertCircle size={16} className="stroke-[#C62828] flex-shrink-0" />
          <span className="text-xs font-semibold text-[#C62828]">{error}</span>
        </div>
      )}

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
            <button disabled={isPending} onClick={() => handleUpdate(nextStatus)} className="btn-solid disabled:opacity-60 disabled:cursor-not-allowed">
              {isPending ? <Loader2 size={15} className="animate-spin" /> : <>Mark as {nextStatus} <ArrowRight size={15} /></>}
            </button>
          )}
          {status !== "Delivered" && !isCancelled && (
            <button
              disabled={isPending}
              onClick={() => handleUpdate("Cancelled")}
              className="inline-flex items-center gap-2 text-sm font-bold px-6 py-3.5 rounded-sm border border-border text-ink hover:border-[#C62828] hover:text-[#C62828] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <XCircle size={15} /> Cancel Order
            </button>
          )}
        </div>
      )}
    </div>
  );
}
