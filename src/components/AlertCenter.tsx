import { useState, useEffect } from "react";
import { Bell, BellOff, Volume2, VolumeX, ShieldAlert, Wifi } from "lucide-react";
import { playSonarPulse, playSeismicWarning } from "../utils/audio";

interface AlertCenterProps {
  onPermissionChange: (granted: boolean) => void;
  hasPermission: boolean;
}

export function AlertCenter({ onPermissionChange, hasPermission }: AlertCenterProps) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [proximityFilter, setProximityFilter] = useState(false);

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support system notifications.");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      onPermissionChange(permission === "granted");
      if (permission === "granted") {
        new Notification("Earthquake Alerts Activated", {
          body: "Lumina Nature Intelligence will now instantly ping major shifts.",
          silent: !soundEnabled,
        });
        if (soundEnabled) playSonarPulse();
      }
    } catch (err) {
      console.error("Failed requesting notifications permission:", err);
    }
  };

  const handleTestAlert = () => {
    if (soundEnabled) {
      playSeismicWarning();
    }
    if (Notification.permission === "granted") {
      new Notification("TEST SYSTEM ALARM", {
        body: "USGS alert simulation. Major earthquake recorded: Magnitude 6.7.",
        icon: "/favicon.ico",
      });
    } else {
      alert("Simulating Alert: Magnitude 6.7 Major Seismological Activity Detected!");
    }
  };

  return (
    <div className="liquid-glass rounded-3xl p-6 md:p-8 flex flex-col justify-between h-full hover:scale-[1.01] transition-all">
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <ShieldAlert size={20} className="text-[#ef4444] animate-pulse" />
            <h3 className="font-heading italic text-2xl text-white">Alert Dispatcher</h3>
          </div>
          <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-mono text-emerald-400">
            <Wifi size={10} /> Online
          </span>
        </div>

        <p className="text-white/70 text-sm leading-relaxed mb-6 font-body font-light">
          Activate our unified location-based warning grid. When customized guidelines are bypassed,
          the system immediately triggers high-frequency desktop notifications and premium Web Audio synthesizers.
        </p>

        <div className="space-y-4">
          {/* Notification Authorization Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl border border-white/5 bg-white/[0.01]">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-white font-body leading-none">System Notifications</span>
              <span className="text-[11px] text-white/40 mt-1 font-mono">Push warnings to operating system</span>
            </div>
            <button
              onClick={requestNotificationPermission}
              className={`px-4 py-1.5 rounded-full text-xs font-mono font-medium flex items-center gap-1.5 transition-all ${
                hasPermission
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-white text-black hover:bg-neutral-200"
              }`}
            >
              {hasPermission ? (
                <>
                  <Bell size={12} /> Enabled
                </>
              ) : (
                <>
                  <BellOff size={12} /> Enable
                </>
              )}
            </button>
          </div>

          {/* Sound Synthesizer Alerts Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl border border-white/5 bg-white/[0.01]">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-white font-body leading-none">Acoustic Sonar alerts</span>
              <span className="text-[11px] text-white/40 mt-1 font-mono">Web Audio synthesizer alarms</span>
            </div>
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                playSonarPulse();
              }}
              className={`p-2.5 rounded-full transition-all ${
                soundEnabled
                  ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                  : "bg-white/5 text-white/30 hover:bg-white/10"
              }`}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Manual Test Dispatch Button */}
      <div className="mt-8 pt-6 border-t border-white/5">
        <button
          onClick={handleTestAlert}
          className="w-full py-3 rounded-full text-xs font-mono font-bold tracking-widest text-center uppercase border border-white/10 hover:border-white/30 text-white/80 hover:text-white hover:bg-white/[0.03] transition-all"
        >
          Dispatch Alarm Simulation
        </button>
      </div>
    </div>
  );
}
