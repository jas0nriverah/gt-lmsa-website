import type { ReactNode } from "react";

export function Section({
  id,
  eyebrow,
  title,
  description,
  children,
  className = "",
  align = "left",
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  align?: "center" | "left";
}) {
  const centered = align === "center";
  return (
    <section id={id} className={`section-shell ${className}`}>
      <div className="mx-auto max-w-6xl">
        <div className={`mb-10 max-w-3xl ${centered ? "mx-auto text-center" : ""}`}>
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          <h2 className="mt-3 text-3xl font-bold text-gt-navy sm:text-4xl">
            {title}
          </h2>
          {description ? (
            <p className="mt-4 text-lg leading-8 text-slate-600">{description}</p>
          ) : null}
        </div>
        {children}
      </div>
    </section>
  );
}
