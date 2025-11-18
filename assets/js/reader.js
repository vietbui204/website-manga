// Minimal reader.js - expects query params: m=<manga-slug>&c=<chapter-slug>
function qs(name){
  return new URLSearchParams(location.search).get(name);
}

async function loadManga(){
  const slug = qs('m');
  const chapter = qs('c');
  const titleEl = document.getElementById('mangaTitle');
  const pagesEl = document.getElementById('pages');
  try{
    const res = await fetch('data/manga.json');
    const list = await res.json();
    const manga = list.find(x=>x.slug===slug);
    if(!manga){ titleEl.textContent='Truyện không tìm thấy'; return; }
    titleEl.textContent = manga.title;
    const chap = (manga.chapters||[]).find(ch=>ch.slug===chapter) || (manga.chapters && manga.chapters[0]);
    if(!chap){ pagesEl.innerHTML='<p>Không có chương.</p>'; return; }
    // Build image URLs from convention: assets/images/<manga-slug>/<chapter-slug>/<n>.jpg
    const imgFolder = `assets/images/${manga.slug}/${chap.slug}/`;
    // If samplePages provided in data, use them; otherwise try 1..20
    const pages = chap.pages && chap.pages.length ? chap.pages : Array.from({length:20},(_,i)=>String(i+1).padStart(2,'0')+'.jpg');
    pagesEl.innerHTML = '';
    pages.forEach(src=>{
      const img = document.createElement('img');
      img.dataset.src = imgFolder + src;
      img.alt = `${manga.title} - ${chap.title}`;
      img.loading = 'lazy';
      // simple error handler
      img.onerror = ()=>{ img.style.opacity=0.6; img.alt='(Không tải được ảnh)'; };
      pagesEl.appendChild(img);
    });
    lazyLoadImages();
  }catch(e){
    pagesEl.innerHTML='<p>Lỗi khi tải dữ liệu.</p>';
  }
}

function lazyLoadImages(){
  const imgs = document.querySelectorAll('img[data-src]');
  if('IntersectionObserver' in window){
    const io = new IntersectionObserver((entries, obs)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          obs.unobserve(img);
        }
      });
    },{rootMargin:'200px'});
    imgs.forEach(i=>io.observe(i));
  }else{
    // fallback: load all
    imgs.forEach(i=>{ i.src = i.dataset.src; i.removeAttribute('data-src'); });
  }
}

document.getElementById && loadManga();

// Navigation handlers (basic)
document.addEventListener('click', e=>{
  if(e.target.id==='nextBtn') window.scrollBy({top: window.innerHeight, behavior:'smooth'});
  if(e.target.id==='prevBtn') window.scrollBy({top: -window.innerHeight, behavior:'smooth'});
});
document.addEventListener('keydown', e=>{
  if(e.key==='ArrowRight') window.scrollBy({top: window.innerHeight, behavior:'smooth'});
  if(e.key==='ArrowLeft') window.scrollBy({top: -window.innerHeight, behavior:'smooth'});
});
