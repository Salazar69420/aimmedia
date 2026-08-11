/**
 * AIM Media — Booking funnel intake
 * Receives the /book form submission and appends a row to Airtable so
 * leads can be pulled and visualized later. Vercel serverless function
 * (zero-config: any file under /api is auto-deployed as a Function).
 */

const MAX_LEN = 500;

function clean(value) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, MAX_LEN);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};
  const name = clean(body.name);
  const phone = clean(body.phone);
  const email = clean(body.email);

  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone are required' });
  }

  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const table = process.env.AIRTABLE_TABLE_NAME || 'Bookings';

  if (!token || !baseId) {
    console.error('Airtable is not configured (missing AIRTABLE_TOKEN / AIRTABLE_BASE_ID)');
    return res.status(500).json({ error: 'Server not configured' });
  }

  const slots = Array.isArray(body.slots) ? body.slots.slice(0, 2).map(clean).filter(Boolean) : [];

  const fields = {
    Name: name,
    Phone: phone,
    Email: email,
    Business: clean(body.business),
    Interest: clean(body.interest),
    Industry: clean(body.industry),
    'Pain Point': clean(body.pain),
    'Weekly Volume': clean(body.volume),
    Timeline: clean(body.timeline),
    'Preferred Slots': slots.join(', '),
    Notes: clean(body.notes),
    Source: clean(body.source) || 'book',
  };

  try {
    const airtableRes = await fetch(
      `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fields }),
      }
    );

    if (!airtableRes.ok) {
      const text = await airtableRes.text();
      console.error('Airtable rejected the submission:', text);
      return res.status(502).json({ error: 'Could not save submission' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Airtable request failed:', err);
    return res.status(500).json({ error: 'Unexpected error' });
  }
}
