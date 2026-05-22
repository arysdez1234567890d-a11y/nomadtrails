import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const { data: rows } = await supabase
    .from('hotels')
    .select('*')
    .order('created_at', { ascending: false });
  return NextResponse.json(rows ?? []);
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const data = await req.json();
    const { data: result, error } = await supabase.from('hotels').insert({
      slug: data.slug,
      type: data.type,
      price_per_night: data.price_per_night,
      image_url: data.image_url,
      name_en: data.name_en,
      name_ru: data.name_ru,
      name_ky: data.name_ky,
      location_en: data.location_en,
      location_ru: data.location_ru,
      location_ky: data.location_ky,
    }).select().single();
    if (error) throw error;
    return NextResponse.json({ id: result.id });
  } catch (err) {
    return NextResponse.json({ error: "DB Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const session = await auth();
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  await supabase.from('hotels').delete().eq('id', id);
  return NextResponse.json({ success: true });
}
