import { useEffect, useState } from 'react';
import MangaList from '../manga/MangaList';

export default function TopMangaSection({ mangas = [] }){
  const [items, setItems] = useState(mangas.slice(0,6));

  useEffect(()=>{
    async function load(){
      try{
        const res = await fetch('/api/manga/top?limit=12');
        if(res.ok){
          const body = await res.json();
          if(body && body.items && body.items.length){
            setItems(body.items.slice(0,6));
            return;
          }
        }
      }catch(e){
        console.warn('TopMangaSection fetch failed', e.message);
      }
    }
    load();
  },[]);

  return (
    <section className="top-manga mt-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Top truyện</h2>
        <a href="#" className="text-sm text-brand hover:text-brand-dark">Xem tất cả</a>
      </div>
      <MangaList mangas={items} />
    </section>
  );
}
