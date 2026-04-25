import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Shield,
  Target,
  Command,
  Star,
  BellRing,
  Settings as SettingsIcon,
  FileText,
  Flame
} from "lucide-react";
import { Toaster } from "sonner";
import Header from "../components/Header";
import CommandPalette from "../components/CommandPalette";
import { useWatchlist } from "../lib/useWatchlist";
import { useIntelFindings } from "../lib/useIntelFindings";
import { useAlertEvaluator } from "../lib/useAlertRules";
import { useSettings } from "../lib/useSettings";

export default function Layout() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const navigate = useNavigate();
  const { count: watchCount } = useWatchlist();
  const [settings] = useSettings();

  const { findings, refresh, usingMocks } = useIntelFindings(0);
  useAlertEvaluator(findings);

  useEffect(() => {
    if (!settings.refreshIntervalSec || settings.refreshIntervalSec <= 0) return;
    const id = setInterval(refresh, settings.refreshIntervalSec * 1000);
    return () => clearInterval(id);
  }, [settings.refreshIntervalSec, refresh]);

  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const navItem = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-4 text-sm font-semibold border-b-2 transition whitespace-nowrap ${
      isActive
        ? "border-fuchsia-500 text-fuchsia-300"
        : "border-transparent text-slate-400 hover:text-slate-200"
    }`;

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 ${settings.presentationMode ? "text-lg" : ""}`}>
      {usingMocks ? (
        <div className="bg-amber-500/10 border-b border-amber-500/30 text-amber-300 text-xs text-center py-1.5 font-mono">
          ⚠ Modo demo — datos simulados (la API no respondió)
        </div>
      ) : null}
      <Header />

      <div className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-4">
          <div className="flex gap-1 overflow-x-auto">
            <NavLink to="/" end className={navItem}>
              <Target size={16} />
              Intelligence
              <span className="ml-1 px-1.5 py-0.5 bg-fuchsia-500/20 text-fuchsia-300 text-[10px] font-bold rounded">
                NEW
              </span>
            </NavLink>
            <NavLink to="/guardian" className={navItem}>
              <Shield size={16} />
              Guardian
            </NavLink>
            <NavLink to="/cartels" className={navItem}>
              <Flame size={16} />
              Carteles
            </NavLink>
            <NavLink to="/watchlist" className={navItem}>
              <Star size={16} />
              Watchlist
              {watchCount > 0 ? (
                <span className="ml-1 px-1.5 py-0.5 bg-yellow-500/20 text-yellow-300 text-[10px] font-bold rounded">
                  {watchCount}
                </span>
              ) : null}
            </NavLink>
            <NavLink to="/alerts" className={navItem}>
              <BellRing size={16} />
              Alertas
            </NavLink>
            <NavLink to="/reports" className={navItem}>
              <FileText size={16} />
              Reportes
            </NavLink>
            <NavLink to="/settings" className={navItem}>
              <SettingsIcon size={16} />
              Config
            </NavLink>
          </div>

          <button
            onClick={() => setPaletteOpen(true)}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 rounded-lg transition shrink-0"
            title="Abrir paleta de comandos"
          >
            <Command size={12} />
            <span>Buscar</span>
            <kbd className="ml-2 px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-mono">
              ⌘K
            </kbd>
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <Outlet />
      </main>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onNavigate={(path) => {
          setPaletteOpen(false);
          navigate(path);
        }}
      />

      <Toaster
        theme="dark"
        position="top-right"
        toastOptions={{
          style: {
            background: "rgb(15 23 42)",
            border: "1px solid rgb(30 41 59)",
            color: "rgb(226 232 240)"
          }
        }}
      />
    </div>
  );
}
