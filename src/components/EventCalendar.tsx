"use client";

import { useMemo, useState } from "react";
import type { ChapterEvent } from "@/lib/site-types";

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

function parseLocalDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function initialView(events: ChapterEvent[]) {
  const dated = events
    .filter((event) => event.startDate)
    .map((event) => parseLocalDate(event.startDate!))
    .sort((a, b) => a.getTime() - b.getTime());

  if (dated.length) {
    return { year: dated[0].getFullYear(), monthIndex: dated[0].getMonth() };
  }

  const today = new Date();
  return { year: today.getFullYear(), monthIndex: today.getMonth() };
}

export function EventCalendar({ events }: { events: ChapterEvent[] }) {
  const startingPoint = useMemo(() => initialView(events), [events]);
  const [year, setYear] = useState(startingPoint.year);
  const [monthIndex, setMonthIndex] = useState(startingPoint.monthIndex);

  const eventsByDay = useMemo(() => {
    const map = new Map<number, ChapterEvent[]>();
    for (const event of events) {
      if (!event.startDate) continue;
      const date = parseLocalDate(event.startDate);
      if (date.getFullYear() !== year || date.getMonth() !== monthIndex) {
        continue;
      }
      const list = map.get(date.getDate()) ?? [];
      list.push(event);
      map.set(date.getDate(), list);
    }
    return map;
  }, [events, year, monthIndex]);

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

  function goToNextEvent() {
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
              Browse any month or year. Confirmed chapter events appear in gold.
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
            onClick={goToNextEvent}
            className="rounded-full border border-gt-gold/50 px-3 py-1.5 text-xs font-bold text-gt-gold transition hover:bg-white/10"
          >
            Jump to next confirmed event
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
          const dayEvents = day ? eventsByDay.get(day) : undefined;
          const hasEvents = Boolean(dayEvents?.length);

          return (
            <div
              key={`${year}-${monthIndex}-${index}`}
              className={`min-h-20 bg-white p-2 ${
                hasEvents ? "ring-2 ring-inset ring-gt-gold" : ""
              }`}
            >
              {day ? (
                <>
                  <p
                    className={`text-sm font-bold ${
                      hasEvents ? "text-gt-navy" : "text-slate-400"
                    }`}
                  >
                    {day}
                  </p>
                  {hasEvents ? (
                    <ul className="mt-1 space-y-1">
                      {dayEvents!.map((event) => (
                        <li key={event.id}>
                          <a
                            href={`#${event.id}`}
                            className="block rounded-md bg-gt-cream px-1.5 py-1 text-[0.65rem] font-bold leading-snug text-gt-navy hover:bg-gt-gold/30"
                          >
                            {event.title}
                          </a>
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
    </div>
  );
}
