"use client";

import { useEffect, useRef } from "react";

const TOTAL = 300;
const DIR = "/aboutus%20frames/ezgif-7c5b6fc9987d975f-jpg/ezgif-frame-";

export function FrameSequence() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgs = useRef<Array<HTMLImageElement | null>>(
    new Array(TOTAL).fill(null)
  );
  const loaded = useRef<Array<boolean>>(new Array(TOTAL).fill(false));
  const started = useRef<Set<number>>(new Set());
  const current = useRef(-1);

  const load = (i: number) => {
    if (i < 0 || i >= TOTAL || started.current.has(i)) return;
    started.current.add(i);
    const img = new window.Image();
    const n = String(i + 1).padStart(3, "0");
    img.src = `${DIR}${n}.jpg`;
    const idx = i;
    img.onload = () => {
      loaded.current[idx] = true;
      if (current.current === idx) draw(idx);
    };
    imgs.current[i] = img;
  };

  const draw = (idx: number) => {
    const canvas = canvasRef.current;
    const img = imgs.current[idx];
    if (!canvas || !img || !loaded.current[idx]) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const cw = canvas.width;
    const ch = canvas.height;
    if (!cw || !ch) return;
    const scale = Math.max(cw / img.width, ch / img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;
    const dx = (cw - dw) / 2;
    const dy = (ch - dh) / 2;
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, dx, dy, dw, dh);
  };

  const resize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    if (current.current >= 0) draw(current.current);
  };

  const compute = () => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const rect = wrap.getBoundingClientRect();
    const vh = window.innerHeight;
    const scrollable = rect.height - vh;
    let progress = 0;
    if (scrollable > 0) {
      progress = Math.min(Math.max(-rect.top / scrollable, 0), 1);
    }
    const idx = Math.min(TOTAL - 1, Math.floor(progress * TOTAL));
    if (idx !== current.current) {
      current.current = idx;
      load(idx);
      load(idx + 1);
      load(idx + 2);
      draw(idx);
    }
  };

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    resize();

    let raf = 0;
    let running = false;
    const loop = () => {
      compute();
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            load(0);
            start();
          } else {
            stop();
          }
        });
      },
      { root: null, rootMargin: "300px" }
    );
    io.observe(wrap);

    window.addEventListener("resize", resize);
    return () => {
      io.disconnect();
      stop();
      window.removeEventListener("resize", resize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={wrapRef} className="relative h-[320vh]">
      <div className="sticky top-0 flex h-screen items-center justify-center">
        <div className="flex w-full max-w-4xl flex-col items-center gap-5 px-4">
          <canvas
            ref={canvasRef}
            className="aspect-[4/3] h-[68vh] w-auto rounded-2xl bg-slate-100 shadow-2xl ring-1 ring-slate-900/[0.06]"
          />
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            {`Scroll to explore`}
            <span className="h-1 w-1 rounded-full bg-slate-300" />
          </div>
        </div>
      </div>
    </div>
  );
}
