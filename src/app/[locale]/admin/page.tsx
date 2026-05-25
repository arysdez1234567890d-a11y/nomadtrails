export const dynamic = "force-dynamic";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getTranslations } from "next-intl/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  ShieldCheck,
  Calendar,
  CheckCircle,
  Clock,
  Users,
  Mail,
  DollarSign,
  Map,
} from "lucide-react";
import AdminTabs from "@/components/AdminTabs";

export default async function AdminDashboard({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();

  if (!session || !session.user || (session.user as any).role !== "admin") {
    redirect(`/${locale}`);
  }

  const t = await getTranslations("admin");

  // Fetch bookings with joins
  let bookings: any[] = [];
  try {
    const { data: rawBookings } = await supabase
      .from("bookings")
      .select(
        `
        *,
        tours(name_en, name_ru, name_ky, price_usd),
        hotels(name_en, name_ru, name_ky, price_per_night),
        transport_options(title_en, title_ru, title_ky)
      `
      )
      .order("created_at", { ascending: false });

    bookings = (rawBookings ?? []).map((b: any) => ({
      ...b,
      tour_name: b.tours?.[`name_${locale}`] ?? null,
      hotel_name: b.hotels?.[`name_${locale}`] ?? null,
      transport_title: b.transport_options?.[`title_${locale}`] ?? null,
      price: b.tours?.price_usd ?? b.hotels?.price_per_night ?? null,
    }));
  } catch (e: any) {
    console.error("[admin] bookings query failed:", e?.message ?? e);
  }

  // Compute stats
  let revenue = 0;
  bookings.forEach((b: any) => {
    if (b.status === "confirmed" && b.price) {
      revenue += Number(b.price) * (b.guests || 1);
    }
  });

  // Get counts in parallel
  const [
    { count: totalUsers },
    { count: totalTours },
    { count: totalHotels },
    { count: unreadMessages },
  ] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("tours").select("*", { count: "exact", head: true }),
    supabase.from("hotels").select("*", { count: "exact", head: true }),
    supabase
      .from("contact_messages")
      .select("*", { count: "exact", head: true })
      .eq("is_read", false),
  ]);

  const stats = {
    total: bookings.length,
    new: bookings.filter((b: any) => b.status === "new").length,
    confirmed: bookings.filter((b: any) => b.status === "confirmed").length,
    cancelled: bookings.filter((b: any) => b.status === "cancelled").length,
    revenue: Math.round(revenue),
    users: totalUsers ?? 0,
    tours: totalTours ?? 0,
    hotels: totalHotels ?? 0,
    unread_messages: unreadMessages ?? 0,
  };

  const translations = {
    tab_bookings: t("tab_bookings"),
    tab_tours: t("tab_tours"),
    tab_hotels: t("tab_hotels"),
    tab_users: "Users",
    tab_messages: "Messages",
    table_id: t("table_id"),
    table_client: t("table_client"),
    table_item: t("table_item"),
    table_date: t("table_date"),
    table_status: t("table_status"),
    table_actions: t("table_actions"),
    guests: t("guests"),
    action_confirm: t("action_confirm"),
    action_cancel: t("action_cancel"),
    confirm_delete: t("confirm_delete"),
    add_new: t("add_new"),
    loading: t("loading"),
    no_items: t("no_items"),
    tour: t("type_tour"),
    hotel: t("type_hotel"),
    transport: t("type_transport"),
    status_new: t("status_new"),
    status_contacted: t("status_contacted"),
    status_confirmed: t("status_confirmed"),
    status_cancelled: t("status_cancelled"),
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-slate-900 via-emerald-950 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6 px-4 md:px-0">
            <div>
              <h1 className="text-3xl md:text-4xl font-black font-playfair text-white flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-[#c9a84c] flex items-center justify-center shadow-lg shadow-[#c9a84c]/20">
                  <ShieldCheck className="text-white" size={28} />
                </div>
                {t("dashboard_title")}
              </h1>
              <p className="text-emerald-400/60 font-bold text-[10px] uppercase tracking-[0.3em] ml-16">
                Welcome back, {session.user.name}
              </p>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
            <StatCard
              label="Revenue"
              value={"$" + stats.revenue.toLocaleString()}
              icon={DollarSign}
              accent="text-emerald-400"
              big
            />
            <StatCard
              label="Bookings"
              value={stats.total}
              icon={Calendar}
              accent="text-blue-400"
            />
            <StatCard
              label="New"
              value={stats.new}
              icon={Clock}
              accent="text-orange-400"
            />
            <StatCard
              label="Confirmed"
              value={stats.confirmed}
              icon={CheckCircle}
              accent="text-emerald-400"
            />
            <StatCard
              label="Users"
              value={stats.users}
              icon={Users}
              accent="text-violet-400"
            />
            <StatCard
              label="Messages"
              value={stats.unread_messages}
              icon={Mail}
              accent="text-pink-400"
              badge={stats.unread_messages > 0}
            />
          </div>

          {/* Tabs panel */}
          <div className="bg-white/5 backdrop-blur-2xl rounded-[2rem] md:rounded-[3rem] shadow-2xl overflow-hidden border border-white/10">
            <AdminTabs
              initialBookings={bookings}
              translations={translations}
              locale={locale}
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  big = false,
  badge = false,
}: {
  label: string;
  value: any;
  icon: any;
  accent: string;
  big?: boolean;
  badge?: boolean;
}) {
  return (
    <div className="relative bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 hover:bg-white/[0.08] transition-all">
      <div className="flex items-center justify-between mb-3">
        <div
          className={`w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center ${accent} border border-white/10`}
        >
          <Icon size={18} />
        </div>
        {badge && (
          <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
        )}
      </div>
      <p className="text-[9px] text-white/40 uppercase font-black tracking-widest mb-1">
        {label}
      </p>
      <p
        className={`font-black text-white tabular-nums ${
          big ? "text-2xl" : "text-xl"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
