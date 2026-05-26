export const dynamic = "force-dynamic";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getTranslations } from "next-intl/server";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Users as UsersIcon,
  Mail,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
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

  let bookings: any[] = [];
  try {
    const { data } = await supabase
      .from("bookings")
      .select(
        `*, tours(name_en, name_ru, name_ky, price_usd), hotels(name_en, name_ru, name_ky, price_per_night), transport_options(title_en, title_ru, title_ky)`
      )
      .order("created_at", { ascending: false });

    bookings = (data ?? []).map((b: any) => ({
      ...b,
      tour_name: b.tours?.[`name_${locale}`] ?? null,
      hotel_name: b.hotels?.[`name_${locale}`] ?? null,
      transport_title: b.transport_options?.[`title_${locale}`] ?? null,
      price: b.tours?.price_usd ?? b.hotels?.price_per_night ?? null,
    }));
  } catch (e: any) {
    console.error("[admin] bookings:", e?.message ?? e);
  }

  let revenue = 0;
  bookings.forEach((b: any) => {
    if (b.status === "confirmed" && b.price)
      revenue += Number(b.price) * (b.guests || 1);
  });

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
    tab_bookings: "Бронирования",
    tab_tours: "Туры",
    tab_hotels: "Отели",
    tab_users: "Пользователи",
    tab_messages: "Сообщения",
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
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-700 mb-1">
            Обзор
          </p>
          <h2 className="text-3xl font-black font-playfair text-slate-900">
            С возвращением, {session.user.name?.split(" ")[0] ?? "Админ"}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Что происходит в NomadTrails сегодня
          </p>
        </div>
        <div className="text-xs text-slate-400 font-medium">
          {new Date().toLocaleDateString("ru-RU", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* Big stat hero */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-gradient-to-br from-[#0a0f14] via-[#0d2818] to-[#1a3d2b] rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#c9a84c]/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={14} className="text-[#c9a84c]" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#c9a84c]">
                Общий доход
              </span>
            </div>
            <p className="text-5xl font-black tabular-nums mb-1">
              ${stats.revenue.toLocaleString()}
            </p>
            <p className="text-sm text-white/50">
              По {stats.confirmed} подтверждённым бронированиям
            </p>
            <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/10">
              <MiniStat label="Всего" value={stats.total} />
              <MiniStat label="Новые" value={stats.new} highlight={stats.new > 0} />
              <MiniStat label="Подтверждённые" value={stats.confirmed} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
          <StatCard
            icon={UsersIcon}
            label="Пользователи"
            value={stats.users}
            color="bg-violet-100 text-violet-600"
            trend={stats.users > 0 ? `${stats.users} зарегистрировано` : "Никого нет"}
          />
          <StatCard
            icon={Mail}
            label="Непрочитанные"
            value={stats.unread_messages}
            color="bg-pink-100 text-pink-600"
            trend={stats.unread_messages > 0 ? "Требует внимания" : "Всё прочитано"}
            urgent={stats.unread_messages > 0}
          />
        </div>
      </div>

      {/* Secondary stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={Calendar}
          label="Бронирования"
          value={stats.total}
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <MetricCard
          icon={Clock}
          label="Новые заявки"
          value={stats.new}
          color="text-orange-600"
          bg="bg-orange-50"
          badge={stats.new > 0}
        />
        <MetricCard
          icon={CheckCircle2}
          label="Подтверждено"
          value={stats.confirmed}
          color="text-emerald-600"
          bg="bg-emerald-50"
        />
        <MetricCard
          icon={TrendingUp}
          label="Туры · Отели"
          value={`${stats.tours} · ${stats.hotels}`}
          color="text-slate-600"
          bg="bg-slate-100"
        />
      </div>

      {/* Tabs panel */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <AdminTabs
          initialBookings={bookings}
          translations={translations}
          locale={locale}
        />
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">
        {label}
      </p>
      <p
        className={`text-xl font-black tabular-nums ${
          highlight ? "text-[#c9a84c]" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  trend,
  urgent = false,
}: {
  icon: any;
  label: string;
  value: number;
  color: string;
  trend?: string;
  urgent?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all relative">
      {urgent && (
        <span className="absolute top-3 right-3 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500" />
        </span>
      )}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${color}`}>
        <Icon size={18} />
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
        {label}
      </p>
      <p className="text-2xl font-black text-slate-900 tabular-nums">{value}</p>
      {trend && <p className="text-[11px] text-slate-500 mt-1">{trend}</p>}
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  color,
  bg,
  badge = false,
}: {
  icon: any;
  label: string;
  value: number | string;
  color: string;
  bg: string;
  badge?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-slate-300 transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg ${bg} ${color} flex items-center justify-center`}>
          <Icon size={16} />
        </div>
        {badge && <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />}
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
        {label}
      </p>
      <p className="text-xl font-black text-slate-900 tabular-nums">{value}</p>
    </div>
  );
}
