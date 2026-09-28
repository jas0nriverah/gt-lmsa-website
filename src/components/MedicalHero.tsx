"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type MedicalHeroProps = {
  chapterName: string;
};

export function MedicalHero({ chapterName }: MedicalHeroProps) {
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [motionReady, setMotionReady] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(media.matches);
    updatePreference();
    setMotionReady(true);
    media.addEventListener("change", updatePreference);
    return () => media.removeEventListener("change", updatePreference);
  }, []);

  return (
    <div data-testid="medical-hero" className={`hero-art medical-hero${paused || reducedMotion || !motionReady ? " is-paused" : ""} relative mx-auto flex w-full max-w-md items-center justify-center overflow-hidden rounded-2xl border border-gt-gold/35 bg-gt-cream px-6`}>
      <svg
        aria-hidden="true"
        className={`medical-hero__routes${paused || reducedMotion ? " is-paused" : ""}`}
        viewBox="0 0 420 420"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="medical-route" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#003057" stopOpacity=".18" />
            <stop offset="1" stopColor="#003057" stopOpacity=".58" />
          </linearGradient>
        </defs>
        <g fill="none" stroke="url(#medical-route)" strokeWidth="1.15">
          <path className="medical-hero__route medical-hero__route--one" d="M-24 104 C55 102 82 151 139 164 C162 169 173 166 188 158" />
          <path className="medical-hero__route medical-hero__route--two" d="M444 94 C366 104 337 147 281 161 C257 167 246 164 231 156" />
          <path className="medical-hero__route medical-hero__route--three" d="M34 322 C105 288 131 250 165 225 C181 213 190 208 202 204" />
          <path className="medical-hero__route medical-hero__route--four" d="M402 329 C331 293 300 254 266 228 C249 215 240 210 228 205" />
          <path d="M13 195 C81 195 108 193 150 193" stroke="#b3a369" strokeOpacity=".58" />
          <path d="M270 193 C312 193 339 195 407 195" stroke="#b3a369" strokeOpacity=".58" />
        </g>
        <g className="medical-hero__nodes" fill="#b3a369">
          <circle cx="52" cy="112" r="3" />
          <circle cx="93" cy="135" r="2.4" />
          <circle cx="368" cy="113" r="3" />
          <circle cx="327" cy="137" r="2.4" />
          <circle cx="75" cy="303" r="3" />
          <circle cx="111" cy="278" r="2.4" />
          <circle cx="345" cy="305" r="3" />
          <circle cx="309" cy="279" r="2.4" />
        </g>
      </svg>

      <div className="medical-hero__identity relative z-10 flex flex-col items-center text-center">
        <Image
          src="/lmsa-logo.png"
          alt="Latino Medical Student Association PLUS logo"
          width={240}
          height={240}
          sizes="(max-width: 767px) 176px, 224px"
          className="h-44 w-44 rounded-full bg-white object-contain p-2 ring-1 ring-gt-gold/40 sm:h-56 sm:w-56"
          priority
        />
        <p className="mt-5 max-w-xs text-sm font-semibold leading-6 text-gt-navy">
          {chapterName}
        </p>
        <svg aria-hidden="true" className="medical-hero__pulse-band" viewBox="0 0 240 50" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 28 H64 L76 17 L86 39 L101 7 L117 39 L130 22 L142 28 H232" stroke="#003057" strokeOpacity=".16" />
          <path className="medical-hero__pulse" pathLength="270" d="M8 28 H64 L76 17 L86 39 L101 7 L117 39 L130 22 L142 28 H232" stroke="#b3a369" />
        </svg>
      </div>

      {!reducedMotion ? (
        <button
          type="button"
          className="medical-hero__motion-control"
          aria-label={paused ? "Play hero animation" : "Pause hero animation"}
          aria-pressed={paused}
          disabled={!motionReady}
          onClick={() => setPaused((current) => !current)}
        >
          {paused ? "Play motion" : "Pause motion"}
        </button>
      ) : null}
    </div>
  );
}
