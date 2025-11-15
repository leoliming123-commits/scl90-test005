import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, apikey, x-client-info, prefer');
    return res.status(200).end();
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return res.status(500).json({ error: 'Supabase configuration missing' });
  }

  try {
    const { path, method, headers: clientHeaders, body } = req.body || {};

    if (!path || typeof path !== 'string') {
      return res.status(400).json({ error: 'Path parameter is required' });
    }

    const targetUrl = `${SUPABASE_URL}${path}`;

    const requestHeaders: HeadersInit = {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    };

    if (clientHeaders && typeof clientHeaders === 'object') {
      Object.assign(requestHeaders, clientHeaders);
    }

    const requestMethod = method || 'GET';

    const fetchOptions: RequestInit = {
      method: requestMethod,
      headers: requestHeaders,
    };

    if (body && requestMethod !== 'GET' && requestMethod !== 'HEAD') {
      fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    const response = await fetch(targetUrl, fetchOptions);
    const data = await response.text();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json');

    const contentRange = response.headers.get('content-range');
    if (contentRange) {
      res.setHeader('Content-Range', contentRange);
    }

    return res.status(response.status).send(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({
      error: 'Proxy request failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
