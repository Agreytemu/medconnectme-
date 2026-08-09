"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type ScrollerValue = {
  scrollTo: (id: string) => void;
  activeId: string | null;
  index: number;
  total: number;
  desktop: boolean;
};

const ScrollerContext = createContext<ScrollerValue>({
  scrollTo: () => {},
  activeId: null,
  index: 0,
  total: 1,
  desktop: false,
});

export function useScroller() {
  return useContext(ScrollerContext);
}

export function Panel({
  id,
  className = "",
  innerClassName = "",
  children,
}: {
  id: string;
  className?: string;
  innerClassName?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      data-panel={id}
      className={`w-full shrink-0 snap-start lg:h-screen lg:w-screen lg:overflow-x-hidden lg:overflow-y-auto ${className}`}
    >
      <div
        className={`mx-auto flex min-h-full w-full max-w-6xl flex-col px-6 pt-20 pb-16 [justify-content:safe_center] lg:pb-10 ${innerClassName}`}
      >
        {children}
      </div>
    </section>
  );
}

export function PanelScroller({
  nav,
  children,
}: {
  nav?: ReactNode;
  children: ReactNode;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const idsRef = useRef<string[]>([]);
  const suppressClick = useRef(false);
  const draggingRef = useRef(false);
  const settleTimer = useRef<number | null>(null);
  const wheelAccum = useRef(0);
  const navLockedUntil = useRef(0);
  const lastIndexRef = useRef(0);
  const [desktop, setDesktop] = useState(false);
  const [progress, setProgress] = useState(0);
  const [index, setIndex] = useState(0);
  const [total, setTotal] = useState(1);
  const [activeId, setActiveId] = useState<string | null>(null);
  const dragRef = useRef<{
    startX: number;
    startLeft: number;
    moved: boolean;
  } | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    idsRef.current = [...el.querySelectorAll("[data-panel]")]
      .map((n) => n.getAttribute("data-panel") || "")
      .filter(Boolean);
    setTotal(idsRef.current.length);
  }, [children]);

  const getIndex = useCallback(() => {
    const el = trackRef.current;
    if (!el) return 0;
    return Math.round(el.scrollLeft / el.clientWidth);
  }, []);

  const scrollToIndex = useCallback((i: number) => {
    const el = trackRef.current;
    if (!el || !idsRef.current.length) return;
    const idx = Math.max(0, Math.min(idsRef.current.length - 1, i));
    const target = el.querySelector<HTMLElement>(`[data-panel="${idsRef.current[idx]}"]`);
    if (!target) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: target.offsetLeft, behavior: reduce ? "auto" : "smooth" });
  }, []);

  const scrollTo = useCallback(
    (id: string) => {
      if (!desktop) {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        return;
      }
      scrollToIndex(idsRef.current.indexOf(id));
    },
    [desktop, scrollToIndex]
  );

  useEffect(() => {
    if (!desktop) return;
    const el = trackRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement | null;
      const panel = target?.closest?.("[data-panel]") as HTMLElement | null;
      if (panel && panel.scrollHeight - panel.clientHeight > 48) {
        const atTop = panel.scrollTop <= 1;
        const atBottom =
          panel.scrollTop + panel.clientHeight >= panel.scrollHeight - 1;
        const canScroll =
          (e.deltaY > 0 && !atBottom) || (e.deltaY < 0 && !atTop);
        if (canScroll) {
          e.preventDefault();
          panel.scrollTop += e.deltaY;
          return;
        }
      }
      if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
      e.preventDefault();
      const now = performance.now();
      if (now < navLockedUntil.current) {
        wheelAccum.current = 0;
        return;
      }
      wheelAccum.current += e.deltaY;
      if (Math.abs(wheelAccum.current) >= 90) {
        const dir = wheelAccum.current < 0 ? -1 : 1;
        wheelAccum.current = 0;
        navLockedUntil.current = now + 600;
        scrollToIndex(lastIndexRef.current + dir);
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [desktop, scrollToIndex]);

  const snapToNearest = useCallback(() => {
    const el = trackRef.current;
    if (!el || draggingRef.current) return;
    scrollToIndex(getIndex());
  }, [scrollToIndex, getIndex]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = el.scrollWidth - el.clientWidth;
        setProgress(max > 0 ? el.scrollLeft / max : 0);
        const i = Math.round(el.scrollLeft / el.clientWidth);
        lastIndexRef.current = i;
        setIndex(i);
        setActiveId(idsRef.current[i] ?? null);
        if (!draggingRef.current) {
          if (settleTimer.current) window.clearTimeout(settleTimer.current);
          settleTimer.current = window.setTimeout(() => snapToNearest(), 220);
        }
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
      if (settleTimer.current) window.clearTimeout(settleTimer.current);
    };
  }, [snapToNearest]);

  useEffect(() => {
    if (!desktop) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        scrollToIndex(lastIndexRef.current + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        scrollToIndex(lastIndexRef.current - 1);
      } else if (e.key === "Home") {
        e.preventDefault();
        scrollToIndex(0);
      } else if (e.key === "End") {
        e.preventDefault();
        scrollToIndex(9999);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [desktop, scrollToIndex]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!desktop) return;
    const el = trackRef.current;
    if (!el) return;
    const startX = e.clientX;
    const startLeft = el.scrollLeft;
    dragRef.current = { startX, startLeft, moved: false };
    const onMove = (ev: PointerEvent) => {
      const st = dragRef.current;
      if (!st || !trackRef.current) return;
      const dx = ev.clientX - st.startX;
      trackRef.current.scrollLeft = st.startLeft - dx;
      if (Math.abs(dx) > 6 && !st.moved) {
        dragRef.current = { ...st, moved: true };
        suppressClick.current = true;
      }
    };
    const endDrag = () => {
      const st = dragRef.current;
      const moved = st ? st.moved : false;
      dragRef.current = null;
      draggingRef.current = false;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", endDrag);
      window.removeEventListener("pointercancel", endDrag);
      setTimeout(() => {
        suppressClick.current = false;
      }, 0);
      if (moved) setTimeout(() => snapToNearest(), 90);
    };
    draggingRef.current = true;
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);
  };

  const onClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (suppressClick.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <ScrollerContext.Provider
      value={{ scrollTo, activeId, index, total, desktop }}
    >
      {nav}
      <div
        ref={trackRef}
        onPointerDown={onPointerDown}
        onClickCapture={onClickCapture}
        className={`min-h-screen cursor-grab active:cursor-grabbing lg:h-screen lg:flex lg:overflow-x-auto lg:overscroll-x-contain lg:touch-pan-x`}
        data-panel-track
      >
        {children}
      </div>
      {desktop && (
        <div className="pointer-events-none fixed bottom-5 right-6 z-50 hidden items-center gap-3 lg:flex">
          <div className="h-px w-28 overflow-hidden bg-slate-200">
            <div
              className="h-full bg-slate-900 transition-[width] duration-200"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <span className="text-xs tabular-nums text-slate-400">
            {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
        </div>
      )}
    </ScrollerContext.Provider>
  );
}
