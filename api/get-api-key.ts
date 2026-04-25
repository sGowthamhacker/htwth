import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const apiKey = process.env.API_KEY || "AIzaSyBujCiuNzlUvP1q561-I5TboqtCzJhZc3Y";

  if (!apiKey) {
    return res.status(500).json({ message: 'API key not configured on the server.' });
  }

  return res.status(200).json({ apiKey });
}
