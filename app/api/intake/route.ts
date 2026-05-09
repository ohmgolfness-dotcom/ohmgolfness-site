import { NextRequest, NextResponse } from "next/server";

interface IntakeData {
  fullName: string;
  email: string;
  phone?: string;
  leagueName?: string;
  playerCount?: string;
  course: string;
  frequency?: string;
  scoringFormat?: string;
  features?: string[];
  migration?: string;
  notes?: string;
}

function summaryHtml(data: IntakeData): string {
  const row = (label: string, value: string | undefined) =>
    value
      ? `<tr><td style="padding:6px 12px 6px 0;font-weight:600;color:#1A3D2B;vertical-align:top;white-space:nowrap">${label}</td><td style="padding:6px 0;color:#333">${value}</td></tr>`
      : "";

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;background:#fff">
  <div style="background:#1A3D2B;border-radius:12px;padding:24px 32px;margin-bottom:32px">
    <span style="font-size:22px;font-weight:900;color:#C9A84C">OHM</span><span style="font-size:22px;font-weight:700;color:#fff">Golfness</span>
    <p style="color:#fff;margin:8px 0 0;font-size:15px">New League Intake Submission</p>
  </div>
  <table style="width:100%;border-collapse:collapse">
    ${row("Full Name", data.fullName)}
    ${row("Email", data.email)}
    ${row("Phone", data.phone)}
    ${row("League Name", data.leagueName)}
    ${row("Players", data.playerCount)}
    ${row("Course / City", data.course)}
    ${row("Frequency", data.frequency)}
    ${row("Scoring Format", data.scoringFormat)}
    ${row("Features", data.features?.join(", "))}
    ${row("Migration", data.migration)}
    ${row("Notes", data.notes)}
  </table>
</body>
</html>`;
}

function confirmationHtml(name: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;background:#fff">
  <div style="background:#1A3D2B;border-radius:12px;padding:24px 32px;margin-bottom:32px">
    <span style="font-size:22px;font-weight:900;color:#C9A84C">OHM</span><span style="font-size:22px;font-weight:700;color:#fff">Golfness</span>
  </div>
  <h2 style="color:#1A3D2B;margin:0 0 12px">Hi ${name.split(" ")[0]}, we got your request!</h2>
  <p style="color:#444;line-height:1.6">
    Thanks for your interest in OHMGolfness. We received your league intake form and will be in touch within <strong>24 hours</strong>.
  </p>
  <p style="color:#444;line-height:1.6">
    In the meantime, check out the live demo at <a href="https://bushwackersgolf.com" style="color:#2D6A4F">bushwackersgolf.com</a> to see OHMGolfness in action.
  </p>
  <p style="color:#888;font-size:13px;margin-top:32px">— The OHMGolfness Team</p>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  const data: IntakeData = await req.json();

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey || apiKey === "your_key_here") {
    console.log("[intake] RESEND_API_KEY not set — logging submission:", data);
    return NextResponse.json({ ok: true, mode: "log-only" });
  }

  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);

  const [adminEmail, confirmEmail] = await Promise.all([
    resend.emails.send({
      from: "OHMGolfness <hello@ohmgolfness.com>",
      to: ["hello@ohmgolfness.com"],
      subject: `New league intake: ${data.leagueName || data.fullName}`,
      html: summaryHtml(data),
    }),
    resend.emails.send({
      from: "OHMGolfness <hello@ohmgolfness.com>",
      to: [data.email],
      subject: "We received your OHMGolfness request",
      html: confirmationHtml(data.fullName),
    }),
  ]);

  if (adminEmail.error || confirmEmail.error) {
    console.error("[intake] Resend error:", adminEmail.error ?? confirmEmail.error);
    return NextResponse.json({ ok: false, error: "Email send failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
