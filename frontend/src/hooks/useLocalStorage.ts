"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { readStorage, writeStorage } from "@/lib/storage";

/**
 * useState that persists to localStorage under `key` and survives page refresh
 * and navigation. Rehydrates from storage on mount and whenever `key` changes
 * (e.g. switching to a different analysis), so each key keeps its own value.
 *
 * SSR-safe: initial render always uses `initialValue` (so server and first
 * client paint agree), then an effect reconciles with the stored value —
 * matching the pattern in useMediaQuery/ThemeContext.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): readonly [T, (updater: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(initialValue);
  // Keep the first initialValue stable so the rehydrate effect can depend on
  // `key` alone without re-running when a fresh literal is passed each render.
  const initialRef = useRef(initialValue);

  useEffect(() => {
    const stored = readStorage<T>(key);
    setValue(stored !== null ? stored : initialRef.current);
  }, [key]);

  const set = useCallback(
    (updater: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const next =
          typeof updater === "function"
            ? (updater as (prev: T) => T)(prev)
            : updater;
        writeStorage(key, next);
        return next;
      });
    },
    [key],
  );

  return [value, set] as const;
}
