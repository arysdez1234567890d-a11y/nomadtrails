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
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
    label: "New booking",
  },
  booking_confirmed: {
    icon: CheckCircle,
    color: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-200",
    label: "Booking confirmed",
  },
  booking_cancelled: {
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-50 border-red-200",
    label: "Booking cancelled",
  },
  booking_contacted: {
    icon: Clock,
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-200",
    label: "Marked contacted",
  },
  user_signup: {
    icon: UserPlus,
    color: "text-violet-600",
    bg: "bg-violet-50 border-violet-200",
    label: "New user",
  },
  message_new: {
    icon: Mail,
    color: "text-pink-600",
    bg: "bg-pink-50 border-pink-200",
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

  useEffect(() => { load(); }, []);
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
      if (!group) { group = { label, items: [] }; groups.push(group); }
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
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-black font-playfair text-slate-900 flex items-center gap-2.5">
            <Activity className="text-[#c9a84c]" size={20} />
            Activity Feed
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Live · {counts.total} event{counts.total === 1 ? "" : "s"}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer select-none">
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
            className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2 hover:bg-slate-50 transition disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-6 items-center">
        <Filter size={12} className="text-slate-400" />
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
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-2 ${
                filter === f.id
                  ? "bg-[#0a0f14] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {f.label}
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  filter === f.id ? "bg-white/20" : "bg-white"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
          <Activity className="mx-auto text-slate-300 mb-3" size={32} />
          <p className="text-sm font-medium text-slate-500">No activity yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map((group) => (
            <div key={group.label}>
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                  {group.label}
                </h3>
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-[10px] text-slate-400">{group.items.length} events</span>
              </div>

              <div className="space-y-2">
                {group.items.map((e) => {
                  const tm = TYPE_META[e.type];
                  const Icon = tm.icon;
                  return (
                    <div
                      key={e.id}
                      className="flex items-start gap-3 p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition"
                    >
                      <div
                        className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${tm.bg} ${tm.color}`}
                      >
                        <Icon size={16} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span className={`text-[10px] font-black uppercase tracking-widest ${tm.color}`}>
                            {tm.label}
                          </span>
                          <span className="text-[10px] text-slate-300">·</span>
                          <span className="text-[10px] text-slate-400">{timeAgo(e.at)}</span>
                        </div>
                        <p className="text-slate-900 font-bold text-sm truncate">{e.title}</p>
                        {e.subtitle && (
                          <p className="text-xs text-slate-500 truncate mt-0.5">{e.subtitle}</p>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-[10px] text-slate-400 whitespace-nowrap">
                          {new Date(e.at).toLocaleTimeString(undefined, {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        {e.meta?.status && (
                          <span
                            className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                              e.meta.status === "confirmed"
                                ? "bg-emerald-100 text-emerald-700"
                                : e.meta.status === "cancelled"
                                ? "bg-red-100 text-red-700"
                                : e.meta.status === "contacted"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-blue-100 text-blue-700"
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
