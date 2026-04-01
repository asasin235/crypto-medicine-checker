import type { ReactNode } from "react";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  stats: Array<{ label: string; value: string }>;
  children?: ReactNode;
};

export function PageHero({
  eyebrow,
  title,
  description,
  stats,
  children,
}: PageHeroProps) {
  return (
    <section className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="rounded-2xl bg-secondary p-8 text-ink">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">{eyebrow}</p>
          <h1 className="mt-4 max-w-xl text-4xl font-semibold leading-tight">{title}</h1>
          <p className="mt-4 max-w-2xl text-base text-ink-muted">{description}</p>
          {children ? <div className="mt-6">{children}</div> : null}
        </div>

        <div className="grid gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-border bg-white p-6 shadow-card"
            >
              <p className="text-sm text-ink-muted">{stat.label}</p>
              <p className="mt-3 text-3xl font-semibold text-ink">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
