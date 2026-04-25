import { useState } from "react";
import MetricsCards from "../components/MetricsCards";
import DistributionChart from "../components/DistributionChart";
import ActivityChart from "../components/ActivityChart";
import EventsTable from "../components/EventsTable";
import EventDetailModal from "../components/EventDetailModal";
import DashboardStatus from "../components/DashboardStatus";
import { useEvents } from "../lib/useEvents";

export default function GuardianPage() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { events, loading, error, lastRefresh, refresh } = useEvents(100);

  return (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-100 mb-2">
          Guardian · Panel de moderación
        </h2>
        <p className="text-slate-400">
          Monitoreo en tiempo real de chat en plataformas integradas
        </p>
      </div>

      <DashboardStatus
        loading={loading}
        error={error}
        lastRefresh={lastRefresh}
        onRefresh={refresh}
        eventCount={events.length}
      />

      {!loading && !error && events.length === 0 ? (
        <div className="p-16 text-center border-2 border-dashed border-slate-800 rounded-xl">
          <p className="text-slate-400 text-lg mb-2">No hay eventos todavía</p>
          <p className="text-slate-600 text-sm">
            Los eventos aparecerán aquí cuando los jugadores escriban en el chat
          </p>
        </div>
      ) : (
        <>
          <MetricsCards events={events} />
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <DistributionChart events={events} />
            <ActivityChart events={events} />
          </div>
          <div className="mt-6">
            <EventsTable
              events={events}
              onEventClick={(event) => setSelectedEvent(event)}
            />
          </div>
        </>
      )}

      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </>
  );
}
