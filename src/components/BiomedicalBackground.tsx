"use client";

import { useEffect, useRef } from "react";
import { createTissue, drawTissue, resetTissue, stepTissue, stimulateTissue, type LensPointer } from "@/lib/biomedical-lens";
import styles from "./BiomedicalBackground.module.css";

export function BiomedicalBackground() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const root = rootRef.current; const canvas = canvasRef.current; const hero = root?.closest("section");
    const ctx = canvas?.getContext("2d");
    if (!root || !canvas || !hero || !ctx) return;
    const media = window.matchMedia("(min-width: 768px) and (hover: hover) and (pointer: fine)");
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const interactive = () => media.matches && !motionPreference.matches;
    let bounds = root.getBoundingClientRect();
    let tissue = createTissue(bounds.width, bounds.height, !interactive());
    let pointer: LensPointer | null = null;
    let frame = 0; let lastFrame = 0; let lastSignal = -Infinity; let visible = true;
    const render = (now: number) => drawTissue(ctx, tissue, now);
    const describe = (state: string, displacement: number) => {
      root.dataset.state = state; root.dataset.displacement = displacement.toFixed(3);
      root.dataset.reveal = tissue.reveal.toFixed(3); root.dataset.pulses = String(tissue.pulses.length);
      root.dataset.lensX = tissue.lens.x.toFixed(3); root.dataset.lensY = tissue.lens.y.toFixed(3);
    };
    const reset = () => {
      cancelAnimationFrame(frame); frame = 0; lastFrame = 0; pointer = null; lastSignal = -Infinity;
      resetTissue(tissue); describe(interactive() ? "idle" : "static", 0); render(performance.now());
    };
    const tick = (now: number) => {
      frame = 0;
      // A media change can be observed by rAF before its change event arrives.
      // Clear the old frame immediately; never leave revealed tissue frozen.
      if (!interactive()) { resize(); return; }
      if (!visible || document.hidden) { reset(); return; }
      const result = stepTissue(tissue, pointer, now, lastFrame ? (now-lastFrame)/1000 : 1/60); lastFrame = now;
      render(now); describe(result.active ? "active" : result.moving ? "settling" : "idle", result.displacement);
      if (result.moving) frame = requestAnimationFrame(tick); else lastFrame = 0;
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(tick); };
    const move = (event: PointerEvent) => {
      if (!interactive() || event.pointerType !== "mouse" || !visible || document.hidden) return;
      const x = event.clientX-bounds.left; const y = event.clientY-bounds.top;
      if (pointer && pointer.x === x && pointer.y === y) return;
      const now = performance.now(); pointer = { x,y,movedAt:now };
      if (now-lastSignal > 1300) { stimulateTissue(tissue,pointer,now); lastSignal=now; }
      schedule();
    };
    const release = () => { pointer=null; if (interactive() && visible && !document.hidden) schedule(); };
    const resize = () => {
      bounds=root.getBoundingClientRect(); const dpr=Math.min(window.devicePixelRatio || 1,2);
      canvas.width=Math.round(bounds.width*dpr); canvas.height=Math.round(bounds.height*dpr); ctx.setTransform(dpr,0,0,dpr,0,0);
      tissue=createTissue(bounds.width,bounds.height,!interactive()); root.dataset.cellCount=String(tissue.cells.length); root.dataset.interactive=String(interactive()); reset();
    };
    const scroll = () => { bounds=root.getBoundingClientRect(); release(); };
    const visibility = () => { if (document.hidden) reset(); };
    const observer=new IntersectionObserver(([entry]) => { visible=entry.isIntersecting; if (!visible) reset(); });
    const sizeObserver=new ResizeObserver(resize);
    resize(); observer.observe(hero); sizeObserver.observe(root);
    hero.addEventListener("pointermove",move,{passive:true}); hero.addEventListener("pointerleave",release); hero.addEventListener("pointercancel",release);
    media.addEventListener("change",resize); motionPreference.addEventListener("change",resize);
    window.addEventListener("resize",resize); window.addEventListener("blur",release);
    window.addEventListener("scroll",scroll,{passive:true}); document.addEventListener("visibilitychange",visibility);
    return () => {
      cancelAnimationFrame(frame); observer.disconnect(); sizeObserver.disconnect();
      hero.removeEventListener("pointermove",move); hero.removeEventListener("pointerleave",release); hero.removeEventListener("pointercancel",release);
      media.removeEventListener("change",resize); motionPreference.removeEventListener("change",resize);
      window.removeEventListener("resize",resize); window.removeEventListener("blur",release);
      window.removeEventListener("scroll",scroll); document.removeEventListener("visibilitychange",visibility);
    };
  },[]);
  return <div ref={rootRef} className={styles.background} data-testid="biomedical-background" data-interactive="false" data-state="static" aria-hidden="true">
    <canvas ref={canvasRef} className={styles.canvas}/>
  </div>;
}
