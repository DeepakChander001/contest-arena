import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;
  const CIRCLE_API_KEY = process.env.CIRCLE_HEADLESS_API_KEY || process.env.VITE_CIRCLE_HEADLESS_API_KEY;

  if (!CIRCLE_API_KEY) {
    return res.status(200).json({ member: null });
  }

  try {
    const response = await fetch(
      `https://app.circle.so/api/v1/members?email=${encodeURIComponent(email)}`,
      {
        headers: {
          'Authorization': `Bearer ${CIRCLE_API_KEY}`,
          'Accept': 'application/json'
        }
      }
    );

    if (response.ok) {
      const data = await response.json();
      return res.status(200).json({ member: data });
    }
    
    return res.status(200).json({ member: null });
  } catch (error) {
    return res.status(200).json({ member: null });
  }
}

