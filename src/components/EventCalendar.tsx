"use client";

import { useMemo, useState } from "react";
import type { CampusCalendarDate, ChapterEvent } from "@/lib/site-types";

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

type CalendarItem = {
  id: string;
  title: string;
  kind: "chapter" | "campus";
  href?: string;
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
  campusDates: CampusCalendarDate[],
) {
  const dated = chapterEvents
    .filter((event) => event.startDate)
    .map((event) => parseLocalDate(event.startDate!))
    .sort((a, b) => a.getTime() - b.getTime());

  if (dated.length) {
    return { year: dated[0].getFullYear(), monthIndex: dated[0].getMonth() };
  }

  const campusDated = campusDates
    .map((date) => parseLocalDate(date.startDate))
    .sort((a, b) => a.getTime() - b.getTime());
  if (campusDated.length) {
    return {
      year: campusDated[0].getFullYear(),
      monthIndex: campusDated[0].getMonth(),
    };
  }

  const today = new Date();
  return { year: today.getFullYear(), monthIndex: today.getMonth() };
}

export function EventCalendar({
  events,
  campusDates = [],
}: {
  events: ChapterEvent[];
  campusDates?: CampusCalendarDate[];
}) {
  const startingPoint = useMemo(
    () => initialView(events, campusDates),
    [events, campusDates],
  );
  const [year, setYear] = useState(startingPoint.year);
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
      addItem(parseLocalDate(event.startDate), {
        id: event.id,
        title: event.title,
        kind: "chapter",
        href: `#${event.id}`,
      });
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
    setYear(next.getFullYear());
    setMonthIndex(next.getMonth());
  }

  function goToToday() {
    const today = new Date();
    setYear(today.getFullYear());
    setMonthIndex(today.getMonth());
  }

  function goToNextChapterEvent() {
    const upcoming = events
      .filter((event) => event.startDate)
      .map((event) => parseLocalDate(event.startDate!))
      .sort((a, b) => a.getTime() - b.getTime());
    if (!upcoming.length) return;
    const first = upcoming[0];
    setYear(first.getFullYear());
    setMonthIndex(first.getMonth());
  }

  const selectClasses =
    "rounded-full border border-white/25 bg-white/10 px-3 py-2 text-sm font-bold text-white outline-none transition hover:bg-white/15 focus:ring-2 focus:ring-gt-gold";

  return (
    <div className="card overflow-hidden">
      <div className="border-b border-slate-200/80 bg-gt-navy px-5 py-4 text-white">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-bold">
              {MONTH_NAMES[monthIndex]} {year}
            </h3>
            <p className="mt-1 text-sm text-white/70">
              Browse any month or year. Gold = chapter events · Navy = Georgia Tech academic dates.
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
              value={year}
              onChange={(event) => {
                const nextYear = Number(event.target.value);
                if (!Number.isNaN(nextYear)) {
                  setYear(nextYear);
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
            className="rounded-full border border-gt-gold/50 px-3 py-1.5 text-xs font-bold text-gt-gold transition hover:bg-white/10"
          >
            Jump to next chapter event
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-slate-200/70 p-px">
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

          return (
            <div
              key={`${year}-${monthIndex}-${index}`}
              className={`min-h-20 bg-white p-2 ${
                hasChapter
                  ? "ring-2 ring-inset ring-gt-gold"
                  : hasCampus
                    ? "ring-1 ring-inset ring-gt-navy/30"
                    : ""
              }`}
            >
              {day ? (
                <>
                  <p
                    className={`text-sm font-bold ${
                      hasChapter || hasCampus ? "text-gt-navy" : "text-slate-400"
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
                              target={
                                item.kind === "campus" ? "_blank" : undefined
                              }
                              rel={
                                item.kind === "campus"
                                  ? "noopener noreferrer"
                                  : undefined
                              }
                              className={`block rounded-md px-1.5 py-1 text-[0.65rem] font-bold leading-snug ${
                                item.kind === "chapter"
                                  ? "bg-gt-cream text-gt-navy hover:bg-gt-gold/30"
                                  : "bg-gt-navy/10 text-gt-navy hover:bg-gt-navy/15"
                              }`}
                            >
                              {item.title}
                            </a>
                          ) : (
                            <span className="block rounded-md bg-gt-navy/10 px-1.5 py-1 text-[0.65rem] font-bold leading-snug text-gt-navy">
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
