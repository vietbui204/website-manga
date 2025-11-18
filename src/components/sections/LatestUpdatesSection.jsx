import { useState, useEffect } from 'react';
import MangaList from '../manga/MangaList';

export default function LatestUpdatesSection({ mangas = [], perPage = 12 }){
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(1);

  useEffect(()=>{
    async function load(){
      try{
        const res = await fetch(`/api/manga?page=${page}&perPage=${perPage}`);
        if(res.ok){
          const body = await res.json();
          if(body && body.items){
            setItems(body.items);
            // if fallback provided, estimate total
            if(body.total) setTotal(Math.ceil(body.total/perPage));
            else setTotal(Math.max(1, Math.ceil((mangas.length||0)/perPage)));
            return;
          }
        }
      }catch(e){
        console.warn('LatestUpdatesSection fetch failed', e.message);
      }
      // fallback to passed mangas prop
      setItems(mangas.slice((page-1)*perPage, page*perPage));
      setTotal(Math.max(1, Math.ceil((mangas.length||0)/perPage)));
    }
    load();
  },[page, perPage]);

  return (
    <section className="latest-updates mt-10">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Mới cập nhật</h2>
      </div>
      <MangaList mangas={items} />
      <div className="pagination mt-6 flex items-center justify-center gap-3">
        <button className="btn" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}>Prev</button>
        <span className="text-sm text-gray-600"> {page} / {total} </span>
        <button className="btn" onClick={()=>setPage(p=>Math.min(total,p+1))} disabled={page===total}>Next</button>
      </div>
    </section>
  );
}
