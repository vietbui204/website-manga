import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = process.env.SUPABASE_BUCKET || process.env.NEXT_PUBLIC_SUPABASE_BUCKET || 'manga-images';

let adminClient = null;

function getAdminClient() {
  if (!SUPABASE_URL || !SERVICE_KEY) return null;
  if (!adminClient) {
    adminClient = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
  }
  return adminClient;
}

function chapterNumberFromSlug(slug) {
  if (!slug) return null;
  const match = slug.match(/(\d+)/);
  return match ? Number(match[1]) : null;
}

export async function getChapterPages({ mangaSlug, chapterSlug }) {
  const supabase = getAdminClient();
  if (!supabase) throw new Error('Supabase admin client unavailable (check SUPABASE_SERVICE_ROLE_KEY).');
  if (!mangaSlug || !chapterSlug) throw new Error('Missing mangaSlug hoặc chapterSlug');

  const { data: manga, error: mangaError } = await supabase
    .from('mangas')
    .select('id')
    .eq('slug', mangaSlug)
    .maybeSingle();
  if (mangaError) throw new Error(`Query manga thất bại: ${mangaError.message}`);
  if (!manga) throw new Error(`Không tìm thấy manga slug=${mangaSlug}`);

  const chapterNumber = chapterNumberFromSlug(chapterSlug);
  if (!chapterNumber) throw new Error(`Không thể suy ra chapter_number từ slug=${chapterSlug}`);

  const { data: chapter, error: chapterError } = await supabase
    .from('chapters')
    .select('id')
    .eq('manga_id', manga.id)
    .eq('chapter_number', chapterNumber)
    .maybeSingle();
  if (chapterError) throw new Error(`Query chapter thất bại: ${chapterError.message}`);
  if (!chapter) throw new Error(`Không tìm thấy chapter #${chapterNumber} cho manga ${mangaSlug}`);

  const { data: pageRows, error: pagesError } = await supabase
    .from('pages')
    .select('id,image_url,page_order')
    .eq('chapter_id', chapter.id)
    .order('page_order', { ascending: true });
  if (pagesError) throw new Error(`Query pages thất bại: ${pagesError.message}`);

  const storage = supabase.storage.from(BUCKET);
  const pages = (pageRows || []).map((row) => {
    const path = row.image_url;
    const publicUrl = storage.getPublicUrl(path).data?.publicUrl || '';
    return {
      id: row.id,
      path,
      pageOrder: row.page_order,
      url: publicUrl,
    };
  });

  return {
    bucket: BUCKET,
    chapterId: chapter.id,
    pages,
  };
}

