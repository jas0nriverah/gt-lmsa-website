import type { ReactNode } from "react";

type SectionProps = {
  id: string;
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  align?: "center" | "left";
};

export function Section({
  id,
  eyebrow,
  title,
  description,
  children,
  className = "",
  align = "center",
}: SectionProps) {
  const isCenter = align === "center";

  return (
    <section id={id} className={`px-6 py-20 sm:px-8 lg:py-24 ${className}`}>
      <div className="mx-auto max-w-6xl">
        <div
          className={`mb-12 max-w-3xl ${
            isCenter ? "mx-auto text-center" : "text-left"
          }`}
        >
          {eyebrow ? (
            <div
              className={`mb-4 flex items-center gap-3 ${
                isCenter ? "justify-center" : ""
              }`}
            >
              <span className="h-px w-8 bg-gt-gold" />
              <span className="text-xs font-bold uppercase tracking-[0.28em] text-gt-dark-gold">
                {eyebrow}
              </span>
              <span className="h-px w-8 bg-gt-gold" />
            </div>
          ) : null}
          <h2 className="text-3xl font-bold tracking-tight text-gt-navy sm:text-4xl">
            {title}
          </h2>
          {description ? (
            <p className="mt-4 text-base leading-8 text-slate-600 sm:text-lg">
              {description}
            </p>
          ) : null}
        </div>
        {children}
      </div>
    </section>
  );
}
