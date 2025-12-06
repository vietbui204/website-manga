/**
 * sync-pages.js
 *
 * Đọc dữ liệu từ data/manga.json để:
 * 1. Đảm bảo truyện (mangas) và chương (chapters) tồn tại trong Postgres.
 * 2. Làm mới bảng pages cho từng chapter bằng đường dẫn khớp với Supabase Storage.
 *
 * Yêu cầu env:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY (key service role để ghi Postgres)
 * - SUPABASE_BUCKET (tùy chọn, mặc định 'manga-images')
 *
 * Chạy: `node scripts/sync-pages.js`
 */

require('dotenv').config({ path: '.env.local' });

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const DATA_FILE = path.join(__dirname, '..', 'data', 'manga.json');
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = process.env.SUPABASE_BUCKET || process.env.NEXT_PUBLIC_SUPABASE_BUCKET || 'manga-images';

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Cần NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY trong biến môi trường.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

function parseJSONFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error('Không tìm thấy file dữ liệu:', filePath);
    process.exit(1);
  }
  const raw = fs.readFileSync(filePath, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error('Không thể parse JSON:', err.message);
    process.exit(1);
  }
}

function toChapterNumber(slug, fallbackIndex) {
  const match = slug && slug.match(/(\d+)/);
  if (match) return Number(match[1]);
  return fallbackIndex + 1;
}

async function ensureManga(manga) {
  const { data: existing, error } = await supabase
    .from('mangas')
    .select('id')
    .eq('slug', manga.slug)
    .maybeSingle();
  if (error) {
    throw new Error(`Không thể tìm manga slug=${manga.slug}: ${error.message}`);
  }
  if (existing) return existing.id;

  const payload = {
    slug: manga.slug,
    title: manga.title,
    author: manga.author || null,
    description: manga.description || '',
    cover_url: manga.coverUrl || manga.cover_url || null,
  };
  const { data: created, error: insertErr } = await supabase
    .from('mangas')
    .insert(payload)
    .select('id')
    .single();
  if (insertErr) {
    throw new Error(`Không thể tạo manga ${manga.slug}: ${insertErr.message}`);
  }
  return created.id;
}

async function ensureChapter(mangaId, mangaSlug, chapter, index) {
  const chapterNumber = toChapterNumber(chapter.slug || '', index);
  const { data: existing, error } = await supabase
    .from('chapters')
    .select('id, slug')
    .eq('manga_id', mangaId)
    .eq('chapter_number', chapterNumber)
    .maybeSingle();
  if (error) {
    throw new Error(`Query chapter ${mangaSlug}#${chapterNumber} lỗi: ${error.message}`);
  }
  if (existing) {
    if (!existing.slug && chapter.slug) {
      await supabase.from('chapters').update({ slug: chapter.slug }).eq('id', existing.id);
    }
    return { id: existing.id, chapterNumber };
  }

  const payload = {
    manga_id: mangaId,
    chapter_number: chapterNumber,
    title: chapter.title || `Chapter ${chapterNumber}`,
    slug: chapter.slug,
  };
  const { data: created, error: insertErr } = await supabase
    .from('chapters')
    .insert(payload)
    .select('id')
    .single();
  if (insertErr) {
    throw new Error(`Không thể tạo chapter ${mangaSlug}#${chapterNumber}: ${insertErr.message}`);
  }
  return { id: created.id, chapterNumber };
}

async function replacePages(chapterId, mangaSlug, chapterSlug, pages = []) {
  await supabase.from('pages').delete().eq('chapter_id', chapterId);
  if (!pages.length) return;

  const sorted = [...pages].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const rows = sorted.map((fileName, idx) => ({
    chapter_id: chapterId,
    image_url: `${mangaSlug}/${chapterSlug}/${fileName}`,
    page_order: idx + 1,
  }));

  const chunkSize = 100;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const { error } = await supabase.from('pages').insert(chunk);
    if (error) {
      throw new Error(`Không thể chèn pages (chunk ${i / chunkSize}): ${error.message}`);
    }
  }
}

async function run() {
  const list = parseJSONFile(DATA_FILE);
  if (!Array.isArray(list) || list.length === 0) {
    console.warn('Không có manga trong data/manga.json');
    return;
  }

  for (const manga of list) {
    if (!manga.slug) {
      console.warn('Bỏ qua manga không có slug', manga);
      continue;
    }
    const mangaId = await ensureManga(manga);
    console.log(`✔ Manga ${manga.slug} (${mangaId})`);

    const chapters = Array.isArray(manga.chapters) ? manga.chapters : [];
    for (let i = 0; i < chapters.length; i++) {
      const chapter = chapters[i];
      if (!chapter || !chapter.slug) {
        console.warn('  ↳ Bỏ qua chapter thiếu slug', chapter);
        continue;
      }
      const { id: chapterId, chapterNumber } = await ensureChapter(mangaId, manga.slug, chapter, i);
      await replacePages(chapterId, manga.slug, chapter.slug, chapter.pages || []);
      console.log(`  ↳ Chapter ${chapter.slug} (#${chapterNumber}) => ${chapter.pages?.length || 0} trang`);
    }
  }

  console.log('\nHoàn tất đồng bộ pages ↔ storage paths (bucket:', BUCKET, ')');
  console.log('Đảm bảo đã chạy scripts/upload-images.js để upload file thật lên Storage.');
}

run().catch((err) => {
  console.error('Sync thất bại:', err);
  process.exit(1);
});

