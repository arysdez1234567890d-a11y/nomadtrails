import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const data = await req.json();

    const {
      item_type,
      tour_id,
      hotel_id,
      transport_id,
      full_name,
      email,
      phone,
      preferred_date,
      guests,
      special_requests,
    } = data;

    const { data: result, error } = await supabase.from('bookings').insert({
      user_id: session?.user ? (session.user as any).id : null,
      item_type: item_type || 'tour',
      tour_id: tour_id || null,
      hotel_id: hotel_id || null,
      transport_id: transport_id || null,
      full_name,
      email,
      phone,
      preferred_date,
      guests: guests || 1,
      special_requests: special_requests || '',
      status: 'new',
    }).select().single();

    if (error) throw error;
    return NextResponse.json({ success: true, bookingId: result.id });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
