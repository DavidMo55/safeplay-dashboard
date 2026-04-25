import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import FindingDossier from "../components/Hunter/FindingDossier";
import { useIntelFindings } from "../lib/useIntelFindings";

export default function FindingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const stateFinding = location.state && location.state.finding;

  const [finding, setFinding] = useState(stateFinding || null);
  const { findings, loading, refresh } = useIntelFindings(0);

  const matched = useMemo(
    () => findings.find((f) => String(f.id) === String(id)),
    [findings, id]
  );

  useEffect(() => {
    if (matched) setFinding(matched);
  }, [matched]);

  function close() {
    navigate("/hunter");
  }

  if (!finding && loading) {
    return (
      <div className="p-16 text-center border-2 border-dashed border-slate-800 rounded-xl">
        <Loader2 className="mx-auto mb-3 animate-spin text-fuchsia-400" size={28} />
        <p className="text-slate-400">Cargando finding…</p>
      </div>
    );
  }

  if (!finding) {
    return (
      <div className="p-16 text-center border-2 border-dashed border-slate-800 rounded-xl">
        <p className="text-slate-300 text-lg mb-2">Finding no encontrado</p>
        <p className="text-slate-500 text-sm mb-6">
          ID: <span className="font-mono">{id}</span>
        </p>
        <button
          onClick={() => navigate("/hunter")}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 text-sm transition"
        >
          <ArrowLeft size={14} />
          Volver al Hunter
        </button>
      </div>
    );
  }

  return (
    <FindingDossier finding={finding} onClose={close} onUpdate={refresh} />
  );
}
