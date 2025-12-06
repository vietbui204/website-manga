import Link from 'next/link';
import Image from 'next/image';

export default function MangaCard({ manga, rank }) {
  if (!manga) return null;

  const cover = manga.coverUrl || manga.cover_url || '/placeholder.jpg'; // Add a fallback if needed
  const avatar = manga.avatarUrl || manga.coverUrl || '';
  const totalChapters = manga.chapters_count || (Array.isArray(manga.chapters) ? manga.chapters.length : (manga.totalChapters || 0));

  // Stats
  const totalFollows = Number(manga.follows || 0);
  const totalComments = Number(manga.comments || manga.commentsCount || 0);

  // Extract genres
  const genres = manga.manga_genres?.map(mg => mg.genres).filter(Boolean) || [];

  const formatNumber = (n) => {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
    return String(n);
  };

  return (
    <article className="group relative h-full overflow-hidden rounded-xl bg-gray-900 shadow-lg transition-all hover:shadow-2xl hover:-translate-y-1">
      {/* Cover Image Area */}
      <div className="relative aspect-[2/3] w-full overflow-hidden">
        {cover && (
          <Image
            src={cover}
            alt={`${manga.title} cover`}
            width={600}
            height={900}
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 220px"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
        )}

        {/* Dark Gradient Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Avatar positioned absolutely */}
        {avatar && (
          <div className="absolute top-2 left-2 h-10 w-10 overflow-hidden rounded-full border-2 border-purple-500 shadow-md">
            <Image
              src={avatar}
              alt="avatar"
              width={40}
              height={40}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {/* Top Right Chapter Badge */}
        <div className="absolute top-2 right-2 rounded-md bg-black/60 px-2 py-1 text-xs font-bold text-white backdrop-blur-sm">
          {totalChapters} chương
        </div>

        {/* Rank Badge (Top Left) */}
        {rank && (
          <div className={`absolute top-0 left-0 z-10 flex h-10 w-10 items-center justify-center rounded-br-xl font-bold text-white shadow-lg ${rank === 1 ? 'bg-yellow-500 text-lg' :
            rank === 2 ? 'bg-gray-400 text-base' :
              rank === 3 ? 'bg-orange-600 text-base' :
                'bg-black/70 backdrop-blur-sm text-sm'
            }`}>
            #{rank}
          </div>
        )}
      </div>

      {/* Content Overlay (Absolute bottom) */}
      <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black via-black/90 to-transparent p-4 pt-12">
        {/* Genre Tags (Limit 2) */}
        {genres.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1">
            {genres.slice(0, 2).map((g, i) => (
              <span key={i} className="rounded bg-purple-600/80 px-1.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider shadow-sm">
                {g.name}
              </span>
            ))}
          </div>
        )}
        {/* Title */}
        <Link
          href={`/m/${manga.slug}`}
          className="mb-1 block text-lg font-bold leading-tight text-white drop-shadow-sm transition-colors hover:text-purple-400 line-clamp-2"
          title={manga.title}
        >
          {manga.title}
        </Link>

        {/* Author */}
        <p className="mb-3 text-xs font-medium text-gray-300 line-clamp-1">
          {manga.author || 'Đang cập nhật'}
        </p>

        {/* Stats Row */}
        <div className="flex items-center justify-between border-t border-gray-700 pt-2 text-xs text-gray-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5" title="Lượt theo dõi">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
              {formatNumber(totalFollows)}
            </span>
            <span className="flex items-center gap-1.5" title="Bình luận">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
              </svg>
              {formatNumber(totalComments)}
            </span>
            <span className="flex items-center gap-1.5" title="Lượt xem">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              {formatNumber(manga.views || 0)}
            </span>
          </div>

          {/* Optional: Status or Rating could go here */}
        </div>
      </div>
    </article>
  );
}
