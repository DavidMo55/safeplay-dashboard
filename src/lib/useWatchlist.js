import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";

const KEY = "safeplay.watchlist";

export function useWatchlist() {
  const [ids, setIds] = useLocalStorage(KEY, []);

  const has = useCallback((id) => ids.includes(String(id)), [ids]);

  const toggle = useCallback(
    (id) => {
      const sid = String(id);
      setIds((prev) =>
        prev.includes(sid) ? prev.filter((x) => x !== sid) : [...prev, sid]
      );
    },
    [setIds]
  );

  const clear = useCallback(() => setIds([]), [setIds]);

  return { ids, has, toggle, clear, count: ids.length };
}
