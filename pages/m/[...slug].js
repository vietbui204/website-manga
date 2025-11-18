import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Header from '../../src/components/UI/Header';
import Container from '../../src/components/UI/Container';
import MangaImage from '../../src/components/UI/MangaImage';
import Loader from '../../src/components/UI/Loader';

export default function CatchAllReader(){
  const router = useRouter();
  const slug = router.query.slug || [];
  const manga = Array.isArray(slug) && slug.length > 0 ? slug[0] : null;
  const chapter = Array.isArray(slug) && slug.length > 1 ? slug[1] : null;
  const [pages, setPages] = useState([]);

  useEffect(()=>{
    if(!router.isReady || !manga || !chapter) return;
    async function load(){
      try{
        const q = `/api/storage/list?manga=${encodeURIComponent(manga)}&chapter=${encodeURIComponent(chapter)}`;
        const res = await fetch(q);
        if(res.ok){
          const body = await res.json();
          if(body && body.pages && body.pages.length){
            setPages(body.pages.map(p=>p.url));
            console.log('Loaded pages from server API', body.pages.length);
            return;
          }
        } else {
          console.warn('API storage/list returned', res.status, await res.text());
        }
      }catch(e){
        console.warn('API call /api/storage/list failed', e.message);
      }

      // fallback: try to read local data/manga.json for pages list
      try{
        const res2 = await fetch('/data/manga.json');
        if(res2.ok){
          const list = await res2.json();
          const mg = list.find(x=>x.slug===manga);
          const ch = mg && mg.chapters && mg.chapters.find(c=>c.slug===chapter);
          if(ch && ch.pages && ch.pages.length) {
            const sorted = [...ch.pages].sort((a,b)=> a.localeCompare(b, undefined, { numeric: true }));
            // fallback to local assets if no Supabase URL configured
            const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const bucket = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || 'manga-images';
            const urls = baseUrl
              ? sorted.map(p => `${baseUrl}/storage/v1/object/public/${bucket}/${manga}/${chapter}/${p}`)
              : sorted.map(p => `/assets/images/${manga}/${chapter}/${p}`);
            setPages(urls);
            console.log('Fallback to local data for pages', ch.pages.length);
            return;
          }
        }
      }catch(e){
        console.warn('Fallback read data/manga.json failed', e.message);
      }
    }
    load();
  },[router.isReady, manga, chapter]);

  return (
    <>
      <Header title="MangaSite" />
      <Container>
        <div className="reader-shell py-4">
          <div className="reader-header mb-4 flex items-center justify-between text-sm text-gray-600">
            <a href="/" className="hover:text-gray-900">← Về trang chủ</a>
            <div className="font-medium">{manga} - {chapter}</div>
          </div>
          <main className="reader">
            <div className="pages mx-auto flex max-w-4xl flex-col gap-3">
              {pages.length===0 && <Loader />}
              {pages.map((p, i)=> (
                <MangaImage key={`${p}-${i}`} src={p} alt={`page-${i+1}`} className="w-full rounded-md bg-white shadow" />
              ))}
            </div>
          </main>
        </div>
      </Container>
    </>
  );
}
