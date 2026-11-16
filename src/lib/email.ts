export type BookingEmailData = {
  reference?: string | null;
  tour_title?: string | null;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  booking_date?: string | null;
  travelers?: string | null;
  package_option?: string | null;
  vehicle_option?: string | null;
  amount?: number | null;
  currency?: string | null;
  status?: string | null;
  notes?: string | null;
};

export async function sendEmail(args: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || "bookings@primedesertsafari.com";
  if (!key) return { ok: false, error: "RESEND_API_KEY not configured" };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: args.to,
        subject: args.subject,
        html: args.html,
        ...(args.text ? { text: args.text } : {}),
        ...(args.replyTo ? { reply_to: args.replyTo } : {}),
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      return { ok: false, error: err };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "email failed" };
  }
}

const money = (b: BookingEmailData) =>
  b.amount != null ? `${b.currency || "AED"} ${Number(b.amount).toLocaleString()}` : "On request";

const row = (label: string, value?: string | number | null) =>
  `<tr><td style="padding:6px 12px 6px 0;color:#64748b;font-size:14px;">${label}</td><td style="padding:6px 0;font-size:14px;color:#1e293b;font-weight:600;">${value ?? "—"}</td></tr>`;

function detailsTable(b: BookingEmailData): string {
  return `<table style="border-collapse:collapse;margin:16px 0;">
    ${row("Reference", b.reference)}
    ${row("Tour", b.tour_title)}
    ${row("Booking Date", b.booking_date)}
    ${row("Travelers", b.travelers)}
    ${row("Package", b.package_option)}
    ${row("Vehicle", b.vehicle_option)}
    ${row("Amount", money(b))}
    ${row("Status", b.status)}
  </table>`;
}

const shell = (inner: string) => `<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1e293b;">
  <div style="border-bottom:3px solid #f6a821;padding-bottom:12px;margin-bottom:20px;">
    <span style="font-size:20px;font-weight:700;">Prime Desert Safari</span>
  </div>
  ${inner}
  <div style="margin-top:28px;padding-top:16px;border-top:1px solid #e5e7eb;color:#94a3b8;font-size:12px;">
    Prime Desert Safari · bookings@primedesertsafari.com
  </div>
</div>`;

export async function sendBookingAdminEmail(b: BookingEmailData) {
  const to = process.env.RESEND_ADMIN_EMAIL || process.env.RESEND_FROM_EMAIL || "bookings@primedesertsafari.com";
  const subject = `New booking request${b.reference ? " — " + b.reference : ""}`;
  const customerLines = [
    b.full_name ? row("Customer", b.full_name) : "",
    b.email ? row("Email", b.email) : "",
    b.phone ? row("Phone", b.phone) : "",
  ].join("");
  const html = shell(`
    <h2 style="font-size:18px;margin:0 0 8px;">New booking request</h2>
    <p style="color:#64748b;margin:0;">A new booking was submitted and is <strong>Pending</strong>. Review it in Admin → Bookings.</p>
    ${detailsTable(b)}
    <table style="border-collapse:collapse;">${customerLines}</table>
    ${b.notes ? `<p style="color:#64748b;font-size:13px;margin-top:12px;"><strong>Notes:</strong> ${b.notes}</p>` : ""}
  `);
  return sendEmail({ to, subject, html, replyTo: b.email || undefined });
}

export async function sendBookingStatusEmail(b: BookingEmailData) {
  if (!b.email) return { ok: false, error: "no customer email" } as const;
  const status = b.status || "Pending";
  const subject = `Booking ${status}${b.reference ? " — " + b.reference : ""}`;
  const intro =
    status === "Confirmed"
      ? `<p style="color:#64748b;">Your booking is <strong style="color:#059669;">confirmed</strong>. Our team will contact you with the confirmation voucher shortly.</p>`
      : status === "Cancelled"
      ? `<p style="color:#64748b;">Your booking has been <strong style="color:#dc2626;">cancelled</strong>. Contact us if you have any questions.</p>`
      : `<p style="color:#64748b;">Your booking is <strong>Pending</strong>. Our team will contact you with the confirmation voucher shortly.</p>`;
  const html = shell(`
    <h2 style="font-size:18px;margin:0 0 8px;">Booking ${status}</h2>
    <p style="color:#64748b;margin:0;">Hi ${b.full_name || "there"},</p>
    <div style="margin:12px 0;">${intro}</div>
    ${detailsTable(b)}
  `);
  return sendEmail({ to: b.email, subject, html });
}