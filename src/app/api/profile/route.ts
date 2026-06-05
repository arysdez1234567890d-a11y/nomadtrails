import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { name, phone, image } = await req.json();
    const updateData: any = { name, phone };
    if (image !== undefined) {
      updateData.image = image;
    }
    await supabase.from('users').update(updateData).eq('email', session.user.email);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
