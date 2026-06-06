import type { ReactNode } from "react";

type SectionProps = {
  id: string;
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function Section({
  id,
  eyebrow,
  title,
  description,
  children,
  className = "",
}: SectionProps) {
  return (
    <section id={id} className={`px-6 py-20 sm:px-8 ${className}`}>
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          {eyebrow ? (
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.24em] text-gt-dark-gold">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-3xl font-bold tracking-tight text-gt-navy sm:text-4xl">
            {title}
          </h2>
          {description ? (
            <p className="mt-4 text-base leading-7 text-slate-700 sm:text-lg">
              {description}
            </p>
          ) : null}
        </div>
        {children}
      </div>
    </section>
  );
}
