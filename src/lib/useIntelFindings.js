import { useCallback, useEffect, useState } from "react";
import { mockFindings } from "../data/mockFindings";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7071/api";
const API_KEY = import.meta.env.VITE_API_KEY || "";
const FORCE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

function applyMinScore(arr, minScore) {
  return arr.filter((f) => (f.score || 0) >= minScore);
}

export function useIntelFindings(minScore = 30) {
  const [findings, setFindings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingMocks, setUsingMocks] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchFindings = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (FORCE_MOCKS) {
      setFindings(applyMinScore(mockFindings, minScore));
      setUsingMocks(true);
      setLastRefresh(new Date());
      setLoading(false);
      return;
    }

    try {
      const keyParam = API_KEY ? `&code=${API_KEY}` : "";
      const url = `${API_BASE}/get-intel-findings?min_score=${minScore}&limit=100${keyParam}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setFindings(data.findings || []);
      setUsingMocks(false);
      setLastRefresh(new Date());
    } catch (err) {
      console.warn("API findings failed, falling back to mocks:", err.message);
      setFindings(applyMinScore(mockFindings, minScore));
      setUsingMocks(true);
      setLastRefresh(new Date());
    } finally {
      setLoading(false);
    }
  }, [minScore]);

  useEffect(() => {
    fetchFindings();
  }, [fetchFindings]);

  return {
    findings,
    loading,
    error,
    usingMocks,
    lastRefresh,
    refresh: fetchFindings
  };
}
