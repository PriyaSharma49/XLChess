import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { Resend } from 'resend';

const NOTIFY_EMAIL = 'ps4340179@gmail.com';
const FROM_EMAIL = 'XLCHESS <onboarding@resend.dev>';

function esc(s) {
  return String(s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

async function sendContactEmail({ email, message }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { skipped: true };
  const resend = new Resend(apiKey);
  const subject = `New XLCHESS contact from ${email}`;
  const html = `
    <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:auto;background:#0f1330;color:#fff;padding:32px;border-radius:16px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px">
        <div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#8b5cf6,#6d28d9);display:inline-block"></div>
        <h1 style="margin:0;font-size:20px;letter-spacing:1px">XLCHESS &mdash; New Contact</h1>
      </div>
      <p style="color:#c4b5fd;font-size:12px;text-transform:uppercase;letter-spacing:2px;margin:0 0 4px">From</p>
      <p style="margin:0 0 20px;font-size:16px;font-weight:600">${esc(email)}</p>
      <p style="color:#c4b5fd;font-size:12px;text-transform:uppercase;letter-spacing:2px;margin:0 0 4px">Message</p>
      <div style="background:#1a1f45;border:1px solid #2a2f5f;border-radius:12px;padding:16px;white-space:pre-wrap;line-height:1.55;font-size:15px;color:#e5e7ff">${esc(message)}</div>
      <p style="color:#7d8bcf;font-size:12px;margin-top:24px">Reply directly to this email to respond to the sender.</p>
    </div>`;
  return await resend.emails.send({
    from: FROM_EMAIL,
    to: [NOTIFY_EMAIL],
    replyTo: email,
    subject,
    html,
    text: `New contact from ${email}\n\n${message}`,
  });
}

function genCode() {
  const alpha = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 6; i++) s += alpha[Math.floor(Math.random() * alpha.length)];
  return s;
}

export async function GET(request, ctx) {
  const params = await ctx.params;
  const parts = (params?.path || []);
  try {
    if (parts[0] === 'games' && parts[1]) {
      const db = await getDb();
      const doc = await db.collection('games').findOne({ code: parts[1].toUpperCase() });
      if (!doc) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
      return NextResponse.json({ ok: true, game: { code: doc.code, pgn: doc.pgn, fen: doc.fen, mode: doc.mode, difficulty: doc.difficulty, updatedAt: doc.updatedAt } });
    }
    return NextResponse.json({ ok: true, service: 'regal-chess' });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}

export async function POST(request, ctx) {
  const params = await ctx.params;
  const parts = (params?.path || []);
  try {
    if (parts[0] === 'games') {
      const body = await request.json();
      const db = await getDb();
      const code = genCode();
      const doc = {
        _id: uuidv4(), code,
        pgn: body.pgn || '', fen: body.fen || '',
        mode: body.mode || 'ai', difficulty: body.difficulty || 'intermediate',
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      };
      await db.collection('games').insertOne(doc);
      return NextResponse.json({ ok: true, code });
    }
    if (parts[0] === 'contact') {
      const body = await request.json();
      if (!body?.email || !body?.message) {
        return NextResponse.json({ ok: false, error: 'Email and message are required' }, { status: 400 });
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
        return NextResponse.json({ ok: false, error: 'Invalid email' }, { status: 400 });
      }
      const db = await getDb();
      const doc = {
        _id: uuidv4(),
        email: String(body.email).slice(0, 200),
        name: String(body.name || '').slice(0, 120),
        message: String(body.message).slice(0, 5000),
        createdAt: new Date().toISOString(),
      };
      await db.collection('contacts').insertOne(doc);
      // Fire-and-notify email; log if it fails but don't fail the API
      let emailStatus = 'skipped';
      try {
        const res = await sendContactEmail({ email: doc.email, message: doc.message });
        if (res?.error) emailStatus = 'error:' + (res.error.message || 'unknown');
        else if (res?.data?.id) emailStatus = 'sent:' + res.data.id;
        else if (res?.skipped) emailStatus = 'skipped';
        else emailStatus = 'sent';
      } catch (e) {
        emailStatus = 'error:' + e.message;
      }
      return NextResponse.json({ ok: true, emailStatus });
    }
    return NextResponse.json({ ok: false, error: 'Unknown route' }, { status: 404 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
