import type { ReactNode } from "react";

export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <section className="border-b border-gt-gold/25 bg-white px-6 py-16 sm:px-8 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight text-gt-navy sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
          {description}
        </p>
        {children ? <div className="mt-8">{children}</div> : null}
      </div>
    </section>
  );
}
