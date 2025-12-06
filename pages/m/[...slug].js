import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../../src/components/UI/Navbar';
import Container from '../../src/components/UI/Container';
import MangaImage from '../../src/components/UI/MangaImage';
import Loader from '../../src/components/UI/Loader';
import { supabase } from '../../lib/supabaseClient';
import Link from 'next/link';

export default function CatchAllReader() {
  const router = useRouter();
  // slug[0] = manga, slug[1] = chapter
  const slug = router.query.slug || [];
  const mangaSlug = Array.isArray(slug) && slug.length > 0 ? slug[0] : null;
  const chapterSlug = Array.isArray(slug) && slug.length > 1 ? slug[1] : null;

  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sourceLabel, setSourceLabel] = useState('');

  // Navigation & Meta Data
  const [chapters, setChapters] = useState([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(-1);
  const [mangaId, setMangaId] = useState(null);
  const [mangaTitle, setMangaTitle] = useState('');

  // User Actions
  const [user, setUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (!router.isReady || !mangaSlug || !chapterSlug) return;

    // 1. Fetch Pages
    fetchPages();

    // 2. Fetch Manga Info (Chapters, Title, ID) for Navigation/Follow
    fetchMangaInfo();

    // 3. User Session
    checkUser();

  }, [router.isReady, mangaSlug, chapterSlug]);


  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
    if (session?.user && mangaId) {
      checkFollow(session.user.id, mangaId);
    }
  }

  // Refetch follow status when mangaId or user changes
  useEffect(() => {
    if (user && mangaId) {
      checkFollow(user.id, mangaId);
    }
  }, [user, mangaId]);

  async function checkFollow(userId, mId) {
    const { data } = await supabase
      .from('follows')
      .select('user_id')
      .eq('user_id', userId)
      .eq('manga_id', mId)
      .maybeSingle();
    setIsFollowing(!!data);
  }

  async function handleFollow() {
    if (!user) {
      alert('Vui lòng đăng nhập để theo dõi.');
      return;
    }
    if (!mangaId) return;

    if (isFollowing) {
      const { error } = await supabase.from('follows').delete().eq('user_id', user.id).eq('manga_id', mangaId);
      if (!error) setIsFollowing(false);
    } else {
      const { error } = await supabase.from('follows').insert({ user_id: user.id, manga_id: mangaId });
      if (!error) setIsFollowing(true);
    }
  }

  async function fetchMangaInfo() {
    try {
      // Fetch manga by slug to get ID and Title
      const { data: manga, error } = await supabase
        .from('mangas')
        .select('id, title, chapters(slug, title, chapter_number)')
        .eq('slug', mangaSlug)
        .single();

      if (manga && !error) {
        setMangaId(manga.id);
        setMangaTitle(manga.title);

        // Sort chapters by order
        const sorted = (manga.chapters || []).sort((a, b) => a.chapter_number - b.chapter_number);
        setChapters(sorted);

        const idx = sorted.findIndex(c => c.slug === chapterSlug);
        setCurrentChapterIndex(idx);
      }
    } catch (err) {
      console.error('Error fetching manga info:', err);
    }
  }

  async function fetchPages() {
    setLoading(true);
    try {
      // Try DB/Storage
      const q = `/api/storage/list?manga=${encodeURIComponent(mangaSlug)}&chapter=${encodeURIComponent(chapterSlug)}`;
      const res = await fetch(q);
      if (res.ok) {
        const body = await res.json();
        if (body?.pages?.length) {
          setPages(body.pages.map(p => p.url));
          setSourceLabel(body.source === 'database' ? 'DB' : 'Storage');
          setLoading(false);
          return;
        }
      }

      // Fallback local
      console.warn('Fallback to local JSON');
      const res2 = await fetch('/data/manga.json');
      if (res2.ok) {
        const list = await res2.json();
        const mg = list.find(x => x.slug === mangaSlug);
        const ch = mg?.chapters?.find(c => c.slug === chapterSlug);
        if (ch?.pages?.length) {
          const sorted = [...ch.pages].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
          const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
          const bucket = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || 'manga-images';
          const urls = baseUrl
            ? sorted.map(p => `${baseUrl}/storage/v1/object/public/${bucket}/${mangaSlug}/${chapterSlug}/${p}`)
            : sorted.map(p => `/assets/images/${mangaSlug}/${chapterSlug}/${p}`);
          setPages(urls);
          setSourceLabel('Local Fallback');
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  function handleNavigate(slug) {
    if (slug) router.push(`/m/${mangaSlug}/${slug}`);
  }

  function handleReload() {
    router.reload();
  }

  // Buttons Logic
  const hasPrev = currentChapterIndex > 0;
  const hasNext = currentChapterIndex < chapters.length - 1;
  const prevChapter = hasPrev ? chapters[currentChapterIndex - 1] : null;
  const nextChapter = hasNext ? chapters[currentChapterIndex + 1] : null;

  return (
    <div className="flex min-h-screen flex-col bg-gray-900 text-gray-100">
      <Navbar />

      <div className="flex-1 pb-24 pt-4"> {/* Padding bottom for sticky bar */}
        <Container>
          <div className="mb-6 flex flex-col gap-2 border-b border-gray-800 pb-4 sm:flex-row sm:items-center sm:justify-center">
            <h1 className="text-center text-lg font-bold text-white sm:text-xl">
              <Link href={`/m/${mangaSlug}`} className="hover:text-purple-400 decoration-none">{mangaTitle}</Link>
              <span className="mx-2 text-gray-600">/</span>
              <span className="text-purple-400">{chapterSlug}</span>
            </h1>
            {sourceLabel && <span className="mx-auto block w-fit rounded bg-gray-800 px-2 py-0.5 text-xs text-gray-500 sm:mx-0">{sourceLabel}</span>}
          </div>

          {loading ? (
            <div className="py-20"><Loader /></div>
          ) : (
            <div className="mx-auto flex max-w-4xl flex-col gap-0 shadow-2xl">
              {pages.length > 0 ? (
                pages.map((p, i) => (
                  <MangaImage
                    key={`${p}-${i}`}
                    src={p}
                    alt={`Page ${i + 1}`}
                    className="w-full bg-gray-800"
                  />
                ))
              ) : (
                <div className="py-20 text-center text-gray-500">
                  <p>Không tải được ảnh chương này.</p>
                  <button onClick={() => window.location.reload()} className="mt-4 text-purple-400 underline">Thử lại</button>
                </div>
              )}
            </div>
          )}
        </Container>
      </div>

      {/* Sticky Control Bar */}
      <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full border border-gray-700 bg-gray-800/95 p-1.5 shadow-2xl backdrop-blur-md sm:gap-2 sm:p-2">
        {/* Home */}
        <Link
          href="/"
          className="rounded-full p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
          title="Trang chủ"
        >
          <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </Link>

        {/* Info / Back */}
        <Link
          href={`/m/${mangaSlug}`}
          className="rounded-full p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
          title="Thông tin truyện"
        >
          <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </Link>

        {/* Reload */}
        <button
          onClick={handleReload}
          className="rounded-full p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
          title="Tải lại"
        >
          <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-700 mx-1"></div>

        {/* Prev */}
        <button
          onClick={() => prevChapter && handleNavigate(prevChapter.slug)}
          disabled={!hasPrev}
          className={`rounded-full p-2 transition ${!hasPrev ? 'opacity-30 cursor-not-allowed text-gray-600' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}
          title="Chương trước"
        >
          <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>

        {/* Chapter Select */}
        <div className="relative max-w-[120px] sm:max-w-[200px]">
          <select
            className="w-full appearance-none rounded-md border border-gray-600 bg-gray-900 py-1.5 pl-3 pr-8 text-sm text-gray-200 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            value={chapterSlug || ''}
            onChange={(e) => handleNavigate(e.target.value)}
          >
            {chapters.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.slug}
              </option>
            ))}
            {!chapters.length && <option>{chapterSlug}</option>}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>

        {/* Next */}
        <button
          onClick={() => nextChapter && handleNavigate(nextChapter.slug)}
          disabled={!hasNext}
          className={`rounded-full p-2 transition ${!hasNext ? 'opacity-30 cursor-not-allowed text-gray-600' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}
          title="Chương sau"
        >
          <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>

        {/* FOLLOW Button */}
        <button
          onClick={handleFollow}
          className={`hidden sm:flex ml-1 items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-bold shadow-sm transition ${isFollowing
            ? 'bg-red-600 text-white hover:bg-red-700'
            : 'bg-white text-gray-900 hover:bg-gray-100'}`}
        >
          <svg className={`h-4 w-4 ${isFollowing ? 'fill-current' : 'fill-none stroke-current'}`} viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span>{isFollowing ? 'Huỷ' : 'Theo dõi'}</span>
        </button>
        {/* Mobile Follow Icon Only */}
        <button
          onClick={handleFollow}
          className={`flex sm:hidden rounded-full p-2 transition ${isFollowing ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
        >
          <svg className={`h-5 w-5 ${isFollowing ? 'fill-current' : 'fill-none stroke-current'}`} viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

      </div>
    </div>
  );
}
