// Reusable card components used across the site.
// You normally won't need to edit this file — update content in
// src/lib/site-data.ts instead. This file controls how cards look.

type ImpactCardProps = {
  index: number;
  title: string;
  description: string;
};

export function ImpactCard({ index, title, description }: ImpactCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-gt-gold/60 hover:shadow-xl">
      <div className="absolute right-0 top-0 h-20 w-20 -translate-y-8 translate-x-8 rounded-full bg-gt-gold/10 transition group-hover:bg-gt-gold/20" />
      <div className="relative mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gt-navy text-sm font-bold text-white shadow-md shadow-gt-navy/20">
        {String(index).padStart(2, "0")}
      </div>
      <h3 className="relative text-xl font-bold text-gt-navy">{title}</h3>
      <p className="relative mt-3 leading-7 text-slate-600">{description}</p>
    </article>
  );
}

type EventCardProps = {
  date: string;
  tag?: string;
  title: string;
  time: string;
  location: string;
  description: string;
};

export function EventCard({
  date,
  tag,
  title,
  time,
  location,
  description,
}: EventCardProps) {
  // "Sep 12" -> month "Sep", day "12" for a clean calendar-style block.
  const [month, day] = date.split(" ");

  return (
    <article className="group flex gap-5 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-gt-gold/60 hover:shadow-xl sm:p-6">
      <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-2xl bg-gt-navy text-white shadow-md shadow-gt-navy/20">
        <span className="text-xs font-bold uppercase tracking-widest text-gt-gold">
          {month}
        </span>
        <span className="text-2xl font-black leading-none">{day}</span>
      </div>
      <div className="min-w-0">
        {tag ? (
          <span className="inline-flex rounded-full bg-gt-cream px-3 py-1 text-xs font-bold uppercase tracking-wide text-gt-dark-gold ring-1 ring-gt-gold/30">
            {tag}
          </span>
        ) : null}
        <h3 className="mt-2 text-lg font-bold text-gt-navy">{title}</h3>
        <p className="mt-1 text-sm font-semibold text-slate-500">
          {time} &middot; {location}
        </p>
        <p className="mt-3 leading-7 text-slate-600">{description}</p>
      </div>
    </article>
  );
}

type BoardCardProps = {
  name: string;
  role: string;
  focus: string;
  email?: string;
};

export function BoardCard({ name, role, focus, email }: BoardCardProps) {
  const initials = role
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2);

  return (
    <article className="flex h-full flex-col rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gt-navy to-gt-navy-deep text-xl font-black text-gt-gold shadow-md shadow-gt-navy/20">
        {initials}
      </div>
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-gt-dark-gold">
        {role}
      </p>
      <h3 className="mt-2 text-xl font-bold text-gt-navy">{name}</h3>
      <p className="mt-3 flex-1 leading-7 text-slate-600">{focus}</p>
      {email ? (
        <a
          href={`mailto:${email}`}
          className="mt-4 inline-flex text-sm font-bold text-gt-dark-gold hover:text-gt-navy"
        >
          {email}
        </a>
      ) : null}
    </article>
  );
}

type ResourceCardProps = {
  title: string;
  description: string;
  href: string;
};

export function ResourceCard({ title, description, href }: ResourceCardProps) {
  const isExternal = href.startsWith("http");

  return (
    <a
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="group flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-gt-gold/60 hover:shadow-lg"
    >
      <h3 className="text-lg font-bold text-gt-navy group-hover:text-gt-dark-gold">
        {title}
      </h3>
      <p className="mt-2 flex-1 leading-7 text-slate-600">{description}</p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-gt-dark-gold">
        {isExternal ? "Visit resource" : "Learn more"}
        <span aria-hidden="true" className="transition group-hover:translate-x-1">
          &rarr;
        </span>
      </span>
    </a>
  );
}
