"use client";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Star, MapPin, Heart, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

gsap.registerPlugin(ScrollTrigger);

const HOTELS = [
  { id: 1, key: "kelsuu", type: "type_yurt", price: 85, rating: 4.9, reviews: 64, image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&q=80", amenities: ["wifi", "meals", "transfer"] },
  { id: 2, key: "khan_tengri", type: "type_lodge", price: 145, rating: 4.8, reviews: 41, image: "https://images.unsplash.com/photo-1518732714860-b62714ce0c59?w=600&q=80", amenities: ["wifi", "spa", "transfer"] },
  { id: 3, key: "boutique", type: "type_hotel", price: 220, rating: 5.0, reviews: 28, image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80", amenities: ["wifi", "pool", "meals", "transfer"] },
  { id: 4, key: "guesthouse", type: "type_guesthouse", price: 55, rating: 4.7, reviews: 83, image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80", amenities: ["meals", "transfer"] },
  { id: 5, key: "sky_camp", type: "type_yurt", price: 95, rating: 4.9, reviews: 52, image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=600&q=80", amenities: ["meals", "horse_riding", "transfer"] },
  { id: 6, key: "luxe", type: "type_hotel", price: 180, rating: 4.8, reviews: 107, image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&q=80", amenities: ["wifi", "pool", "spa", "meals"] },
];

const TYPE_COLOR: Record<string, string> = { type_yurt: "#40916c", type_lodge: "#1a3d2b", type_hotel: "#c9a84c", type_guesthouse: "#6c757d" };

const HOTEL_DESCS: Record<string, Record<string, { desc: string; details: string[]; features: string[] }>> = {
  kelsuu: {
    en: {
      desc: "Experience authentic Kyrgyz hospitality in handmade felt yurts located at 3,500m altitude. A perfect base camp for horseback expeditions to Kel-Suu Lake, offering traditional wood-stove heating and star-gazing opportunities.",
      details: ["Capacity: up to 4 persons per yurt", "Authentic wood-fire stove heating", "Fresh spring water and homemade local food"],
      features: ["Traditional yurt construction", "Scenic mountain river view", "Eco-friendly solar electricity"]
    },
    ru: {
      desc: "Окунитесь в атмосферу традиционного кыргызского гостеприимства в войлочных юртах ручной работы на высоте 3500 метров. Идеальная база для конных экспедиций к озеру Кель-Суу с традиционным печным отоплением.",
      details: ["Вместимость: до 4 человек в юрте", "Отопление традиционной дровяной печью", "Чистая родниковая вода и домашняя местная кухня"],
      features: ["Традиционная конструкция юрт", "Вид на горную реку", "Экологичное солнечное электричество"]
    },
    ky: {
      desc: "Кытай чек арасына жакын тоолордо катылган Көл-Суу көлүнө ат менен экспедициялар үчүн эң сонун базалык лагерь. Войлоктон жасалган улуттук боз үйлөр.",
      details: ["Сыйымдуулугу: боз үйдө 4 кишиге чейин", "Жылытуу: отун менен жылытылуучу меш", "Таза булак суусу жана улуттук тамак-аштар"],
      features: ["Улуттук боз үй курулушу", "Тоо суусунун жээгинде жайгашкан", "Күн батареяларынан алынган электр энергиясы"]
    }
  },
  khan_tengri: {
    en: {
      desc: "A warm and cozy alpine lodge located in the adventure hub of Karakol. Ideal for trekkers and skiers, featuring modern amenities, comfortable wooden rooms, an outdoor hot tub, and guided backcountry tours.",
      details: ["Modern private rooms with heating", "Traditional sauna (banya) and hot tub", "Drying room for ski/trekking gear"],
      features: ["Cozy fireplace lounge", "Local craft beer on tap", "Backcountry guides on site"]
    },
    ru: {
      desc: "Теплый и уютный альпийский лодж, расположенный в туристическом центре Каракола. Идеально подходит для треккеров и лыжников, предлагая современные удобства, баню и купель под открытым небом.",
      details: ["Современные номера с отоплением", "Традиционная русская баня и купель", "Сушилка для лыжного снаряжения"],
      features: ["Каминный зал", "Местное крафтовое пиво на кране", "Проводники на месте"]
    },
    ky: {
      desc: "Каракол шаарынын тоолуу аймагында жайгашкан кооз альп лоджу. Треккинг жана лыжа тебүү сүйүүчүлөрү үчүн ылайыктуу, заманбап ыңгайлуулуктар жана сырттагы ысык купель бар.",
      details: ["Заманбап жылытылуучу бөлмөлөр", "Традициялык мончо жана купель", "Лыжа жана треккинг шаймандарын кургатуучу бөлмө"],
      features: ["Камин бөлмөсү", "Жергиликтүү крафт сырасы", "Тоолуу гиддердин кызматы"]
    }
  },
  boutique: {
    en: {
      desc: "A premium lakeside retreat on the shores of Lake Issyk-Kul. Featuring private sandy beach access, panoramic lake views, indoor heated swimming pools, and fine-dining experiences highlighting organic Silk Road ingredients.",
      details: ["Panoramic lake view suites", "Private sandy beach access", "Full-service wellness spa & indoor pool"],
      features: ["Sunset deck bar", "Heated outdoor lounge", "Organic gourmet restaurant"]
    },
    ru: {
      desc: "Премиальный курорт на берегу озера Иссык-Куль. К услугам гостей собственный песчаный пляж, панорамный вид на озеро, крытые бассейны с подогревом и изысканная кухня Шелкового пути.",
      details: ["Номера люкс с видом на озеро", "Собственный песчаный пляж", "Спа-комплекс и бассейн"],
      features: ["Бар на закатной террасе", "Отапливаемая лаунж-зона", "Органический ресторан"]
    },
    ky: {
      desc: "Ысык-Көлдүн жээгиндеги жогорку деңгээлдеги эс алуу жайы. Жеке кумдуу пляж, көлгө караган кооз көрүнүш жана жылытылуучу жабык бассейн бар.",
      details: ["Көлгө караган панорамалык люкс бөлмөлөр", "Жеке кумдуу пляж", "Спа-комплекс жана жабык бассейн"],
      features: ["Күн батышын көрүүчү бар террасасы", "Жылытылуучу ачык лаунж", "Органикалык ресторан"]
    }
  },
  guesthouse: {
    en: {
      desc: "A charming family-run guesthouse located near the ancient Tash-Rabat caravanserai. Perfect for cultural immersion, enjoying home-cooked meals by a local family, and learning ancient felt-making crafts.",
      details: ["Cozy guestrooms with family hospitality", "Traditional home-cooked breakfast & dinner included", "Stunning views of the Tash-Rabat valley"],
      features: ["Family-run atmosphere", "Horseback riding tours", "Felt masterclass opportunities"]
    },
    ru: {
      desc: "Очаровательный семейный гостевой дом недалеко от древнего караван-сарая Таш-Рабат. Отлично подходит для культурного погружения, дегустации домашних блюд и обучения войлочному ремеслу.",
      details: ["Уютные номера с семейным уютом", "Домашний завтрак и ужин включены в стоимость", "Вид на долину Таш-Рабат"],
      features: ["Семейная атмосфера", "Конные экскурсии", "Мастер-классы по войлоку"]
    },
    ky: {
      desc: "Байыркы Таш-Рабат кербен сарайынын жанында жайгашкан жагымдуу үй-бүлөлүк конок үйү. Кыргыз үй-бүлөсүнүн тамак-ашы жана кийиз жасоо боюнча мастер-класстар.",
      details: ["Үй-бүлөлүк меймандостук жана уюттуу бөлмөлөр", "Традициялык эртең мененки жана кечки тамактар кошо камтылган", "Таш-Рабат өрөөнүнүн кооз көрүнүшү"],
      features: ["Үй-бүлөлүк атмосфера", "Ат үстүндө саякаттар", "Кийиз жасоо боюнча мастер-класстар"]
    }
  },
  sky_camp: {
    en: {
      desc: "Sleep under the clearest skies in Central Asia at our luxury yurt camp on the shores of Son-Kul Lake. Wake up to wild horses grazing outside your door and enjoy fresh kymyz (traditional mare's milk).",
      details: ["Elevated wooden platforms for yurts", "Panoramic views of Son-Kul alpine pastures", "Traditional nomadic games demonstrations"],
      features: ["Clear night stargazing dome", "Authentic horse breeding farm", "Nomadic folklore music nights"]
    },
    ru: {
      desc: "Спите под самым чистым небом Центральной Азии в нашем юрточном лагере на берегу озера Сон-Куль. Просыпайтесь под ржание диких лошадей и наслаждайтесь свежим кумысом.",
      details: ["Деревянные платформы под юртами", "Панорамный вид на пастбища Сон-Куля", "Демонстрация кочевых игр"],
      features: ["Купол для наблюдения за звездами", "Ферма по разведению коней", "Вечера кочевой фольклорной музыки"]
    },
    ky: {
      desc: "Соң-Көл көлүнүн жээгиндеги люкс боз үй лагеринде Азиянын эң тунук асманынын астында уктаңыз. Эшигиңиздин жанында жайылып жүргөн жапайы жылкыларды көрүңүз.",
      details: ["Боз үйлөрдүн астындагы жыгач платформалар", "Соң-Көлдүн жайлоолорунун панорамалык көрүнүшү", "Кыргыз улуттук ат оюндарынын көрсөтмөсү"],
      features: ["Жылдыздарды көрүүчү купол", "Жылкы чарбасы", "Кочмондордун фольклордук музыкалык кечелери"]
    }
  },
  luxe: {
    en: {
      desc: "A premium modern hotel located in the heart of Bishkek. Combining state-of-the-art business facilities with high-end luxury services, rooftop sky-lounge dining, and full wellness treatment suites.",
      details: ["Spacious rooms with modern tech amenities", "Rooftop dining with city views", "Sauna, massage, and fitness center"],
      features: ["Downtown central location", "Exclusive VIP concierge service", "Modern conference facility rooms"]
    },
    ru: {
      desc: "Премиальный современный отель в самом центре Бишкека. Сочетает в себе передовые условия для бизнеса и первоклассный сервис, ресторан на крыше и полноценный велнес-центр.",
      details: ["Просторные номера с умными технологиями", "Ресторан на крыше с видом на город", "Сауна, массаж и фитнес-центр"],
      features: ["Центральное расположение", "Эксклюзивный VIP-консьерж", "Современные конференц-залы"]
    },
    ky: {
      desc: "Бишкектин чок ортосунда жайгашкан заманбап премиум отель. Заманбап бизнес шарттары жана жогорку деңгээлдеги люкс кызматтары бар.",
      details: ["Акылдуу технологиялар менен жабдылган кенен бөлмөлөр", "Шаарды көрүүчү террасадагы ресторан", "Сауна, массаж жана фитнес-борбор"],
      features: ["Шаардын борборундагы жайгашуусу", "Эксклюзивдүү VIP-консьерж кызматы", "Заманбап конференц-залдар"]
    }
  }
};

export default function HotelsSection() {
  const t = useTranslations("hotels");
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const headRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  
  // Favorites wishlist state
  const [favorites, setFavorites] = useState<{ id: number; type: 'tour' | 'hotel' }[]>([]);
  const [selectedHotelDetails, setSelectedHotelDetails] = useState<any>(null);

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

  useEffect(() => {
    gsap.fromTo(headRef.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.9, scrollTrigger: { trigger: headRef.current, start: "top 85%" } });
    if (gridRef.current) {
      gsap.fromTo(gridRef.current.children, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power3.out", scrollTrigger: { trigger: gridRef.current, start: "top 80%" } });
    }
  }, []);

  return (
    <section id="hotels" className="section-padding" style={{ background: "#fff" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div ref={headRef} style={{ textAlign: "center", marginBottom: "4rem" }}>
          <span className="section-badge">{t("title")}</span>
          <h2 className="section-title">{t("title")}</h2>
          <p className="section-subtitle" style={{ margin: "0.75rem auto 0" }}>{t("subtitle")}</p>
        </div>

        <div ref={gridRef} className="responsive-grid">
          {HOTELS.map((hotel) => {
            const fav = isFavorite(hotel.id, 'hotel');
            return (
              <article key={hotel.id} className="card-hover relative" style={{ borderRadius: 20, overflow: "hidden", background: "#fff", boxShadow: "0 4px 30px rgba(0,0,0,0.07)", border: "1px solid rgba(0,0,0,0.04)" }}>
                {/* Heart button for wishlist */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleFavorite(hotel.id, 'hotel');
                  }}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md flex items-center justify-center text-white transition cursor-pointer z-10"
                  title="Add to favorites"
                >
                  <Heart size={16} className={fav ? "fill-red-500 text-red-500 stroke-red-500" : "text-white"} />
                </button>

                <div style={{ position: "relative", height: 210, overflow: "hidden" }}>
                  <img src={hotel.image} alt={t(`list.${hotel.key}.name`)} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.6s" }}
                    onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.08)")}
                    onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")} />
                  <div style={{ position: "absolute", top: "1rem", left: "1rem", background: TYPE_COLOR[hotel.type] || "#1a3d2b", color: "#fff", borderRadius: 999, padding: "0.3rem 0.85rem", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    {t(hotel.type as "type_yurt" | "type_lodge" | "type_hotel" | "type_guesthouse")}
                  </div>
                </div>
                <div className="card-content" style={{ padding: "clamp(1.25rem, 4vw, 1.75rem)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                    <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.15rem", fontWeight: 700, color: "#0d1117" }}>{t(`list.${hotel.key}.name`)}</h3>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexShrink: 0 }}>
                      <Star size={12} color="#c9a84c" fill="#c9a84c" />
                      <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#0d1117" }}>{hotel.rating}</span>
                      <span style={{ fontSize: "0.75rem", color: "#6c757d" }}>({hotel.reviews})</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "#6c757d", fontSize: "0.8rem", marginBottom: "1rem" }}>
                    <MapPin size={12} /><span>{t(`list.${hotel.key}.location`)}</span>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
                    {hotel.amenities.slice(0, 3).map(a => (
                      <span key={a} style={{ background: "#f0f0f0", color: "#343a40", borderRadius: 8, padding: "0.2rem 0.6rem", fontSize: "0.72rem", fontWeight: 500 }}>{t(`amenities.${a}` as any)}</span>
                    ))}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
                    <div>
                      <span style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.5rem", fontWeight: 700, color: "#1a3d2b" }}>${hotel.price}</span>
                      <span style={{ fontSize: "0.78rem", color: "#6c757d" }}> / {t("per_night")}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedHotelDetails(hotel)}
                        className="btn-secondary cursor-pointer"
                        style={{ padding: "0.6rem 1rem", fontSize: "0.82rem" }}
                      >
                        {locale === "ru" ? "Подробнее" : (locale === "ky" ? "Кененирээк" : "Details")}
                      </button>
                      <button onClick={() => {
                        window.dispatchEvent(new CustomEvent("select-booking-item", { detail: t(`list.${hotel.key}.name`) }));
                      }} className="btn-primary cursor-pointer" style={{ padding: "0.6rem 1rem", fontSize: "0.82rem" }}>{t("book")}</button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <HotelDetailsModal
        hotel={selectedHotelDetails}
        open={selectedHotelDetails !== null}
        onClose={() => setSelectedHotelDetails(null)}
        locale={locale}
        translations={t}
      />
    </section>
  );
}

// Subcomponent: HotelDetailsModal
function HotelDetailsModal({
  hotel,
  open,
  onClose,
  locale,
  translations,
}: {
  hotel: any;
  open: boolean;
  onClose: () => void;
  locale: string;
  translations: any;
}) {
  const t = translations;
  if (!hotel) return null;

  const hotelInfo = HOTEL_DESCS[hotel.key]?.[locale] || HOTEL_DESCS[hotel.key]?.en || { desc: "", details: [], features: [] };

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
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] w-[min(640px,calc(100vw-2rem))] max-h-[calc(100vh-4rem)] bg-white rounded-[40px] shadow-2xl flex flex-col overflow-hidden text-slate-800"
          >
            {/* Header image area */}
            <div className="relative h-56 sm:h-64 w-full shrink-0 overflow-hidden">
              <img src={hotel.image} alt={t(`list.${hotel.key}.name`)} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              
              {/* Badges */}
              <div className="absolute top-6 left-6 flex gap-2">
                <span className="bg-[#1a3d2b] text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
                  {t(hotel.type)}
                </span>
                <span className="bg-[#c9a84c] text-[#1a3d2b] text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full flex items-center gap-1.5">
                  <Star size={12} className="fill-[#1a3d2b] text-[#1a3d2b]" /> {hotel.rating}
                </span>
              </div>

              {/* Close button */}
              <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md flex items-center justify-center text-white transition cursor-pointer">
                <X size={20} />
              </button>

              {/* Title */}
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <p className="text-[10px] font-bold text-[#c9a84c] uppercase tracking-[0.2em] mb-1 flex items-center gap-1">
                  <MapPin size={12} /> {t(`list.${hotel.key}.location`)}
                </p>
                <h3 className="font-playfair text-xl sm:text-2xl font-black">{t(`list.${hotel.key}.name`)}</h3>
              </div>
            </div>

            <div className="p-6 sm:p-8 !pb-2 space-y-6 overflow-y-auto flex-1 hide-scrollbar">
              
              {/* Description */}
              <div>
                <h4 className="font-playfair text-base font-bold text-[#1a3d2b] mb-2">
                  {locale === "ru" ? "Описание" : (locale === "ky" ? "Жалпы маалымат" : "Overview")}
                </h4>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed font-medium">{hotelInfo.desc}</p>
              </div>

              {/* Details & Rules */}
              <div>
                <h4 className="font-playfair text-base font-bold text-[#1a3d2b] mb-2">
                  {locale === "ru" ? "Детали размещения" : (locale === "ky" ? "Жайгашуу шарттары" : "Accommodation Details")}
                </h4>
                <ul className="space-y-2">
                  {hotelInfo.details.map((dt, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-gray-600 text-xs sm:text-sm font-medium">
                      <span className="w-4 h-4 rounded-full bg-[#1a3d2b]/10 text-[#1a3d2b] flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={10} className="stroke-[3]" />
                      </span>
                      <span>{dt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Unique Features */}
              <div>
                <h4 className="font-playfair text-base font-bold text-[#1a3d2b] mb-2">
                  {locale === "ru" ? "Особенности" : (locale === "ky" ? "Өзгөчөлүктөрү" : "Special Features")}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {hotelInfo.features.map((ft, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-gray-50 border border-gray-100 p-2.5 rounded-xl">
                      <div className="w-5 h-5 rounded-full bg-[#c9a84c]/20 text-[#c9a84c] flex items-center justify-center shrink-0">
                        <Check size={12} className="stroke-[3]" />
                      </div>
                      <span className="text-gray-750 text-xs font-bold uppercase tracking-wide">{ft}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Amenities icons list */}
              <div>
                <h4 className="font-playfair text-base font-bold text-[#1a3d2b] mb-2">
                  {locale === "ru" ? "Услуги и удобства" : (locale === "ky" ? "Удобстволор" : "Amenities")}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {hotel.amenities.map((a: string) => (
                    <span key={a} className="bg-gray-100 text-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-wider border border-gray-150">
                      {t(`amenities.${a}` as any)}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* CTA Booking Row */}
            <div className="flex items-center justify-between gap-6 p-6 sm:p-8 border-t border-gray-100 bg-white shrink-0 rounded-b-[40px] z-10">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t("per_night")}</p>
                <p className="font-playfair text-2xl sm:text-3xl font-black text-[#1a3d2b]">${hotel.price}</p>
              </div>
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("select-booking-item", { detail: t(`list.${hotel.key}.name`) }));
                  onClose();
                }}
                className="btn-primary !py-3.5 !px-6 flex-1 sm:flex-initial"
              >
                {t("book")}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
