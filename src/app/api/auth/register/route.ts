import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");
    const name = String(body?.name || "").trim() || email.split("@")[0];

    // Validation
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }
    if (name.length < 1 || name.length > 100) {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }

    // Check duplicate
    const { data: existing, error: selectErr } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .limit(1);
    if (selectErr) {
      console.error("[register] select error:", selectErr.message);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create user
    const { data: created, error: insertErr } = await supabase
      .from("users")
      .insert({
        email,
        name,
        role: "user",
        password_hash,
        image: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=1a3d2b`,
      })
      .select("id, email, name, image")
      .single();

    if (insertErr || !created) {
      // Common case: password_hash column doesn't exist yet
      if (insertErr?.message?.includes("password_hash")) {
        return NextResponse.json(
          {
            error:
              "Database not ready. Run backend/setup-auth.sql in Supabase first.",
          },
          { status: 500 }
        );
      }
      console.error("[register] insert error:", insertErr?.message);
      return NextResponse.json(
        { error: insertErr?.message || "Failed to create account" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, user: created });
  } catch (e: any) {
    console.error("[register] unexpected:", e?.message ?? e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
