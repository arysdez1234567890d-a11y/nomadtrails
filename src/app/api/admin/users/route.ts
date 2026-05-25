import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  return null;
}

export async function GET() {
  const guard = await requireAdmin();
  if (guard) return guard;

  // Get all users with their booking count
  const { data: users, error } = await supabase
    .from("users")
    .select("id, name, email, image, role, phone, created_at")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Booking counts per user
  const { data: bookings } = await supabase
    .from("bookings")
    .select("user_id");
  const counts: Record<string, number> = {};
  (bookings ?? []).forEach((b: any) => {
    if (b.user_id) counts[b.user_id] = (counts[b.user_id] ?? 0) + 1;
  });

  const enriched = (users ?? []).map((u: any) => ({
    ...u,
    bookings_count: counts[u.id] ?? 0,
  }));

  return NextResponse.json(enriched);
}

export async function PATCH(req: Request) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const { userId, role } = await req.json();
  if (!userId || !["user", "admin"].includes(role)) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { error } = await supabase.from("users").update({ role }).eq("id", userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const guard = await requireAdmin();
  if (guard) return guard;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await supabase.from("users").delete().eq("id", id);
  return NextResponse.json({ success: true });
}
