"use client";

import { useEffect, useRef } from "react";
import { closestNeuron, createNeuralField, drawNeuralField, resetNeuralField, stepNeuralField, stimulateNeuron, type FieldPointer } from "@/lib/neural-field";
import styles from "./NeuralNetworkBackground.module.css";

export function NeuralNetworkBackground() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const hero = root?.closest("section");
    const ctx = canvas?.getContext("2d");
    if (!root || !canvas || !hero || !ctx) return;
    const media = window.matchMedia("(min-width: 768px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    let bounds = root.getBoundingClientRect();
    let field = createNeuralField(bounds.width, bounds.height);
    let pointer: FieldPointer | null = null;
    let frame = 0;
    let lastFrame = 0;
    let lastSignal = -Infinity;
    let visible = true;
    let disposed = false;
    const render = (now: number) => drawNeuralField(ctx, field, now);
    const reset = () => {
      cancelAnimationFrame(frame); frame = 0; pointer = null; lastFrame = 0; lastSignal = -Infinity;
      resetNeuralField(field);
      root.dataset.state = media.matches ? "idle" : "static";
      root.dataset.activeNeuron = "-1"; root.dataset.displacement = "0"; root.dataset.pulses = "0";
      render(performance.now());
    };
    const tick = (now: number) => {
      frame = 0;
      if (disposed || !media.matches || !visible || document.hidden) return;
      const result = stepNeuralField(field, pointer, now, lastFrame ? (now - lastFrame) / 1000 : 1 / 60);
      lastFrame = now;
      render(now);
      root.dataset.state = result.active ? "active" : result.moving ? "settling" : "idle";
      root.dataset.activeNeuron = result.active && pointer ? String(pointer.closest) : "-1";
      root.dataset.displacement = result.displacement.toFixed(3);
      root.dataset.pulses = String(field.pulses.length);
      if (result.moving) frame = requestAnimationFrame(tick);
      else lastFrame = 0;
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(tick); };
    const move = (event: PointerEvent) => {
      if (!media.matches || event.pointerType !== "mouse" || !visible || document.hidden) return;
      const now = performance.now();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;
      if (pointer && pointer.x === x && pointer.y === y) return;
      const closest = closestNeuron(field, x, y);
      // Switching regions responds immediately; sustained motion is rate limited.
      if (now - lastSignal > 900 || (pointer?.closest !== closest && now - lastSignal > 180)) {
        stimulateNeuron(field, closest, now); lastSignal = now;
      }
      pointer = { x, y, closest, movedAt: now };
      schedule();
    };
    const release = () => { pointer = null; if (media.matches && visible && !document.hidden) schedule(); };
    const resize = () => {
      bounds = root.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(bounds.width * dpr); canvas.height = Math.round(bounds.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      field = createNeuralField(bounds.width, bounds.height);
      root.dataset.neuronCount = String(field.neurons.length);
      root.dataset.interactive = String(media.matches);
      reset();
    };
    const scroll = () => { bounds = root.getBoundingClientRect(); release(); };
    const visibility = () => { if (document.hidden) reset(); };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (!visible) reset(); });
    const sizeObserver = new ResizeObserver(resize);
    resize(); observer.observe(hero); sizeObserver.observe(root);
    hero.addEventListener("pointermove", move, { passive: true });
    hero.addEventListener("pointerleave", release); hero.addEventListener("pointercancel", release);
    media.addEventListener("change", resize);
    window.addEventListener("resize", resize); window.addEventListener("blur", release);
    window.addEventListener("scroll", scroll, { passive: true });
    document.addEventListener("visibilitychange", visibility);
    return () => {
      disposed = true; cancelAnimationFrame(frame); observer.disconnect(); sizeObserver.disconnect();
      hero.removeEventListener("pointermove", move); hero.removeEventListener("pointerleave", release); hero.removeEventListener("pointercancel", release);
      media.removeEventListener("change", resize); window.removeEventListener("resize", resize); window.removeEventListener("blur", release);
      window.removeEventListener("scroll", scroll); document.removeEventListener("visibilitychange", visibility);
    };
  }, []);

  return <div ref={rootRef} data-testid="neural-network" data-interactive="false" data-state="static" className={styles.background} aria-hidden="true">
    <canvas ref={canvasRef} className={styles.canvas} />
  </div>;
}
