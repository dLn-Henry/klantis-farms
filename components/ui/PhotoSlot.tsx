import { ImageIcon } from "lucide-react";

type PhotoSlotProps = {
  label: string;
  className?: string;
};

/**
 * Stands in for real photography wherever we don't have it yet.
 * Swap for a real <Image> once photos exist — the label tells whoever
 * is wiring up assets exactly what should go here.
 */
export function PhotoSlot({ label, className = "" }: PhotoSlotProps) {
  return (
    <div className={`photo-slot ${className}`}>
      <ImageIcon strokeWidth={1.5} />
      <span>{label}</span>
    </div>
  );
}
