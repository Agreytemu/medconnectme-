"use client";

import { useEffect, useRef, useState } from "react";
import { useLang } from "@/lib/i18n/LanguageContext";
import { Logo } from "@/components/ui/logo";

const TOTAL = 300;
const DIR = "/aboutus%20frames/ezgif-7c5b6fc9987d975f-jpg/ezgif-frame-";

type Caption = { title: string; text: string };

export function FrameSequence({ captions = [] }: { captions?: Caption[] }) {
  const { t } = useLang();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgs = useRef<Array<HTMLImageElement | null>>(
    new Array(TOTAL).fill(null)
  );
  const loaded = useRef<Array<boolean>>(new Array(TOTAL).fill(false));
  const started = useRef<Set<number>>(new Set());
  const current = useRef(-1);
  const [captionIndex, setCaptionIndex] = useState(0);

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
    const frameIdx = Math.min(TOTAL - 1, Math.floor(progress * TOTAL));
    if (frameIdx !== current.current) {
      current.current = frameIdx;
      load(frameIdx);
      load(frameIdx + 1);
      load(frameIdx + 2);
      draw(frameIdx);
    }
    if (captions.length > 0) {
      const capIdx = Math.min(
        captions.length - 1,
        Math.floor(progress * captions.length)
      );
      setCaptionIndex((prev) => (prev === capIdx ? prev : capIdx));
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
    <div
      ref={wrapRef}
      className="relative h-[320vh] -mx-6 -mt-20 -mb-16"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-slate-900">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/45 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-60 bg-gradient-to-t from-black/60 to-transparent" />

        <div className="absolute left-5 top-6 flex items-center gap-2 text-white/90">
          <Logo className="h-7 w-7 rounded-md bg-white/15 p-1" />
          <span className="text-sm font-semibold">{t("appName")}</span>
        </div>

        {captions.length > 0 && captions[captionIndex] && (
          <div className="absolute inset-x-0 bottom-0 px-6 pb-12 sm:px-10 sm:pb-16">
            <div key={captionIndex} className="caption-in max-w-2xl">
              <h3 className="text-xl font-semibold text-white drop-shadow-sm sm:text-2xl">
                {captions[captionIndex].title}
              </h3>
              <p className="mt-2 text-sm text-white/85 drop-shadow-sm sm:text-base">
                {captions[captionIndex].text}
              </p>
            </div>
            <div className="mt-5 flex gap-2">
              {captions.map((_, i) => (
                <span
                  key={i}
                  className={
                    "h-1.5 rounded-full transition-all duration-300 " +
                    (i === captionIndex
                      ? "w-7 bg-white"
                      : "w-1.5 bg-white/40")
                  }
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
