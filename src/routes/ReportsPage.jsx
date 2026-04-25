import { useMemo, useState } from "react";
import { FileText, Download } from "lucide-react";
import { toast } from "sonner";
import { useIntelFindings } from "../lib/useIntelFindings";
import { buildReportPdf } from "../lib/buildPdf";
import { exportCSV, exportJSON } from "../lib/exportData";

const PRESETS = [
  { id: "24h", label: "Últimas 24h", hours: 24 },
  { id: "7d", label: "Últimos 7 días", hours: 24 * 7 },
  { id: "30d", label: "Últimos 30 días", hours: 24 * 30 },
  { id: "all", label: "Todo", hours: null }
];

export default function ReportsPage() {
  const { findings, loading } = useIntelFindings(0);
  const [preset, setPreset] = useState("7d");

  const filtered = useMemo(() => {
    const cfg = PRESETS.find((p) => p.id === preset);
    if (!cfg || cfg.hours == null) return findings;
    const cutoff = Date.now() - cfg.hours * 3600 * 1000;
    return findings.filter((f) => {
      const t = f.detected_at ? new Date(f.detected_at).getTime() : 0;
      return t >= cutoff;
    });
  }, [findings, preset]);

  const presetLabel = PRESETS.find((p) => p.id === preset)?.label || "—";

  const stats = useMemo(() => {
    const bySeverity = {};
    const byCartel = {};
    let scoreSum = 0;
    for (const f of filtered) {
      const s = f.severity || "UNKNOWN";
      bySeverity[s] = (bySeverity[s] || 0) + 1;
      const c = f.cartel_attribution || "—";
      byCartel[c] = (byCartel[c] || 0) + 1;
      scoreSum += f.score || 0;
    }
    return {
      total: filtered.length,
      avg: filtered.length ? Math.round(scoreSum / filtered.length) : 0,
      bySeverity,
      byCartel
    };
  }, [filtered]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
          <FileText className="text-fuchsia-400" /> Reportes
        </h2>
        <p className="text-slate-400">
          Genera briefings PDF/CSV/JSON sobre los findings detectados.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => setPreset(p.id)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition ${
              preset === p.id
                ? "bg-fuchsia-500/20 border-fuchsia-500/40 text-fuchsia-200"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Findings" value={stats.total} />
        <Stat label="Score promedio" value={stats.avg} />
        <Stat label="Críticos" value={stats.bySeverity.CRITICAL || 0} />
        <Stat label="Altos" value={stats.bySeverity.HIGH || 0} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Block title="Distribución por severidad">
          {Object.keys(stats.bySeverity).length === 0 ? (
            <p className="text-sm text-slate-500">—</p>
          ) : (
            Object.entries(stats.bySeverity)
              .sort((a, b) => b[1] - a[1])
              .map(([k, v]) => (
                <div key={k} className="flex items-center justify-between py-1 text-sm">
                  <span className="text-slate-300">{k}</span>
                  <span className="font-mono text-slate-100">{v}</span>
                </div>
              ))
          )}
        </Block>
        <Block title="Atribución de cartel">
          {Object.keys(stats.byCartel).length === 0 ? (
            <p className="text-sm text-slate-500">—</p>
          ) : (
            Object.entries(stats.byCartel)
              .sort((a, b) => b[1] - a[1])
              .map(([k, v]) => (
                <div key={k} className="flex items-center justify-between py-1 text-sm">
                  <span className="text-slate-300">{k}</span>
                  <span className="font-mono text-slate-100">{v}</span>
                </div>
              ))
          )}
        </Block>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => {
            buildReportPdf(filtered, presetLabel);
            toast.success("PDF generado");
          }}
          disabled={loading || filtered.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 disabled:opacity-50 text-white text-sm font-semibold rounded-lg"
        >
          <Download size={16} /> Descargar PDF
        </button>
        <button
          onClick={() => {
            exportCSV(`findings-${preset}.csv`, filtered);
            toast.success("CSV exportado");
          }}
          disabled={filtered.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-sm rounded-lg"
        >
          <Download size={16} /> CSV
        </button>
        <button
          onClick={() => {
            exportJSON(`findings-${preset}.json`, filtered);
            toast.success("JSON exportado");
          }}
          disabled={filtered.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-sm rounded-lg"
        >
          <Download size={16} /> JSON
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
      <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
        {label}
      </div>
      <div className="text-2xl font-bold text-slate-100">{value}</div>
    </div>
  );
}

function Block({ title, children }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
      <div className="text-xs uppercase tracking-wider text-slate-500 mb-3">
        {title}
      </div>
      {children}
    </div>
  );
}
