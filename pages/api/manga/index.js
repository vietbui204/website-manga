import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = SERVICE_KEY ? createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } }) : null;

export default async function handler(req, res){
  if(req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const page = Math.max(1, Number(req.query.page) || 1);
  const perPage = Math.max(1, Number(req.query.perPage) || 12);
  const start = (page - 1) * perPage;
  const end = start + perPage - 1;

  // Cache short to reduce load
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');

  // Try Supabase Postgres first
  if(supabaseAdmin){
    try{
      const { data, error, count } = await supabaseAdmin
        .from('mangas')
        .select('*', { count: 'exact' })
        .order('updated_at', { ascending: false })
        .range(start, end);
      if(error) {
        console.error('supabase select error', error);
      } else if(data && data.length >= 0) {
        return res.status(200).json({ page, perPage, items: data, total: count ?? undefined });
      }
    }catch(e){
      console.error('supabase query failed', e.message);
    }
  }

  // Fallback to local data file
  try{
    const dataPath = path.join(process.cwd(),'data','manga.json');
    const raw = fs.readFileSync(dataPath,'utf8');
    const list = JSON.parse(raw || '[]');
    const items = list.slice(start, start+perPage);
    return res.status(200).json({ page, perPage, items, total: list.length, fallback: true });
  }catch(e){
    console.error('fallback read failed', e.message);
    return res.status(500).json({ error: 'no data available' });
  }
}
