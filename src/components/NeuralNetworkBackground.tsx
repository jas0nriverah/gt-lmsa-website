"use client";

import { useEffect, useRef } from "react";
import styles from "./NeuralNetworkBackground.module.css";

// A continuous edge-to-edge network; the contrast veil protects foreground copy.
const connections = [
  "M-40 470C130 465 190 286 460 345",
  "M460 345C578 372 646 278 790 320",
  "M460 345C508 214 640 189 682 52",
  "M790 320C876 285 906 163 1050 145",
  "M790 320C931 299 965 452 1100 420",
  "M790 320C794 447 888 458 920 590",
  "M1050 145C1164 112 1221 230 1340 280",
  "M1050 145C1009 53 1141 23 1150-40",
  "M1100 420C1152 339 1284 381 1340 280",
  "M1100 420C1065 505 1003 530 920 590",
  "M1340 280C1400 234 1460 228 1490 160",
  "M1340 280C1300 423 1460 461 1450 574",
  "M1100 420C1210 438 1198 592 1352 668",
  "M920 590C808 582 695 675 588 673",
  "M-50 30C40 15 85 108 140 135",
  "M140 135C260 160 305 290 460 345",
  "M140 135C280 62 390 148 560 80",
  "M140 135C88 219 156 311 90 390",
  "M90 390C178 413 185 498 290 530",
  "M290 530C380 480 386 400 460 345",
  "M290 530C360 601 486 591 588 673",
  "M-50 620C89 615 151 498 290 530",
  "M90 390C42 331-6 365-60 290",
];

const dendrites = [
  "M460 345C423 314 429 276 386 254M429 298L443 262M401 267L374 271M460 345C408 368 390 404 340 404M392 386L389 422",
  "M790 320C751 280 766 248 732 220M759 262L790 242M747 240L748 206M790 320C734 352 723 391 674 404M734 374L748 404M698 398L685 434",
  "M1050 145C1069 98 1035 74 1058 34M1049 76L1019 57M1050 145C1112 159 1120 202 1164 212M1129 190L1156 176M1144 204L1143 235M1050 145C1006 135 989 106 950 105M988 122L966 145",
  "M1100 420C1078 377 1102 347 1072 317M1091 356L1120 342M1084 331L1058 329M1100 420C1154 454 1172 489 1217 482M1171 476L1178 511M1198 485L1223 507",
  "M1340 280C1289 265 1277 228 1237 219M1281 242L1290 213M1256 225L1241 244M1340 280C1355 332 1386 342 1402 384M1380 338L1410 336M1392 363L1377 389",
  "M920 590C933 539 902 519 919 478M911 523L885 502M920 590C963 614 972 647 1009 656M967 631L991 622",
  "M140 135C153 93 191 93 209 55M181 96L177 64M140 135C102 123 94 95 58 94M98 114L72 131",
  "M290 530C272 485 297 469 280 437M286 476L312 460M290 530C245 554 229 595 191 599M228 579L229 610",
  "M90 390C119 350 111 325 133 302M112 344L139 341M90 390C70 438 83 454 64 490M72 452L41 461",
];

const neurons = [
  { x: 460, y: 345, gold: false },
  { x: 790, y: 320, gold: true },
  { x: 1050, y: 145, gold: false },
  { x: 1100, y: 420, gold: true },
  { x: 1340, y: 280, gold: false },
  { x: 920, y: 590, gold: false },
  { x: 140, y: 135, gold: true },
  { x: 290, y: 530, gold: false },
  { x: 90, y: 390, gold: false },
];

type Offset = { x: number; y: number };
const restingOffsets = () => neurons.map(() => ({ x: 0, y: 0 }));
const geometry = connections.map((path) => {
  const points = path.match(/-?\d+(?:\.\d+)?/g)!.map(Number);
  return {
    points,
    from: neurons.findIndex((node) => node.x === points[0] && node.y === points[1]),
    to: neurons.findIndex((node) => node.x === points[6] && node.y === points[7]),
  };
});

