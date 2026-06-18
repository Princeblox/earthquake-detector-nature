import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Music2,
  Facebook,
  Twitter,
  Youtube,
  Instagram,
  ArrowUpRight,
  Play,
  Volume2,
  Globe,
  Clock,
  Activity,
  Compass,
  AlertTriangle,
  CheckCircle2,
  Bell,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import { FadingVideo } from "./components/FadingVideo";
import { BlurText } from "./components/BlurText";
import { WorldMap, Earthquake } from "./components/WorldMap";
import { USGSFeed } from "./components/USGSFeed";
import { AlertCenter } from "./components/AlertCenter";
import { AnalyticsPanel } from "./components/AnalyticsPanel";
import { Capabilities } from "./components/Capabilities";
import { playClickSound, playSonarPulse, playSeismicWarning } from "./utils/audio";

// High-fidelity fallback list of recent major earthquakes (Ring of Fire)
const staticQuakes: Earthquake[] = [
  {
    id: "us_fallback_1",
    magnitude: 6.8,
    place: "82 km SE of Port-Olry, Vanuatu",
    time: Date.now() - 3600000 * 2, // 2 hours ago
    longitude: 167.5,
    latitude: -15.5,
    depth: 121,
  },
  {
    id: "us_fallback_2",
    magnitude: 5.9,
    place: "Near Coast of Southern Peru",
    time: Date.now() - 3600000 * 5, // 5 hours ago
    longitude: -74.3,
    latitude: -16.2,
    depth: 35,
  },
  {
    id: "us_fallback_3",
    magnitude: 6.2,
    place: "Tonga Islands Region",
    time: Date.now() - 3600000 * 8, // 8 hours ago
    longitude: -175.2,
    latitude: -20.5,
    depth: 10,
  },
  {
    id: "us_fallback_4",
    magnitude: 4.1,
    place: "12 km WNW of Searles Valley, California",
    time: Date.now() - 1200000, // 20 mins ago
    longitude: -117.5,
    latitude: 35.8,
    depth: 8,
  },
  {
    id: "us_fallback_5",
    magnitude: 5.3,
    place: "65 km ESE of Tokyo, Japan",
    time: Date.now() - 3600000 * 12,
    longitude: 140.4,
    latitude: 35.5,
    depth: 45,
  },
  {
    id: "us_fallback_6",
    magnitude: 3.2,
    place: "6 km NNW of Anchorage, Alaska",
    time: Date.now() - 1800000,
    longitude: -149.9,
    latitude: 61.2,
    depth: 22,
  },
  {
    id: "us_fallback_7",
    magnitude: 7.1,
    place: "Halmahera, Indonesia",
    time: Date.now() - 3600000 * 24,
    longitude: 128.1,
    latitude: 1.4,
    depth: 85,
  },
];

