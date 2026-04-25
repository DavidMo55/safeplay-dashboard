import { useNavigate } from "react-router-dom";
import { Star, Trash2 } from "lucide-react";
import { useIntelFindings } from "../lib/useIntelFindings";
import { useWatchlist } from "../lib/useWatchlist";
import FindingCard from "../components/Hunter/FindingCard";

export default function WatchlistPage() {
  const navigate = useNavigate();
  const { findings, loading } = useIntelFindings(0);
  const { ids, has, toggle, clear } = useWatchlist();

  const items = findings.filter((f) => has(f.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <Star className="text-yellow-400 fill-yellow-400" /> Watchlist
          </h2>
          <p className="text-slate-400">
            {ids.length} finding{ids.length === 1 ? "" : "s"} en seguimiento
          </p>
        </div>
        {ids.length > 0 ? (
          <button
            onClick={clear}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-sm rounded-lg"
          >
            <Trash2 size={14} /> Vaciar
          </button>
        ) : null}
      </div>

      {loading && items.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-slate-800 rounded-xl text-slate-500">
          Cargando…
        </div>
      ) : items.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-slate-800 rounded-xl">
          <Star className="mx-auto mb-3 text-slate-600" size={32} />
          <p className="text-slate-400">Sin findings marcados.</p>
          <p className="text-slate-600 text-sm mt-1">
            Pulsa la estrella en una FindingCard para añadirla.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {items.map((f) => (
            <FindingCard
              key={f.id}
              finding={f}
              onOpenDossier={() => navigate(`/findings/${f.id}`, { state: { finding: f } })}
              starred={true}
              onToggleStar={() => toggle(f.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
