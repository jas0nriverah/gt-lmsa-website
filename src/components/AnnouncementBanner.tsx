import Link from "next/link";
import type { Announcement } from "@/lib/site-types";
import { StatusBadge } from "./StatusBadge";

export function AnnouncementBanner({
  announcement,
}: {
  announcement: Announcement;
}) {
  const content = (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={announcement.status} />
          <p className="text-sm font-bold text-gt-navy">{announcement.timing}</p>
        </div>
        <h3 className="mt-3 text-xl font-bold text-gt-navy">
          {announcement.title}
        </h3>
        <p className="mt-2 max-w-3xl leading-7 text-slate-600">
          {announcement.summary}
        </p>
      </div>
      {announcement.href ? (
        <span className="shrink-0 font-bold text-gt-navy" aria-hidden="true">
          Learn more →
        </span>
      ) : null}
    </div>
  );

  return announcement.href ? (
    <Link
      href={announcement.href}
      className="card block p-6 hover:border-gt-gold focus-visible:border-gt-gold"
    >
      {content}
    </Link>
  ) : (
    <div className="card p-6">{content}</div>
  );
}
