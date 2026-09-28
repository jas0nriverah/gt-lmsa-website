const atlantaTimeZone = "America/New_York";
const formatter = new Intl.DateTimeFormat("en-US", {
  timeZone: atlantaTimeZone,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function partsForDate(date: Date): Record<string, string> {
  return Object.fromEntries(
    formatter.formatToParts(date).map(({ type, value }) => [type, value]),
  );
}

function sameWallTime(parts: Record<string, string>, values: number[]): boolean {
  return (
    Number(parts.year) === values[0] &&
    Number(parts.month) === values[1] &&
    Number(parts.day) === values[2] &&
    Number(parts.hour) === values[3] &&
    Number(parts.minute) === values[4]
  );
}

export function toAtlantaDateTimeInput(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const parts = partsForDate(date);
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

/** Converts an Atlanta wall-clock input without using the browser's local timezone. */
export function fromAtlantaDateTimeInput(value: string, fieldName: string): string | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) throw new Error(`${fieldName} must be a valid date and time.`);

  const values = match.slice(1).map(Number);
  const [year, month, day, hour, minute] = values;
  const wallTime = Date.UTC(year, month - 1, day, hour, minute);
  const check = new Date(wallTime);
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() + 1 !== month ||
    check.getUTCDate() !== day ||
    hour > 23 ||
    minute > 59
  ) {
    throw new Error(`${fieldName} must be a valid date and time.`);
  }

  // Atlanta uses UTC−5 in standard time and UTC−4 in daylight time. Testing
  // both offsets also rejects wall times skipped by the spring clock change.
  const candidates = [4, 5]
    .map((offset) => new Date(wallTime + offset * 60 * 60 * 1000))
    .filter((candidate) => sameWallTime(partsForDate(candidate), values))
    .sort((left, right) => left.getTime() - right.getTime());

  if (candidates.length === 0) {
    throw new Error(`${fieldName} does not exist in Atlanta because of the daylight-saving clock change.`);
  }

  // The earlier occurrence is selected for the repeated hour in autumn.
  return candidates[0].toISOString();
}

export function formatAtlantaDateTime(value: string | null): string {
  if (!value) return "Date and time to be announced";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date and time unavailable";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: atlantaTimeZone,
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);
}

export function formatAtlantaDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: atlantaTimeZone,
    dateStyle: "medium",
  }).format(date);
}
