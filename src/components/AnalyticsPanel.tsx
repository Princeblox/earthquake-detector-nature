import { useEffect, useState } from "react";
import { Users, TrendingUp, Calendar, Clock } from "lucide-react";

export function AnalyticsPanel() {
  const [online, setOnline] = useState(142);
  const [total, setTotal] = useState(128450);
  const [today, setToday] = useState(14820);
  const [thisWeek, setThisWeek] = useState(89450);

  useEffect(() => {
    // Read from localStorage to provide consistent and non-flickery updates
    const savedTotal = localStorage.getItem("lumina_total_visitors");
    const initialTotal = savedTotal ? parseInt(savedTotal, 10) : 128450;
    setTotal(initialTotal);

    const savedToday = localStorage.getItem("lumina_today_visitors");
    const initialToday = savedToday ? parseInt(savedToday, 10) : 14822;
    setToday(initialToday);

    // Live fluctuate updates to look authentic, like a live terminal monitor
    const interval = setInterval(() => {
      // Fluctuate live active visitors
      setOnline((prev) => {
        const delta = Math.floor(Math.random() * 7) - 3; // -3 to +3
        const next = prev + delta;
        return Math.max(120, Math.min(next, 190));
      });

      // Increment total visitors
      setTotal((prev) => {
        const next = prev + 1;
        localStorage.setItem("lumina_total_visitors", next.toString());
        return next;
      });

      // Increment today visitors
      setToday((prev) => {
        const next = prev + 1;
        localStorage.setItem("lumina_today_visitors", next.toString());
        return next;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
      {/* Visitors Online */}
      <div className="liquid-glass rounded-2xl p-4 flex flex-col justify-between group hover:scale-[1.02] transition-transform duration-300">
        <div className="flex items-center justify-between text-white/50 mb-3 text-xs uppercase tracking-wider font-body">
          <span>Active Monitor Sessions</span>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
        </div>
        <div>
          <div className="text-3xl font-heading italic text-white leading-none tracking-tight">
            {online}
          </div>
          <p className="text-[11px] text-white/40 mt-1.5 font-body flex items-center gap-1">
            <Users size={12} /> Global nodes active
          </p>
        </div>
      </div>

      {/* Today */}
      <div className="liquid-glass rounded-2xl p-4 flex flex-col justify-between group hover:scale-[1.02] transition-transform duration-300">
        <div className="flex items-center justify-between text-white/50 mb-3 text-xs uppercase tracking-wider font-body">
          <span>Queries Today</span>
          <Clock size={12} className="text-white/30" />
        </div>
        <div>
          <div className="text-3xl font-heading italic text-white leading-none tracking-tight">
            {today.toLocaleString()}
          </div>
          <p className="text-[11px] text-emerald-400/80 mt-1.5 font-body flex items-center gap-1">
            <TrendingUp size={12} /> Live API requests
          </p>
        </div>
      </div>

      {/* This Week */}
      <div className="liquid-glass rounded-2xl p-4 flex flex-col justify-between group hover:scale-[1.02] transition-transform duration-300">
        <div className="flex items-center justify-between text-white/50 mb-3 text-xs uppercase tracking-wider font-body">
          <span>Global Analyzed</span>
          <Calendar size={12} className="text-white/30" />
        </div>
        <div>
          <div className="text-3xl font-heading italic text-white leading-none tracking-tight">
            {thisWeek.toLocaleString()}
          </div>
          <p className="text-[11px] text-white/40 mt-1.5 font-body">
            Seismic sweeps this week
          </p>
        </div>
      </div>

      {/* Total Visitors */}
      <div className="liquid-glass rounded-2xl p-4 flex flex-col justify-between group hover:scale-[1.02] transition-transform duration-300">
        <div className="flex items-center justify-between text-white/50 mb-3 text-xs uppercase tracking-wider font-body">
          <span>Accrued System Hits</span>
          <div className="h-1.5 w-6 rounded bg-white/20 overflow-hidden">
            <div className="h-full w-2/3 bg-white animate-pulse" />
          </div>
        </div>
        <div>
          <div className="text-3xl font-heading italic text-white leading-none tracking-tight">
            {total.toLocaleString()}
          </div>
          <p className="text-[11px] text-white/40 mt-1.5 font-body">
            Encrypted historical records
          </p>
        </div>
      </div>
    </div>
  );
}
