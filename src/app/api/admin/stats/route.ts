import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const [
    { count: totalBookings },
    { count: newBookings },
    { count: confirmedBookings },
    { count: cancelledBookings },
    { count: totalUsers },
    { count: totalTours },
    { count: totalHotels },
    { count: unreadMessages },
    { data: confirmedRevenue },
  ] = await Promise.all([
    supabase.from("bookings").select("*", { count: "exact", head: true }),
    supabase.from("bookings").select("*", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("bookings").select("*", { count: "exact", head: true }).eq("status", "confirmed"),
    supabase.from("bookings").select("*", { count: "exact", head: true }).eq("status", "cancelled"),
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("tours").select("*", { count: "exact", head: true }),
    supabase.from("hotels").select("*", { count: "exact", head: true }),
    supabase.from("contact_messages").select("*", { count: "exact", head: true }).eq("is_read", false),
    supabase
      .from("bookings")
      .select("guests, tours(price_usd), hotels(price_per_night)")
      .eq("status", "confirmed"),
  ]);

  let revenue = 0;
  (confirmedRevenue ?? []).forEach((b: any) => {
    const guests = b.guests || 1;
    if (b.tours?.price_usd) revenue += Number(b.tours.price_usd) * guests;
    else if (b.hotels?.price_per_night) revenue += Number(b.hotels.price_per_night) * guests;
  });

  return NextResponse.json({
    bookings: {
      total: totalBookings ?? 0,
      new: newBookings ?? 0,
      confirmed: confirmedBookings ?? 0,
      cancelled: cancelledBookings ?? 0,
    },
    users: totalUsers ?? 0,
    tours: totalTours ?? 0,
    hotels: totalHotels ?? 0,
    unread_messages: unreadMessages ?? 0,
    revenue_usd: Math.round(revenue),
  });
}
