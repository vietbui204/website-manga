export default function MangaImage({ src, alt, className }){
  return <img src={src} alt={alt} className={className || 'manga-img'} loading="lazy" />;
}
