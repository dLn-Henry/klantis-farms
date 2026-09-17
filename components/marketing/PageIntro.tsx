import Link from "next/link";

type Crumb = { label: string; href?: string };

type PageIntroProps = {
  title: string;
  description?: string;
  breadcrumbs?: Crumb[];
};

export function PageIntro({ title, description, breadcrumbs = [] }: PageIntroProps) {
  return (
    <div className="bg-mist border-b border-border py-11">
      <div className="max-w-[1280px] mx-auto px-10">
        {breadcrumbs.length > 0 && (
          <div className="breadcrumb">
            {breadcrumbs.map((c, i) => (
              <span key={i}>
                {c.href ? <Link href={c.href}>{c.label}</Link> : <span>{c.label}</span>}
                {i < breadcrumbs.length - 1 && <span className="sep">/</span>}
              </span>
            ))}
          </div>
        )}
        <h1 className="text-4xl font-extrabold tracking-tight">{title}</h1>
        {description && (
          <p className="text-ink-soft text-[15px] max-w-xl mt-2.5">{description}</p>
        )}
      </div>
    </div>
  );
}
