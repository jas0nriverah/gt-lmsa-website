import type { ChapterEvent } from "@/lib/site-types";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function parseLocalDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthTitle(date: Date) {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

type CalendarMonth = {
  key: string;
  title: string;
  year: number;
  monthIndex: number;
  eventsByDay: Map<number, ChapterEvent[]>;
};

function buildMonths(events: ChapterEvent[]): CalendarMonth[] {
  const dated = events.filter((event) => event.startDate);
  const byMonth = new Map<string, CalendarMonth>();

  for (const event of dated) {
    const date = parseLocalDate(event.startDate!);
    const key = monthKey(date);
    const existing = byMonth.get(key);
    if (existing) {
      const list = existing.eventsByDay.get(date.getDate()) ?? [];
      list.push(event);
      existing.eventsByDay.set(date.getDate(), list);
    } else {
      byMonth.set(key, {
        key,
        title: monthTitle(date),
        year: date.getFullYear(),
        monthIndex: date.getMonth(),
        eventsByDay: new Map([[date.getDate(), [event]]]),
      });
    }
  }

  return [...byMonth.values()].sort((a, b) => a.key.localeCompare(b.key));
}

function MonthGrid({ month }: { month: CalendarMonth }) {
  const firstDay = new Date(month.year, month.monthIndex, 1).getDay();
  const daysInMonth = new Date(month.year, month.monthIndex + 1, 0).getDate();
  const cells: Array<number | null> = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return (
    <div className="card overflow-hidden">
      <div className="border-b border-slate-200/80 bg-gt-navy px-5 py-4 text-white">
        <h3 className="text-lg font-bold">{month.title}</h3>
        <p className="mt-1 text-sm text-white/70">
          Confirmed chapter events appear in gold.
        </p>
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
          const dayEvents = day ? month.eventsByDay.get(day) : undefined;
          const hasEvents = Boolean(dayEvents?.length);

          return (
            <div
              key={`${month.key}-${index}`}
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

export function EventCalendar({ events }: { events: ChapterEvent[] }) {
  const months = buildMonths(events);

  if (!months.length) {
    return null;
  }

  return (
    <div className="grid gap-6">
      {months.map((month) => (
        <MonthGrid key={month.key} month={month} />
      ))}
    </div>
  );
}
