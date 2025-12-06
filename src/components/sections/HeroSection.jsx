import Link from 'next/link';
import Image from 'next/image';

export default function HeroSection({ manga }) {
    if (!manga) return null;

    // Handle cover url
    const coverUrl = manga.cover_url || manga.coverUrl || '/placeholder.jpg';
    // Genres list (if available) - assuming manga.manga_genres is joined
    const genres = manga.manga_genres?.map(g => g.genres?.name).filter(Boolean).slice(0, 3) || [];

    return (
        <div className="relative w-full overflow-hidden bg-gray-900 py-12 sm:py-20">
            {/* Background Effect */}
            <div className="absolute inset-0 z-0">
                <Image
                    src={coverUrl}
                    alt="bg"
                    fill
                    className="object-cover opacity-10 blur-3xl scale-125"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/60 to-transparent" />
            </div>

            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center gap-8 md:flex-row md:items-start md:gap-12">
                    {/* Main Poster (Hidden on mobile, or smaller?) */}
                    <div className="hidden md:block shrink-0 relative h-[400px] w-[280px] overflow-hidden rounded-xl border-4 border-gray-800 shadow-2xl skew-y-1 transform transition hover:skew-y-0 hover:scale-105 duration-500">
                        <Image
                            src={coverUrl}
                            alt={manga.title}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>

                    {/* Text Content */}
                    <div className="flex-1 text-center md:text-left pt-4">
                        {/* Mobile Poster (small) */}
                        <div className="md:hidden mx-auto h-[200px] w-[140px] relative mb-6 rounded-lg shadow-lg overflow-hidden border-2 border-gray-700">
                            <Image src={coverUrl} alt={manga.title} fill className="object-cover" />
                        </div>

                        <div className="mb-4 flex flex-wrap justify-center md:justify-start gap-2">
                            <span className="rounded-full bg-purple-600/20 px-3 py-1 text-xs font-semibold text-purple-400 border border-purple-500/30">Feature</span>
                            {genres.map(g => (
                                <span key={g} className="rounded-full bg-gray-800 px-3 py-1 text-xs font-semibold text-gray-300 border border-gray-700">{g}</span>
                            ))}
                        </div>

                        <h1 className="mb-4 text-4xl font-black leading-tight text-white sm:text-5xl md:text-6xl drop-shadow-lg">
                            {manga.title}
                        </h1>

                        <p className="mb-8 max-w-2xl text-lg text-gray-300 line-clamp-3 md:line-clamp-4 leading-relaxed">
                            {manga.description || 'Chưa có mô tả cho truyện này.'}
                        </p>

                        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center md:justify-start">
                            <Link
                                href={`/m/${manga.slug}`}
                                className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-purple-600 px-8 py-3 text-base font-bold text-white shadow-lg transition-all hover:bg-purple-700 hover:scale-105 hover:shadow-purple-500/50"
                            >
                                <span className="mr-2">Đọc Ngay</span>
                                <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </Link>

                            <Link
                                href={`/m/${manga.slug}`}
                                className="inline-flex items-center justify-center rounded-full border-2 border-gray-600 bg-transparent px-8 py-3 text-base font-bold text-gray-300 transition-all hover:border-gray-400 hover:bg-white/5 hover:text-white"
                            >
                                Chi tiết
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
