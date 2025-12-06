import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '../../../lib/supabaseClient';
import { useRouter } from 'next/router';

export default function SearchSuggest() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchRef = useRef(null);
    const router = useRouter();

    // Debounce logic
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.trim().length >= 2) {
                fetchResults(query);
            } else {
                setResults([]);
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(timer);
    }, [query]);

    // Click outside to close
    useEffect(() => {
        function handleClickOutside(event) {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    async function fetchResults(searchTerm) {
        setLoading(true);
        try {
            // Search by title or alternative titles
            const { data, error } = await supabase
                .from('mangas')
                .select(`
          id,
          title,
          slug,
          cover_url, 
          author,
          chapters (slug, chapter_number),
          manga_genres (genres (name))
        `)
                .ilike('title', `%${searchTerm}%`)
                .limit(10); // Limit results

            if (error) {
                console.error('Search error:', error);
            } else {
                setResults(data || []);
                setShowDropdown(true);
            }
        } catch (err) {
            console.error('Search exception:', err);
        } finally {
            setLoading(false);
        }
    }

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            setShowDropdown(false);
            router.push(`/search?q=${encodeURIComponent(query)}`);
        }
    };

    return (
        <div ref={searchRef} className="relative w-full max-w-lg">
            <form onSubmit={handleSearchSubmit} className="relative">
                <input
                    type="text"
                    className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-4 pr-10 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    placeholder="Tìm truyện..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        if (e.target.value.length >= 2) setShowDropdown(true);
                    }}
                    onFocus={() => {
                        if (results.length > 0) setShowDropdown(true);
                    }}
                />
                <button
                    type="submit"
                    className="absolute right-0 top-0 h-full px-3 flex items-center justify-center text-gray-400 hover:text-purple-500"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-5 w-5"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                        />
                    </svg>
                </button>
            </form>

            {/* Dropdown Results */}
            {showDropdown && (results.length > 0 || loading) && (
                <div className="absolute left-0 top-full z-50 mt-1 max-h-[400px] w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-xl scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
                    {loading ? (
                        <div className="p-4 text-center text-sm text-gray-500">Đang tìm kiếm...</div>
                    ) : (
                        <ul>
                            {results.map((manga) => {
                                // Determine latest chapter
                                const latestChapter = manga.chapters?.length
                                    ? manga.chapters.sort((a, b) => b.chapter_number - a.chapter_number)[0]
                                    : null;

                                // Format genres
                                const genreText = manga.manga_genres
                                    ?.map(g => g.genres?.name)
                                    .filter(Boolean)
                                    .join(', ');

                                return (
                                    <li key={manga.id} className="border-b border-gray-100 last:border-none">
                                        <Link
                                            href={`/m/${manga.slug}`}
                                            className="flex gap-3 p-3 transition-colors hover:bg-gray-50"
                                            onClick={() => setShowDropdown(false)}
                                        >
                                            {/* Cover Image */}
                                            <div className="relative h-16 w-12 flex-shrink-0 overflow-hidden rounded shadow-sm">
                                                <Image
                                                    src={manga.cover_url || '/placeholder.jpg'}
                                                    alt={manga.title}
                                                    fill
                                                    className="object-cover"
                                                    sizes="48px"
                                                />
                                            </div>

                                            {/* Content */}
                                            <div className="flex flex-1 flex-col justify-between overflow-hidden">
                                                <div>
                                                    <h4 className="truncate text-sm font-bold text-gray-900 group-hover:text-purple-600">
                                                        {manga.title}
                                                    </h4>
                                                    <div className="flex items-center gap-2 text-xs">
                                                        {latestChapter ? (
                                                            <span className="text-gray-600">Chapter {latestChapter.chapter_number}</span>
                                                        ) : (
                                                            <span className="text-gray-400">Chưa có chương</span>
                                                        )}
                                                        {latestChapter && (
                                                            <span className="text-gray-400 italic">Latest</span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="truncate text-xs">
                                                    {manga.author && (
                                                        <span className="font-medium text-blue-600 mr-2">{manga.author}</span>
                                                    )}
                                                    {genreText && (
                                                        <span className="italic text-gray-500">{genreText}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            )}

            {/* No results state */}
            {showDropdown && !loading && query.length >= 2 && results.length === 0 && (
                <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white p-4 shadow-xl text-center text-sm text-gray-500">
                    Không tìm thấy kết quả
                </div>
            )}
        </div>
    );
}
