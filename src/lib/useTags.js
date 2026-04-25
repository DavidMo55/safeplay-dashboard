import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";

const KEY = "safeplay.tags";

export function useTags() {
  const [map, setMap] = useLocalStorage(KEY, {});

  const get = useCallback(
    (id) => (map[String(id)] || []),
    [map]
  );

  const add = useCallback(
    (id, tag) => {
      const sid = String(id);
      const clean = String(tag || "").trim();
      if (!clean) return;
      setMap((prev) => {
        const current = prev[sid] || [];
        if (current.includes(clean)) return prev;
        return { ...prev, [sid]: [...current, clean] };
      });
    },
    [setMap]
  );

  const remove = useCallback(
    (id, tag) => {
      const sid = String(id);
      setMap((prev) => {
        const current = prev[sid] || [];
        const next = current.filter((t) => t !== tag);
        if (next.length === 0) {
          const copy = { ...prev };
          delete copy[sid];
          return copy;
        }
        return { ...prev, [sid]: next };
      });
    },
    [setMap]
  );

  const allTags = Array.from(
    new Set(Object.values(map).flat())
  ).sort();

  return { get, add, remove, allTags, map };
}
