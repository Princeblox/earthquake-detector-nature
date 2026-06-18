import React, { useState, useRef, useMemo, useEffect } from "react";
import { continentPaths, getGraticules } from "./WorldMapData";
import { ZoomIn, ZoomOut, RotateCcw, MapPin, Eye } from "lucide-react";
import { motion } from "motion/react";
import { playSonarPulse } from "../utils/audio";

export interface Earthquake {
  id: string;
  magnitude: number;
  place: string;
  time: number;
  longitude: number;
  latitude: number;
  depth: number;
  distance?: number;
}

interface WorldMapProps {
  earthquakes: Earthquake[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  userCoords: { latitude: number; longitude: number } | null;
}

export function WorldMap({ earthquakes, selectedId, onSelect, userCoords }: WorldMapProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [mouseCoord, setMouseCoord] = useState({ lat: 0, lon: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const graticules = useMemo(() => getGraticules(), []);

  // Map latitude/longitude to SVG viewBox (1000x500 flat projection)
  const getCoords = (lon: number, lat: number) => {
    const x = ((lon + 180) / 360) * 1000;
    const y = ((90 - lat) / 180) * 500;
    return { x, y };
  };

  // Convert SVG coordinates back to latitude/longitude for mouse HUD
  const getLatLonFromSvg = (x: number, y: number) => {
    const lon = (x / 1000) * 360 - 180;
    const lat = 90 - (y / 50) * 18;
    return {
      lat: Math.min(90, Math.max(-90, lat)),
      lon: Math.min(180, Math.max(-180, lon)),
    };
  };

  const selectedEarthquake = useMemo(() => {
    return earthquakes.find((eq) => eq.id === selectedId) || null;
  }, [earthquakes, selectedId]);

  // Center on selected earthquake
  useEffect(() => {
    if (selectedEarthquake) {
      const { x, y } = getCoords(selectedEarthquake.longitude, selectedEarthquake.latitude);
      // Move SVG so this point is centered in 1000x500 box
      setPan({
        x: (500 - x * zoom),
        y: (250 - y * zoom),
      });
    }
  }, [selectedEarthquake, zoom]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Left click only
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // 1. Pan calculation
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }

    // 2. HUD Latitude/Longitude track
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const relativeY = e.clientY - rect.top;

      // Map relative coordinates to SVG 1000xx500 viewport considering current zoom and pan
      const svgX = ((relativeX - pan.x) / (rect.width * zoom)) * 1000;
      const svgY = ((relativeY - pan.y) / (rect.height * zoom)) * 500;

      const { lat, lon } = getLatLonFromSvg(svgX, svgY);
      setMouseCoord({ lat, lon });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoom = (factor: number) => {
    setZoom((prev) => Math.min(6, Math.max(1, prev * factor)));
  };

  const resetProjection = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Magnitude colored markers helper
  const getMagStyles = (mag: number) => {
    if (mag < 3.0) return { bg: "text-emerald-400 bg-emerald-400/20", border: "border-emerald-400", hex: "#34d399" };
    if (mag < 5.0) return { bg: "text-yellow-400 bg-yellow-400/20", border: "border-yellow-400", hex: "#facc15" };
    if (mag < 6.5) return { bg: "text-orange-500 bg-orange-500/20", border: "border-orange-500", hex: "#f97316" };
    return { bg: "text-red-500 bg-red-500/20", border: "border-red-500", hex: "#ef4444" };
  };

  return (
    <div className="relative w-full h-[600px] rounded-3xl overflow-hidden border border-white/10 bg-black/90 selection:bg-none">
      {/* HUD Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between gap-4 pointer-events-none">
        {/* Terminal Reading coordinates */}
        <div className="liquid-glass rounded-full px-4 py-2 flex items-center gap-6 pointer-events-auto select-none">
          <div className="flex items-center gap-1.5 text-xs font-mono text-white/40">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            LIVE SCANNER
          </div>
          <div className="h-4 w-[1px] bg-white/10" />
          <div className="text-xs font-mono text-white/90">
            LAT: <span className="text-white font-medium">{mouseCoord.lat.toFixed(4)}°</span>
          </div>
          <div className="text-xs font-mono text-white/90">
            LON: <span className="text-white font-medium">{mouseCoord.lon.toFixed(4)}°</span>
          </div>
          <div className="h-4 w-[1px] bg-white/10" />
          <div className="text-[10px] uppercase font-mono tracking-widest text-[#ef4444] font-semibold animate-pulse">
            Active Feed
          </div>
        </div>

        {/* Map Operations */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => handleZoom(1.2)}
            className="p-2 rounded-full liquid-glass hover:bg-white/10 text-white/80 transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>
          <button
            onClick={() => handleZoom(0.8)}
            className="p-2 rounded-full liquid-glass hover:bg-white/10 text-white/80 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>
          <button
            onClick={resetProjection}
            className="p-2 rounded-full liquid-glass hover:bg-white/10 text-white/80 transition-colors"
            title="Reset Scope"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* SVG Interactive Canvas */}
      <div
        ref={containerRef}
        className={`w-full h-full relative overflow-hidden select-none cursor-${isDragging ? "grabbing" : "grab"}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          viewBox="0 0 1000 500"
          className="w-full h-full aspect-video transition-transform duration-75"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
          }}
        >
          {/* Cybergrid lines of Map */}
          <g>
            {graticules.map((grid, i) => (
              <line
                key={i}
                x1={grid.x1}
                y1={grid.y1}
                x2={grid.x2}
                y2={grid.y2}
                stroke="white"
                strokeWidth={0.2}
                strokeDasharray="4 4"
                className="opacity-20"
              />
            ))}
          </g>

          {/* Continents drawing */}
          <g className="fill-none stroke-white/15 stroke-[1px]">
            {continentPaths.map((continent) => (
              <path
                key={continent.name}
                d={continent.d}
                className="hover:stroke-white/30 hover:fill-white/5 transition-colors duration-300"
                style={{ fill: "rgba(255, 255, 255, 0.01)" }}
              />
            ))}
          </g>

          {/* User Geolocation Spot */}
          {userCoords && (
            <g>
              {(() => {
                const { x, y } = getCoords(userCoords.longitude, userCoords.latitude);
                return (
                  <>
                    <circle cx={x} cy={y} r={12} fill="rgba(59, 130, 246, 0.15)" />
                    <circle cx={x} cy={y} r={4} fill="#3b82f6" />
                    <line x1={x - 15} y1={y} x2={x + 15} y2={y} stroke="#3b82f6" strokeWidth={0.5} />
                    <line x1={x} y1={y - 15} x2={x} y2={y + 15} stroke="#3b82f6" strokeWidth={0.5} />
                  </>
                );
              })()}
            </g>
          )}

          {/* Live Earthquake Pins */}
          <g>
            {earthquakes.map((eq) => {
              const { x, y } = getCoords(eq.longitude, eq.latitude);
              const styles = getMagStyles(eq.magnitude);
              const isSelected = eq.id === selectedId;

              return (
                <g
                  key={eq.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(eq.id);
                    playSonarPulse();
                  }}
                  className="cursor-pointer group"
                >
                  {/* Dynamic Pulsating alert aura for significant quakes */}
                  {eq.magnitude >= 4.5 && (
                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected ? 18 : 10}
                      fill={styles.hex}
                      className="opacity-20 animate-ping"
                      style={{ animationDuration: "1.8s" }}
                    />
                  )}

                  {/* Marker Circle */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? 6 : 3.5}
                    fill={styles.hex}
                    className="stroke-black stroke-[1px] group-hover:scale-125 transition-transform"
                  />

                  {/* Highlight Ring */}
                  {isSelected && (
                    <circle
                      cx={x}
                      cy={y}
                      r={10}
                      fill="none"
                      stroke={styles.hex}
                      strokeWidth={1.5}
                    />
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Floating Selected Earthcard beside the map */}
      {selectedEarthquake && (
        <div className="absolute bottom-4 left-4 max-w-sm w-[90%] md:w-[320px] liquid-glass rounded-2xl p-4 text-white z-20 pointer-events-auto select-text animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-mono font-medium ${
                selectedEarthquake.magnitude >= 6.5
                  ? "bg-red-500/20 text-red-400"
                  : selectedEarthquake.magnitude >= 5.0
                  ? "bg-orange-500/20 text-orange-400"
                  : selectedEarthquake.magnitude >= 3.0
                  ? "bg-yellow-500/20 text-yellow-400"
                  : "bg-emerald-500/20 text-emerald-400"
              }`}
            >
              MAG {selectedEarthquake.magnitude.toFixed(1)}
            </span>
            <button
              onClick={() => onSelect(null)}
              className="text-white/40 hover:text-white/100 text-xs font-mono font-medium"
            >
              RESET
            </button>
          </div>
          <h4 className="text-sm font-semibold truncate leading-tight font-body mb-2 flex items-start gap-1.5">
            <MapPin size={14} className="text-white/60 shrink-0 mt-0.5" />
            {selectedEarthquake.place}
          </h4>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono mb-3">
            <div className="border border-white/5 rounded p-1.5 bg-white/[0.01]">
              <span className="text-white/45 block uppercase">Depth</span>
              <span className="text-white font-medium">{selectedEarthquake.depth} km</span>
            </div>
            <div className="border border-white/5 rounded p-1.5 bg-white/[0.01]">
              <span className="text-white/45 block uppercase">Seismic Rank</span>
              <span className="text-white font-medium">
                {selectedEarthquake.magnitude >= 6.5
                  ? "Severe Hazard"
                  : selectedEarthquake.magnitude >= 5.0
                  ? "Strong Quake"
                  : selectedEarthquake.magnitude >= 3.0
                  ? "Moderate Alert"
                  : "Microseismic"}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-white/50 border-t border-white/5 pt-2.5">
            <span>{new Date(selectedEarthquake.time).toLocaleTimeString()}</span>
            {selectedEarthquake.distance && (
              <span className="text-emerald-400/80 font-mono">
                {selectedEarthquake.distance.toFixed(0)} km distant
              </span>
            )}
          </div>
        </div>
      )}

      {/* Map Legend */}
      <div className="absolute bottom-4 right-4 liquid-glass rounded-lg px-3 py-2 flex flex-col gap-1.5 text-[10px] font-mono text-white/60">
        <span className="text-white/40 mb-0.5 uppercase tracking-wider text-[8px]">Seismic Severity</span>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          <span>Major (≥ 6.5 MAG)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-orange-500" />
          <span>Strong (5.0–6.5 MAG)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-yellow-400" />
          <span>Moderate (3.0–5.0 MAG)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span>Minor ({"<"} 3.0 MAG)</span>
        </div>
      </div>
    </div>
  );
}
