import type { FAQ } from "@/lib/site-types";

export function FAQList({ items }: { items: FAQ[] }) {
  return (
    <div className="divide-y divide-slate-200 overflow-hidden rounded-3xl border border-slate-200 bg-white">
      {items.map((item) => (
        <details key={item.question} className="group p-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-5 font-bold text-gt-navy marker:content-none">
            <span>{item.question}</span>
            <span
              aria-hidden="true"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gt-cream text-xl transition group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <p className="mt-4 max-w-4xl leading-7 text-slate-600">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
