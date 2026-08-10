"use client";

import { useEffect, useRef, useState } from "react";

export function Typewriter({
  text,
  delay = 0,
  className,
}: {
  text: string;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState("");
  const [started, setStarted] = useState(false);
  const [prevText, setPrevText] = useState(text);

  if (prevText !== text) {
    setPrevText(text);
    setShown("");
    setStarted(false);
  }

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const desktop = window.matchMedia("(min-width: 1024px)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let index = 0;
    let timer: number | undefined;

    const finish = () => {
      setShown(text);
      setStarted(false);
    };

    const tick = () => {
      const step = Math.max(1, Math.round(text.length / 60));
      index = Math.min(text.length, index + step);
      setShown(text.slice(0, index));
      setStarted(true);
      if (index < text.length) {
        timer = window.setTimeout(tick, 20);
      }
    };

    const begin = () => {
      if (desktop || reduced) {
        finish();
        return;
      }
      if (delay > 0) timer = window.setTimeout(tick, delay);
      else tick();
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          observer.disconnect();
          begin();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      if (timer) window.clearTimeout(timer);
    };
  }, [text, delay]);

  const typing = started && shown.length < text.length;

  return (
    <span ref={ref} className={className}>
      {shown}
      <span
        aria-hidden
        className={`ml-0.5 inline-block h-[1em] w-[2px] align-middle bg-current ${
          typing ? "animate-pulse" : "hidden"
        }`}
      />
    </span>
  );
}
