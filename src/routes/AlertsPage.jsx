import { useState } from "react";
import { Plus, Trash2, BellRing, Bell, BellOff } from "lucide-react";
import { toast } from "sonner";
import { useAlertRules } from "../lib/useAlertRules";
import { useNotifications } from "../lib/useNotifications";

const SEVERITIES = ["ANY", "CRITICAL", "HIGH", "MEDIUM", "LOW"];
const CARTELS = ["ANY", "CJNG", "CARTEL_SINALOA", "LA_MAÑA", "CARTEL_GOLFO", "FAMILIA"];

export default function AlertsPage() {
  const { rules, create, remove, toggle } = useAlertRules();
  const { permission, request, supported } = useNotifications();
  const [draft, setDraft] = useState({
    name: "",
    minScore: 70,
    severity: "ANY",
    cartel: "ANY",
    notify: true
  });

  function submit(e) {
    e.preventDefault();
    if (!draft.name.trim()) {
      toast.error("Dale un nombre a la regla");
      return;
    }
    create(draft);
    toast.success("Regla creada");
    setDraft({ name: "", minScore: 70, severity: "ANY", cartel: "ANY", notify: true });
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-100 mb-2 flex items-center gap-3">
          <BellRing className="text-fuchsia-400" /> Alertas
        </h2>
        <p className="text-slate-400">
          Define reglas para que se te notifique cuando entren findings que cumplan ciertos criterios.
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Notificaciones del navegador
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Estado: <span className="font-mono">{permission}</span>
            </p>
          </div>
          {supported && permission !== "granted" ? (
            <button
              onClick={async () => {
                const r = await request();
                if (r === "granted") toast.success("Notificaciones habilitadas");
                else toast.error("Permiso denegado");
              }}
              className="px-3 py-1.5 bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-sm rounded-lg"
            >
              Permitir notificaciones
            </button>
          ) : null}
        </div>
      </div>

      <form
        onSubmit={submit}
        className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4"
      >
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
          Nueva regla
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Nombre">
            <input
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="Ej. CJNG críticos"
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm text-slate-200"
            />
          </Field>
          <Field label="Score mínimo">
            <input
              type="number"
              min={0}
              max={100}
              value={draft.minScore}
              onChange={(e) =>
                setDraft({ ...draft, minScore: Number(e.target.value) || 0 })
              }
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm text-slate-200"
            />
          </Field>
          <Field label="Severidad">
            <select
              value={draft.severity}
              onChange={(e) => setDraft({ ...draft, severity: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm text-slate-200"
            >
              {SEVERITIES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Cartel">
            <select
              value={draft.cartel}
              onChange={(e) => setDraft({ ...draft, cartel: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm text-slate-200"
            >
              {CARTELS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={draft.notify}
            onChange={(e) => setDraft({ ...draft, notify: e.target.checked })}
          />
          Enviar notificación del navegador (además del toast)
        </label>
        <button
          type="submit"
          className="inline-flex items-center gap-2 px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-sm font-semibold rounded-lg"
        >
          <Plus size={16} /> Crear regla
        </button>
      </form>

      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
          Reglas activas ({rules.length})
        </h3>
        {rules.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-slate-800 rounded-xl text-slate-500">
            Sin reglas todavía
          </div>
        ) : (
          rules.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between p-4 border border-slate-800 bg-slate-900/40 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggle(r.id)}
                  className={`p-2 rounded-lg ${r.enabled ? "bg-fuchsia-500/20 text-fuchsia-300" : "bg-slate-800 text-slate-500"}`}
                  title={r.enabled ? "Activa" : "Pausada"}
                >
                  {r.enabled ? <Bell size={14} /> : <BellOff size={14} />}
                </button>
                <div>
                  <div className="text-sm font-semibold text-slate-200">{r.name}</div>
                  <div className="text-xs text-slate-500">
                    score ≥ {r.minScore} · {r.severity} · {r.cartel}
                    {r.notify ? " · 🔔" : ""}
                  </div>
                </div>
              </div>
              <button
                onClick={() => remove(r.id)}
                className="p-2 text-slate-500 hover:text-red-400"
                title="Eliminar"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-xs text-slate-400 mb-1 block">{label}</span>
      {children}
    </label>
  );
}
