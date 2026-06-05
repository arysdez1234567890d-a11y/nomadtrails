"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Clock, Users, Star, Check, X, AlertCircle, Calendar, Search, ChevronDown, Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import SignInModal from "./SignInModal";

gsap.registerPlugin(ScrollTrigger);

const TOURS = [
  { id: 1, key: "kelsuu_tashrabat", days: 7, price: 890, group: "2-8", rating: 4.9, reviews: 47, image: "https://images.unsplash.com/photo-1544084944-15269ec7b5a0?w=800&q=80", difficulty: "Moderate" },
  { id: 2, key: "enilchek", days: 12, price: 2400, group: "2-6", rating: 5.0, reviews: 18, image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80", difficulty: "Hard" },
  { id: 3, key: "issyk_kul", days: 5, price: 550, group: "2-12", rating: 4.8, reviews: 92, image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80", difficulty: "Easy" },
  { id: 4, key: "nomadic", days: 9, price: 1250, group: "2-8", rating: 4.9, reviews: 33, image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80", difficulty: "Moderate" },
];

const DIFF_COLOR: Record<string, string> = { 
  Easy: "#40916c", Moderate: "#c9a84c", Hard: "#c0392b", 
  "Орто": "#c9a84c", "Средняя": "#c9a84c", 
  "Жеңил": "#40916c", "Легкая": "#40916c", 
  "Кыйын": "#c0392b", "Тяжелая": "#c0392b" 
};

const HOTELS = [
  { id: 1, key: "kelsuu", name: "Юрточный лагерь Кель-Суу" },
  { id: 2, key: "khan_tengri", name: "Хан Тенгри Лодж" },
  { id: 3, key: "boutique", name: "Иссык-Куль Бутик" },
  { id: 4, key: "guesthouse", name: "Гостевой дом Таш-Рабат" },
  { id: 5, key: "sky_camp", name: "Скай Кэмп Сон-Куль" },
  { id: 6, key: "luxe", name: "Бишкек Люкс Отель" },
];

const TRANSPORT = [
  { id: 1, key: "jeep", name: "Аренда внедорожников 4×4" },
  { id: 2, key: "flight", name: "Внутренние рейсы" },
];

export default function ToursSection() {
  const t = useTranslations("tours");
  const th = useTranslations("hotels");
  const ttr = useTranslations("transport");
  const ta = useTranslations("auth");
  const { data: session } = useSession();
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", tour: "", date: "", guests: "2", message: "" });
  
  // New States
  const [selectedTourDetails, setSelectedTourDetails] = useState<any>(null);
  const [signInOpen, setSignInOpen] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [hasGoogle, setHasGoogle] = useState(true);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  
  // Favorites/Wishlist state
  const [favorites, setFavorites] = useState<{ id: number; type: 'tour' | 'hotel' }[]>([]);

  useEffect(() => {
    // Check if Google provider is available
    fetch("/api/auth/providers")
      .then((r) => r.json())
      .then((p) => setHasGoogle(!!p?.google))
      .catch(() => setHasGoogle(false));
  }, []);

  // Restore form from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("nomadtrails_booking_form");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(prev => ({
          ...prev,
          name: session?.user?.name || parsed.name || "",
          email: session?.user?.email || parsed.email || "",
          phone: parsed.phone || "",
          tour: parsed.tour || "",
          date: parsed.date || "",
          guests: parsed.guests || "2",
          message: parsed.message || ""
        }));
      } catch (e) {
        console.error("Failed to parse saved booking form:", e);
      }
    } else if (session?.user) {
      setFormData(prev => ({
        ...prev,
        name: session.user?.name || "",
        email: session.user?.email || ""
      }));
    }
  }, [session]);

  // Save form to localStorage on change
  useEffect(() => {
    localStorage.setItem("nomadtrails_booking_form", JSON.stringify(formData));
  }, [formData]);

  // Load wishlist on mount
  useEffect(() => {
    const saved = localStorage.getItem("nomadtrails_favorites");
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Synchronize favorites if changed in other components
  useEffect(() => {
    const handleFavoritesSync = () => {
      const saved = localStorage.getItem("nomadtrails_favorites");
      if (saved) {
        try {
          setFavorites(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
    };
    window.addEventListener("favorites-updated", handleFavoritesSync);
    return () => window.removeEventListener("favorites-updated", handleFavoritesSync);
  }, []);

  const toggleFavorite = (itemId: number, itemType: 'tour' | 'hotel') => {
    setFavorites(prev => {
      const exists = prev.some(f => f.id === itemId && f.type === itemType);
      let updated;
      if (exists) {
        updated = prev.filter(f => !(f.id === itemId && f.type === itemType));
      } else {
        updated = [...prev, { id: itemId, type: itemType }];
      }
      localStorage.setItem("nomadtrails_favorites", JSON.stringify(updated));
      window.dispatchEvent(new Event("favorites-updated"));
      return updated;
    });
  };

  const isFavorite = (itemId: number, itemType: 'tour' | 'hotel') => {
    return favorites.some(f => f.id === itemId && f.type === itemType);
  };

  // GSAP animation
  useEffect(() => {
    gsap.fromTo(headRef.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.9, scrollTrigger: { trigger: headRef.current, start: "top 85%" } });
  }, []);

  // Listen for custom event to set the selected item from other sections
  useEffect(() => {
    const handleSelect = (e: Event) => {
      const itemName = (e as CustomEvent).detail;
      setFormData(prev => ({ ...prev, tour: itemName }));
      
      const formElement = document.getElementById("booking-form");
      if (formElement) {
        formElement.scrollIntoView({ behavior: "smooth" });
      }
    };
    
    window.addEventListener("select-booking-item", handleSelect);
    return () => window.removeEventListener("select-booking-item", handleSelect);
  }, []);

  // Dynamically filter and sort tours
  const filteredTours = useMemo(() => {
    let list = [...TOURS];
    
    // Search text query filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(tour => 
        t(`list.${tour.key}.name`).toLowerCase().includes(q) ||
        t(`list.${tour.key}.overview`).toLowerCase().includes(q)
      );
    }
    
    // Difficulty level filter
    if (difficultyFilter !== "all") {
      list = list.filter(tour => tour.difficulty.toLowerCase() === difficultyFilter.toLowerCase());
    }
    
    // Sorting order logic
    if (sortBy === "price-asc") {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      list.sort((a, b) => b.rating - a.rating);
    }
    
    return list;
  }, [searchQuery, difficultyFilter, sortBy, locale]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setValidationError(null);

    if (!session) {
      setSignInOpen(true);
      return;
    }

    if (!formData.tour) {
      setValidationError(t("form_select_item"));
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setValidationError(t("form_email_invalid"));
      return;
    }

    // Validate phone number
    const phoneRegex = /^[0-9+\s()\-]{6,}$/;
    if (!phoneRegex.test(formData.phone)) {
      setValidationError(t("form_phone_invalid"));
      return;
    }

    // Validate date is in the future
    if (formData.date) {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        setValidationError(t("form_date_past"));
        return;
      }
    }
    
    setLoading(true);
    
    let itemType = 'tour';
    let itemId = null;
    
    const selectedTour = TOURS.find(tr => t(`list.${tr.key}.name`) === formData.tour);
    const selectedHotel = HOTELS.find(h => th(`list.${h.key}.name`) === formData.tour);
    const selectedTransport = TRANSPORT.find(tr => ttr(`${tr.key}_title`) === formData.tour);

    if (selectedTour) {
      itemType = 'tour';
      itemId = selectedTour.id;
    } else if (selectedHotel) {
      itemType = 'hotel';
      itemId = selectedHotel.id;
    } else if (selectedTransport) {
      itemType = 'transport';
      itemId = selectedTransport.id;
    }
    
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_type: itemType,
          tour_id: itemType === 'tour' ? itemId : null,
          hotel_id: itemType === 'hotel' ? itemId : null,
          transport_id: itemType === 'transport' ? itemId : null,
          full_name: formData.name,
          email: formData.email,
          phone: formData.phone,
          preferred_date: formData.date,
          guests: formData.guests,
          special_requests: formData.message
        }),
      });
      
      if (res.ok) {
        setSubmitted(true);
        localStorage.removeItem("nomadtrails_booking_form");
        setFormData(p => ({
          ...p,
          tour: "",
          date: "",
          message: "",
          guests: "2"
        }));
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        const errData = await res.json();
        setValidationError(errData.error || t("form_error"));
      }
    } catch (err) {
      console.error(err);
      setValidationError(t("form_error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section ref={sectionRef} id="tours" className="section-padding" style={{ background: "#f8f9fa" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div ref={headRef} style={{ textAlign: "center", marginBottom: "3rem" }}>
          <span className="section-badge">{t("title")}</span>
          <h2 className="section-title">{t("title")}</h2>
          <p className="section-subtitle" style={{ margin: "0.75rem auto 0" }}>{t("subtitle")}</p>
        </div>

        {/* Search & Filter Controls */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-gray-100 mb-12 flex flex-col md:flex-row gap-4 justify-between items-center max-w-5xl mx-auto">
          {/* Search Bar */}
          <div className="relative w-full md:max-w-md">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={locale === "ru" ? "Поиск туров..." : "Search tours..."}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-[#1a3d2b] focus:ring-4 focus:ring-[#1a3d2b]/5 outline-none transition-all placeholder:text-gray-400 text-sm"
            />
          </div>

          {/* Difficulty pills */}
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
            {[
              { value: "all", label: locale === "ru" ? "Все сложности" : "All difficulties" },
              { value: "easy", label: locale === "ru" ? "Легкая" : "Easy" },
              { value: "moderate", label: locale === "ru" ? "Средняя" : "Moderate" },
              { value: "hard", label: locale === "ru" ? "Тяжелая" : "Hard" },
            ].map(pill => (
              <button
                key={pill.value}
                onClick={() => setDifficultyFilter(pill.value)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  difficultyFilter === pill.value
                    ? "bg-[#1a3d2b] text-white shadow-md shadow-[#1a3d2b]/10"
                    : "bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* Sort dropdown */}
          <div className="relative w-full md:w-auto min-w-[180px]">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="w-full px-4 pr-10 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none text-sm font-bold text-gray-600 cursor-pointer focus:border-[#1a3d2b] appearance-none"
            >
              <option value="default">{locale === "ru" ? "По умолчанию" : "Sort by"}</option>
              <option value="price-asc">{locale === "ru" ? "Сначала дешевые" : "Price: Low to High"}</option>
              <option value="price-desc">{locale === "ru" ? "Сначала дорогие" : "Price: High to Low"}</option>
              <option value="rating">{locale === "ru" ? "По рейтингу" : "Top Rated"}</option>
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Tour Cards */}
        {filteredTours.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm mb-24 max-w-lg mx-auto">
            <AlertCircle size={40} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">{locale === "ru" ? "Туры не найдены по вашему запросу" : "No tours match your criteria"}</p>
          </div>
        ) : (
          <div className="responsive-grid mb-24">
            {filteredTours.map((tour) => {
              const tourDiff = t(`list.${tour.key}.difficulty`);
              const fav = isFavorite(tour.id, 'tour');
              return (
                <article key={tour.id} className="card-hover flex flex-col bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-xl shadow-black/[0.03] relative">
                  {/* Heart button for wishlist */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleFavorite(tour.id, 'tour');
                    }}
                    className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md flex items-center justify-center text-white transition cursor-pointer z-10"
                    title={locale === "ru" ? "Добавить в избранное" : "Add to wishlist"}
                  >
                    <Heart size={18} className={fav ? "fill-red-500 text-red-500 stroke-red-500" : "text-white"} />
                  </button>

                  <div className="relative h-64 overflow-hidden">
                    <img src={tour.image} alt={t(`list.${tour.key}.name`)} className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" />
                    <div className={`absolute top-6 left-6 text-white rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-widest`} style={{ background: DIFF_COLOR[tourDiff] || "#1a3d2b" }}>
                      {tourDiff}
                    </div>
                    <div className="absolute bottom-6 right-6 glass-card !bg-black/40 !backdrop-blur-md rounded-2xl px-3 py-1.5 flex items-center gap-2 border-white/10">
                      <Star size={14} className="text-[#c9a84c] fill-[#c9a84c]" />
                      <span className="text-white text-xs font-bold">{tour.rating}</span>
                    </div>
                  </div>
                  <div className="p-8 flex-1 flex flex-col">
                    <h3 className="font-playfair text-2xl font-bold text-[#0d1117] mb-4">{t(`list.${tour.key}.name`)}</h3>
                    <div className="flex gap-6 mb-6">
                      <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                        <Clock size={14} className="text-[#c9a84c]" /> {tour.days} {t("days")}
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                        <Users size={14} className="text-[#c9a84c]" /> {tour.group}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-8">
                      {(t.raw(`list.${tour.key}.includes`) as string[]).map((inc) => (
                        <span key={inc} className="bg-gray-50 text-gray-600 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wide border border-gray-100">
                          {inc}
                        </span>
                      ))}
                    </div>
                    <div className="mt-auto flex items-center justify-between gap-2">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t("from")}</p>
                        <p className="font-playfair text-2xl font-black text-[#1a3d2b]">${tour.price}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setSelectedTourDetails(tour)} className="btn-secondary !px-4 !py-3 !text-[10px]">
                          {t("details")}
                        </button>
                        <a href="#booking-form" onClick={() => setFormData(p => ({...p, tour: t(`list.${tour.key}.name`)}))} className="btn-primary !px-4 !py-3 !text-[10px]">
                          {t("book_now")}
                        </a>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Booking Form */}
        <div id="booking-form" className="max-w-4xl mx-auto">
          <div className="bg-white rounded-[40px] p-8 md:p-16 shadow-2xl border border-gray-50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#c9a84c]/5 rounded-full -mr-32 -mt-32 blur-3xl" />
            
            <div className="relative z-10">
              <div className="text-center mb-12">
                <span className="section-badge">{t("form_title")}</span>
                <h3 className="section-title !text-3xl md:!text-4xl">{t("form_title")}</h3>
              </div>

              {!session && (
                <div className="bg-amber-50 border border-amber-100 rounded-3xl p-6 mb-10 flex items-center gap-4 text-amber-800">
                  <AlertCircle size={28} className="shrink-0" />
                  <p className="text-sm font-bold leading-relaxed">{ta("sign_in_required")}</p>
                </div>
              )}

              {submitted ? (
                <div className="text-center py-20">
                  <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check size={40} />
                  </div>
                  <p className="text-xl font-bold text-[#1a3d2b]">{t("form_success")}</p>
                </div>
              ) : (
                <form ref={formRef} onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {validationError && (
                    <div className="md:col-span-2 bg-red-50 border border-red-100 rounded-3xl p-5 flex items-center gap-3 text-red-800">
                      <AlertCircle size={20} className="shrink-0" />
                      <p className="text-xs font-bold leading-relaxed">{validationError}</p>
                    </div>
                  )}

                  {[
                    { key: "name", label: t("form_name"), type: "text" },
                    { key: "email", label: t("form_email"), type: "email" },
                    { key: "phone", label: t("form_phone"), type: "tel" },
                    { key: "date", label: t("form_date"), type: "date" },
                  ].map(({ key, label, type }) => (
                    <div key={key}>
                      <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400 mb-3 ml-1">{label}</label>
                      <input type={type} className="input-field" required value={formData[key as keyof typeof formData]} onChange={e => setFormData(p => ({ ...p, [key]: e.target.value }))} />
                    </div>
                  ))}
                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400 mb-3 ml-1">{t("form_tour")}</label>
                      <select name="item-select" className="input-field cursor-pointer" value={formData.tour} onChange={e => setFormData(p => ({ ...p, tour: e.target.value }))} required>
                        <option value="">—</option>
                        <optgroup label={t("title")}>
                          {TOURS.map(t2 => <option key={t2.id} value={t(`list.${t2.key}.name`)}>{t(`list.${t2.key}.name`)}</option>)}
                        </optgroup>
                        <optgroup label={th("title")}>
                          {HOTELS.map(h => <option key={h.id} value={th(`list.${h.key}.name`)}>{th(`list.${h.key}.name`)}</option>)}
                        </optgroup>
                        <optgroup label={ttr("title")}>
                          {TRANSPORT.map(tr => <option key={tr.id} value={ttr(`${tr.key}_title`)}>{ttr(`${tr.key}_title`)}</option>)}
                        </optgroup>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400 mb-3 ml-1">{t("form_guests")}</label>
                      <input type="number" min={1} max={20} className="input-field" value={formData.guests} onChange={e => setFormData(p => ({ ...p, guests: e.target.value }))} />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400 mb-3 ml-1">{t("form_message")}</label>
                    <textarea className="input-field min-h-[120px]" value={formData.message} onChange={e => setFormData(p => ({ ...p, message: e.target.value }))} />
                  </div>
                  <div className="md:col-span-2 text-center mt-6">
                    <button type="submit" disabled={loading} className="btn-accent w-full md:w-auto min-w-[280px] cursor-pointer">
                      {loading ? <div className="w-5 h-5 border-2 border-[#1a3d2b]/30 border-t-[#1a3d2b] rounded-full animate-spin" /> : (session ? t("form_submit") : ta("login_google"))}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Tour details modal */}
      <TourDetailsModal
        tour={selectedTourDetails}
        open={selectedTourDetails !== null}
        onClose={() => setSelectedTourDetails(null)}
        locale={locale}
        translations={t}
        onBook={() => {
          if (selectedTourDetails) {
            setFormData(p => ({ ...p, tour: t(`list.${selectedTourDetails.key}.name`) }));
            setTimeout(() => {
              const formElement = document.getElementById("booking-form");
              if (formElement) {
                formElement.scrollIntoView({ behavior: "smooth" });
              }
            }, 100);
          }
        }}
      />

      {/* SignInModal Trigger */}
      <SignInModal
        open={signInOpen}
        onClose={() => setSignInOpen(false)}
        hasGoogle={hasGoogle}
      />
    </section>
  );
}

// Subcomponent: TourDetailsModal
function TourDetailsModal({
  tour,
  open,
  onClose,
  locale,
  onBook,
  translations,
}: {
  tour: any;
  open: boolean;
  onClose: () => void;
  locale: string;
  onBook: () => void;
  translations: any;
}) {
  const t = translations;
  if (!tour) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
          />
          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] w-[min(720px,calc(100vw-2rem))] max-h-[calc(100vh-4rem)] bg-white rounded-[40px] shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header image area */}
            <div className="relative h-64 md:h-80 w-full shrink-0 overflow-hidden">
              <img src={tour.image} alt={t(`list.${tour.key}.name`)} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              
              {/* Badges */}
              <div className="absolute top-6 left-6 flex gap-2">
                <span className="text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full" style={{ background: DIFF_COLOR[t(`list.${tour.key}.difficulty`)] || "#1a3d2b" }}>
                  {t(`list.${tour.key}.difficulty`)}
                </span>
                <span className="bg-[#c9a84c] text-[#1a3d2b] text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full flex items-center gap-1.5">
                  <Star size={12} className="fill-[#1a3d2b] text-[#1a3d2b]" /> {tour.rating}
                </span>
              </div>

              {/* Close button */}
              <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md flex items-center justify-center text-white transition cursor-pointer">
                <X size={20} />
              </button>

              {/* Title */}
              <div className="absolute bottom-8 left-8 right-8">
                <p className="text-[10px] font-bold text-[#c9a84c] uppercase tracking-[0.2em] mb-2">
                  {tour.days} {t("days")} • {t("group_size")}: {tour.group}
                </p>
                <h3 className="font-playfair text-2xl md:text-3xl font-black text-white">{t(`list.${tour.key}.name`)}</h3>
              </div>
            </div>

            <div className="p-8 md:p-10 !pb-2 space-y-8 overflow-y-auto flex-1 hide-scrollbar">
              
              {/* Quick info badges row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-gray-50 p-5 rounded-3xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-[#c9a84c] shrink-0 shadow-sm">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{t("days")}</p>
                    <p className="text-xs font-black text-[#0d1117] mt-0.5">{tour.days} {t("days")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-[#c9a84c] shrink-0 shadow-sm">
                    <Users size={18} />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{t("group_size")}</p>
                    <p className="text-xs font-black text-[#0d1117] mt-0.5">{tour.group}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 col-span-2 sm:col-span-1">
                  <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-[#c9a84c] shrink-0 shadow-sm">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{t("best_season")}</p>
                    <p className="text-xs font-black text-[#0d1117] mt-0.5">{t(`list.${tour.key}.season`)}</p>
                  </div>
                </div>
              </div>

              {/* Overview */}
              <div>
                <h4 className="font-playfair text-lg font-bold text-[#1a3d2b] mb-3">{t("overview")}</h4>
                <p className="text-gray-600 text-sm leading-relaxed font-medium">{t(`list.${tour.key}.overview`)}</p>
              </div>

              {/* Highlights */}
              <div>
                <h4 className="font-playfair text-lg font-bold text-[#1a3d2b] mb-3">{t("highlights")}</h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(t.raw(`list.${tour.key}.highlights`) as string[]).map((hl, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-gray-600 text-sm font-medium">
                      <span className="w-5 h-5 rounded-full bg-[#c9a84c]/10 text-[#c9a84c] flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={12} className="stroke-[3]" />
                      </span>
                      <span>{hl}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Day-by-Day Itinerary */}
              <div>
                <h4 className="font-playfair text-lg font-bold text-[#1a3d2b] mb-4">{t("itinerary")}</h4>
                <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                  {(t.raw(`list.${tour.key}.itinerary`) as any[]).map((day, idx) => (
                    <div key={idx} className="relative pl-10 flex gap-4">
                      {/* Circle dot on line */}
                      <span className="absolute left-0 w-8 h-8 rounded-full bg-[#1a3d2b] text-white border-4 border-white shadow-md flex items-center justify-center text-[10px] font-black">
                        {idx + 1}
                      </span>
                      <div>
                        <h5 className="font-bold text-sm text-[#0d1117] mb-1">{day.title}</h5>
                        <p className="text-gray-500 text-xs leading-relaxed font-medium">{day.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Includes & Excludes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                <div>
                  <h4 className="font-playfair text-base font-bold text-[#1a3d2b] mb-3">{t("includes")}</h4>
                  <ul className="space-y-2.5">
                    {(t.raw(`list.${tour.key}.includes`) as string[]).map((inc, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-gray-600 text-xs font-bold uppercase tracking-wider">
                        <Check size={14} className="text-emerald-500 stroke-[3]" />
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-playfair text-base font-bold text-[#1a3d2b] mb-3">{t("not_included")}</h4>
                  <ul className="space-y-2.5">
                    {(t.raw(`list.${tour.key}.not_included`) as string[]).map((exc, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-gray-600 text-xs font-bold uppercase tracking-wider">
                        <X size={14} className="text-red-500 stroke-[3]" />
                        <span>{exc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>

            {/* CTA Booking Row */}
            <div className="flex items-center justify-between gap-6 p-8 md:p-10 border-t border-gray-100 bg-white shrink-0 rounded-b-[40px] z-10">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t("per_person")}</p>
                <p className="font-playfair text-3xl font-black text-[#1a3d2b]">${tour.price}</p>
              </div>
              <button
                onClick={() => {
                  onBook();
                  onClose();
                }}
                className="btn-primary !py-4 !px-8 flex-1 sm:flex-initial"
              >
                {t("book_now")}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
