import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
import Layout from "./routes/Layout";

const HunterPage = lazy(() => import("./routes/HunterPage"));
const GuardianPage = lazy(() => import("./routes/GuardianPage"));
const FindingDetailPage = lazy(() => import("./routes/FindingDetailPage"));
const AlertsPage = lazy(() => import("./routes/AlertsPage"));
const SettingsPage = lazy(() => import("./routes/SettingsPage"));
const WatchlistPage = lazy(() => import("./routes/WatchlistPage"));
const CartelsPage = lazy(() => import("./routes/CartelsPage"));
const TargetPage = lazy(() => import("./routes/TargetPage"));
const ReportsPage = lazy(() => import("./routes/ReportsPage"));

function PageFallback() {
  return (
    <div className="p-16 text-center text-slate-500">
      <Loader2 className="mx-auto mb-3 animate-spin text-fuchsia-400" size={28} />
      Cargando…
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route
            index
            element={
              <Suspense fallback={<PageFallback />}>
                <HunterPage />
              </Suspense>
            }
          />
          <Route path="hunter" element={<Navigate to="/" replace />} />
          <Route
            path="guardian"
            element={
              <Suspense fallback={<PageFallback />}>
                <GuardianPage />
              </Suspense>
            }
          />
          <Route
            path="findings/:id"
            element={
              <Suspense fallback={<PageFallback />}>
                <FindingDetailPage />
              </Suspense>
            }
          />
          <Route
            path="targets/:author"
            element={
              <Suspense fallback={<PageFallback />}>
                <TargetPage />
              </Suspense>
            }
          />
          <Route
            path="alerts"
            element={
              <Suspense fallback={<PageFallback />}>
                <AlertsPage />
              </Suspense>
            }
          />
          <Route
            path="settings"
            element={
              <Suspense fallback={<PageFallback />}>
                <SettingsPage />
              </Suspense>
            }
          />
          <Route
            path="watchlist"
            element={
              <Suspense fallback={<PageFallback />}>
                <WatchlistPage />
              </Suspense>
            }
          />
          <Route
            path="cartels"
            element={
              <Suspense fallback={<PageFallback />}>
                <CartelsPage />
              </Suspense>
            }
          />
          <Route
            path="reports"
            element={
              <Suspense fallback={<PageFallback />}>
                <ReportsPage />
              </Suspense>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
