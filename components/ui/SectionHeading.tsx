import Link from "next/link";
import { ArrowRight } from "lucide-react";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  linkHref?: string;
  linkLabel?: string;
  center?: boolean;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  linkHref,
  linkLabel,
  center = false,
}: SectionHeadingProps) {
  if (center) {
    return (
      <div className="text-center mb-9">
        <span className="eyebrow">{eyebrow}</span>
        <h2 className="text-3xl font-extrabold tracking-tight">{title}</h2>
        {description && (
          <p className="text-ink-soft text-[15px] max-w-xl mx-auto mt-2.5">
            {description}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-end justify-between mb-9">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2 className="text-3xl font-extrabold tracking-tight">{title}</h2>
        {description && (
          <p className="text-ink-soft text-[15px] max-w-xl mt-2.5">{description}</p>
        )}
      </div>
      {linkHref && linkLabel && (
        <Link href={linkHref} className="link-arrow flex-shrink-0">
          {linkLabel}
          <ArrowRight />
        </Link>
      )}
    </div>
  );
}
