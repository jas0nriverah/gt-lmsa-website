"use client";

import { useMemo, useState } from "react";
import type { CampusCalendarDate, ChapterEvent } from "@/lib/site-types";
import { hasEnded } from "@/lib/event-dates";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const MIN_YEAR = 1900;
const MAX_YEAR = 2100;

type CalendarItem = {
  id: string;
  title: string;
  kind: "chapter" | "national" | "campus";
  href?: string;
};

const SCOPE_LABELS = {
  chapter: "Chapter event",
  national: "National event",
  campus: "Georgia Tech",
};

const ITEM_COLORS = {
  chapter: "bg-gt-cream text-gt-navy hover:bg-gt-gold/30",
  national: "bg-purple-50 text-purple-900 hover:bg-purple-100",
  campus: "bg-gt-navy/10 text-gt-navy hover:bg-gt-navy/15",
};

function parseLocalDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function eachDayInRange(startIso: string, endIso?: string) {
  const start = parseLocalDate(startIso);
  const end = endIso ? parseLocalDate(endIso) : start;
  const days: Date[] = [];
  for (
    let cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    cursor.getTime() <= end.getTime();
    cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 1)
  ) {
    days.push(new Date(cursor));
  }
  return days;
}

function initialView(
  chapterEvents: ChapterEvent[],
  today: string,
) {
  const dated = chapterEvents
    .filter((event) => event.startDate && !hasEnded(event, today))
    .map((event) => parseLocalDate(event.startDate! < today ? today : event.startDate!))
    .sort((a, b) => a.getTime() - b.getTime());

  if (dated.length) {
    return { year: dated[0].getFullYear(), monthIndex: dated[0].getMonth() };
  }

  const date = parseLocalDate(today);
  return { year: date.getFullYear(), monthIndex: date.getMonth() };
}

