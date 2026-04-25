import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, User } from "lucide-react";
import { useIntelFindings } from "../lib/useIntelFindings";
import FindingCard from "../components/Hunter/FindingCard";

export default function TargetPage() {
  const { author } = useParams();
  const navigate = useNavigate();
  const { findings, loading } = useIntelFindings(0);

  const byAuthor = useMemo(
    () =>
      findings
        .filter((f) => (f.author_name || "").toLowerCase() === (author || "").toLowerCase())
        .sort((a, b) => new Date(b.detected_at || 0) - new Date(a.detected_at || 0)),
    [findings, author]
  );

  const totals = useMemo(() => {
    if (byAuthor.length === 0) return null;
    const sum = byAuthor.reduce((acc, f) => acc + (f.score || 0), 0);
    return {
      count: byAuthor.length,
      avg: Math.round(sum / byAuthor.length),
      max: Math.max(...byAuthor.map((f) => f.score || 0)),
      critical: byAuthor.filter((f) => (f.severity || "") === "CRITICAL").length
    };
  }, [byAuthor]);

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200"
      >
        <ArrowLeft size={14} /> Volver
      </button>

      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-500">
          <User size={24} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-100">@{author}</h2>
          <p className="text-slate-400">Perfil de objetivo</p>
        </div>
      </div>

      {loading && byAuthor.length === 0 ? (
        <div className="p-12 text-center text-slate-500">Cargando…</div>
      ) : !totals ? (
        <div className="p-12 text-center border-2 border-dashed border-slate-800 rounded-xl">
          <p className="text-slate-400">Sin findings para este autor.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat label="Findings" value={totals.count} />
            <Stat label="Score promedio" value={totals.avg} />
            <Stat label="Score máximo" value={totals.max} />
            <Stat label="Críticos" value={totals.critical} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {byAuthor.map((f) => (
              <FindingCard
                key={f.id}
                finding={f}
                onOpenDossier={() =>
                  navigate(`/findings/${f.id}`, { state: { finding: f } })
                }
              />
            ))}
          </div>
        </>
      )}
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
