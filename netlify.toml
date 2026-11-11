// Optional email notification. Configure RESEND_API_KEY, CONTACT_NOTIFY_TO,
// and CONTACT_FROM_EMAIL in Netlify environment variables.
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' };
  const { RESEND_API_KEY, CONTACT_NOTIFY_TO, CONTACT_FROM_EMAIL } = process.env;
  if (!RESEND_API_KEY || !CONTACT_NOTIFY_TO || !CONTACT_FROM_EMAIL) {
    return { statusCode: 200, body: JSON.stringify({ sent: false, reason: 'Email notification is not configured.' }) };
  }
  let data;
  try { data = JSON.parse(event.body || '{}'); } catch { return { statusCode: 400, body: 'Invalid JSON' }; }
  const name = String(data.name || '').slice(0, 80);
  const email = String(data.email || '').slice(0, 160);
  const subject = String(data.subject || '').slice(0, 120);
  const message = String(data.message || '').slice(0, 3000);
  if (!name || !email.includes('@') || !subject || !message) return { statusCode: 400, body: 'Invalid message' };
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: CONTACT_FROM_EMAIL,
      to: [CONTACT_NOTIFY_TO],
      subject: `Portfolio message: ${subject}`,
      reply_to: email,
      text: `New portfolio message\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`
    })
  });
  if (!response.ok) return { statusCode: 502, body: 'Email provider could not send notification.' };
  return { statusCode: 200, body: JSON.stringify({ sent: true }) };
};
