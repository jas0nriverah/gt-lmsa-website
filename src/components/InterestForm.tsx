"use client";

import type { FormEvent } from "react";
import { useRef, useState } from "react";
import { contactLinks } from "@/lib/site-data";

const interestOptions = ["Mentorship", "Pre-health workshops", "Community service", "Culture and community", "Leadership"];

export function InterestForm() {
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const nameInput = event.currentTarget.elements.namedItem("name") as HTMLInputElement;
    if (!name) {
      nameInput.setCustomValidity("Enter your name.");
      nameInput.reportValidity();
      return;
    }
    const academicLevel = String(data.get("academicLevel") ?? "");
    const interests = data.getAll("interests").map(String);
    const body = [
      "Hello LMSA PLUS at Georgia Tech,",
      "",
      "Please add me to the chapter interest list for updates and opportunities.",
      "",
      "Name: " + name,
      "Email: " + email,
      ...(academicLevel ? ["Academic year: " + academicLevel] : []),
      ...(interests.length ? ["Interests: " + interests.join(", ")] : []),
      "",
      "I understand that joining the interest list does not confirm chapter membership.",
    ].join("\n");
    setMessage(body);
    setSubject("Chapter interest — " + name);
    setCopyStatus("");
    requestAnimationFrame(() => resultRef.current?.focus());
  }

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(message);
      setCopyStatus("Message copied. Paste it into an email to " + contactLinks.email + ".");
    } catch {
      setCopyStatus("Select and copy the message below, then email it to " + contactLinks.email + ".");
    }
  }

  const inputClasses = "mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-ink focus:border-gt-navy focus:ring-2 focus:ring-gt-gold";

  return (
    <div>
      <form onSubmit={handleSubmit} onChange={() => setMessage("")} className="card p-6 sm:p-8">
        <p className="mb-6 text-sm leading-6 text-slate-600">Only your name and email are required.</p>
        <div className="grid gap-6 sm:grid-cols-2">
          <label className="font-bold text-gt-navy">
            Name <span className="font-normal text-slate-500">(required)</span>
            <input className={inputClasses} type="text" name="name" autoComplete="name" maxLength={80} required onInput={(event) => event.currentTarget.setCustomValidity("")} />
          </label>
          <label className="font-bold text-gt-navy">
            Email <span className="font-normal text-slate-500">(required)</span>
            <input className={inputClasses} type="email" name="email" autoComplete="email" maxLength={120} required />
          </label>
        </div>
        <details className="mt-6 rounded-xl border border-slate-200 p-4">
          <summary className="cursor-pointer font-bold text-gt-navy">Tell us what interests you <span className="font-normal text-slate-500">(optional)</span></summary>
          <label className="mt-5 block font-bold text-gt-navy">
            Academic year
            <select className={inputClasses} name="academicLevel" defaultValue="">
              <option value="">Prefer not to say</option>
              <option>First-year undergraduate</option>
              <option>Second-year undergraduate</option>
              <option>Third-year undergraduate</option>
              <option>Fourth-year or later undergraduate</option>
              <option>Graduate student</option>
              <option>Other</option>
            </select>
          </label>
          <fieldset className="mt-6">
            <legend className="font-bold text-gt-navy">What interests you?</legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {interestOptions.map((interest) => (
                <label key={interest} className="flex cursor-pointer items-center gap-3 rounded-xl bg-gt-cream p-3 text-sm font-semibold text-slate-700">
                  <input type="checkbox" name="interests" value={interest} className="h-5 w-5 shrink-0 accent-gt-navy" />
                  {interest}
                </label>
              ))}
            </div>
          </fieldset>
        </details>
        <p className="mt-6 text-sm leading-6 text-slate-600">This prepares an email for chapter updates. Nothing is sent or saved until you send it to the chapter.</p>
        <button type="submit" className="button button-primary mt-5">Prepare my interest email <span aria-hidden="true">→</span></button>
      </form>

      {message ? (
        <div ref={resultRef} tabIndex={-1} className="card mt-6 p-6 sm:p-8" aria-labelledby="interest-next-step">
          <h2 id="interest-next-step" className="text-2xl font-bold text-gt-navy">Your message is ready to send.</h2>
          <p className="mt-3 leading-7 text-slate-600">You have not joined the list yet. Send this message to {contactLinks.email} to complete your request.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a href={"mailto:" + contactLinks.email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(message)} className="button button-primary">Open email app</a>
            <button type="button" onClick={copyMessage} className="button button-secondary">Copy message</button>
          </div>
          <label className="mt-5 block text-sm font-bold text-gt-navy">
            Prepared message
            <textarea readOnly value={message} rows={8} className={inputClasses + " font-normal"} onFocus={(event) => event.currentTarget.select()} />
          </label>
          <p role="status" className="mt-3 text-sm leading-6 text-slate-600">{copyStatus}</p>
        </div>
      ) : null}
    </div>
  );
}
