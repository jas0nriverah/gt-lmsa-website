export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-gt-gold bg-white p-8 text-center">
      <h3 className="text-xl font-bold text-gt-navy">{title}</h3>
      <p className="mx-auto mt-3 max-w-2xl leading-7 text-slate-600">
        {description}
      </p>
    </div>
  );
}
