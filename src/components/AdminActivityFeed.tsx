"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  UserPlus,
  Mail,
  RefreshCw,
  Activity,
  Filter,
  ChevronRight,
} from "lucide-react";

type Event = {
  id: string;
  type:
    | "booking_new"
    | "booking_confirmed"
    | "booking_cancelled"
    | "booking_contacted"
    | "user_signup"
    | "message_new";
  at: string;
  title: string;
  subtitle?: string;
  meta?: any;
};

const TYPE_META: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  booking_new: {
    icon: Calendar,
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/30",
    label: "New booking",
  },
  booking_confirmed: {
    icon: CheckCircle,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/30",
    label: "Booking confirmed",
  },
  booking_cancelled: {
    icon: XCircle,
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/30",
    label: "Booking cancelled",
  },
  booking_contacted: {
    icon: Clock,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/30",
    label: "Marked contacted",
  },
  user_signup: {
    icon: UserPlus,
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/30",
    label: "New user",
  },
  message_new: {
    icon: Mail,
    color: "text-pink-400",
    bg: "bg-pink-500/10 border-pink-500/30",
    label: "New message",
  },
};

const FILTERS = [
  { id: "all", label: "All activity" },
  { id: "bookings", label: "Bookings", types: ["booking_new", "booking_confirmed", "booking_cancelled", "booking_contacted"] },
  { id: "users", label: "Users", types: ["user_signup"] },
  { id: "messages", label: "Messages", types: ["message_new"] },
] as const;

export default function AdminActivityFeed() {
  const [events, setEvents] = useState<Event[]>([]);
  const [counts, setCounts] = useState({ total: 0, bookings: 0, users: 0, messages: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    setRefreshing(true);
    try {
      const res = await fetch("/api/admin/activity?limit=50");
      const data = await res.json();
      setEvents(data.events ?? []);
      setCounts(data.counts ?? { total: 0, bookings: 0, users: 0, messages: 0 });
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [autoRefresh]);

  const filtered = useMemo(() => {
    if (filter === "all") return events;
    const f = FILTERS.find((x) => x.id === filter);
    if (!f || !("types" in f)) return events;
    return events.filter((e) => (f as any).types.includes(e.type));
  }, [events, filter]);

  // Group by date label
  const grouped = useMemo(() => {
    const groups: { label: string; items: Event[] }[] = [];
    const now = new Date();
    const todayStr = now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    filtered.forEach((e) => {
      const d = new Date(e.at);
      const ds = d.toDateString();
      let label: string;
      if (ds === todayStr) label = "Today";
      else if (ds === yesterdayStr) label = "Yesterday";
      else label = d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });

      let group = groups.find((g) => g.label === label);
      if (!group) {
        group = { label, items: [] };
        groups.push(group);
      }
      group.items.push(e);
    });
    return groups;
  }, [filtered]);

  function timeAgo(iso: string): string {
    const ms = Date.now() - new Date(iso).getTime();
    const s = Math.floor(ms / 1000);
    if (s < 60) return "just now";
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d < 7) return `${d}d ago`;
    return new Date(iso).toLocaleDateString();
  }

  return (
    <div className="p-6 md:p-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-black font-playfair text-white mb-1 flex items-center gap-3">
            <Activity className="text-[#c9a84c]" size={26} />
            Activity Feed
          </h2>
          <p className="text-emerald-400/40 text-xs uppercase tracking-widest font-bold">
            Live · {counts.total} events
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <label className="flex items-center gap-2 text-xs text-white/50 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="accent-[#c9a84c]"
            />
            Auto-refresh
          </label>
          <button
            onClick={load}
            disabled={refreshing}
            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 text-xs font-bold flex items-center gap-2 hover:bg-white/10 transition disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        <span className="flex items-center gap-2 text-xs text-white/30 mr-2">
          <Filter size={12} />
        </span>
        {FILTERS.map((f) => {
          const count =
            f.id === "all"
              ? counts.total
              : f.id === "bookings"
              ? counts.bookings
              : f.id === "users"
              ? counts.users
              : counts.messages;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-2 ${
                filter === f.id
                  ? "bg-[#c9a84c] text-[#1a3d2b]"
                  : "bg-white/5 text-white/50 hover:bg-white/10"
              }`}
            >
              {f.label}
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  filter === f.id ? "bg-[#1a3d2b]/20" : "bg-white/10"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Loading / empty / list */}
      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 bg-white/5 border border-white/10 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-3xl border-2 border-dashed border-white/10">
          <Activity className="mx-auto text-white/20 mb-4" size={40} />
          <p className="text-white/30 font-black uppercase tracking-widest text-xs">
            No activity yet
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map((group) => (
            <div key={group.label}>
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
                  {group.label}
                </h3>
                <div className="flex-1 h-px bg-white/5" />
                <span className="text-[10px] text-white/30">{group.items.length} events</span>
              </div>

              <div className="space-y-2">
                {group.items.map((e) => {
                  const tm = TYPE_META[e.type];
                  const Icon = tm.icon;
                  return (
                    <div
                      key={e.id}
                      className="group flex items-start gap-4 p-4 bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 rounded-2xl transition"
                    >
                      <div
                        className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${tm.bg} ${tm.color}`}
                      >
                        <Icon size={18} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span className={`text-[10px] font-black uppercase tracking-widest ${tm.color}`}>
                            {tm.label}
                          </span>
                          <span className="text-[10px] text-white/30">·</span>
                          <span className="text-[10px] text-white/40">{timeAgo(e.at)}</span>
                        </div>
                        <p className="text-white font-bold truncate">{e.title}</p>
                        {e.subtitle && (
                          <p className="text-xs text-white/50 truncate mt-0.5">{e.subtitle}</p>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-[10px] text-white/30 whitespace-nowrap">
                          {new Date(e.at).toLocaleTimeString(undefined, {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        {e.meta?.status && (
                          <span
                            className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                              e.meta.status === "confirmed"
                                ? "bg-emerald-500/20 text-emerald-400"
                                : e.meta.status === "cancelled"
                                ? "bg-red-500/20 text-red-400"
                                : e.meta.status === "contacted"
                                ? "bg-amber-500/20 text-amber-400"
                                : "bg-blue-500/20 text-blue-400"
                            }`}
                          >
                            {e.meta.status}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
