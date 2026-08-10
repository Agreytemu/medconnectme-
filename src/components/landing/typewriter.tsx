"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}

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

  const isClient = useIsClient();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const isReduced = useMediaQuery("(prefers-reduced-motion: reduce)");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let index = 0;
    let timer: number | undefined;

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

  const instant = !isClient || isDesktop || isReduced;
  const typing = started && shown.length < text.length;
  const display = instant ? text : shown;

  return (
    <span ref={ref} className={className}>
      {display}
      <span
        aria-hidden
        className={`ml-0.5 inline-block h-[1em] w-[2px] align-middle bg-current ${
          typing && !instant ? "animate-pulse" : "hidden"
        }`}
      />
    </span>
  );
}
