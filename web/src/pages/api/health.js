export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} not allowed`);
  }
  try {
    return res.status(200).json({ ok: true, uptime: process.uptime() });
  } catch {
    return res.status(500).json({ ok: false });
  }
}
