import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import Navbar from '../src/components/UI/Navbar';
import Container from '../src/components/UI/Container';
import Footer from '../src/components/UI/Footer';
import MangaList from '../src/components/manga/MangaList';

const PAGE_SIZE = 24;

export default function LatestPage({ mangas, page, hasNext }) {
    return (
        <div className="flex min-h-screen flex-col bg-gray-900 text-gray-100">
            <Navbar />

            <Container className="flex-1 py-12">
                <div className="mb-8 flex items-center gap-3 border-b border-gray-800 pb-4">
                    <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h1 className="text-3xl font-bold text-white">Mới Cập Nhật</h1>
                </div>

                <MangaList mangas={mangas} />

                {/* Pagination */}
                <div className="mt-12 flex justify-center gap-4">
                    {page > 1 && (
                        <Link
                            href={`/latest?page=${page - 1}`}
                            className="rounded-full border border-gray-700 bg-gray-800 px-6 py-2 font-bold text-white hover:bg-gray-700"
                        >
                            ← Trang trước
                        </Link>
                    )}

                    {hasNext && (
                        <Link
                            href={`/latest?page=${page + 1}`}
                            className="rounded-full bg-purple-600 px-6 py-2 font-bold text-white shadow-lg hover:bg-purple-700"
                        >
                            Trang sau →
                        </Link>
                    )}
                </div>
            </Container>

            <Footer />
        </div>
    );
}

export async function getServerSideProps({ query }) {
    const page = Number(query.page) || 1;
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE - 1;

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
    );

    const { data, count } = await supabase
        .from('mangas')
        .select('*', { count: 'exact' })
        .order('updated_at', { ascending: false })
        .range(start, end);

    return {
        props: {
            mangas: data || [],
            page,
            hasNext: count ? end < count - 1 : false,
        }
    };
}
