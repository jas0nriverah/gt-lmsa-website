"use client";

import { useState, type FormEvent } from "react";
import { contactLinks } from "@/lib/site-data";

export function HelpRequestForm() {
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("");
  const [details, setDetails] = useState("");

  function prepareEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const subject = `Website help: ${topic}`;
    const body = [
      `Reply to: ${email}`,
      `Page: ${window.location.href}`,
      `Topic: ${topic}`,
      "",
      "Details:",
      details,
    ].join("\n");
    window.location.href = `mailto:${contactLinks.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  return (
    <form onSubmit={prepareEmail} className="card grid gap-6 p-6 sm:p-8">
      <h2 className="text-2xl font-bold text-gt-navy">Send a note</h2>
      <label className="grid gap-2 font-semibold text-slate-700">
        Your email
        <input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@gatech.edu"
          className="min-h-12 rounded-md border border-slate-300 px-4 font-normal"
        />
      </label>
      <label className="grid gap-2 font-semibold text-slate-700">
        What do you need help with?
        <select
          required
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
          className="min-h-12 rounded-md border border-slate-300 bg-white px-4 font-normal"
        >
          <option value="" disabled>Select a topic</option>
          <option>Joining the chapter</option>
          <option>Event information or RSVP</option>
          <option>Website issue</option>
          <option>Something else</option>
        </select>
      </label>
      <label className="grid gap-2 font-semibold text-slate-700">
        Tell us a little more
        <textarea
          required
          minLength={10}
          rows={5}
          value={details}
          onChange={(event) => setDetails(event.target.value)}
          placeholder="What happened, or what question can we help with?"
          className="rounded-md border border-slate-300 px-4 py-3 font-normal"
        />
      </label>
      <div>
        <button type="submit" className="button button-primary">
          Open email to send <span aria-hidden="true">→</span>
        </button>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Your email app will open with a draft. Review it and press Send; this form does not submit or store your message.
        </p>
      </div>
    </form>
  );
}
