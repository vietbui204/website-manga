import Link from 'next/link';
import Image from 'next/image';

export default function MangaCard({ manga }){
  if(!manga) return null;
  const cover = manga.coverUrl || '';
  const avatar = manga.avatarUrl || manga.coverUrl || '';
  const totalChapters = Array.isArray(manga.chapters) ? manga.chapters.length : (manga.totalChapters || 0);
  const totalViews = Number(manga.views || manga.viewCount || 0);
  const totalLikes = Number(manga.likes || manga.likeCount || 0);
  const totalComments = Number(manga.comments || manga.commentsCount || 0);

  const formatNumber = (n)=>{
    if(n >= 1_000_000) return (n/1_000_000).toFixed(1).replace(/\.0$/,'') + 'M';
    if(n >= 1_000) return (n/1_000).toFixed(1).replace(/\.0$/,'') + 'k';
    return String(n);
  };
  return (
    <article className="manga-card card transition hover:shadow-md">
      <div className="relative">
        {cover && (
          <Image
            src={cover}
            alt={`${manga.title} cover`}
            width={600}
            height={900}
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 20vw, 240px"
            className="h-auto w-full object-cover"
            priority={false}
          />
        )}
        {avatar && (
          <div className="manga-avatar absolute left-2 top-2 overflow-hidden rounded-full ring-2 ring-white shadow">
            <Image src={avatar} alt={`${manga.title} avatar`} width={36} height={36} sizes="36px" />
          </div>
        )}
        <div className="manga-stats-overlay absolute bottom-2 left-2 flex gap-2 rounded-md bg-black/55 px-2 py-1 text-[11px] text-white">
          <span title="Lượt xem">👁️ {formatNumber(totalViews)}</span>
          <span title="Bình luận">💬 {formatNumber(totalComments)}</span>
          <span title="Lượt thích">❤️ {formatNumber(totalLikes)}</span>
        </div>
      </div>
      <div className="card-body">
        <Link href={`/m/${manga.slug}`} className="manga-title line-clamp-2 font-semibold text-gray-900 hover:text-brand">
          {manga.title}
        </Link>
        {manga.author && <p className="manga-author mt-1 text-sm text-gray-600">{manga.author}</p>}
        <div className="manga-meta mt-2 text-xs text-gray-500">
          <span className="chapters-count">{totalChapters} chương</span>
        </div>
      </div>
    </article>
  );
}
