"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { EventInput, PlatformEvent } from "@/lib/platform-contracts";
import { fromAtlantaDateTimeInput, toAtlantaDateTimeInput } from "./date-time";
import { FieldLabel, InlineAlert, inputClassName, PlatformStatus } from "./ui";

function emptyForm(): EventInput {
  return {
    title: "",
    description: "",
    location: "",
    category: "",
    timingLabel: "To be announced",
    startsAt: null,
    endsAt: null,
    publicationStatus: "draft",
    registrationStatus: "closed",
    registrationOpensAt: null,
    registrationClosesAt: null,
    capacity: null,
  };
}

function fromEvent(event: PlatformEvent): EventInput {
  return {
    title: event.title,
    description: event.description,
    location: event.location,
    category: event.category,
    timingLabel: event.timingLabel,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    publicationStatus: event.publicationStatus,
    registrationStatus: event.registrationStatus,
    registrationOpensAt: event.registrationOpensAt,
    registrationClosesAt: event.registrationClosesAt,
    capacity: event.capacity,
  };
}

export function OfficerEventForm({
  event,
  saving,
  onCancel,
  onSubmit,
}: {
  event: PlatformEvent | null;
  saving: boolean;
  onCancel: () => void;
  onSubmit: (input: EventInput) => Promise<void>;
}) {
  const [form, setForm] = useState<EventInput>(() => event ? fromEvent(event) : emptyForm());
  const [startInput, setStartInput] = useState(() => toAtlantaDateTimeInput(event?.startsAt ?? null));
  const [endInput, setEndInput] = useState(() => toAtlantaDateTimeInput(event?.endsAt ?? null));
  const [opensInput, setOpensInput] = useState(() => toAtlantaDateTimeInput(event?.registrationOpensAt ?? null));
  const [closesInput, setClosesInput] = useState(() => toAtlantaDateTimeInput(event?.registrationClosesAt ?? null));
  const [capacityInput, setCapacityInput] = useState(event?.capacity == null ? "" : String(event.capacity));
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    const next = event ? fromEvent(event) : emptyForm();
    setForm(next);
    setStartInput(toAtlantaDateTimeInput(event?.startsAt ?? null));
    setEndInput(toAtlantaDateTimeInput(event?.endsAt ?? null));
    setOpensInput(toAtlantaDateTimeInput(event?.registrationOpensAt ?? null));
    setClosesInput(toAtlantaDateTimeInput(event?.registrationClosesAt ?? null));
    setCapacityInput(event?.capacity == null ? "" : String(event.capacity));
    setValidationError(null);
  }, [event]);

  async function submit(eventObject: FormEvent<HTMLFormElement>) {
    eventObject.preventDefault();
    setValidationError(null);
    try {
      const startsAt = fromAtlantaDateTimeInput(startInput, "Start time");
      const endsAt = fromAtlantaDateTimeInput(endInput, "End time");
      const registrationOpensAt = fromAtlantaDateTimeInput(opensInput, "Registration opening time");
      const registrationClosesAt = fromAtlantaDateTimeInput(closesInput, "Registration closing time");
      if (Boolean(startsAt) !== Boolean(endsAt)) throw new Error("Enter both event start and end times, or leave both empty for an undated event.");
      if (startsAt && endsAt && new Date(endsAt) <= new Date(startsAt)) throw new Error("End time must be after start time.");
      if (registrationOpensAt && registrationClosesAt && new Date(registrationClosesAt) <= new Date(registrationOpensAt)) {
        throw new Error("Registration closing time must be after its opening time.");
      }
      if (form.registrationStatus === "open" && (!startsAt || form.publicationStatus !== "published")) {
        throw new Error("Confirm the event start time and publish the event before opening registration.");
      }
      const capacity = capacityInput.trim() === "" ? null : Number(capacityInput);
      if (capacity !== null && (!Number.isInteger(capacity) || capacity < 1 || capacity > 10000)) throw new Error("Capacity must be 1–10,000, or left blank for no limit.");
      await onSubmit({
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        category: form.category.trim(),
        timingLabel: form.timingLabel.trim(),
        startsAt,
        endsAt,
        registrationOpensAt,
        registrationClosesAt,
        capacity,
      });
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : "Check the event details and try again.");
    }
  }

  return (
    <form className="grid gap-5" onSubmit={submit}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 className="text-xl font-bold text-gt-navy">{event ? "Edit event" : "Create event"}</h4>
          <p className="mt-1 text-sm leading-6 text-slate-600">All date and time inputs use Atlanta time (America/New_York).</p>
        </div>
        {event ? <PlatformStatus status={event.publicationStatus} /> : null}
      </div>
      {validationError ? <InlineAlert>{validationError}</InlineAlert> : null}
      <div className="grid gap-5 sm:grid-cols-2">
        <FieldLabel htmlFor="event-title">Event title
          <input id="event-title" className={inputClassName} value={form.title} required maxLength={160} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </FieldLabel>
        <FieldLabel htmlFor="event-category">Category
          <input id="event-category" className={inputClassName} value={form.category} required maxLength={80} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        </FieldLabel>
      </div>
      <FieldLabel htmlFor="event-description">Description
        <textarea id="event-description" className={`${inputClassName} min-h-32 resize-y`} value={form.description} required maxLength={5000} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </FieldLabel>
      <div className="grid gap-5 sm:grid-cols-2">
        <FieldLabel htmlFor="event-location">Location
          <input id="event-location" className={inputClassName} value={form.location} maxLength={300} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        </FieldLabel>
        <FieldLabel htmlFor="event-timing-label">Timing label
          <input id="event-timing-label" className={inputClassName} value={form.timingLabel} maxLength={200} placeholder="e.g. Date to be announced" onChange={(e) => setForm({ ...form, timingLabel: e.target.value })} />
        </FieldLabel>
      </div>
      <fieldset className="grid gap-4 rounded-2xl border border-slate-200 p-4 sm:grid-cols-2">
        <legend className="px-2 text-sm font-bold text-gt-navy">Event schedule · Atlanta time</legend>
        <FieldLabel htmlFor="event-start">Starts at
          <input id="event-start" type="datetime-local" className={inputClassName} value={startInput} onChange={(e) => setStartInput(e.target.value)} />
        </FieldLabel>
        <FieldLabel htmlFor="event-end">Ends at
          <input id="event-end" type="datetime-local" className={inputClassName} value={endInput} onChange={(e) => setEndInput(e.target.value)} />
        </FieldLabel>
        <p className="text-xs leading-5 text-slate-500 sm:col-span-2">Leave both blank for an undated event. A time that does not exist during the spring daylight-saving change is rejected. During the repeated fall hour, the first occurrence is used.</p>
      </fieldset>
      <fieldset className="grid gap-4 rounded-2xl border border-slate-200 p-4 sm:grid-cols-2">
        <legend className="px-2 text-sm font-bold text-gt-navy">Registration window · Atlanta time</legend>
        <FieldLabel htmlFor="registration-opens">Opens at
          <input id="registration-opens" type="datetime-local" className={inputClassName} value={opensInput} onChange={(e) => setOpensInput(e.target.value)} />
        </FieldLabel>
        <FieldLabel htmlFor="registration-closes">Closes at
          <input id="registration-closes" type="datetime-local" className={inputClassName} value={closesInput} onChange={(e) => setClosesInput(e.target.value)} />
        </FieldLabel>
        <p className="text-xs leading-5 text-slate-500 sm:col-span-2">Either time may be set independently. If no closing time is set, registration closes automatically when the event starts. The registration status below is authoritative.</p>
      </fieldset>
      <div className="grid gap-5 sm:grid-cols-3">
        <FieldLabel htmlFor="event-publication">Publication status
          <select id="event-publication" className={inputClassName} value={form.publicationStatus} onChange={(e) => setForm({ ...form, publicationStatus: e.target.value as EventInput["publicationStatus"] })}>
            <option value="draft">Draft</option><option value="published">Published</option><option value="cancelled">Cancelled</option>
          </select>
        </FieldLabel>
        <FieldLabel htmlFor="event-registration">Registration status
          <select id="event-registration" className={inputClassName} value={form.registrationStatus} onChange={(e) => setForm({ ...form, registrationStatus: e.target.value as EventInput["registrationStatus"] })}>
            <option value="open">Open</option><option value="closed">Closed</option>
          </select>
        </FieldLabel>
        <FieldLabel htmlFor="event-capacity">Capacity
          <input id="event-capacity" type="number" min="1" step="1" className={inputClassName} value={capacityInput} placeholder="No limit" onChange={(e) => setCapacityInput(e.target.value)} />
        </FieldLabel>
      </div>
      <div className="flex flex-wrap gap-3">
        <button type="submit" className="button button-primary disabled:opacity-60" disabled={saving}>
          {saving ? "Saving event…" : event ? "Save event changes" : "Create event"}
        </button>
        <button type="button" className="button button-secondary" disabled={saving} onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
