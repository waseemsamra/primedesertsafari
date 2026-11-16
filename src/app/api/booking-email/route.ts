import { NextResponse } from "next/server";
import { sendBookingAdminEmail, sendBookingStatusEmail, type BookingEmailData } from "@/lib/email";

export async function POST(req: Request) {
  let body: { kind?: string; booking?: BookingEmailData };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400 });
  }
  const { kind, booking } = body;
  if (!booking) {
    return NextResponse.json({ ok: false, error: "booking is required" }, { status: 400 });
  }
  const result =
    kind === "status"
      ? await sendBookingStatusEmail(booking)
      : await sendBookingAdminEmail(booking);
  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}