"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fnRef = useRef(fn);

  useEffect(() => {
    fnRef.current = fn;
  });

  const run = useCallback(() => {
    setLoading(true);
    setError(null);
    return fnRef.current().then(
      (result) => {
        setData(result);
        setLoading(false);
      },
      (err) => {
        setError(err instanceof Error ? err.message : "Something went wrong");
        setLoading(false);
      }
    );
  }, []);

  useEffect(() => {
    let active = true;
    fnRef.current().then(
      (result) => {
        if (!active) return;
        setData(result);
        setLoading(false);
      },
      (err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Something went wrong");
        setLoading(false);
      }
    );
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, refetch: run };
}
