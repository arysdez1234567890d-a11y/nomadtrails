import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

// Public GET route to fetch testimonials
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[reviews GET] Supabase fetch failed:", error.message);
      return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch (e: any) {
    console.error("[reviews GET] Unexpected error:", e?.message ?? e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Secured POST route to submit reviews
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "You must be signed in to submit a review." }, { status: 401 });
    }

    const body = await req.json();
    const rating = Number(body?.rating);
    const comment = String(body?.comment || "").trim();

    // Validation
    if (isNaN(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be a number between 1 and 5." }, { status: 400 });
    }
    if (!comment || comment.length < 5) {
      return NextResponse.json({ error: "Review comment must be at least 5 characters long." }, { status: 400 });
    }
    if (comment.length > 1000) {
      return NextResponse.json({ error: "Review comment cannot exceed 1000 characters." }, { status: 400 });
    }

    // Insert into Supabase reviews table
    const { data: inserted, error: insertErr } = await supabase
      .from("reviews")
      .insert({
        user_id: session.user.id ? Number(session.user.id) : null,
        name: session.user.name || "Traveler",
        avatar: session.user.image || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(session.user.name || "T")}&backgroundColor=1a3d2b`,
        rating,
        comment,
      })
      .select("*")
      .single();

    if (insertErr) {
      console.error("[reviews POST] Supabase insert failed:", insertErr.message);
      return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
    }

    return NextResponse.json({ success: true, review: inserted });
  } catch (e: any) {
    console.error("[reviews POST] Unexpected error:", e?.message ?? e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Secured DELETE route to delete a review
export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const reviewId = searchParams.get("id");

    if (!reviewId) {
      return NextResponse.json({ error: "Review ID required" }, { status: 400 });
    }

    // Check that review belongs to user
    const { data: review, error: getErr } = await supabase
      .from("reviews")
      .select("user_id")
      .eq("id", Number(reviewId))
      .limit(1);

    if (getErr || !review || review.length === 0) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    if (Number(review[0].user_id) !== Number(session.user.id)) {
      return NextResponse.json({ error: "You can only delete your own reviews" }, { status: 403 });
    }

    const { error: delErr } = await supabase
      .from("reviews")
      .delete()
      .eq("id", Number(reviewId));

    if (delErr) {
      console.error("[reviews DELETE] error:", delErr.message);
      return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("[reviews DELETE] unexpected:", e?.message ?? e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
