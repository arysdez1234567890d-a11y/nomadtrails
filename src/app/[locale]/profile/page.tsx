export const dynamic = 'force-dynamic';
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getTranslations } from "next-intl/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProfileTabs from "@/components/ProfileTabs";
import { ShieldCheck, ArrowRight, Calendar, Mail, Users } from "lucide-react";

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await auth();
  const t = await getTranslations("profile");

  if (!session || !session.user || !session.user.email) {
    redirect(`/${locale}`);
  }

  let userData: any = null;
  let bookings: any[] = [];

  try {
    const { data: userRows } = await supabase
      .from('users')
      .select('*')
      .eq('email', session.user.email)
      .limit(1);
    userData = userRows?.[0] ?? null;
  } catch (e: any) {
    console.error("[profile] users query failed:", e?.message ?? e);
  }

  if (!userData) {
    // Fallback to session info so the page still renders for fresh users
    userData = {
      id: null,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
      role: 'user',
    };
  }

  // Fetch admin overview stats (only if admin)
  let adminStats: { bookings: number; users: number; messages: number; new_bookings: number } | null = null;
  if (userData.role === "admin") {
    try {
      const [{ count: b }, { count: u }, { count: m }, { count: nb }] = await Promise.all([
        supabase.from("bookings").select("*", { count: "exact", head: true }),
        supabase.from("users").select("*", { count: "exact", head: true }),
        supabase.from("contact_messages").select("*", { count: "exact", head: true }).eq("is_read", false),
        supabase.from("bookings").select("*", { count: "exact", head: true }).eq("status", "new"),
      ]);
      adminStats = { bookings: b ?? 0, users: u ?? 0, messages: m ?? 0, new_bookings: nb ?? 0 };
    } catch (e: any) {
      console.error("[profile admin stats]", e?.message ?? e);
    }
  }

  if (userData.id) {
    try {
      const { data: rawBookings } = await supabase
        .from('bookings')
        .select(`
          *,
          tours(name_en, name_ru, name_ky, price_usd),
          hotels(name_en, name_ru, name_ky, price_per_night),
          transport_options(title_en, title_ru, title_ky)
        `)
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false });

      bookings = (rawBookings ?? []).map((b: any) => ({
        ...b,
        tour_name: b.tours?.[`name_${locale}`] ?? null,
        hotel_name: b.hotels?.[`name_${locale}`] ?? null,
        transport_title: b.transport_options?.[`title_${locale}`] ?? null,
      }));
    } catch (e: any) {
      console.error("[profile] bookings query failed:", e?.message ?? e);
    }
  }

  let userReviews: any[] = [];
  if (userData.id) {
    try {
      const { data } = await supabase
        .from("reviews")
        .select("*")
        .eq("user_id", userData.id)
        .order("created_at", { ascending: false });
      userReviews = data ?? [];
    } catch (e: any) {
      console.error("[profile] user reviews query failed:", e?.message ?? e);
    }
  }

  const translations = {
    my_bookings: t("my_bookings"),
    settings: t("settings"),
    no_bookings: t("no_bookings"),
    explore_tours: t("explore_tours"),
    type_tour: t("type_tour"),
    type_hotel: t("type_hotel"),
    type_transport: t("type_transport"),
    status_new: t("status_new"),
    status_contacted: t("status_contacted"),
    status_confirmed: t("status_confirmed"),
    status_cancelled: t("status_cancelled"),
    guests: t("guests"),
    full_name: t("full_name"),
    phone_number: t("phone_number"),
    save_changes: t("save_changes"),
    saved: t("saved"),
    my_reviews: locale === "ru" ? "Мои отзывы" : (locale === "ky" ? "Менин пикирлерим" : "My Reviews"),
    no_reviews: locale === "ru" ? "Вы еще не оставили отзывов." : (locale === "ky" ? "Сиз азырынча пикир калтыра элексиз." : "You have not left any reviews yet."),
    delete_review: locale === "ru" ? "Удалить отзыв" : (locale === "ky" ? "Пикирди өчүрүү" : "Delete review"),
    confirm_delete: locale === "ru" ? "Вы уверены, что хотите удалить этот отзыв?" : (locale === "ky" ? "Бул пикирди өчүрүүнү каалайсызбы?" : "Are you sure you want to delete this review?"),
    my_favorites: locale === "ru" ? "Избранное" : (locale === "ky" ? "Тандалган" : "Favorites"),
    no_favorites: locale === "ru" ? "У вас пока нет избранных туров или отелей." : (locale === "ky" ? "Сизде азырынча тандалган турлар же отелдер жок." : "You have no favorite tours or hotels yet."),
    remove_favorite: locale === "ru" ? "Удалить" : (locale === "ky" ? "Өчүрүү" : "Remove"),
    book: locale === "ru" ? "Забронировать" : (locale === "ky" ? "Брондоо" : "Book"),
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-12 bg-[#f8f9fa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 mb-8">
            <div className="bg-gradient-to-r from-[#1a3d2b] to-[#2d5a42] px-8 py-12 text-white">
              <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                {session.user.image ? (
                  <img src={session.user.image} alt={session.user.name || ""} className="w-24 h-24 rounded-full border-4 border-white/20 shadow-lg" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center text-3xl font-bold border-4 border-white/20">
                    {session.user.name?.[0]}
                  </div>
                )}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold font-playfair">{userData.name}</h1>
                  <p className="text-white/70">{session.user.email}</p>
                  {userData.role === 'admin' && (
                    <span className="inline-block mt-2 px-3 py-1 bg-[#c9a84c] text-[#1a3d2b] text-[10px] font-bold uppercase tracking-wider rounded-full">
                      Admin Access
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="p-4 md:p-8">
              {userData.role === "admin" && (
                <Link
                  href={`/${locale}/admin`}
                  className="group block mb-8 relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0d1117] via-[#1a3d2b] to-[#0d2818] p-6 md:p-8 hover:shadow-2xl hover:shadow-[#c9a84c]/20 transition-all"
                >
                  {/* Background decorations */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#c9a84c]/10 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-[#c9a84c]/20 transition-all" />
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -ml-24 -mb-24" />

                  <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-[#c9a84c] flex items-center justify-center shadow-lg shadow-[#c9a84c]/30 shrink-0 group-hover:scale-110 transition-transform">
                          <ShieldCheck className="text-[#1a3d2b]" size={26} />
                        </div>
                        <div>
                          <p className="text-[#c9a84c] text-[10px] font-black uppercase tracking-[0.3em] mb-1">
                            Admin Access
                          </p>
                          <h3 className="text-2xl md:text-3xl font-black font-playfair text-white mb-1">
                            Open Admin Panel
                          </h3>
                          <p className="text-white/50 text-sm">
                            Manage bookings, users, tours, hotels & messages
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-center text-[#c9a84c] font-bold group-hover:gap-3 transition-all">
                        <span className="text-xs uppercase tracking-widest">Enter</span>
                        <ArrowRight size={20} />
                      </div>
                    </div>

                    {/* Quick stats */}
                    {adminStats && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
                        <AdminStat icon={Calendar} label="Total bookings" value={adminStats.bookings} accent="text-blue-400" />
                        <AdminStat icon={Calendar} label="New requests" value={adminStats.new_bookings} accent="text-orange-400" badge={adminStats.new_bookings > 0} />
                        <AdminStat icon={Users} label="Users" value={adminStats.users} accent="text-violet-400" />
                        <AdminStat icon={Mail} label="Unread msgs" value={adminStats.messages} accent="text-pink-400" badge={adminStats.messages > 0} />
                      </div>
                    )}
                  </div>
                </Link>
              )}

              <ProfileTabs
                bookings={bookings}
                userReviews={userReviews}
                userData={userData}
                translations={translations}
                locale={locale}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function AdminStat({
  icon: Icon,
  label,
  value,
  accent,
  badge = false,
}: {
  icon: any;
  label: string;
  value: number;
  accent: string;
  badge?: boolean;
}) {
  return (
    <div className="relative bg-white/5 backdrop-blur-md p-3 rounded-xl border border-white/10">
      <div className="flex items-center justify-between mb-2">
        <Icon size={14} className={accent} />
        {badge && <span className="w-1.5 h-1.5 rounded-full bg-[#c9a84c] animate-pulse" />}
      </div>
      <p className="text-[9px] text-white/40 uppercase font-black tracking-widest mb-0.5">{label}</p>
      <p className="text-lg font-black text-white tabular-nums">{value}</p>
    </div>
  );
}
