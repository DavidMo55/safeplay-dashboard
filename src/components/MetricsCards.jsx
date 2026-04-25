import { MessageCircle, ShieldAlert, Users, TrendingUp, ArrowUp, ArrowDown, Minus } from "lucide-react";

function splitPeriods(events) {
  if (!events || events.length < 2) {
    return { current: events || [], previous: [] };
  }
  const sorted = [...events].sort(
    (a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0)
  );
  const mid = Math.floor(sorted.length / 2);
  return { previous: sorted.slice(0, mid), current: sorted.slice(mid) };
}

function metricsOf(events) {
  const total = events.length;
  const bloqueados = events.filter((e) => e.action === "BLOQUEAR").length;
  const jugadoresUnicos = new Set(events.map((e) => e.player_id)).size;
  const categoriasCounts = events.reduce((acc, e) => {
    if (e.categoria !== "SEGURO") {
      acc[e.categoria] = (acc[e.categoria] || 0) + 1;
    }
    return acc;
  }, {});
  const categoriaTop = Object.entries(categoriasCounts).sort((a, b) => b[1] - a[1])[0];
  return {
    total,
    bloqueados,
    jugadoresUnicos,
    topCategoriaNombre: categoriaTop ? categoriaTop[0] : "—",
    topCategoriaCount: categoriaTop ? categoriaTop[1] : 0
  };
}

function delta(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

export default function MetricsCards({ events }) {
  const { current, previous } = splitPeriods(events);
  const cur = metricsOf(current.length > 0 ? current : events);
  const prev = metricsOf(previous);

  const total = events.length;
  const porcentajeBloqueados =
    total > 0 ? Math.round((cur.bloqueados / Math.max(cur.total, 1)) * 100) : 0;

  const metrics = [
    {
      label: "Mensajes analizados",
      value: total,
      sublabel: "Total histórico",
      delta: delta(cur.total, prev.total),
      icon: MessageCircle,
      iconColor: "text-cyan-400",
      iconBg: "bg-cyan-500/10",
      glow: "shadow-cyan-500/20"
    },
    {
      label: "Bloqueados",
      value: cur.bloqueados + prev.bloqueados,
      sublabel: `${porcentajeBloqueados}% en periodo actual`,
      delta: delta(cur.bloqueados, prev.bloqueados),
      icon: ShieldAlert,
      iconColor: "text-red-400",
      iconBg: "bg-red-500/10",
      glow: "shadow-red-500/20"
    },
    {
      label: "Jugadores únicos",
      value: new Set(events.map((e) => e.player_id)).size,
      sublabel: "Activos en período",
      delta: delta(cur.jugadoresUnicos, prev.jugadoresUnicos),
      icon: Users,
      iconColor: "text-fuchsia-400",
      iconBg: "bg-fuchsia-500/10",
      glow: "shadow-fuchsia-500/20"
    },
    {
      label: "Categoría principal",
      value: cur.topCategoriaNombre,
      sublabel: `${cur.topCategoriaCount} detecciones`,
      icon: TrendingUp,
      iconColor: "text-amber-400",
      iconBg: "bg-amber-500/10",
      glow: "shadow-amber-500/20",
      isText: true
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <div
            key={metric.label}
            className={`relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur p-5 hover:border-slate-700 transition-all shadow-lg ${metric.glow}`}
          >
            <div
              className={`absolute -right-8 -top-8 w-32 h-32 rounded-full ${metric.iconBg} blur-2xl opacity-50`}
            ></div>

            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2.5 rounded-lg ${metric.iconBg}`}>
                  <Icon className={`w-5 h-5 ${metric.iconColor}`} strokeWidth={2.5} />
                </div>
                {metric.delta != null && !metric.isText ? (
                  <DeltaBadge value={metric.delta} />
                ) : null}
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                  {metric.label}
                </p>
                <p
                  className={`font-black text-slate-100 ${
                    metric.isText ? "text-2xl" : "text-4xl"
                  }`}
                >
                  {metric.value}
                </p>
                <p className="text-xs text-slate-500 mt-2">{metric.sublabel}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DeltaBadge({ value }) {
  if (value === 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400">
        <Minus size={10} /> 0%
      </span>
    );
  }
  const positive = value > 0;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
        positive
          ? "bg-emerald-500/20 text-emerald-300"
          : "bg-red-500/20 text-red-300"
      }`}
      title="Cambio vs período anterior"
    >
      {positive ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
      {Math.abs(value)}%
    </span>
  );
}