// Move both endpoints and their Bezier handles together, keeping synapses joined.
function connectionPath(index: number, offsets: Offset[]) {
  const { points, from, to } = geometry[index];
  const start = offsets[from] ?? { x: 0, y: 0 };
  const end = offsets[to] ?? { x: 0, y: 0 };
  if (!start.x && !start.y && !end.x && !end.y) return connections[index];
  const moved = points.map((value, i) => {
    const weight = Math.floor(i / 2) / 3;
    const axis = i % 2 === 0 ? "x" : "y";
    return (value + start[axis] * (1 - weight) + end[axis] * weight).toFixed(3);
  });
  return `M${moved[0]} ${moved[1]}C${moved.slice(2).join(" ")}`;
}

export function NeuralNetworkBackground() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const hero = root?.closest("section");
    const svg = root?.querySelector("svg");
    if (!root || !hero || !svg) return;
    const media = window.matchMedia("(min-width: 768px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    const nodes = [...root.querySelectorAll<SVGGElement>("[data-neuron]")];
    const branches = [...root.querySelectorAll<SVGGElement>("[data-dendrite]")];
    const halos = [...root.querySelectorAll<SVGCircleElement>("[data-halo]")];
    const pulseHalos = [...root.querySelectorAll<SVGCircleElement>("[data-pulse-halo]")];
    const paths = [...root.querySelectorAll<SVGPathElement>("[data-connection]")];
    const signals = [...root.querySelectorAll<SVGPathElement>("[data-signal]")];
    const introSignals = [...root.querySelectorAll<SVGPathElement>("[data-intro-signal]")];
    const animations = new Set<Animation>();
    let frame = 0;
    let pointer: { x: number; y: number } | null = null;
    let lastSignal = -Infinity;
    let visible = true;

    const applyOffsets = (offsets: Offset[], strengths: number[]) => {
      nodes.forEach((node, i) => {
        node.setAttribute("transform", `translate(${neurons[i].x + offsets[i].x} ${neurons[i].y + offsets[i].y})`);
        branches[i].setAttribute("transform", `translate(${offsets[i].x} ${offsets[i].y})`);
        halos[i].style.opacity = String(strengths[i] * 0.32);
      });
      paths.forEach((path, i) => {
        const d = connectionPath(i, offsets);
        path.setAttribute("d", d);
        signals[i].setAttribute("d", d);
      });
      introSignals.forEach((path) => path.setAttribute("d", connectionPath(Number(path.dataset.introSignal), offsets)));
    };
    const reset = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      pointer = null;
      lastSignal = -Infinity;
      animations.forEach((animation) => animation.cancel());
      animations.clear();
      applyOffsets(restingOffsets(), neurons.map(() => 0));
    };
    const play = (element: SVGElement, keyframes: Keyframe[]) => {
      const animation = element.animate(keyframes, { duration: 1800, easing: "ease-in-out" });
      animations.add(animation);
      animation.onfinish = () => { animations.delete(animation); animation.cancel(); };
    };
    const update = () => {
      frame = 0;
      if (!pointer || !media.matches || !visible || document.hidden) return;
      const matrix = svg.getScreenCTM();
      if (!matrix) return;
      const cursor = new DOMPoint(pointer.x, pointer.y).matrixTransform(matrix.inverse());
      const radius = 180 / Math.max(Math.abs(matrix.a), 0.01);
      const strengths = neurons.map((node) => Math.max(0, 1 - Math.hypot(cursor.x - node.x, cursor.y - node.y) / radius));
      const offsets = neurons.map((node, i) => ({
        x: Math.max(-6, Math.min(6, (cursor.x - node.x) * 0.045)) * strengths[i],
        y: Math.max(-6, Math.min(6, (cursor.y - node.y) * 0.045)) * strengths[i],
      }));
      applyOffsets(offsets, strengths);
      const closest = strengths.indexOf(Math.max(...strengths));
      const now = performance.now();
      if (strengths[closest] > 0.22 && now - lastSignal > 2000) {
        lastSignal = now;
        const connected = geometry.flatMap((edge, i) => edge.from === closest || edge.to === closest ? [i] : []);
        const edge = connected[Math.floor(now / 2000) % connected.length];
        if (edge !== undefined) {
          // Signals leave the activated synapse, even on incoming connections.
          const direction = geometry[edge].from === closest ? 1 : -1;
          play(signals[edge], [
            { strokeDashoffset: String(direction), opacity: 0 },
            { opacity: 0.55, offset: 0.25 },
            { opacity: 0.4, offset: 0.7 },
            { strokeDashoffset: String(-direction), opacity: 0 },
          ]);
          play(pulseHalos[closest], [
            { opacity: 0, transform: "scale(0.8)" },
            { opacity: 0.24, offset: 0.3 },
            { opacity: 0, transform: "scale(1.55)" },
          ]);
        }
      }
    };
    const move = (event: PointerEvent) => {
      if (!media.matches || event.pointerType !== "mouse" || !visible || document.hidden) return;
      pointer = { x: event.clientX, y: event.clientY };
      if (!frame) frame = requestAnimationFrame(update);
    };
    const preferenceChanged = () => {
      root.dataset.interactive = String(media.matches);
      reset();
    };
    const visibilityChanged = () => { if (document.hidden) reset(); };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) reset();
    });
    preferenceChanged();
    observer.observe(hero);
    hero.addEventListener("pointermove", move, { passive: true });
    hero.addEventListener("pointerleave", reset);
    hero.addEventListener("pointercancel", reset);
    media.addEventListener("change", preferenceChanged);
    window.addEventListener("blur", reset);
    window.addEventListener("resize", reset);
    window.addEventListener("scroll", reset, { passive: true });
    document.addEventListener("visibilitychange", visibilityChanged);
    return () => {
      reset();
      observer.disconnect();
      hero.removeEventListener("pointermove", move);
      hero.removeEventListener("pointerleave", reset);
      hero.removeEventListener("pointercancel", reset);
      media.removeEventListener("change", preferenceChanged);
      window.removeEventListener("blur", reset);
      window.removeEventListener("resize", reset);
      window.removeEventListener("scroll", reset);
      document.removeEventListener("visibilitychange", visibilityChanged);
    };
  }, []);

  return (
    <div ref={rootRef} data-testid="neural-network" data-interactive="false" className={styles.background} aria-hidden="true">
      <svg className={styles.network} viewBox="0 0 1400 640" preserveAspectRatio="xMidYMid slice" fill="none" focusable="false">
        <g className={styles.biology}>
          <path d="M1000-30C1190 40 960 130 1140 205S960 370 1140 440M1140-30C950 40 1180 130 1000 205S1180 370 1000 440" />
          <path d="M1025 0H1115M1040 75H1100M1020 150H1120M1040 225H1100M1020 300H1120M1040 375H1100" />
          <path d="M730 555C775 542 795 545 820 550L835 550L842 542L850 566L860 529L872 554L882 550C906 547 915 565 938 568" />
          <path d="M-30 230C30 220 42 224 64 226L79 226L85 219L92 238L101 210L111 230L120 226C147 221 174 234 207 243" />
        </g>
        <g className={styles.connections}>
          {connections.map((path, i) => <path key={path} data-connection={i} d={path} pathLength="1" />)}
        </g>
        <g className={styles.dendrites}>
          {dendrites.map((path, i) => <g key={path} data-dendrite={i}><path d={path} pathLength="1" /></g>)}
        </g>
        <g className={styles.signals}>
          {[3, 8, 15].map((index) => (
            <path key={index} data-intro-signal={index} d={connections[index]} pathLength="1" />
          ))}
        </g>
        <g className={styles.pointerSignals}>
          {connections.map((path, i) => <path key={path} data-signal={i} d={path} pathLength="1" />)}
        </g>
        <g className={styles.neurons}>
          {neurons.map(({ x, y, gold }, i) => (
            <g key={`${x}-${y}`} data-neuron={i} transform={`translate(${x} ${y})`} className={gold ? styles.goldNeuron : styles.navyNeuron}>
              <circle data-halo={i} r="20" className={styles.halo} />
              <circle data-pulse-halo={i} r="22" className={styles.pulseHalo} />
              <path d="M-13-4C-6-6-5-12 1-10C7-8 6-3 13 1C6 3 5 11-1 9C-7 8-6 3-13-4Z" />
              <circle r="2.5" />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
