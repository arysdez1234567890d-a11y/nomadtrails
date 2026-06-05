"use client";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  Star,
  DollarSign,
  Heart,
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

// Local static data matching homepage to render favorites details
const TOURS_DATA = [
  { id: 1, key: "kelsuu_tashrabat", days: 7, price: 890, group: "2-8", rating: 4.9, image: "https://images.unsplash.com/photo-1544084944-15269ec7b5a0?w=800&q=80", difficulty: "Moderate" },
  { id: 2, key: "enilchek", days: 12, price: 2400, group: "2-6", rating: 5.0, image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80", difficulty: "Hard" },
  { id: 3, key: "issyk_kul", days: 5, price: 550, group: "2-12", rating: 4.8, image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80", difficulty: "Easy" },
  { id: 4, key: "nomadic", days: 9, price: 1250, group: "2-8", rating: 4.9, image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80", difficulty: "Moderate" },
];

const HOTELS_DATA = [
  { id: 1, key: "kelsuu", type: "type_yurt", price: 85, rating: 4.9, image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&q=80" },
  { id: 2, key: "khan_tengri", type: "type_lodge", price: 145, rating: 4.8, image: "https://images.unsplash.com/photo-1518732714860-b62714ce0c59?w=600&q=80" },
  { id: 3, key: "boutique", type: "type_hotel", price: 220, rating: 5.0, image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80" },
  { id: 4, key: "guesthouse", type: "type_guesthouse", price: 55, rating: 4.7, image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80" },
  { id: 5, key: "sky_camp", type: "type_yurt", price: 95, rating: 4.9, image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=600&q=80" },
  { id: 6, key: "luxe", type: "type_hotel", price: 180, rating: 4.8, image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&q=80" },
];

export default function ProfileTabs({
  bookings,
  userReviews = [],
  userData,
  translations,
  locale,
}: any) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"bookings" | "settings" | "reviews" | "favorites">("bookings");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "completed" | "cancelled">("all");
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [localBookings, setLocalBookings] = useState<Booking[]>(bookings);
  const [localReviews, setLocalReviews] = useState<any[]>(userReviews);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  
  // Favorites list state
  const [favoritesList, setFavoritesList] = useState<{ id: number; type: 'tour' | 'hotel' }[]>([]);

  // Sync state if props update from server components
  useMemo(() => {
    setLocalBookings(bookings);
  }, [bookings]);

  useMemo(() => {
    setLocalReviews(userReviews);
  }, [userReviews]);

  // Load favorites from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem("nomadtrails_favorites");
    if (saved) {
      try {
        setFavoritesList(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

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
        router.refresh();
      } else {
        alert("Failed to cancel booking");
      }
    } finally {
      setCancellingId(null);
    }
  }

  async function handleDeleteReview(id: number) {
    if (!confirm(translations.confirm_delete)) return;
    try {
      const res = await fetch(`/api/reviews?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setLocalReviews((prev) => prev.filter((r) => r.id !== id));
        router.refresh();
      } else {
        alert("Failed to delete review");
      }
    } catch (err) {
      console.error("Delete review error:", err);
    }
  }

  // Remove item from favorites list in UI and localStorage
  const handleRemoveFavorite = (itemId: number, itemType: 'tour' | 'hotel') => {
    setFavoritesList(prev => {
      const updated = prev.filter(f => !(f.id === itemId && f.type === itemType));
      localStorage.setItem("nomadtrails_favorites", JSON.stringify(updated));
      window.dispatchEvent(new Event("favorites-updated"));
      return updated;
    });
  };

  // Redirect to booking form on home page with restoration
  const handleBookFavorite = (name: string) => {
    const existingStr = localStorage.getItem("nomadtrails_booking_form");
    let existing = { name: "", email: "", phone: "", tour: "", date: "", guests: "2", message: "" };
    if (existingStr) {
      try { existing = JSON.parse(existingStr); } catch (e) {}
    }
    existing.tour = name;
    localStorage.setItem("nomadtrails_booking_form", JSON.stringify(existing));
    window.location.href = `/${locale}#booking-form`;
  };

  // Map user favorites to full static objects
  const favoriteTours = useMemo(() => {
    const tourIds = favoritesList.filter(f => f.type === 'tour').map(f => f.id);
    return TOURS_DATA.filter(t => tourIds.includes(t.id));
  }, [favoritesList]);

  const favoriteHotels = useMemo(() => {
    const hotelIds = favoritesList.filter(f => f.type === 'hotel').map(f => f.id);
    return HOTELS_DATA.filter(h => hotelIds.includes(h.id));
  }, [favoritesList]);

  const getCountdown = (dateStr: string, status: string) => {
    if (status === "cancelled") return null;
    const diff = new Date(dateStr).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days > 0) {
      return locale === "ru" 
        ? `Начало через ${days} дн.!` 
        : (locale === "ky" ? `Башталышына ${days} күн калды!` : `Starts in ${days} days!`);
    }
    return null;
  };

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
      <div className="flex border-b border-gray-100 mb-8 overflow-x-auto hide-scrollbar">
        <button
          onClick={() => setActiveTab("bookings")}
          className={`flex items-center gap-2 px-6 py-4 font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
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
          onClick={() => setActiveTab("favorites")}
          className={`flex items-center gap-2 px-6 py-4 font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === "favorites"
              ? "border-[#1a3d2b] text-[#1a3d2b]"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          <Heart size={18} />
          {translations.my_favorites}
          <span className="ml-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            {favoritesList.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("reviews")}
          className={`flex items-center gap-2 px-6 py-4 font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === "reviews"
              ? "border-[#1a3d2b] text-[#1a3d2b]"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          <Star size={18} />
          {translations.my_reviews}
          <span className="ml-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            {localReviews.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`flex items-center gap-2 px-6 py-4 font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === "settings"
              ? "border-[#1a3d2b] text-[#1a3d2b]"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          <Settings size={18} />
          {translations.settings}
        </button>
      </div>

      {activeTab === "bookings" && (
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
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
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
            <div className="text-center py-16 bg-gradient-to-b from-gray-50 to-white rounded-3xl border-2 border-dashed border-gray-200 animate-fade-in">
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
                const countdown = booking.preferred_date ? getCountdown(booking.preferred_date, booking.status) : null;

                return (
                  <div
                    key={booking.id}
                    className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
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
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#c9a84c]">
                                {translations[`type_${booking.item_type}`]}
                              </span>
                              <span className="text-[10px] text-gray-300">•</span>
                              <span className="text-[10px] text-gray-400">#{booking.id}</span>
                              {countdown && (
                                <>
                                  <span className="text-[10px] text-gray-300">•</span>
                                  <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                                    {countdown}
                                  </span>
                                </>
                              )}
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
                      <div className="bg-gray-50/50 border-t border-gray-100 p-5 space-y-4 text-sm animate-fade-in">
                        {/* Price breakdown block */}
                        {(booking.tours?.price_usd || booking.hotels?.price_per_night) && (
                          <div className="bg-white border border-gray-100 p-4 rounded-xl flex items-center gap-3 shadow-sm max-w-sm">
                            <div className="w-9 h-9 rounded-lg bg-yellow-50 text-[#c9a84c] flex items-center justify-center">
                              <DollarSign size={18} />
                            </div>
                            <div>
                              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">
                                {translations.guests} x Price
                              </p>
                              <p className="text-sm font-bold text-[#0d1117]">
                                {booking.guests} чел. × ${booking.tours?.price_usd || booking.hotels?.price_per_night} ={" "}
                                <span className="text-[#1a3d2b] font-black">
                                  ${(booking.guests || 1) * Number(booking.tours?.price_usd || booking.hotels?.price_per_night)}
                                </span>
                              </p>
                            </div>
                          </div>
                        )}

                        {booking.special_requests && (
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                              Special requests
                            </p>
                            <p className="text-gray-700 bg-white border border-gray-100 p-3 rounded-xl leading-relaxed">{booking.special_requests}</p>
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
                          <div className="pt-3 border-t border-gray-100">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                cancelBooking(booking.id);
                              }}
                              disabled={cancellingId === booking.id}
                              className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-all text-sm font-bold disabled:opacity-50 cursor-pointer"
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
      )}

      {activeTab === "favorites" && (
        <div className="space-y-8 animate-fade-in">
          {favoritesList.length === 0 ? (
            <div className="text-center py-16 bg-gradient-to-b from-gray-50 to-white rounded-3xl border-2 border-dashed border-gray-200">
              <div className="w-16 h-16 mx-auto bg-red-50 text-red-400 rounded-2xl flex items-center justify-center mb-4">
                <Heart size={32} className="fill-red-400 text-red-400" />
              </div>
              <p className="text-gray-500 font-medium">{translations.no_favorites}</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Tours Wishlist Section */}
              {favoriteTours.length > 0 && (
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4 ml-1">
                    {locale === "ru" ? "Избранные Туры" : "Favorite Tours"}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {favoriteTours.map(tour => (
                      <div key={tour.id} className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm flex flex-col sm:flex-row hover:shadow-md transition">
                        <div className="relative w-full sm:w-40 h-40 shrink-0">
                          <img src={tour.image} alt={tour.key} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-6 flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="font-playfair font-bold text-lg text-[#0d1117]">
                              {locale === "ru" ? (tour.id === 1 ? "Исследователь Кель-Суу и Таш-Рабат" : tour.id === 2 ? "Экспедиция на ледник Энильчек" : tour.id === 3 ? "Кольцо Иссык-Куля" : "Кочевая жизнь и охота с орлами") : tour.key.replace("_", " ")}
                            </h4>
                            <p className="text-[#c9a84c] text-xs font-bold mt-1">
                              {tour.days} {translations.guests.split(" ")[0]} • ${tour.price}
                            </p>
                          </div>
                          <div className="flex gap-2 mt-4 pt-2 border-t border-gray-50 justify-end">
                            <button
                              onClick={() => handleRemoveFavorite(tour.id, 'tour')}
                              className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 text-xs font-bold hover:bg-gray-50 cursor-pointer"
                            >
                              {translations.remove_favorite}
                            </button>
                            <button
                              onClick={() => handleBookFavorite(locale === "ru" ? (tour.id === 1 ? "Исследователь Кель-Суу и Таш-Рабат" : tour.id === 2 ? "Экспедиция на ледник Энильчек" : tour.id === 3 ? "Кольцо Иссык-Куля" : "Кочевая жизнь и охота с орлами") : tour.key.replace("_", " "))}
                              className="px-3 py-1.5 rounded-lg bg-[#1a3d2b] text-white text-xs font-bold hover:bg-[#2d5a42] cursor-pointer"
                            >
                              {translations.book}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hotels Wishlist Section */}
              {favoriteHotels.length > 0 && (
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4 ml-1">
                    {locale === "ru" ? "Избранные Отели" : "Favorite Hotels"}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {favoriteHotels.map(hotel => {
                      const hotelName = locale === "ru"
                        ? (hotel.id === 1 ? "Юрточный лагерь Кель-Суу"
                          : hotel.id === 2 ? "Хан Тенгри Лодж"
                          : hotel.id === 3 ? "Иссык-Куль Бутик"
                          : hotel.id === 4 ? "Гостевой дом Таш-Рабат"
                          : hotel.id === 5 ? "Скай Кэмп Сон-Куль"
                          : "Бишкек Люкс Отель")
                        : hotel.key;
                      return (
                        <div key={hotel.id} className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm flex flex-col sm:flex-row hover:shadow-md transition">
                          <div className="relative w-full sm:w-40 h-40 shrink-0">
                            <img src={hotel.image} alt={hotel.key} className="w-full h-full object-cover" />
                          </div>
                          <div className="p-6 flex-1 flex flex-col justify-between">
                            <div>
                              <h4 className="font-playfair font-bold text-lg text-[#0d1117]">{hotelName}</h4>
                              <p className="text-[#c9a84c] text-xs font-bold mt-1">
                                ${hotel.price} / night
                              </p>
                            </div>
                            <div className="flex gap-2 mt-4 pt-2 border-t border-gray-50 justify-end">
                              <button
                                onClick={() => handleRemoveFavorite(hotel.id, 'hotel')}
                                className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 text-xs font-bold hover:bg-gray-50 cursor-pointer"
                              >
                                {translations.remove_favorite}
                              </button>
                              <button
                                onClick={() => handleBookFavorite(hotelName)}
                                className="px-3 py-1.5 rounded-lg bg-[#1a3d2b] text-white text-xs font-bold hover:bg-[#2d5a42] cursor-pointer"
                              >
                                {translations.book}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "reviews" && (
        <div className="space-y-4">
          {localReviews.length === 0 ? (
            <div className="text-center py-16 bg-gradient-to-b from-gray-50 to-white rounded-3xl border-2 border-dashed border-gray-200">
              <div className="w-16 h-16 mx-auto bg-[#1a3d2b]/5 rounded-2xl flex items-center justify-center mb-4">
                <Award className="text-[#1a3d2b]/40" size={32} />
              </div>
              <p className="text-gray-500 mb-4 font-medium">
                {translations.no_reviews}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {localReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={14}
                          className={s <= rev.rating ? "text-[#c9a84c] fill-[#c9a84c]" : "text-gray-200"}
                        />
                      ))}
                    </div>
                    <p className="text-gray-600 text-sm italic font-medium mb-4">“{rev.comment}”</p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <span className="text-[10px] text-gray-400">
                      {new Date(rev.created_at).toLocaleDateString(locale)}
                    </span>
                    <button
                      onClick={() => handleDeleteReview(rev.id)}
                      className="text-red-500 hover:text-red-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Ban size={12} /> {translations.delete_review}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "settings" && (
        <ProfileSettings initialUser={userData} translations={translations} />
      )}
    </div>
  );
}
