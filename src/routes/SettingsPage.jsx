import { Settings as SettingsIcon } from "lucide-react";
import { toast } from "sonner";
import { useSettings } from "../lib/useSettings";
import { useNotifications } from "../lib/useNotifications";

export default function SettingsPage() {
  const [settings, update] = useSettings();
  const { permission, request, supported } = useNotifications();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-100 mb-2 flex items-center gap-3">
        <SettingsIcon className="text-fuchsia-400" /> Configuración
      </h2>

      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
          Datos
        </h3>
        <Row
          label="Auto-refresh (segundos)"
          hint="0 = manual"
          control={
            <input
              type="number"
              min={0}
              value={settings.refreshIntervalSec}
              onChange={(e) =>
                update({ refreshIntervalSec: Number(e.target.value) || 0 })
              }
              className="w-24 bg-slate-800 border border-slate-700 rounded px-3 py-1 text-sm text-slate-200"
            />
          }
        />
        <Row
          label="Score mínimo por defecto"
          hint="Filtro inicial en Hunter"
          control={
            <input
              type="number"
              min={0}
              max={100}
              value={settings.defaultMinScore}
              onChange={(e) =>
                update({ defaultMinScore: Number(e.target.value) || 0 })
              }
              className="w-24 bg-slate-800 border border-slate-700 rounded px-3 py-1 text-sm text-slate-200"
            />
          }
        />
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
          Idioma
        </h3>
        <Row
          label="Idioma de la interfaz"
          control={
            <select
              value={settings.language}
              onChange={(e) => update({ language: e.target.value })}
              className="bg-slate-800 border border-slate-700 rounded px-3 py-1 text-sm text-slate-200"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          }
        />
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
          Notificaciones
        </h3>
        <Row
          label="Permiso del navegador"
          hint={supported ? `Estado: ${permission}` : "No soportado en este navegador"}
          control={
            supported && permission !== "granted" ? (
              <button
                onClick={async () => {
                  const r = await request();
                  if (r === "granted") toast.success("Notificaciones habilitadas");
                }}
                className="px-3 py-1 bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-sm rounded-lg"
              >
                Permitir
              </button>
            ) : (
              <span className="text-xs text-slate-500">{permission}</span>
            )
          }
        />
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
          Modo presentación
        </h3>
        <Row
          label="Activar modo TV"
          hint="Cards más grandes, menos cromatismo. Útil para sala de operaciones."
          control={
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.presentationMode}
                onChange={(e) => update({ presentationMode: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:bg-fuchsia-600 relative transition">
                <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition peer-checked:translate-x-5" />
              </div>
            </label>
          }
        />
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-3">
          Datos locales
        </h3>
        <p className="text-xs text-slate-500 mb-3">
          Watchlist, tags, alertas, filtros guardados — viven en localStorage de este navegador.
        </p>
        <button
          onClick={() => {
            if (confirm("¿Borrar todos los datos locales (watchlist, tags, alertas, filtros)?")) {
              [
                "safeplay.watchlist",
                "safeplay.tags",
                "safeplay.alertRules",
                "safeplay.alertSeen",
                "safeplay.savedFilters",
                "safeplay.settings"
              ].forEach((k) => localStorage.removeItem(k));
              toast.success("Datos locales borrados — recarga la página");
            }
          }}
          className="px-3 py-1.5 bg-red-600/80 hover:bg-red-600 text-white text-sm rounded-lg"
        >
          Borrar datos locales
        </button>
      </div>
    </div>
  );
}

function Row({ label, hint, control }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="text-sm text-slate-200">{label}</div>
        {hint ? <div className="text-xs text-slate-500">{hint}</div> : null}
      </div>
      {control}
    </div>
  );
}
