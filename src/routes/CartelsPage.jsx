import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Flame } from "lucide-react";
import { useIntelFindings } from "../lib/useIntelFindings";

const CARTEL_COLORS = {
  CJNG: "from-red-700 to-red-900",
  CARTEL_SINALOA: "from-purple-700 to-purple-900",
  "LA_MAÑA": "from-amber-700 to-amber-900",
  CARTEL_GOLFO: "from-blue-700 to-blue-900",
  FAMILIA: "from-green-700 to-green-900"
};

export default function CartelsPage() {
  const navigate = useNavigate();
  const { findings, loading } = useIntelFindings(0);

  const groups = useMemo(() => {
    const map = new Map();
    for (const f of findings) {
      const key = f.cartel_attribution || "SIN_ATRIBUCION";
      if (!map.has(key)) {
        map.set(key, { findings: [], scoreSum: 0, maxScore: 0, critical: 0 });
      }
      const g = map.get(key);
      g.findings.push(f);
      g.scoreSum += f.score || 0;
      g.maxScore = Math.max(g.maxScore, f.score || 0);
      if ((f.severity || "") === "CRITICAL") g.critical += 1;
    }
    return Array.from(map.entries())
      .map(([cartel, g]) => ({
        cartel,
        count: g.findings.length,
        avg: g.findings.length ? Math.round(g.scoreSum / g.findings.length) : 0,
        max: g.maxScore,
        critical: g.critical,
        recent: [...g.findings]
          .sort((a, b) => new Date(b.detected_at || 0) - new Date(a.detected_at || 0))
          .slice(0, 3)
      }))
      .sort((a, b) => b.count - a.count);
  }, [findings]);

  if (loading && findings.length === 0) {
    return <div className="p-12 text-center text-slate-500">Cargando…</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
          <Flame className="text-red-400" /> Carteles
        </h2>
        <p className="text-slate-400">
          Atribución agregada a partir de findings detectados.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {groups.map((g) => (
          <div
            key={g.cartel}
            className={`rounded-xl border-2 border-slate-800 overflow-hidden ${
              g.cartel !== "SIN_ATRIBUCION"
                ? `bg-gradient-to-br ${CARTEL_COLORS[g.cartel] || "from-slate-800 to-slate-900"}`
                : "bg-slate-900/40"
            }`}
          >
            <div className="p-5">
              <h3 className={`text-xl font-bold ${g.cartel !== "SIN_ATRIBUCION" ? "text-white" : "text-slate-200"}`}>
                {g.cartel.replace(/_/g, " ")}
              </h3>
              <div className="grid grid-cols-3 gap-2 mt-4">
                <Stat label="Findings" value={g.count} />
                <Stat label="Score promedio" value={g.avg} />
                <Stat label="Críticos" value={g.critical} />
              </div>
            </div>
            <div className="bg-slate-950/60 p-4 space-y-2">
              <div className="text-xs uppercase tracking-wider text-slate-400 mb-2">
                Recientes
              </div>
              {g.recent.length === 0 ? (
                <div className="text-xs text-slate-500">—</div>
              ) : (
                g.recent.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => navigate(`/findings/${f.id}`, { state: { finding: f } })}
                    className="block w-full text-left text-xs text-slate-300 hover:text-fuchsia-300 truncate"
                  >
                    @{f.author_name} · score {f.score} · {f.severity}
                  </button>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <div className="text-xs text-white/70 uppercase tracking-wider">{label}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </div>
  );
}
