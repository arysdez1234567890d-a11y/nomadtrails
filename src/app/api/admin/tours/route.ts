import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const { data: rows } = await supabase
    .from('tours')
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
    const { data: result, error } = await supabase.from('tours').insert({
      slug: data.slug,
      duration_days: data.duration_days,
      price_usd: data.price_usd,
      difficulty: data.difficulty,
      image_url: data.image_url,
      name_en: data.name_en,
      name_ru: data.name_ru,
      name_ky: data.name_ky,
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
  await supabase.from('tours').delete().eq('id', id);
  return NextResponse.json({ success: true });
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const data = await req.json();
    const { id, ...updateData } = data;
    if (!id) {
      return NextResponse.json({ error: "Missing tour ID" }, { status: 400 });
    }
    const { error } = await supabase.from('tours').update({
      slug: updateData.slug,
      duration_days: Number(updateData.duration_days),
      price_usd: Number(updateData.price_usd),
      difficulty: updateData.difficulty,
      image_url: updateData.image_url,
      name_en: updateData.name_en,
      name_ru: updateData.name_ru,
      name_ky: updateData.name_ky,
      active: updateData.active,
    }).eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[tours PATCH] Error:", err?.message || err);
    return NextResponse.json({ error: "DB Error" }, { status: 500 });
  }
}
