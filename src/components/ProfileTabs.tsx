"use client";
import { useState, useMemo } from "react";
import {
  Calendar,
  Settings,
  Map,
  Hotel,
  Plane,
  Clock,
  X,
  Filter,
  CheckCircle2,
  AlertCircle,
  Ban,
  TrendingUp,
  CreditCard,
  Award,
} from "lucide-react";
import ProfileSettings from "./ProfileSettings";

type Booking = {
  id: number;
  item_type: "tour" | "hotel" | "transport";
  tour_name?: string | null;
  hotel_name?: string | null;
  transport_title?: string | null;
  preferred_date: string;
  guests: number;
  status: "new" | "contacted" | "confirmed" | "cancelled";
  created_at: string;
  tours?: any;
  hotels?: any;
  special_requests?: string;
};

const STATUS_COLOR: Record<string, string> = {
  new: "bg-blue-100 text-blue-700 border-blue-200",
  contacted: "bg-amber-100 text-amber-700 border-amber-200",
  confirmed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
};

const TYPE_ICON: Record<string, any> = { tour: Map, hotel: Hotel, transport: Plane };

export default function ProfileTabs({ bookings, userData, translations, locale }: any) {
  const [activeTab, setActiveTab] = useState<"bookings" | "settings">("bookings");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "completed" | "cancelled">("all");
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [localBookings, setLocalBookings] = useState<Booking[]>(bookings);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Compute stats
  const stats = useMemo(() => {
    const total = localBookings.length;
    const confirmed = localBookings.filter((b) => b.status === "confirmed").length;
    const active = localBookings.filter((b) => b.status === "new" || b.status === "contacted").length;
    let spent = 0;
    localBookings.forEach((b: any) => {
      if (b.status === "confirmed") {
        const guests = b.guests || 1;
        if (b.tours?.price_usd) spent += Number(b.tours.price_usd) * guests;
        else if (b.hotels?.price_per_night) spent += Number(b.hotels.price_per_night) * guests;
      }
    });
    return { total, confirmed, active, spent: Math.round(spent) };
  }, [localBookings]);

  const filteredBookings = useMemo(() => {
    const now = Date.now();
    return localBookings.filter((b) => {
      if (statusFilter === "all") return true;
      if (statusFilter === "cancelled") return b.status === "cancelled";
      if (statusFilter === "active") return b.status === "new" || b.status === "contacted";
      if (statusFilter === "completed") {
        return b.status === "confirmed" && new Date(b.preferred_date).getTime() < now;
      }
      return true;
    });
  }, [localBookings, statusFilter]);

  async function cancelBooking(id: number) {
    if (!confirm("Cancel this booking?")) return;
    setCancellingId(id);
    try {
      const res = await fetch("/api/bookings/cancel", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: id }),
      });
      if (res.ok) {
        setLocalBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b))
        );
      } else {
        alert("Failed to cancel booking");
      }
    } finally {
      setCancellingId(null);
    }
  }

  function memberSince() {
    if (!userData?.created_at) return "";
    return new Date(userData.created_at).toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
    });
  }

  return (
    <div>
      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Bookings", value: stats.total, icon: Calendar, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Confirmed", value: stats.confirmed, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Active", value: stats.active, icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Total Spent", value: "$" + stats.spent, icon: CreditCard, color: "text-purple-600", bg: "bg-purple-50" },
        ].map((s, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-xl ${s.bg} ${s.color} flex items-center justify-center mb-3`}>
              <s.icon size={20} />
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
            <p className="text-2xl font-black text-[#0d1117]">{s.value}</p>
          </div>
        ))}
      </div>

      {userData?.created_at && (
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-6">
          <Award size={14} className="text-[#c9a84c]" />
          <span>Member since {memberSince()}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-100 mb-8 overflow-x-auto">
        <button
          onClick={() => setActiveTab("bookings")}
          className={`flex items-center gap-2 px-6 py-4 font-bold transition-all border-b-2 whitespace-nowrap ${
            activeTab === "bookings"
              ? "border-[#1a3d2b] text-[#1a3d2b]"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          <Calendar size={18} />
          {translations.my_bookings}
          <span className="ml-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            {localBookings.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`flex items-center gap-2 px-6 py-4 font-bold transition-all border-b-2 whitespace-nowrap ${
            activeTab === "settings"
              ? "border-[#1a3d2b] text-[#1a3d2b]"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          <Settings size={18} />
          {translations.settings}
        </button>
      </div>

      {activeTab === "bookings" ? (
        <div>
          {/* Filter pills */}
          {localBookings.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="flex items-center gap-2 text-xs text-gray-500 mr-2">
                <Filter size={14} /> Filter:
              </span>
              {(
                [
                  { id: "all", label: "All" },
                  { id: "active", label: "Active" },
                  { id: "completed", label: "Completed" },
                  { id: "cancelled", label: "Cancelled" },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    statusFilter === f.id
                      ? "bg-[#1a3d2b] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}

          {filteredBookings.length === 0 ? (
            <div className="text-center py-16 bg-gradient-to-b from-gray-50 to-white rounded-3xl border-2 border-dashed border-gray-200">
              <div className="w-16 h-16 mx-auto bg-[#1a3d2b]/5 rounded-2xl flex items-center justify-center mb-4">
                <Calendar className="text-[#1a3d2b]/40" size={32} />
              </div>
              <p className="text-gray-500 mb-4 font-medium">
                {localBookings.length === 0 ? translations.no_bookings : "No bookings match this filter"}
              </p>
              {localBookings.length === 0 && (
                <a href={`/${locale}#tours`} className="btn-primary inline-block">
                  {translations.explore_tours}
                </a>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredBookings.map((booking: Booking) => {
                const Icon = TYPE_ICON[booking.item_type] ?? Map;
                const title =
                  booking.tour_name || booking.hotel_name || booking.transport_title || "—";
                const date = booking.preferred_date
                  ? new Date(booking.preferred_date).toLocaleDateString(locale, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "TBD";
                const isExpanded = expandedId === booking.id;
                const isPast = new Date(booking.preferred_date).getTime() < Date.now();
                const canCancel =
                  (booking.status === "new" || booking.status === "contacted") && !isPast;

                return (
                  <div
                    key={booking.id}
                    className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div
                      className="p-5 cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : booking.id)}
                    >
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#f0f7f4] to-[#e8f1ed] flex items-center justify-center text-[#1a3d2b] shrink-0">
                            <Icon size={22} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#c9a84c]">
                                {translations[`type_${booking.item_type}`]}
                              </span>
                              <span className="text-[10px] text-gray-300">•</span>
                              <span className="text-[10px] text-gray-400">#{booking.id}</span>
                            </div>
                            <h3 className="text-base font-bold text-[#0d1117] truncate">{title}</h3>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
                              <span className="flex items-center gap-1.5">
                                <Calendar size={13} /> {date}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Clock size={13} /> {booking.guests} {translations.guests}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                              STATUS_COLOR[booking.status]
                            }`}
                          >
                            {translations[`status_${booking.status}`]}
                          </span>
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="bg-gray-50/50 border-t border-gray-100 p-5 space-y-3 text-sm">
                        {booking.special_requests && (
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                              Special requests
                            </p>
                            <p className="text-gray-700">{booking.special_requests}</p>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                              Booked on
                            </p>
                            <p className="text-gray-700">
                              {new Date(booking.created_at).toLocaleDateString(locale)}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                              Status
                            </p>
                            <p className="text-gray-700 capitalize">{booking.status}</p>
                          </div>
                        </div>
                        {canCancel && (
                          <div className="pt-3 border-t border-gray-200">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                cancelBooking(booking.id);
                              }}
                              disabled={cancellingId === booking.id}
                              className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-all text-sm font-bold disabled:opacity-50"
                            >
                              <Ban size={16} />
                              {cancellingId === booking.id ? "Cancelling..." : "Cancel booking"}
                            </button>
                          </div>
                        )}
                        {booking.status === "confirmed" && (
                          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-center gap-2 text-emerald-800 text-xs">
                            <CheckCircle2 size={16} />
                            <span>Your booking is confirmed. We'll contact you with details.</span>
                          </div>
                        )}
                        {booking.status === "new" && (
                          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center gap-2 text-blue-800 text-xs">
                            <AlertCircle size={16} />
                            <span>We received your request. Expect contact within 24 hours.</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <ProfileSettings initialUser={userData} translations={translations} />
      )}
    </div>
  );
}
