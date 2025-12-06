import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = SERVICE_KEY ? createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } }) : null;

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  const limit = Math.max(1, Number(req.query.limit) || 12);
  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('mangas')
        .select('id,slug,title,author,cover_url,views,follows,comments,chapters_count,created_at, manga_genres(genres(name, slug))')
        .order('views', { ascending: false })
        .limit(limit);
      if (!error && data) return res.status(200).json({ items: data });
    } catch (e) {
      console.error('supabase top query failed', e.message);
    }
  }

  // fallback
  try {
    const dataPath = path.join(process.cwd(), 'data', 'manga.json');
    const raw = fs.readFileSync(dataPath, 'utf8');
    const list = JSON.parse(raw || '[]');
    // assume local list has no views: just return first items
    return res.status(200).json({ items: list.slice(0, limit), fallback: true });
  } catch (e) {
    console.error('fallback top read failed', e.message);
    return res.status(500).json({ error: 'no data' });
  }
}
