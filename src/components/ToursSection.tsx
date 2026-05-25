"use client";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Clock, Users, Star, Check, X, AlertCircle } from "lucide-react";
import { useSession, signIn } from "next-auth/react";

gsap.registerPlugin(ScrollTrigger);

const TOURS = [
  { id: 1, key: "kelsuu_tashrabat", days: 7, price: 890, group: "2-8", rating: 4.9, reviews: 47, image: "https://images.unsplash.com/photo-1544084944-15269ec7b5a0?w=800&q=80" },
  { id: 2, key: "enilchek", days: 12, price: 2400, group: "2-6", rating: 5.0, reviews: 18, image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80" },
  { id: 3, key: "issyk_kul", days: 5, price: 550, group: "2-12", rating: 4.8, reviews: 92, image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80" },
  { id: 4, key: "nomadic", days: 9, price: 1250, group: "2-8", rating: 4.9, reviews: 33, image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80" },
];

const DIFF_COLOR: Record<string, string> = { Easy: "#40916c", Moderate: "#c9a84c", Hard: "#c0392b", "Орто": "#c9a84c", "Средняя": "#c9a84c", "Жеңил": "#40916c", "Легкая": "#40916c", "Кыйын": "#c0392b", "Тяжелая": "#c0392b" };

const HOTELS = [
  { id: 101, key: "kelsuu", name: "Юрточный лагерь Кель-Суу" },
  { id: 102, key: "khan_tengri", name: "Хан Тенгри Лодж" },
  { id: 103, key: "boutique", name: "Иссык-Куль Бутик" },
  { id: 104, key: "guesthouse", name: "Гостевой дом Таш-Рабат" },
  { id: 105, key: "sky_camp", name: "Скай Кэмп Сон-Куль" },
  { id: 106, key: "luxe", name: "Бишкек Люкс Отель" },
];

const TRANSPORT = [
  { id: 201, key: "jeep", name: "Аренда внедорожников 4×4" },
  { id: 202, key: "flight", name: "Внутренние рейсы" },
];

export default function ToursSection() {
  const t = useTranslations("tours");
  const th = useTranslations("hotels");
  const ttr = useTranslations("transport");
  const ta = useTranslations("auth");
  const { data: session } = useSession();
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", tour: "", date: "", guests: "2", message: "" });

  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        name: session.user?.name || "",
        email: session.user?.email || ""
      }));
    }
  }, [session]);

  useEffect(() => {
    gsap.fromTo(headRef.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.9, scrollTrigger: { trigger: headRef.current, start: "top 85%" } });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session) {
      signIn();
      return;
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
        setTimeout(() => setSubmitted(false), 5000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section ref={sectionRef} id="tours" className="section-padding" style={{ background: "#f8f9fa" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div ref={headRef} style={{ textAlign: "center", marginBottom: "4rem" }}>
          <span className="section-badge">{t("title")}</span>
          <h2 className="section-title">{t("title")}</h2>
          <p className="section-subtitle" style={{ margin: "0.75rem auto 0" }}>{t("subtitle")}</p>
        </div>

        {/* Tour Cards */}
        <div className="responsive-grid mb-24">
          {TOURS.map((tour) => {
            const tourDiff = t(`list.${tour.key}.difficulty`);
            return (
              <article key={tour.id} className="card-hover flex flex-col bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-xl shadow-black/[0.03]">
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
                  <div className="mt-auto flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t("from")}</p>
                      <p className="font-playfair text-3xl font-black text-[#1a3d2b]">${tour.price}</p>
                    </div>
                    <a href="#booking-form" onClick={() => setFormData(p => ({...p, tour: t(`list.${tour.key}.name`)}))} className="btn-primary !px-6 !py-3.5 !text-[10px]">
                      {t("book_now")}
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

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
                    <button type="submit" disabled={loading} className="btn-accent w-full md:w-auto min-w-[280px]">
                      {loading ? <div className="w-5 h-5 border-2 border-[#1a3d2b]/30 border-t-[#1a3d2b] rounded-full animate-spin" /> : (session ? t("form_submit") : ta("login_google"))}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