export function EventCalendar({
  events,
  campusDates = [],
  today,
}: {
  events: ChapterEvent[];
  campusDates?: CampusCalendarDate[];
  today: string;
}) {
  const startingPoint = useMemo(
    () => initialView(events, today),
    [events, today],
  );
  const [year, setYear] = useState(startingPoint.year);
  const [draftYear, setDraftYear] = useState(String(startingPoint.year));
  const [monthIndex, setMonthIndex] = useState(startingPoint.monthIndex);

  const itemsByDay = useMemo(() => {
    const map = new Map<number, CalendarItem[]>();

    function addItem(date: Date, item: CalendarItem) {
      if (date.getFullYear() !== year || date.getMonth() !== monthIndex) {
        return;
      }
      const list = map.get(date.getDate()) ?? [];
      list.push(item);
      map.set(date.getDate(), list);
    }

    for (const event of events) {
      if (!event.startDate) continue;
      for (const day of eachDayInRange(event.startDate, event.endDate)) {
        addItem(day, {
          id: event.id,
          title: event.title,
          kind: event.scope ?? "chapter",
          href: `#${event.id}`,
        });
      }
    }

    for (const campusDate of campusDates) {
      for (const day of eachDayInRange(campusDate.startDate, campusDate.endDate)) {
        addItem(day, {
          id: `${campusDate.id}-${day.toISOString().slice(0, 10)}`,
          title: campusDate.title,
          kind: "campus",
          href: campusDate.sourceUrl,
        });
      }
    }

    return map;
  }, [events, campusDates, year, monthIndex]);

  const firstDay = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells: Array<number | null> = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  function shiftMonth(delta: number) {
    const next = new Date(year, monthIndex + delta, 1);
    if (next.getFullYear() < MIN_YEAR || next.getFullYear() > MAX_YEAR) {
      return;
    }
    setYear(next.getFullYear());
    setDraftYear(String(next.getFullYear()));
    setMonthIndex(next.getMonth());
  }

  function commitDraftYear() {
    const nextYear = Number(draftYear);
    if (Number.isInteger(nextYear) && nextYear >= MIN_YEAR && nextYear <= MAX_YEAR) {
      setYear(nextYear);
      setDraftYear(String(nextYear));
    } else {
      setDraftYear(String(year));
    }
  }

  function goToToday() {
    const date = parseLocalDate(today);
    setYear(date.getFullYear());
    setDraftYear(String(date.getFullYear()));
    setMonthIndex(date.getMonth());
  }

  const nextChapterEvents = events.filter((event) =>
    (!event.scope || event.scope === "chapter") && event.startDate && !hasEnded(event, today));

  function goToNextChapterEvent() {
    if (!nextChapterEvents.length) return;
    const next = initialView(nextChapterEvents, today);
    setYear(next.year);
    setDraftYear(String(next.year));
    setMonthIndex(next.monthIndex);
  }

  const selectClasses =
    "rounded-full border border-white/25 bg-white/10 px-3 py-2 text-sm font-bold text-white outline-none transition hover:bg-white/15 focus:ring-2 focus:ring-gt-gold";

  return (
    <div className="card overflow-hidden">
      <div className="border-b border-slate-200/80 bg-gt-navy px-5 py-4 text-white">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-bold" aria-live="polite" aria-atomic="true">
              {MONTH_NAMES[monthIndex]} {year}
            </h3>
            <p className="mt-1 text-sm text-white/70">
              Gold = chapter · Purple = national · Navy = Georgia Tech
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              className="rounded-full border border-white/25 px-3 py-2 text-sm font-bold transition hover:bg-white/10"
              aria-label="Previous month"
            >
              ← Prev
            </button>
            <label className="sr-only" htmlFor="calendar-month">
              Month
            </label>
            <select
              id="calendar-month"
              className={selectClasses}
              value={monthIndex}
              onChange={(event) => setMonthIndex(Number(event.target.value))}
            >
              {MONTH_NAMES.map((name, index) => (
                <option key={name} value={index} className="text-gt-navy">
                  {name}
                </option>
              ))}
            </select>
            <label className="sr-only" htmlFor="calendar-year">
              Year
            </label>
            <input
              id="calendar-year"
              type="number"
              min={1900}
              max={2100}
              value={draftYear}
              onChange={(event) => {
                setDraftYear(event.target.value);
              }}
              onBlur={commitDraftYear}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  commitDraftYear();
                }
              }}
              className={`${selectClasses} w-24`}
            />
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              className="rounded-full border border-white/25 px-3 py-2 text-sm font-bold transition hover:bg-white/10"
              aria-label="Next month"
            >
              Next →
            </button>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={goToToday}
            className="rounded-full bg-gt-gold px-3 py-1.5 text-xs font-bold text-gt-navy transition hover:bg-gt-dark-gold hover:text-white"
          >
            Today
          </button>
          <button
            type="button"
            onClick={goToNextChapterEvent}
            disabled={!nextChapterEvents.length}
            className="rounded-full border border-gt-gold/50 px-3 py-1.5 text-xs font-bold text-gt-gold transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {nextChapterEvents.length ? "Jump to next chapter event" : "No upcoming chapter event"}
          </button>
        </div>
      </div>

      <div className="bg-white px-5 py-4 md:hidden">
        <h4 className="sr-only">Agenda for {MONTH_NAMES[monthIndex]} {year}</h4>
        {itemsByDay.size ? (
          <ol className="space-y-5">
            {[...itemsByDay.entries()].sort(([a], [b]) => a - b).map(([day, dayItems]) => {
              const date = new Date(year, monthIndex, day);
              const isoDate = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              return (
                <li key={day}>
                  <p className="mb-2 text-sm font-bold text-gt-navy">
                    <time dateTime={isoDate}>
                      {WEEKDAYS[date.getDay()]}, {MONTH_NAMES[monthIndex]} {day}
                    </time>
                    {isoDate === today ? <span className="ml-2 text-gt-dark-gold">Today</span> : null}
                  </p>
                  <ul className="space-y-2">
                    {dayItems.map((item) => {
                      const external = item.href?.startsWith("http");
                      const content = (
                        <>
                          <span className="block text-xs font-semibold">{SCOPE_LABELS[item.kind]}</span>
                          <span className="mt-1 block text-sm font-bold">{item.title}</span>
                          {external ? <span className="sr-only"> (opens in a new tab)</span> : null}
                        </>
                      );
                      const classes = `block rounded-lg px-4 py-3 leading-relaxed ${ITEM_COLORS[item.kind]} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gt-navy`;
                      return (
                        <li key={item.id}>
                          {item.href ? (
                            <a href={item.href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} className={classes}>
                              {content}
                            </a>
                          ) : <div className={classes}>{content}</div>}
                        </li>
                      );
                    })}
                  </ul>
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="py-4 text-sm leading-relaxed text-slate-600">
            No dated events or Georgia Tech calendar dates are listed for this month. Choose another month to explore the calendar.
          </p>
        )}
      </div>

      <div className="hidden grid-cols-7 gap-px bg-slate-200/70 p-px md:grid">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="bg-gt-cream px-1 py-2 text-center text-xs font-bold uppercase tracking-wide text-gt-dark-gold"
          >
            {day}
          </div>
        ))}
        {cells.map((day, index) => {
          const dayItems = day ? itemsByDay.get(day) : undefined;
          const hasChapter = Boolean(
            dayItems?.some((item) => item.kind === "chapter"),
          );
          const hasCampus = Boolean(
            dayItems?.some((item) => item.kind === "campus"),
          );
          const hasNational = Boolean(dayItems?.some((item) => item.kind === "national"));

          return (
            <div
              key={`${year}-${monthIndex}-${index}`}
              className={`min-h-20 min-w-0 bg-white p-1 sm:p-2 ${
                hasChapter
                  ? "ring-2 ring-inset ring-gt-gold"
                  : hasNational ? "ring-2 ring-inset ring-purple-300" : hasCampus
                    ? "ring-1 ring-inset ring-gt-navy/30"
                    : ""
              }`}
            >
              {day ? (
                <>
                  <p
                    className={`text-sm font-bold ${
                      hasChapter || hasCampus || hasNational ? "text-gt-navy" : "text-slate-400"
                    }`}
                  >
                    {day}
                  </p>
                  {dayItems?.length ? (
                    <ul className="mt-1 space-y-1">
                      {dayItems.map((item) => (
                        <li key={item.id}>
                          {item.href ? (
                            <a
                              href={item.href}
                              aria-label={`${SCOPE_LABELS[item.kind]}: ${item.title}, ${MONTH_NAMES[monthIndex]} ${day}, ${year}${item.href.startsWith("http") ? ", opens in a new tab" : ""}`}
                              target={
                                item.href.startsWith("http") ? "_blank" : undefined
                              }
                              rel={
                                item.href.startsWith("http")
                                  ? "noopener noreferrer"
                                  : undefined
                              }
                              className={`block break-words rounded-md px-0.5 py-1 text-[0.65rem] font-bold leading-snug sm:px-1.5 ${
                                item.kind === "chapter"
                                  ? "bg-gt-cream text-gt-navy hover:bg-gt-gold/30"
                                  : item.kind === "national" ? "bg-purple-50 text-purple-900 hover:bg-purple-100" : "bg-gt-navy/10 text-gt-navy hover:bg-gt-navy/15"
                              }`}
                            >
                              <span className="mb-0.5 block text-[0.6rem] font-medium">{SCOPE_LABELS[item.kind]}</span>
                              {item.title}
                            </a>
                          ) : (
                            <span className="block rounded-md bg-gt-navy/10 px-1.5 py-1 text-[0.65rem] font-bold leading-snug text-gt-navy">
                              <span className="mb-0.5 block text-[0.6rem] font-medium">{SCOPE_LABELS[item.kind]}</span>
                              {item.title}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </>
              ) : null}
            </div>
          );
        })}
      </div>
      <p className="border-t border-slate-200/80 bg-gt-cream px-5 py-3 text-xs leading-5 text-slate-600">
        Georgia Tech dates come from the Registrar&apos;s tentative five-term
        calendar and may change.{" "}
        <a
          href="https://registrar.gatech.edu/info/tentative-five-term-school-calendar"
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-gt-dark-gold underline decoration-gt-gold/40 underline-offset-2 hover:text-gt-navy"
        >
          Verify on the official GT calendar
        </a>
        .
      </p>
    </div>
  );
}
