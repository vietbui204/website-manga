import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || 'manga-images';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { manga, chapter, limit = 1000 } = req.query;
  if (!manga || !chapter) return res.status(400).json({ error: 'Missing manga or chapter query param' });

  const prefix = `${manga}/${chapter}`;

  try {
    if (!SUPABASE_URL || !ANON_KEY) {
      console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
      return res.status(500).json({ error: 'Server misconfiguration: Supabase URL/Anon key missing' });
    }
    // Use anon key with public bucket. Ensure your bucket has public read/list policy.
    const supabase = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });
    const { data, error } = await supabase.storage.from(BUCKET).list(prefix, { limit: Number(limit) });
    if (error) {
      console.error('storage.list error', error);
      return res.status(500).json({ error: error.message || 'storage list error' });
    }

    // With anon key and public bucket, always use public URLs
    const useSigned = false;
    const pages = await Promise.all((data || []).map(async (obj) => {
      const path = `${prefix}/${obj.name}`;
      if (!useSigned) {
        const pub = supabase.storage.from(BUCKET).getPublicUrl(path);
        return { name: obj.name, url: pub?.data?.publicUrl || '', size: obj.size };
      }
      try {
        const signed = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60);
        if (signed.error) {
          const pub = supabase.storage.from(BUCKET).getPublicUrl(path);
          return { name: obj.name, url: pub?.data?.publicUrl || '', size: obj.size };
        }
        return { name: obj.name, url: signed.data?.signedUrl || '', size: obj.size };
      } catch (e) {
        const pub = supabase.storage.from(BUCKET).getPublicUrl(path);
        return { name: obj.name, url: pub?.data?.publicUrl || '', size: obj.size };
      }
    }));

    // sort by name (so pages like 01.jpg, 02.jpg are in order)
    pages.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.status(200).json({ bucket: BUCKET, path: prefix, pages });
  } catch (err) {
    console.error('API storage list failed', err);
    return res.status(500).json({ error: err.message || 'internal error' });
  }
}
