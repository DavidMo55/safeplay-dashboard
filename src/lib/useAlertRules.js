import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useLocalStorage } from "./useLocalStorage";
import { sendNotification } from "./useNotifications";

const RULES_KEY = "safeplay.alertRules";
const SEEN_KEY = "safeplay.alertSeen";

export function useAlertRules() {
  const [rules, setRules] = useLocalStorage(RULES_KEY, []);

  const create = useCallback(
    (rule) => {
      setRules((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          enabled: true,
          createdAt: new Date().toISOString(),
          ...rule
        }
      ]);
    },
    [setRules]
  );

  const remove = useCallback(
    (id) => setRules((prev) => prev.filter((r) => r.id !== id)),
    [setRules]
  );

  const toggle = useCallback(
    (id) =>
      setRules((prev) =>
        prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
      ),
    [setRules]
  );

  return { rules, create, remove, toggle };
}

function matches(rule, finding) {
  if (rule.minScore != null && finding.score < rule.minScore) return false;
  if (rule.severity && rule.severity !== "ANY" && finding.severity !== rule.severity)
    return false;
  if (rule.cartel && rule.cartel !== "ANY" && finding.cartel_attribution !== rule.cartel)
    return false;
  return true;
}

export function useAlertEvaluator(findings) {
  const { rules } = useAlertRules();
  const seenRef = useRef(loadSeen());

  useEffect(() => {
    if (!findings || findings.length === 0) return;
    const seen = seenRef.current;
    const fresh = [];
    for (const f of findings) {
      const fid = String(f.id);
      if (seen[fid]) continue;
      for (const r of rules) {
        if (!r.enabled) continue;
        if (matches(r, f)) {
          fresh.push({ rule: r, finding: f });
          break;
        }
      }
      seen[fid] = 1;
    }

    saveSeen(seen);

    for (const m of fresh) {
      const title = `🚨 Alerta: ${m.rule.name || "Regla"}`;
      const body = `@${m.finding.author_name} · score ${m.finding.score} · ${m.finding.severity || "-"}`;
      toast(title, { description: body });
      if (m.rule.notify) {
        sendNotification(title, { body });
      }
    }
  }, [findings, rules]);
}

function loadSeen() {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveSeen(seen) {
  try {
    const keys = Object.keys(seen);
    if (keys.length > 2000) {
      const trimmed = {};
      for (const k of keys.slice(-1000)) trimmed[k] = 1;
      localStorage.setItem(SEEN_KEY, JSON.stringify(trimmed));
    } else {
      localStorage.setItem(SEEN_KEY, JSON.stringify(seen));
    }
  } catch {
    // ignore
  }
}
