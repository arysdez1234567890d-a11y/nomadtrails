export const dynamic = 'force-dynamic';
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getTranslations } from "next-intl/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ShieldCheck, Calendar, CheckCircle, Clock } from "lucide-react";
import AdminTabs from "@/components/AdminTabs";

export default async function AdminDashboard({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await auth();

  if (!session || !session.user || (session.user as any).role !== 'admin') {
    redirect(`/${locale}`);
  }

  const t = await getTranslations("admin");

  const { data: rawBookings } = await supabase
    .from('bookings')
    .select(`
      *,
      tours(name_en, name_ru, name_ky),
      hotels(name_en, name_ru, name_ky),
      transport_options(title_en, title_ru, title_ky)
    `)
    .order('created_at', { ascending: false });

  const bookings = (rawBookings ?? []).map((b: any) => ({
    ...b,
    tour_name: b.tours?.[`name_${locale}`] ?? null,
    hotel_name: b.hotels?.[`name_${locale}`] ?? null,
    transport_title: b.transport_options?.[`title_${locale}`] ?? null,
  }));

  const stats = {
    total: bookings.length,
    new: bookings.filter((b: any) => b.status === 'new').length,
    confirmed: bookings.filter((b: any) => b.status === 'confirmed').length,
  };

  const translations = {
    tab_bookings: t("tab_bookings"),
    tab_tours: t("tab_tours"),
    tab_hotels: t("tab_hotels"),
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
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6 px-4 md:px-0">
            <div>
              <h1 className="text-4xl font-black font-playfair text-white flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-[#c9a84c] flex items-center justify-center shadow-lg shadow-[#c9a84c]/20">
                  <ShieldCheck className="text-white" size={28} />
                </div>
                {t("dashboard_title")}
              </h1>
              <p className="text-emerald-400/60 font-bold text-xs uppercase tracking-[0.3em] ml-16">Management Control Center</p>
            </div>
            <div className="flex flex-wrap gap-4">
              {[
                { label: t("total_bookings"), value: stats.total, icon: Calendar, color: "from-blue-500/20 to-blue-600/5", textColor: "text-blue-400" },
                { label: t("new_bookings"), value: stats.new, icon: Clock, color: "from-orange-500/20 to-orange-600/5", textColor: "text-orange-400" },
                { label: t("confirmed_bookings"), value: stats.confirmed, icon: CheckCircle, color: "from-emerald-500/20 to-emerald-600/5", textColor: "text-emerald-400" },
              ].map((stat, i) => (
                <div key={i} className="relative group overflow-hidden bg-white/5 backdrop-blur-md p-5 rounded-[2rem] border border-white/10 flex items-center gap-5 min-w-[180px] transition-all hover:bg-white/10">
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-50`} />
                  <div className="relative z-10 w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white border border-white/10">
                    <stat.icon size={22} className={stat.textColor} />
                  </div>
                  <div className="relative z-10">
                    <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-1">{stat.label}</p>
                    <p className="text-2xl font-black text-white">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-2xl rounded-[3rem] shadow-2xl overflow-hidden border border-white/10">
            <AdminTabs initialBookings={bookings} translations={translations} locale={locale} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
