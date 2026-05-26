export const dynamic = "force-dynamic";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AdminBookingTable from "@/components/AdminBookingTable";

export default async function AdminBookingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "admin") {
    redirect(`/${locale}`);
  }

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
    console.error("[admin bookings]:", e?.message ?? e);
  }

  const translations = {
    status_new: "Новые",
    status_contacted: "В обработке",
    status_confirmed: "Подтверждено",
    status_cancelled: "Отменено",
    tour: "Тур",
    hotel: "Отель",
    transport: "Транспорт",
    guests: "гостей",
    action_confirm: "Подтвердить",
    action_cancel: "Отменить",
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <AdminBookingTable
        initialBookings={bookings}
        translations={translations}
      />
    </div>
  );
}
