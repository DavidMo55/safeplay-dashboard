import { useMemo, useState } from "react";
import { Table2, Filter, Search, X, Download } from "lucide-react";
import { toast } from "sonner";
import {
  shortTime,
  timeAgo,
  actionStyles,
  categoriaColor,
  categoriaLabel
} from "../lib/formatters";
import { exportCSV, exportJSON } from "../lib/exportData";

function inRange(ts, fromIso, toIso) {
  if (!ts) return false;
  const t = new Date(ts).getTime();
  if (fromIso) {
    const from = new Date(fromIso).getTime();
    if (t < from) return false;
  }
  if (toIso) {
    const to = new Date(toIso).getTime() + 24 * 3600 * 1000 - 1;
    if (t > to) return false;
  }
  return true;
}

export default function EventsTable({ events, onEventClick }) {
  const [filterAction, setFilterAction] = useState("TODOS");
  const [filterCategoria, setFilterCategoria] = useState("TODOS");
  const [query, setQuery] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const acciones = ["TODOS", ...new Set(events.map((e) => e.action))];
  const categorias = ["TODOS", ...new Set(events.map((e) => e.categoria))];

  const filteredEvents = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events.filter((e) => {
      if (filterAction !== "TODOS" && e.action !== filterAction) return false;
      if (filterCategoria !== "TODOS" && e.categoria !== filterCategoria) return false;
      if ((from || to) && !inRange(e.timestamp, from, to)) return false;
      if (q) {
        const haystack = [
          e.player_name,
          e.player_id,
          e.message,
          e.categoria,
          e.action
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [events, filterAction, filterCategoria, query, from, to]);

  function clearAll() {
    setFilterAction("TODOS");
    setFilterCategoria("TODOS");
    setQuery("");
    setFrom("");
    setTo("");
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10">
            <Table2 className="w-4 h-4 text-emerald-400" />
          </div>
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            Eventos recientes
          </h3>
          <span className="text-xs text-slate-500 ml-2">
            {filteredEvents.length} de {events.length}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar jugador, mensaje…"
              className="text-xs bg-slate-800 border border-slate-700 text-slate-200 rounded-md pl-7 pr-7 py-1.5 hover:border-slate-600 focus:outline-none focus:border-pink-500 w-56"
            />
            {query ? (
              <button
                onClick={() => setQuery("")}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-500 hover:text-slate-200"
                aria-label="Limpiar búsqueda"
              >
                <X className="w-3 h-3" />
              </button>
            ) : null}
          </div>

          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="text-xs bg-slate-800 border border-slate-700 text-slate-200 rounded-md px-2 py-1.5"
            title="Desde"
          />
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="text-xs bg-slate-800 border border-slate-700 text-slate-200 rounded-md px-2 py-1.5"
            title="Hasta"
          />

          <Filter className="w-4 h-4 text-slate-500" />

          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="text-xs bg-slate-800 border border-slate-700 text-slate-200 rounded-md px-2 py-1.5 hover:border-slate-600 focus:outline-none focus:border-pink-500 cursor-pointer"
          >
            {acciones.map((a) => (
              <option key={a} value={a}>
                {a === "TODOS" ? "Todas las acciones" : a}
              </option>
            ))}
          </select>

          <select
            value={filterCategoria}
            onChange={(e) => setFilterCategoria(e.target.value)}
            className="text-xs bg-slate-800 border border-slate-700 text-slate-200 rounded-md px-2 py-1.5 hover:border-slate-600 focus:outline-none focus:border-pink-500 cursor-pointer"
          >
            {categorias.map((c) => (
              <option key={c} value={c}>
                {c === "TODOS" ? "Todas las categorías" : categoriaLabel(c)}
              </option>
            ))}
          </select>

          <button
            onClick={clearAll}
            className="text-xs text-slate-500 hover:text-slate-200 px-2 py-1.5"
            title="Limpiar filtros"
          >
            Limpiar
          </button>

          <button
            onClick={() => {
              exportCSV("events.csv", filteredEvents);
              toast.success("CSV exportado");
            }}
            disabled={filteredEvents.length === 0}
            className="inline-flex items-center gap-1 text-xs px-2 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 rounded-md"
          >
            <Download size={12} /> CSV
          </button>
          <button
            onClick={() => {
              exportJSON("events.json", filteredEvents);
              toast.success("JSON exportado");
            }}
            disabled={filteredEvents.length === 0}
            className="inline-flex items-center gap-1 text-xs px-2 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 rounded-md"
          >
            <Download size={12} /> JSON
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-900/80">
            <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
              <th className="px-6 py-3 font-semibold">Hora</th>
              <th className="px-6 py-3 font-semibold">Jugador</th>
              <th className="px-6 py-3 font-semibold">Mensaje</th>
              <th className="px-6 py-3 font-semibold">Categoría</th>
              <th className="px-6 py-3 font-semibold">Score</th>
              <th className="px-6 py-3 font-semibold">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredEvents.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                  Sin eventos que coincidan con el filtro
                </td>
              </tr>
            ) : (
              filteredEvents.map((event) => {
                const style = actionStyles(event.action);
                return (
                  <tr
                    key={event.id}
                    onClick={() => onEventClick && onEventClick(event)}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-3 whitespace-nowrap">
                      <div className="text-sm text-slate-300 font-mono">
                        {shortTime(event.timestamp)}
                      </div>
                      <div className="text-xs text-slate-500">
                        {timeAgo(event.timestamp)}
                      </div>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white">
                          {event.player_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-200">
                            {event.player_name}
                          </div>
                          <div className="text-xs text-slate-500 font-mono">
                            {event.player_id.substring(0, 10)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div
                        className="text-sm text-slate-300 max-w-xs truncate"
                        title={event.message}
                      >
                        {event.message}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: categoriaColor(event.categoria) }}
                        ></div>
                        <span className="text-xs text-slate-300">
                          {categoriaLabel(event.categoria)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${event.score}%`,
                              backgroundColor:
                                event.score >= 70
                                  ? "#ef4444"
                                  : event.score >= 31
                                  ? "#f59e0b"
                                  : "#10b981"
                            }}
                          ></div>
                        </div>
                        <span className="text-xs font-mono font-semibold text-slate-300 w-6">
                          {event.score}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${style.bg} ${style.border} ${style.text}`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></div>
                        {event.action}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
