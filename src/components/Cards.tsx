type ImpactCardProps = {
  index: number;
  title: string;
  description: string;
};

export function ImpactCard({ index, title, description }: ImpactCardProps) {
  return (
    <article className="group rounded-3xl border border-gt-gold/25 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gt-navy text-sm font-bold text-white shadow-sm">
        {String(index).padStart(2, "0")}
      </div>
      <h3 className="text-xl font-bold text-gt-navy">{title}</h3>
      <p className="mt-3 leading-7 text-slate-700">{description}</p>
    </article>
  );
}

type EventCardProps = {
  date: string;
  title: string;
  time: string;
  location: string;
  description: string;
};

export function EventCard({
  date,
  title,
  time,
  location,
  description,
}: EventCardProps) {
  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-5 border-b border-slate-100 bg-gt-cream p-5">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gt-navy text-center text-sm font-bold uppercase tracking-wide text-white">
          {date}
        </div>
        <div>
          <h3 className="text-lg font-bold text-gt-navy">{title}</h3>
          <p className="mt-1 text-sm font-semibold text-gt-dark-gold">
            {time} | {location}
          </p>
        </div>
      </div>
      <p className="p-5 leading-7 text-slate-700">{description}</p>
    </article>
  );
}

type BoardCardProps = {
  name: string;
  role: string;
  focus: string;
};

export function BoardCard({ name, role, focus }: BoardCardProps) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gt-cream text-xl font-bold text-gt-navy ring-1 ring-gt-gold/40">
        {role
          .split(" ")
          .map((word) => word[0])
          .join("")
          .slice(0, 2)}
      </div>
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-gt-dark-gold">
        {role}
      </p>
      <h3 className="mt-2 text-xl font-bold text-gt-navy">{name}</h3>
      <p className="mt-3 leading-7 text-slate-700">{focus}</p>
    </article>
  );
}

type ResourceCardProps = {
  title: string;
  description: string;
  href: string;
};

export function ResourceCard({ title, description, href }: ResourceCardProps) {
  return (
    <a
      href={href}
      className="block rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-gt-gold hover:shadow-xl"
    >
      <h3 className="text-xl font-bold text-gt-navy">{title}</h3>
      <p className="mt-3 leading-7 text-slate-700">{description}</p>
      <span className="mt-5 inline-flex text-sm font-bold text-gt-dark-gold">
        Learn more
      </span>
    </a>
  );
}
