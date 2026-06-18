import { useState, useMemo } from "react";
import { Earthquake } from "./WorldMap";
import { Search, Map, Calendar, SlidersHorizontal, RefreshCw, Layers } from "lucide-react";

interface USGSFeedProps {
  earthquakes: Earthquake[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  isLoading: boolean;
  onRefresh: () => void;
}

export function USGSFeed({ earthquakes, selectedId, onSelect, isLoading, onRefresh }: USGSFeedProps) {
  const [search, setSearch] = useState("");
  const [minMagnitude, setMinMagnitude] = useState<number>(0);
  const [sortBy, setSortBy] = useState<"time" | "magnitude">("time");

  // Filters earthquakes by inputs
  const filtered = useMemo(() => {
    return earthquakes
      .filter((eq) => {
        const matchesSearch = eq.place.toLowerCase().includes(search.toLowerCase());
        const matchesMag = eq.magnitude >= minMagnitude;
        return matchesSearch && matchesMag;
      })
      .sort((a, b) => {
        if (sortBy === "magnitude") return b.magnitude - a.magnitude;
        return b.time - a.time; // Newest first
      });
  }, [earthquakes, search, minMagnitude, sortBy]);

  const getSeverityBadge = (mag: number) => {
    if (mag < 3.0) return { label: "Minor", css: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" };
    if (mag < 5.0) return { label: "Moderate", css: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" };
    if (mag < 6.5) return { label: "Strong", css: "bg-orange-500/10 text-orange-400 border border-orange-500/20" };
    return { label: "Severe", css: "bg-red-500/25 text-red-400 border border-red-500/40 animate-pulse" };
  };

  return (
    <div className="liquid-glass rounded-3xl p-6 md:p-8 flex flex-col h-full border border-white/5">
      {/* Search Header Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between mb-6 pb-6 border-b border-white/5">
        <div>
          <h3 className="font-heading italic text-3xl text-white">Live Seismic Activity</h3>
          <p className="text-white/40 text-[11px] uppercase font-mono mt-0.5 tracking-wider">
            Sourced Real-Time from USGS (United States Geological Survey)
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2.5 rounded-full liquid-glass hover:bg-white/10 text-white/70 hover:text-white transition-all disabled:opacity-50"
            title="Refresh Feed"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          </button>
          
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/5 text-[11px] font-mono">
            <button
              onClick={() => setSortBy("time")}
              className={`px-3 py-1 rounded-full transition-all ${
                sortBy === "time" ? "bg-white text-black font-semibold" : "text-white/60 hover:text-white"
              }`}
            >
              Recency
            </button>
            <button
              onClick={() => setSortBy("magnitude")}
              className={`px-3 py-1 rounded-full transition-all ${
                sortBy === "magnitude" ? "bg-white text-black font-semibold" : "text-white/60 hover:text-white"
              }`}
            >
              Severity
            </button>
          </div>
        </div>
      </div>

      {/* Filter and search bars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <div className="relative flex items-center">
          <Search size={14} className="absolute left-3.5 text-white/35" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter location (e.g. Tonga, Alaska)..."
            className="w-full bg-white/[0.02] border border-white/5 rounded-full pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/20 font-body"
          />
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal size={14} className="text-white/35 ml-2" />
          <select
            value={minMagnitude}
            onChange={(e) => setMinMagnitude(parseFloat(e.target.value))}
            className="w-full bg-black/90 border border-white/5 rounded-full px-4 py-2.5 text-xs text-white focus:outline-none focus:border-white/20 font-body"
          >
            <option value="0">All Magnitudes</option>
            <option value="3">Moderate (≥ 3.0 MAG)</option>
            <option value="5">Strong (≥ 5.0 MAG)</option>
            <option value="6.5">Severe (≥ 6.5 MAG)</option>
          </select>
        </div>
      </div>

      {/* USGS Feed items list */}
      <div className="flex-1 overflow-y-auto max-h-[480px] space-y-2 pr-1 custom-scrollbar">
        {filtered.length === 0 ? (
          <div className="py-20 text-center text-white/30 font-body font-light text-sm">
            No live tremors found in active cache for selected query filters.
          </div>
        ) : (
          filtered.map((eq) => {
            const isSelected = eq.id === selectedId;
            const badge = getSeverityBadge(eq.magnitude);

            return (
              <div
                key={eq.id}
                onClick={() => onSelect(isSelected ? null : eq.id)}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? "bg-white/[0.04] border-white/20 shadow-md"
                    : "bg-white/[0.01] border-white/5 hover:bg-white/[0.02] hover:border-white/10"
                }`}
              >
                {/* Left information row */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex flex-col items-center justify-center h-12 w-12 rounded-full border border-white/10 bg-white/[0.02] shrink-0">
                    <span className="text-lg font-heading italic text-white leading-none">
                      {eq.magnitude.toFixed(1)}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-white/90 font-body truncate">
                      {eq.place}
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[10px] font-mono text-white/40 mt-1">
                      <span className="flex items-center gap-1">
                        <Map size={10} /> Depth: {eq.depth} km
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar size={10} /> {new Date(eq.time).toLocaleTimeString()}
                      </span>
                      {eq.distance && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-400">
                            {eq.distance.toFixed(0)} km near you
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Severity Badge */}
                <span className={`text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full font-mono ${badge.css}`}>
                  {badge.label}
                </span>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-white/5 text-[10px] uppercase font-mono text-white/40 flex items-center justify-between">
        <span>Monitor Node active: #LUMINA-SEC-9</span>
        <span>Showing {filtered.length} entries</span>
      </div>
    </div>
  );
}
