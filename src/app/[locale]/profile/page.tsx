export const dynamic = 'force-dynamic';
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getTranslations } from "next-intl/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProfileTabs from "@/components/ProfileTabs";

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await auth();
  const t = await getTranslations("profile");

  if (!session || !session.user) {
    redirect(`/${locale}`);
  }

  const { data: userRows } = await supabase
    .from('users')
    .select('*')
    .eq('email', session.user.email)
    .limit(1);

  const userData = userRows?.[0];

  if (!userData) {
    redirect(`/${locale}`);
  }

  const { data: rawBookings } = await supabase
    .from('bookings')
    .select(`
      *,
      tours(name_en, name_ru, name_ky),
      hotels(name_en, name_ru, name_ky),
      transport_options(title_en, title_ru, title_ky)
    `)
    .eq('user_id', userData.id)
    .order('created_at', { ascending: false });

  const bookings = (rawBookings ?? []).map((b: any) => ({
    ...b,
    tour_name: b.tours?.[`name_${locale}`] ?? null,
    hotel_name: b.hotels?.[`name_${locale}`] ?? null,
    transport_title: b.transport_options?.[`title_${locale}`] ?? null,
  }));

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
              <ProfileTabs
                bookings={bookings}
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
