import { useEffect, useMemo, useRef } from "react";
import { Command } from "cmdk";
import {
  Shield,
  Target,
  FileText,
  Search,
  Star,
  BellRing,
  Settings as SettingsIcon,
  Flame,
  User
} from "lucide-react";
import { useIntelFindings } from "../lib/useIntelFindings";

export default function CommandPalette({ open, onClose, onNavigate }) {
  const inputRef = useRef(null);
  const { findings } = useIntelFindings(0);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current && inputRef.current.focus(), 30);
  }, [open]);

  const recentTargets = useMemo(() => {
    const seen = new Map();
    for (const f of findings) {
      const author = f.author_name;
      if (!author) continue;
      if (!seen.has(author)) seen.set(author, f);
      if (seen.size >= 8) break;
    }
    return Array.from(seen.entries());
  }, [findings]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/80 backdrop-blur-sm pt-24 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-xl border border-slate-800 bg-slate-950 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <Command label="Paleta de comandos" className="flex flex-col">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800">
            <Search size={16} className="text-slate-500" />
            <Command.Input
              ref={inputRef}
              placeholder="Buscar páginas, findings, targets…"
              className="flex-1 bg-transparent outline-none text-slate-100 placeholder:text-slate-500 text-sm"
            />
            <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-mono text-slate-400">
              ESC
            </kbd>
          </div>

          <Command.List className="max-h-96 overflow-y-auto p-2">
            <Command.Empty className="px-4 py-8 text-center text-sm text-slate-500">
              Sin resultados.
            </Command.Empty>

            <Command.Group heading="Navegación" className="text-xs text-slate-500 px-2 py-1">
              <Item icon={<Target size={14} className="text-fuchsia-400" />} label="Intelligence · Hunter" onSelect={() => onNavigate("/")} />
              <Item icon={<Shield size={14} className="text-cyan-400" />} label="Guardian · Moderación" onSelect={() => onNavigate("/guardian")} />
              <Item icon={<Flame size={14} className="text-red-400" />} label="Carteles" onSelect={() => onNavigate("/cartels")} />
              <Item icon={<Star size={14} className="text-yellow-400" />} label="Watchlist" onSelect={() => onNavigate("/watchlist")} />
              <Item icon={<BellRing size={14} className="text-fuchsia-400" />} label="Alertas" onSelect={() => onNavigate("/alerts")} />
              <Item icon={<FileText size={14} className="text-fuchsia-400" />} label="Reportes" onSelect={() => onNavigate("/reports")} />
              <Item icon={<SettingsIcon size={14} className="text-slate-400" />} label="Configuración" onSelect={() => onNavigate("/settings")} />
            </Command.Group>

            {recentTargets.length > 0 ? (
              <Command.Group heading="Targets recientes" className="text-xs text-slate-500 px-2 py-1 mt-2">
                {recentTargets.map(([author, f]) => (
                  <Item
                    key={author}
                    icon={<User size={14} className="text-cyan-400" />}
                    label={`@${author}`}
                    hint={`Score ${f.score} · ${f.severity || "-"}`}
                    onSelect={() => onNavigate(`/targets/${encodeURIComponent(author)}`)}
                  />
                ))}
              </Command.Group>
            ) : null}

            {findings.length > 0 ? (
              <Command.Group heading="Findings" className="text-xs text-slate-500 px-2 py-1 mt-2">
                {findings.slice(0, 8).map((f) => (
                  <Item
                    key={f.id}
                    icon={<FileText size={14} className="text-fuchsia-400" />}
                    label={`@${f.author_name || f.id}`}
                    hint={`Score ${f.score} · ${f.severity || "-"}`}
                    onSelect={() => onNavigate(`/findings/${f.id}`)}
                  />
                ))}
              </Command.Group>
            ) : null}
          </Command.List>
        </Command>
      </div>
    </div>
  );
}

function Item({ icon, label, hint, onSelect }) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-sm text-slate-200 aria-selected:bg-fuchsia-500/10 aria-selected:text-fuchsia-200"
    >
      {icon}
      <span className="flex-1">{label}</span>
      {hint ? <span className="text-xs text-slate-500">{hint}</span> : null}
    </Command.Item>
  );
}
