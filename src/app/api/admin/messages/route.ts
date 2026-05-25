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
  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function PATCH(req: Request) {
  const guard = await requireAdmin();
  if (guard) return guard;
  const { id, is_read } = await req.json();
  await supabase.from("contact_messages").update({ is_read }).eq("id", id);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const guard = await requireAdmin();
  if (guard) return guard;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await supabase.from("contact_messages").delete().eq("id", id);
  return NextResponse.json({ success: true });
}
