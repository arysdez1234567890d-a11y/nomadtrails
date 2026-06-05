import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body?.name || "").trim();
    const email = String(body?.email || "").trim().toLowerCase();
    const subject = String(body?.subject || "").trim();
    const message = String(body?.message || "").trim();

    // Validation
    if (!name || name.length > 200) {
      return NextResponse.json({ error: "Name is required (max 200 chars)" }, { status: 400 });
    }
    if (!email || !email.includes("@") || email.length > 200) {
      return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
    }
    if (!message || message.length < 5) {
      return NextResponse.json({ error: "Message must be at least 5 characters" }, { status: 400 });
    }

    // Insert into contact_messages
    const { data, error } = await supabase
      .from("contact_messages")
      .insert({
        name,
        email,
        subject: subject || "No Subject",
        message,
        is_read: false,
      })
      .select("id")
      .single();

    if (error) {
      console.error("[messages API] Supabase insert failed:", error.message);
      return NextResponse.json({ error: "Failed to save message in database" }, { status: 500 });
    }

    return NextResponse.json({ success: true, messageId: data?.id });
  } catch (e: any) {
    console.error("[messages API] Unexpected error:", e?.message ?? e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
