import { useCallback, useEffect, useState } from "react";

export function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw == null ? initial : JSON.parse(raw);
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // quota or privacy mode — ignore
    }
  }, [key, value]);

  useEffect(() => {
    function onStorage(e) {
      if (e.key === key && e.newValue != null) {
        try {
          setValue(JSON.parse(e.newValue));
        } catch {
          // ignore parse error
        }
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key]);

  const reset = useCallback(() => setValue(initial), [initial]);
  return [value, setValue, reset];
}
