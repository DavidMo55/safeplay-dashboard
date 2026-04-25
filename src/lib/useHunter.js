import { useCallback, useState } from "react";
import { mockHuntResponse, simulateHuntProgress } from "../data/mockFindings";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7071/api";
const API_KEY = import.meta.env.VITE_API_KEY || "";
const FORCE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

export function useHunter() {
  const [hunting, setHunting] = useState(false);
  const [lastHunt, setLastHunt] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(null);

  const launchHunt = useCallback(async (hashtags, maxPerTag = 15) => {
    setHunting(true);
    setError(null);
    setProgress({
      status: "initializing",
      message: "Inicializando agente de cacería...",
      hashtags
    });

    if (FORCE_MOCKS) {
      try {
        const data = await simulateHuntProgress(setProgress, hashtags);
        setLastHunt(data);
        return data;
      } finally {
        setHunting(false);
      }
    }

    try {
      const keyParam = API_KEY ? `&code=${API_KEY}` : "";
      const url = `${API_BASE}/hunt-tiktok${keyParam ? `?${keyParam.slice(1)}` : ""}`;

      setProgress({
        status: "scanning",
        message: `Escaneando TikTok: ${hashtags.join(", ")}...`,
        hashtags
      });

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hashtags,
          max_per_tag: maxPerTag
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setLastHunt(data);
      setProgress({
        status: "complete",
        message: `Cacería completa: ${data.findings_detected} amenazas detectadas`,
        ...data
      });
      return data;
    } catch (err) {
      console.warn("Hunt API failed, simulating with mocks:", err.message);
      try {
        const data = await simulateHuntProgress(setProgress, hashtags);
        setLastHunt(data);
        return data;
      } catch (innerErr) {
        const fallback = mockHuntResponse(hashtags);
        setLastHunt(fallback);
        setProgress({
          status: "complete",
          message: `Cacería simulada: ${fallback.findings_detected} amenazas`,
          ...fallback
        });
        return fallback;
      }
    } finally {
      setHunting(false);
    }
  }, []);

  return {
    hunting,
    lastHunt,
    error,
    progress,
    launchHunt
  };
}
