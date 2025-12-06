import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import Navbar from '../src/components/UI/Navbar';
import MangaList from '../src/components/manga/MangaList';
import Footer from '../src/components/UI/Footer';
import Link from 'next/link';

export default function HistoryPage() {
    const [mangas, setMangas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        checkUser();
    }, []);

    async function checkUser() {
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user;
        setUser(currentUser);

        if (currentUser) {
            fetchHistory(currentUser.id);
        } else {
            setLoading(false);
        }
    }

    async function fetchHistory(userId) {
        try {
            // Fetch history with manga details
            const { data, error } = await supabase
                .from('reading_history')
                .select(`
                    last_read_at,
                    mangas (
                        *,
                        manga_genres (
                            genres (name, slug)
                        )
                    )
                `)
                .eq('user_id', userId)
                .order('last_read_at', { ascending: false });

            if (error) throw error;

            // Transform data structure for MangaList
            if (data) {
                const historyItems = data.map(item => ({
                    ...item.mangas,
                    // Preserve the structure for genres if needed by MangaCard
                    // The select query above returns mangas -> manga_genres -> genres
                    // MangaCard expects manga.manga_genres to be array of objects
                }));
                setMangas(historyItems);
            }
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Navbar />

            <main className="container mx-auto px-4 py-8">
                <div className="mb-8 border-b border-gray-200 pb-4">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Lịch Sử Đọc
                    </h1>
                    <p className="mt-2 text-gray-600">Những truyện bạn đã đọc gần đây</p>
                </div>

                {loading ? (
                    <div className="py-20 text-center text-gray-500">Đang tải...</div>
                ) : !user ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <p className="mb-4 text-lg text-gray-600">Vui lòng đăng nhập để xem lịch sử đọc.</p>
                        <Link href="/login" className="rounded-lg bg-brand px-6 py-2 text-white hover:bg-brand-dark">
                            Đăng nhập
                        </Link>
                    </div>
                ) : mangas.length > 0 ? (
                    <MangaList mangas={mangas} />
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <p className="text-lg text-gray-500">Bạn chưa đọc truyện nào.</p>
                        <Link href="/" className="mt-4 text-brand hover:underline">
                            Khám phá truyện ngay
                        </Link>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
