import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../../lib/supabaseClient';

export default function GenreDropdown() {
    const [genres, setGenres] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchGenres() {
            try {
                const { data, error } = await supabase
                    .from('genres')
                    .select('id, name, slug')
                    .order('name');

                if (!error && data) {
                    setGenres(data);
                }
            } catch (e) {
                console.error('Error fetching genres:', e);
            } finally {
                setLoading(false);
            }
        }
        fetchGenres();
    }, []);

    return (
        <div className="group relative">
            {/* Trigger Button */}
            <button className="flex items-center gap-1 rounded-full px-4 py-2 text-sm font-bold text-gray-600 transition-all hover:bg-purple-100 hover:text-purple-600">
                Thể loại
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform duration-200 group-hover:rotate-180" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>

            {/* Dropdown Menu */}
            {/* Using opacity/invisible for smooth transition as requested, simpler than animating display:none */}
            <div className="absolute left-0 top-full z-50 pt-1.5 opacity-0 invisible translate-y-2 transition-all duration-200 ease-out group-hover:opacity-100 group-hover:visible group-hover:translate-y-0">
                <div className="w-[220px] overflow-hidden rounded-xl bg-white p-2 shadow-xl ring-1 ring-black/5">
                    {loading ? (
                        <div className="p-4 text-center text-xs text-gray-500">Đang tải...</div>
                    ) : genres.length > 0 ? (
                        <div className="grid grid-cols-1 gap-1 max-h-[300px] overflow-y-auto">
                            {genres.map((genre) => (
                                <Link
                                    key={genre.id}
                                    href={`/genres/${genre.slug}`}
                                    className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                                >
                                    {genre.name}
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="p-4 text-center text-xs text-gray-500">Chưa có thể loại</div>
                    )}
                </div>
            </div>
        </div>
    );
}