export default function App() {
  const [earthquakes, setEarthquakes] = useState<Earthquake[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // Geo Detection Toasts and Notification Permission State
  const [detectionToast, setDetectionToast] = useState<{
    show: boolean;
    type: "success" | "warning" | "info";
    title: string;
    msg: string;
  } | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<boolean>(false);

  // Calculate distance between two coordinates in km (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Safe fetch USGS real-time earthquakes
  const fetchUSGSData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"
      );
      if (!response.ok) throw new Error("API Network issue");
      const data = await response.json();

      let parsed: Earthquake[] = data.features.map((feat: any) => {
        const [lon, lat, dep] = feat.geometry.coordinates;
        return {
          id: feat.id,
          magnitude: feat.properties.mag,
          place: feat.properties.place,
          time: feat.properties.time,
          longitude: lon,
          latitude: lat,
          depth: dep,
        };
      });

      // Filter null/weird magnitudes
      parsed = parsed.filter((eq) => eq.magnitude !== null && !isNaN(eq.magnitude));

      // Append distances if geolocated
      if (userLocation) {
        parsed = parsed.map((eq) => ({
          ...eq,
          distance: calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            eq.latitude,
            eq.longitude
          ),
        }));
      }

      setEarthquakes(parsed.length > 0 ? parsed : staticQuakes);
    } catch (err) {
      console.warn("Could not retrieve real-time USGS stream, utilizing fallback dataset", err);
      // Fallback
      let parsed = [...staticQuakes];
      if (userLocation) {
        parsed = parsed.map((eq) => ({
          ...eq,
          distance: calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            eq.latitude,
            eq.longitude
          ),
        }));
      }
      setEarthquakes(parsed);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchUSGSData();

    // Notification authorization check
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission === "granted");
    }
  }, [userLocation]);

  // Geolocation trigger: "Detect Earthquake Near Me"
  const handleDetectNearMe = () => {
    playClickSound();
    if (!navigator.geolocation) {
      setDetectionToast({
        show: true,
        type: "warning",
        title: "Platform Unresolved",
        msg: "Geolocation protocol is not supported by your current browser environment.",
      });
      return;
    }

    setDetectionToast({
      show: true,
      type: "info",
      title: "Scanner Initiated",
      msg: "Acquiring orbital telemetry coordinates. Please authorize browser location...",
    });

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
        setUserLocation(coords);

        // Find nearest earthquake in active cache
        if (earthquakes.length > 0) {
          let nearest: Earthquake | null = null;
          let minDistance = Infinity;

          const updated = earthquakes.map((eq) => {
            const dist = calculateDistance(coords.latitude, coords.longitude, eq.latitude, eq.longitude);
            if (dist < minDistance) {
              minDistance = dist;
              nearest = eq;
            }
            return { ...eq, distance: dist };
          });

          setEarthquakes(updated);

          if (nearest) {
            setSelectedId((nearest as Earthquake).id);
            playSonarPulse();

            setDetectionToast({
              show: true,
              type: "success",
              title: "Geotether Established",
              msg: `Closest Tremor: ${(nearest as Earthquake).place} (${minDistance.toFixed(0)} km distant) with local strength ${(nearest as Earthquake).magnitude.toFixed(1)} MAG.`,
            });

            // Smooth scroll to tracking terminal
            document.getElementById("tracking-dashboard")?.scrollIntoView({ behavior: "smooth" });
          }
        }
      },
      (err) => {
        console.warn("Geolocation denied or timed out:", err);
        setDetectionToast({
          show: true,
          type: "warning",
          title: "Telemetry Refused",
          msg: "Coordinate grab failed. Using generic global seismological overview instead.",
        });
      }
    );
  };

  return (
    <main className="relative w-full min-h-[115vh] overflow-x-hidden flex flex-col items-center bg-black font-sans selection:bg-white/20 selection:text-white">
      {/* Background World Video */}
      <div className="fixed inset-0 w-full h-full object-cover z-0 overflow-hidden pointer-events-none">
        <FadingVideo
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260429_114316_1c7889ad-2885-410e-b493-98119fee0ddb.mp4"
          className="absolute left-1/2 top-0 -translate-x-1/2 object-cover object-top z-0"
          style={{ width: "120%", height: "120%" }}
        />
      </div>

      {/* Notification Toast Alert */}
      <AnimatePresence>
        {detectionToast?.show && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md pointer-events-auto"
          >
            <div className="liquid-glass rounded-2xl p-4 flex items-start gap-3.5 shadow-2xl border border-white/10">
              <div className="shrink-0 mt-0.5">
                {detectionToast.type === "success" ? (
                  <CheckCircle2 className="text-emerald-400" size={18} />
                ) : detectionToast.type === "warning" ? (
                  <AlertTriangle className="text-red-400 animate-pulse" size={18} />
                ) : (
                  <Activity className="text-blue-400 animate-spin" style={{ animationDuration: "3s" }} />
                )}
              </div>
              <div className="flex-1">
                <span className="text-xs uppercase font-mono tracking-wider font-bold text-white block">
                  {detectionToast.title}
                </span>
                <p className="text-[11px] text-white/80 font-body mt-1 leading-snug">
                  {detectionToast.msg}
                </p>
              </div>
              <button
                onClick={() => setDetectionToast(null)}
                className="text-white/40 hover:text-white text-xs font-mono font-bold"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Header Navbar */}
      <motion.nav
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed top-4 w-[92%] max-w-7xl z-50 flex items-center justify-between"
      >
        {/* Left Circle Logo */}
        <div className="flex items-center gap-3">
          <a
            href="#"
            onClick={() => playClickSound()}
            className="h-11 w-11 rounded-full liquid-glass flex items-center justify-center font-heading italic text-white text-xl hover:scale-105 transition-transform"
          >
            n
          </a>
          <span className="text-xs tracking-widest font-mono text-white/50 uppercase select-none hidden sm:inline">
            // Nature
          </span>
        </div>

        {/* Center Nav Pill Links */}
        <div className="liquid-glass rounded-full px-1.5 py-1.5 flex items-center gap-1">
          <a
            href="#tracking-dashboard"
            onClick={() => playClickSound()}
            className="px-3.5 py-1.5 rounded-full text-xs font-body font-medium text-white/80 hover:text-white transition-colors"
          >
            Dashboard
          </a>
          <a
            href="#tracking-dashboard"
            onClick={() => playClickSound()}
            className="px-3.5 py-1.5 rounded-full text-xs font-body font-medium text-white/80 hover:text-white transition-colors"
          >
            Live Map
          </a>
          <a
            href="#capabilities-section"
            onClick={() => playClickSound()}
            className="px-3.5 py-1.5 rounded-full text-xs font-body font-medium text-white/80 hover:text-white transition-colors"
          >
            Capabilities
          </a>
        </div>

        {/* Right CTA Button */}
        <div>
          <button
            onClick={handleDetectNearMe}
            className="liquid-glass-strong rounded-full px-5 py-2.5 text-xs font-mono font-bold text-white hover:bg-white/10 flex items-center gap-2 transition-all group"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Detect</span>
            <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </motion.nav>

      {/* Hero section */}
      <section className="relative w-full min-h-screen flex flex-col justify-between items-center z-10 pt-32 px-6 md:px-12 select-text">
        <div className="flex-1 flex flex-col justify-center items-center text-center max-w-4xl mt-12 md:mt-16">
          
          {/* Badge indicator */}
          <motion.div
            initial={{ filter: "blur(10px)", opacity: 0, y: 20 }}
            animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="liquid-glass rounded-full px-3 py-1 flex items-center gap-2 mb-6"
          >
            <span className="bg-white text-black rounded-full px-2.5 py-0.5 text-[9px] font-bold font-mono tracking-wider uppercase">
              Live
            </span>
            <span className="text-[11px] font-medium text-white/95 font-body">
              Global Seismic Network Connected
            </span>
          </motion.div>

          {/* Heading - BlurReveal */}
          <BlurText
            text="Monitor Earth. Understand Every Tremor."
            className="text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] tracking-[-3px] font-heading font-medium leading-[0.8] mb-6"
          />

          {/* Subheading */}
          <motion.p
            initial={{ filter: "blur(10px)", opacity: 0, y: 20 }}
            animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
            className="text-white/70 max-w-2xl text-xs sm:text-sm md:text-base font-body font-light leading-relaxed mb-8"
          >
            Track earthquakes worldwide using real-time seismic intelligence, deep geological monitoring,
            and location-aware alerts. Powered by the unified USGS geodetic coordinate grid.
          </motion.p>

          {/* CTA Row */}
          <motion.div
            initial={{ filter: "blur(10px)", opacity: 0, y: 20 }}
            animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1, ease: "easeOut" }}
            className="flex flex-wrap justify-center items-center gap-4"
          >
            <button
              onClick={handleDetectNearMe}
              className="liquid-glass-strong rounded-full px-6 py-3 text-sm font-semibold text-white hover:bg-white/[0.05] transition-all flex items-center gap-2 group cursor-pointer"
            >
              <span>Detect Earthquake Near Me</span>
              <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>

            <a
              href="#tracking-dashboard"
              onClick={() => {
                playClickSound();
                document.getElementById("tracking-dashboard")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-5 py-3 text-sm font-body font-medium text-white/80 hover:text-white flex items-center gap-1.5 transition-colors group"
            >
              <span>View Global Activity</span>
              <Play size={10} className="fill-white stroke-none group-hover:scale-110 transition-transform" />
            </a>
          </motion.div>

          {/* Stats Cards Row */}
          <motion.div
            initial={{ filter: "blur(10px)", opacity: 0, y: 30 }}
            animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.3, ease: "easeOut" }}
            className="flex flex-wrap justify-center items-stretch gap-4 mt-16 md:mt-20"
          >
            {/* Card 1 */}
            <div className="liquid-glass p-5 w-[220px] rounded-[1.25rem] text-left flex flex-col justify-between hover:scale-[1.02] transition-transform">
              <div className="h-7 w-7 rounded-full liquid-glass flex items-center justify-center text-white/80 mb-6 border border-white/5">
                <Clock size={12} />
              </div>
              <div>
                <span className="text-4xl font-heading italic text-white tracking-tight leading-none">
                  34.5 Min
                </span>
                <p className="text-[10px] text-white/40 font-body uppercase tracking-wider mt-2">
                  Average Telemetry Sync
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="liquid-glass p-5 w-[220px] rounded-[1.25rem] text-left flex flex-col justify-between hover:scale-[1.02] transition-transform">
              <div className="h-7 w-7 rounded-full liquid-glass flex items-center justify-center text-white/80 mb-6 border border-white/5">
                <Globe size={12} />
              </div>
              <div>
                <span className="text-4xl font-heading italic text-white tracking-tight leading-none">
                  2.8B+
                </span>
                <p className="text-[10px] text-white/40 font-body uppercase tracking-wider mt-2">
                  Daily Database Sweeps
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Partners Line spacer */}
        <motion.div
          initial={{ filter: "blur(10px)", opacity: 0, y: 20 }}
          animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4, ease: "easeOut" }}
          className="w-full max-w-4xl flex flex-col items-center gap-4 py-12 mt-12 md:mt-24 border-t border-white/5"
        >
          <span className="rounded-full liquid-glass px-3.5 py-1 text-[10px] font-medium tracking-wide uppercase text-white/50">
            Collaborating with top aerospace & geology pioneers globally
          </span>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-3 text-2xl md:text-3xl font-heading italic text-white/85 select-none">
            <span>Aeon</span>
            <span>·</span>
            <span>Vela</span>
            <span>·</span>
            <span>Apex</span>
            <span>·</span>
            <span>Orbit</span>
            <span>·</span>
            <span>Zeno</span>
          </div>
        </motion.div>
      </section>

      {/* Main interactive terminal section */}
      <section
        id="tracking-dashboard"
        className="relative w-full max-w-7xl mx-auto px-6 md:px-12 pt-32 pb-6 z-10 flex flex-col gap-8 select-text"
      >
        <div className="text-center max-w-2xl mx-auto mb-6">
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#ef4444] font-semibold flex items-center justify-center gap-1.5 mb-2">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
            Active Real-Time Telemetry Monitor
          </span>
          <h2 className="font-heading italic text-white text-4xl md:text-5xl leading-none tracking-tight">
            Seismic Mission Terminal
          </h2>
          <p className="text-sm font-body font-light text-white/60 mt-2">
            Tap and pan the visual grid to isolate coordinates. Select details on our live stream
            below or authorize proximity detectors to track local tremors.
          </p>
        </div>

        {/* World map monitoring map */}
        <WorldMap
          earthquakes={earthquakes}
          selectedId={selectedId}
          onSelect={setSelectedId}
          userCoords={userLocation}
        />

        {/* Multi column console details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-7">
            <USGSFeed
              earthquakes={earthquakes}
              selectedId={selectedId}
              onSelect={setSelectedId}
              isLoading={loading}
              onRefresh={fetchUSGSData}
            />
          </div>

          <div className="lg:col-span-5 flex flex-col gap-6">
            <AlertCenter
              hasPermission={notificationPermission}
              onPermissionChange={setNotificationPermission}
            />
          </div>
        </div>

        {/* Live system telemetry hits row */}
        <div className="mt-8">
          <AnalyticsPanel />
        </div>
      </section>

      {/* Seismologist capabilities specs section */}
      <div id="capabilities-section" className="w-full select-text mt-24">
        <Capabilities />
      </div>

      {/* Lumina Liquid-Glass Footer */}
      <div className="relative w-full z-10 max-w-7xl px-6 md:px-12 pt-20 pb-12 select-text">
        <motion.footer
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, delay: 0.1, ease: "easeOut" }}
          className="liquid-glass w-full rounded-3xl p-6 md:p-10 text-white/70"
        >
          {/* Top layout grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 mb-10">
            {/* Column 1 - Brand Column */}
            <div className="md:col-span-5 flex flex-col gap-4">
              <div className="flex items-center gap-3 text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 256 256"
                  fill="currentColor"
                  className="h-5 w-5 hover:rotate-12 transition-transform"
                >
                  <path d="M 4.688 136 C 68.373 136 120 187.627 120 251.312 C 120 252.883 119.967 254.445 119.905 256 L 0 256 L 0 136.096 C 1.555 136.034 3.117 136 4.688 136 Z M 251.312 136 C 252.883 136 254.445 136.034 256 136.096 L 256 256 L 136.095 256 C 136.032 254.438 136.001 252.875 136 251.312 C 136 187.627 187.627 136 251.312 136 Z M 119.905 0 C 119.967 1.555 120 3.117 120 4.688 C 120 68.373 68.373 120 4.687 120 C 3.117 120 1.555 119.967 0 119.905 L 0 0 Z M 256 119.905 C 254.445 119.967 252.883 120 251.312 120 C 187.627 120 136 68.373 136 4.687 C 136 3.117 136.033 1.555 136.095 0 L 256 0 Z" />
                </svg>
                <span className="text-xl font-medium tracking-wider">LUMINA</span>
              </div>
              <p className="text-xs leading-relaxed max-w-sm text-white/50 font-body">
                Lumina provides premium clarity on global events and cosmic wonders - shared with all for free.
              </p>
            </div>

            {/* Columns 2-4 - Shared navigation matrices */}
            <div className="md:col-span-7 grid grid-cols-3 gap-6">
              {/* Box 1 */}
              <div>
                <h4 className="text-sm uppercase tracking-wider text-white font-medium mb-4 font-body">
                  Discover
                </h4>
                <ul className="text-xs space-y-2 text-white/45 font-body">
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Labs & Workshops
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Deep Dive Catalog
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Global Circles
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Resource Vaults
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Future Roadmaps
                    </a>
                  </li>
                </ul>
              </div>

              {/* Box 2 */}
              <div>
                <h4 className="text-sm uppercase tracking-wider text-white font-medium mb-4 font-body">
                  The Mission
                </h4>
                <ul className="text-xs space-y-2 text-white/45 font-body">
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Origin Stories
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      The Collectives
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Newsroom Hubs
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Join the Teams
                    </a>
                  </li>
                </ul>
              </div>

              {/* Box 3 */}
              <div>
                <h4 className="text-sm uppercase tracking-wider text-white font-medium mb-4 font-body">
                  Concierge
                </h4>
                <ul className="text-xs space-y-2 text-white/45 font-body">
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Get in Touch
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Legal Privacies
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      User Agreements
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Report Concerns
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer bottom bar panel */}
          <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4 select-none">
            <p className="text-[10px] uppercase tracking-widest opacity-50 font-mono">
              Curated by @GotInGeorgiG
            </p>

            <div className="flex items-center gap-4">
              <span className="text-[10px] uppercase tracking-widest opacity-50 font-mono">
                Join the Journey:
              </span>
              <div className="flex items-center gap-3">
                <a
                  href="#"
                  className="opacity-70 hover:opacity-100 transition-colors hover:text-white"
                  title="Music"
                  onClick={() => playClickSound()}
                >
                  <Music2 size={16} />
                </a>
                <a
                  href="#"
                  className="opacity-70 hover:opacity-100 transition-colors hover:text-white"
                  title="Facebook"
                  onClick={() => playClickSound()}
                >
                  <Facebook size={16} />
                </a>
                <a
                  href="#"
                  className="opacity-70 hover:opacity-100 transition-colors hover:text-white"
                  title="Twitter"
                  onClick={() => playClickSound()}
                >
                  <Twitter size={16} />
                </a>
                <a
                  href="#"
                  className="opacity-70 hover:opacity-100 transition-colors hover:text-white"
                  title="Youtube"
                  onClick={() => playClickSound()}
                >
                  <Youtube size={16} />
                </a>
                <a
                  href="#"
                  className="opacity-70 hover:opacity-100 transition-colors hover:text-white"
                  title="Instagram"
                  onClick={() => playClickSound()}
                >
                  <Instagram size={16} />
                </a>
              </div>
            </div>
          </div>
        </motion.footer>
      </div>
    </main>
  );
}
