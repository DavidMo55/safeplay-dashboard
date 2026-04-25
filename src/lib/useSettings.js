import { useLocalStorage } from "./useLocalStorage";

const KEY = "safeplay.settings";

const DEFAULTS = {
  refreshIntervalSec: 0,
  language: "es",
  defaultMinScore: 30,
  presentationMode: false
};

export function useSettings() {
  const [settings, setSettings] = useLocalStorage(KEY, DEFAULTS);

  const update = (patch) =>
    setSettings((prev) => ({ ...DEFAULTS, ...prev, ...patch }));

  return [{ ...DEFAULTS, ...settings }, update];
}
