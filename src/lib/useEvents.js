import { useCallback, useEffect, useState } from "react";
import { mockEvents } from "../data/mockEvents";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7071/api";
const API_KEY = import.meta.env.VITE_API_KEY || "";
const FORCE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

export function useEvents(limit = 50) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingMocks, setUsingMocks] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (FORCE_MOCKS) {
      setEvents(mockEvents.slice(0, limit));
      setUsingMocks(true);
      setLastRefresh(new Date());
      setLoading(false);
      return;
    }

    try {
      const keyParam = API_KEY ? `&code=${API_KEY}` : "";
      const url = `${API_BASE}/get-events?limit=${limit}${keyParam}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setEvents(data.events || []);
      setUsingMocks(false);
      setLastRefresh(new Date());
    } catch (err) {
      console.warn("API events failed, falling back to mocks:", err.message);
      setEvents(mockEvents.slice(0, limit));
      setUsingMocks(true);
      setLastRefresh(new Date());
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    loading,
    error,
    usingMocks,
    lastRefresh,
    refresh: fetchEvents
  };
}
