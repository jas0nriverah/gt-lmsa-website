import Image from "next/image";
import type {
  BoardMember,
  ChapterEvent,
  Program,
  Resource,
  ScholarshipOpportunity,
} from "@/lib/site-types";
import { StatusBadge } from "./StatusBadge";

export function ValueCard({
  index,
  title,
  description,
}: {
  index: number;
  title: string;
  description: string;
}) {
  return (
    <article className="card h-full p-6 sm:p-7">
      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-gt-navy text-sm font-black text-white">
        {String(index).padStart(2, "0")}
      </div>
      <h3 className="text-xl font-bold text-gt-navy">{title}</h3>
      <p className="mt-3 leading-7 text-slate-600">{description}</p>
    </article>
  );
}

export function ProgramCard({ program }: { program: Program }) {
  return (
    <article className="card flex h-full flex-col p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="eyebrow">{program.category}</span>
        <StatusBadge status={program.status} />
      </div>
      <h3 className="mt-4 text-xl font-bold text-gt-navy">{program.title}</h3>
      <p className="mt-3 flex-1 leading-7 text-slate-600">{program.description}</p>
    </article>
  );
}

export function EventCard({ event }: { event: ChapterEvent }) {
  return (
    <article id={event.id} className="card flex h-full flex-col overflow-hidden scroll-mt-28">
      {event.image ? (
        <Image
          src={event.image.src}
          alt={event.image.alt}
          width={720}
          height={400}
          className="aspect-[16/9] w-full object-cover"
        />
      ) : null}
      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="eyebrow">{event.category}</span>
          <StatusBadge status={event.status} />
        </div>
        <h3 className="mt-4 text-xl font-bold text-gt-navy">{event.title}</h3>
        <dl className="mt-4 grid gap-2 text-sm">
          <div className="flex gap-2">
            <dt className="font-bold text-gt-navy">Date:</dt>
            <dd className="text-slate-600">{event.displayDate}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-bold text-gt-navy">Time:</dt>
            <dd className="text-slate-600">{event.time ?? "To be confirmed"}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-bold text-gt-navy">Location:</dt>
            <dd className="text-slate-600">
              {event.location ?? "To be confirmed"}
            </dd>
          </div>
        </dl>
        <p className="mt-4 flex-1 leading-7 text-slate-600">{event.description}</p>
        {event.registrationStatus !== "not-required" ||
        (event.calendarUrl && event.startDate) ? (
          <div className="mt-6 flex flex-wrap gap-3">
            {event.registrationStatus === "active" && event.registrationUrl ? (
              <a className="button button-primary" href={event.registrationUrl}>
                Register
              </a>
            ) : event.registrationStatus === "coming-soon" ? (
              <span className="button button-disabled" aria-disabled="true">
                Registration coming soon
              </span>
            ) : null}
            {event.calendarUrl && event.startDate ? (
              <a className="button button-secondary" href={event.calendarUrl}>
                Add to calendar
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function BoardCard({ member }: { member: BoardMember }) {
  return (
    <article className="card flex h-full flex-col p-6">
      {member.image ? (
        <Image
          src={member.image.src}
          alt={member.image.alt}
          width={96}
          height={96}
          className="h-24 w-24 rounded-3xl object-cover"
        />
      ) : (
        <div
          className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gt-navy text-2xl font-black text-white ring-4 ring-gt-gold/25"
          aria-hidden="true"
        >
          {member.initials}
        </div>
      )}
      <p className="mt-6 text-sm font-bold tracking-wide text-gt-dark-gold">
        {member.role}
      </p>
      <h3 className="mt-2 text-xl font-bold text-gt-navy">{member.name}</h3>
      {member.openingNote ? (
        <p className="mt-2 inline-flex w-fit rounded-full bg-gt-cream px-3 py-1 text-xs font-bold uppercase tracking-wide text-gt-dark-gold ring-1 ring-gt-gold/30">
          {member.openingNote}
        </p>
      ) : null}
      <p className="mt-3 flex-1 leading-7 text-slate-600">
        {member.description}
      </p>
      {member.applicationUrl ? (
        <a
          href={member.applicationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="button button-primary mt-5 self-start"
        >
          Apply for this role
        </a>
      ) : member.openingNote ? (
        <span className="button button-disabled mt-5 self-start" aria-disabled="true">
          Application form coming soon
        </span>
      ) : null}
      {member.publicContacts?.length ? (
        <div className="mt-5 flex flex-wrap gap-4 text-sm font-bold">
          {member.publicContacts.map((contact) => (
            <a key={contact.href} href={contact.href} className="text-link">
              {contact.label}
            </a>
          ))}
        </div>
      ) : null}
    </article>
  );
}

export function ResourceCard({ resource }: { resource: Resource }) {
  return (
    <article className="card flex h-full flex-col p-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="eyebrow">{resource.organization}</span>
        {resource.timeSensitive ? (
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 ring-1 ring-amber-200">
            Time-sensitive
          </span>
        ) : null}
      </div>
      <h3 className="mt-4 text-lg font-bold text-gt-navy">{resource.title}</h3>
      <p className="mt-2 flex-1 leading-7 text-slate-600">
        {resource.description}
      </p>
      <a
        href={resource.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-link mt-5 inline-flex w-fit items-center gap-2 font-bold"
      >
        Visit official resource
        <span aria-hidden="true">↗</span>
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    </article>
  );
}

const opportunityLabels: Record<ScholarshipOpportunity["status"], string> = {
  open: "Open",
  upcoming: "Upcoming",
  recurring: "Recurring",
  closed: "Closed",
  "verify-current-cycle": "Verify current cycle",
};

export function OpportunityCard({
  opportunity,
}: {
  opportunity: ScholarshipOpportunity;
}) {
  return (
    <article className="card flex h-full flex-col p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="eyebrow">{opportunity.organization}</span>
        <StatusBadge
          status={opportunity.status}
          label={opportunityLabels[opportunity.status]}
        />
      </div>
      <h3 className="mt-4 text-xl font-bold text-gt-navy">
        {opportunity.name}
      </h3>
      <p className="mt-2 text-sm font-semibold text-slate-500">
        {opportunity.audience}
      </p>
      <p className="mt-4 leading-7 text-slate-600">
        {opportunity.description}
      </p>
      <dl className="mt-5 grid gap-3 border-t border-slate-200 pt-5 text-sm">
        <div>
          <dt className="font-bold text-gt-navy">Eligibility summary</dt>
          <dd className="mt-1 leading-6 text-slate-600">
            {opportunity.eligibility}
          </dd>
        </div>
        {opportunity.benefit ? (
          <div>
            <dt className="font-bold text-gt-navy">Award or benefit</dt>
            <dd className="mt-1 text-slate-600">{opportunity.benefit}</dd>
          </div>
        ) : null}
        {opportunity.deadline ? (
          <div>
            <dt className="font-bold text-gt-navy">Deadline</dt>
            <dd className="mt-1 text-slate-600">{opportunity.deadline}</dd>
          </div>
        ) : null}
        <div>
          <dt className="font-bold text-gt-navy">LMSA membership</dt>
          <dd className="mt-1 text-slate-600">
            {opportunity.lmsaMembershipRequired
              ? "Required for the listed cycle"
              : "Not listed as required"}
          </dd>
        </div>
      </dl>
      <div className="mt-6 flex flex-1 flex-col justify-end">
        <p className="text-xs font-semibold text-slate-500">
          Last verified {opportunity.lastVerified}
        </p>
        <a
          href={opportunity.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="button button-secondary mt-3 w-fit"
        >
          Check official source <span aria-hidden="true">↗</span>
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
    </article>
  );
}
