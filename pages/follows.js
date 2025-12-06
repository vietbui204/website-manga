import { useState, useEffect } from 'react';
import Head from 'next/head';
import { supabase } from '../lib/supabaseClient';
import Header from '../src/components/UI/Header';
import Container from '../src/components/UI/Container';
import MangaList from '../src/components/manga/MangaList';
import Navbar from '../src/components/ui/Navbar';
import Footer from '../src/components/ui/Footer';

export default function FollowsPage() {
    const [items, setItems] = useState([]);
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
            loadFollows(currentUser.id);
        } else {
            setLoading(false);
        }
    }

    async function loadFollows(userId) {
        try {
            // 1. Get list of followed manga_ids
            const { data: follows, error: followError } = await supabase
                .from('follows')
                .select('manga_id')
                .eq('user_id', userId);

            if (followError) throw followError;

            if (!follows || follows.length === 0) {
                setItems([]);
                setLoading(false);
                return;
            }

            const mangaIds = follows.map(f => f.manga_id);

            // 2. Fetch manga details for these IDs
            const { data: mangas, error: mangaError } = await supabase
                .from('mangas')
                .select('*')
                .in('id', mangaIds);

            if (mangaError) throw mangaError;

            setItems(mangas || []);
        } catch (err) {
            console.error('Failed to load follows:', err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <Head>
                <title>Truyện đang theo dõi - MangaSite</title>
            </Head>
            <Navbar />
            <Header title="Truyện đang theo dõi" />
            <Container>
                <div className="py-8 min-h-[50vh]">
                    {loading ? (
                        <div className="text-center text-gray-500 mt-10">Đang tải...</div>
                    ) : !user ? (
                        <div className="text-center mt-10">
                            <p className="mb-4">Vui lòng đăng nhập để xem danh sách theo dõi.</p>
                            <a href="/login" className="btn primary px-6 py-2 rounded">Đăng nhập</a>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="text-center text-gray-500 mt-10">
                            <p>Bạn chưa theo dõi truyện nào.</p>
                            <a href="/" className="text-blue-500 hover:underline mt-2 inline-block">Khám phá truyện mới</a>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-2xl font-bold mb-6">Danh sách theo dõi ({items.length})</h2>
                            <MangaList mangas={items} />
                        </>
                    )}
                </div>
            </Container>
            <Footer />
        </>
    );
}
