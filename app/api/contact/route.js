import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const { email, message } = await req.json();

    // Validation
    if (!email || !message) {
      return Response.json(
        { ok: false, error: "Email and message are required." },
        { status: 400 }
      );
    }

    await resend.emails.send({
      from: "XLCHESS <onboarding@resend.dev>", // Change after verifying your domain
      to: process.env.CONTACT_EMAIL,
      replyTo: email,
      subject: `New XLCHESS Contact from ${email}`,
      html: `
        <div style="font-family:Arial,sans-serif;padding:20px">
          <h2>📩 New Contact Form Submission</h2>

          <p><strong>From:</strong> ${email}</p>

          <h3>Message</h3>

          <div style="
            background:#f5f5f5;
            padding:15px;
            border-radius:8px;
            white-space:pre-wrap;
          ">
            ${message}
          </div>

          <hr style="margin:30px 0"/>

          <p style="color:#666">
            Sent from the XLCHESS website contact form.
          </p>
        </div>
      `,
    });

    return Response.json({ ok: true });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        ok: false,
        error: "Failed to send email.",
      },
      {
        status: 500,
      }
    );
  }
}