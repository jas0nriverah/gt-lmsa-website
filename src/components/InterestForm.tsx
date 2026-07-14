"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { contactLinks } from "@/lib/site-data";

const interestOptions = [
  "General membership and chapter updates",
  "Peer or medical-student mentorship",
  "Pre-health workshops and resources",
  "Community service",
  "Culture and community events",
  "Leadership and chapter-building",
];

export function InterestForm() {
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const data = new FormData(form);
    const interests = data.getAll("interests").map(String);

    if (!interests.length) {
      setError("Choose at least one area of interest.");
      form.querySelector<HTMLInputElement>('input[name="interests"]')?.focus();
      return;
    }

    setError("");

    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const academicLevel = String(data.get("academicLevel") ?? "");
    const pathway = String(data.get("pathway") ?? "");
    const message = String(data.get("message") ?? "").trim();
    const body = [
      "Hello LMSA Plus at Georgia Tech,",
      "",
      "I would like to join the chapter interest list.",
      "",
      `Preferred name: ${name}`,
      `Reply email: ${email}`,
      `Academic level: ${academicLevel}`,
      `Health-professions interest: ${pathway}`,
      "Areas of interest:",
      ...interests.map((interest) => `- ${interest}`),
      ...(message ? ["", "Optional note:", message] : []),
      "",
      "I understand this email is an expression of interest and does not confirm membership, a leadership position, or participation in a specific program.",
    ].join("\n");

    const subject = `Chapter interest — ${name}`;
    const mailto = `mailto:${contactLinks.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    setStatus(
      `Your email app should open with a prepared message to ${contactLinks.email}. Review it, then send it to complete your interest submission.`,
    );
    window.location.href = mailto;
  }

  const inputClasses =
    "mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-ink shadow-sm outline-none transition focus:border-gt-navy focus:ring-2 focus:ring-gt-gold";

  return (
    <form onSubmit={handleSubmit} className="card p-6 sm:p-8">
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="font-bold text-gt-navy">
          Preferred name
          <span className="ml-1 text-red-700" aria-hidden="true">*</span>
          <input
            className={inputClasses}
            type="text"
            name="name"
            autoComplete="name"
            maxLength={80}
            required
          />
        </label>

        <label className="font-bold text-gt-navy">
          Email <span className="font-normal text-slate-500">(Georgia Tech preferred)</span>
          <span className="ml-1 text-red-700" aria-hidden="true">*</span>
          <input
            className={inputClasses}
            type="email"
            name="email"
            autoComplete="email"
            maxLength={120}
            required
          />
        </label>

        <label className="font-bold text-gt-navy">
          Academic level
          <span className="ml-1 text-red-700" aria-hidden="true">*</span>
          <select className={inputClasses} name="academicLevel" defaultValue="" required>
            <option value="" disabled>Select one</option>
            <option>First-year undergraduate</option>
            <option>Second-year undergraduate</option>
            <option>Third-year undergraduate</option>
            <option>Fourth-year or later undergraduate</option>
            <option>Graduate student</option>
            <option>Other or prefer not to say</option>
          </select>
        </label>

        <label className="font-bold text-gt-navy">
          Health-professions interest
          <span className="ml-1 text-red-700" aria-hidden="true">*</span>
          <select className={inputClasses} name="pathway" defaultValue="" required>
            <option value="" disabled>Select one</option>
            <option>Medicine (MD or DO)</option>
            <option>Dentistry</option>
            <option>Physician assistant practice</option>
            <option>Nursing</option>
            <option>Public health</option>
            <option>Pharmacy</option>
            <option>Physical or occupational therapy</option>
            <option>Another health profession</option>
            <option>Exploring or undecided</option>
          </select>
        </label>
      </div>

      <fieldset className="mt-8" aria-describedby={error ? "interest-error" : undefined}>
        <legend className="font-bold text-gt-navy">
          What would you like to hear about?
          <span className="ml-1 text-red-700" aria-hidden="true">*</span>
        </legend>
        <p className="mt-1 text-sm leading-6 text-slate-500">Choose one or more.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {interestOptions.map((interest) => (
            <label
              key={interest}
              className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-gt-cream p-4 font-semibold text-slate-700 hover:border-gt-gold"
            >
              <input
                type="checkbox"
                name="interests"
                value={interest}
                className="mt-1 h-5 w-5 shrink-0 accent-gt-navy"
              />
              <span>{interest}</span>
            </label>
          ))}
        </div>
        {error ? (
          <p id="interest-error" role="alert" className="mt-3 font-semibold text-red-700">
            {error}
          </p>
        ) : null}
      </fieldset>

      <label className="mt-8 block font-bold text-gt-navy">
        Anything else the founding board should know? <span className="font-normal text-slate-500">(optional)</span>
        <textarea
          className={`${inputClasses} min-h-32 resize-y`}
          name="message"
          maxLength={500}
          placeholder="Keep this brief and do not include sensitive personal information."
        />
      </label>

      <label className="mt-6 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
        <input type="checkbox" name="consent" required className="mt-1 h-5 w-5 shrink-0 accent-gt-navy" />
        <span>
          <span className="font-bold text-gt-navy">Required:</span>{" "}
          I understand this website does not store my response. Submitting prepares an email in my mail app, and I must review and send that email to share it with the chapter.
        </span>
      </label>

      <div className="mt-7 flex flex-wrap items-center gap-4">
        <button type="submit" className="button button-primary">
          Prepare interest email <span aria-hidden="true">→</span>
        </button>
        <p className="text-sm leading-6 text-slate-500">
          Required text and selection fields are marked with an asterisk.
        </p>
      </div>

      {status ? (
        <p role="status" aria-live="polite" className="mt-5 rounded-xl bg-emerald-50 p-4 leading-7 text-emerald-900 ring-1 ring-emerald-200">
          {status}
        </p>
      ) : null}
    </form>
  );
}
