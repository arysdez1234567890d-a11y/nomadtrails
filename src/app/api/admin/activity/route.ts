import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

type Event = {
  id: string;
  type:
    | "booking_new"
    | "booking_confirmed"
    | "booking_cancelled"
    | "booking_contacted"
    | "user_signup"
    | "message_new";
  at: string; // ISO date
  title: string;
  subtitle?: string;
  meta?: Record<string, any>;
};

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "30"), 100);

  // Fetch all source data in parallel
  const [
    { data: bookings },
    { data: users },
    { data: messages },
  ] = await Promise.all([
    supabase
      .from("bookings")
      .select(
        "id, full_name, email, item_type, status, guests, created_at, preferred_date, tour_id, hotel_id, tours(name_en), hotels(name_en), transport_options(title_en)"
      )
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase
      .from("users")
      .select("id, name, email, image, role, created_at")
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase
      .from("contact_messages")
      .select("id, name, email, subject, is_read, created_at")
      .order("created_at", { ascending: false })
      .limit(limit),
  ]);

  const events: Event[] = [];

  (bookings ?? []).forEach((b: any) => {
    const itemName =
      b.tours?.name_en || b.hotels?.name_en || b.transport_options?.title_en || "—";
    const baseSubtitle = `${b.item_type} · ${itemName} · ${b.guests} guest${
      b.guests === 1 ? "" : "s"
    }`;
    let type: Event["type"] = "booking_new";
    if (b.status === "confirmed") type = "booking_confirmed";
    else if (b.status === "cancelled") type = "booking_cancelled";
    else if (b.status === "contacted") type = "booking_contacted";

    events.push({
      id: `b-${b.id}`,
      type,
      at: b.created_at,
      title: b.full_name,
      subtitle: baseSubtitle,
      meta: {
        booking_id: b.id,
        email: b.email,
        item_type: b.item_type,
        item_name: itemName,
        status: b.status,
        guests: b.guests,
        preferred_date: b.preferred_date,
      },
    });
  });

  (users ?? []).forEach((u: any) => {
    events.push({
      id: `u-${u.id}`,
      type: "user_signup",
      at: u.created_at,
      title: u.name || u.email,
      subtitle: `${u.email}${u.role === "admin" ? " · admin" : ""}`,
      meta: { user_id: u.id, email: u.email, image: u.image, role: u.role },
    });
  });

  (messages ?? []).forEach((m: any) => {
    events.push({
      id: `m-${m.id}`,
      type: "message_new",
      at: m.created_at,
      title: m.name,
      subtitle: m.subject || m.email,
      meta: { message_id: m.id, email: m.email, is_read: m.is_read },
    });
  });

  // Sort all by date desc and trim
  events.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  const trimmed = events.slice(0, limit);

  return NextResponse.json({
    events: trimmed,
    counts: {
      total: events.length,
      bookings: (bookings ?? []).length,
      users: (users ?? []).length,
      messages: (messages ?? []).length,
    },
  });
}
