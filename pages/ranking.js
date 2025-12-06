import { supabase } from '../lib/supabaseClient';
import Navbar from '../src/components/UI/Navbar';
import MangaList from '../src/components/manga/MangaList';
import Footer from '../src/components/UI/Footer';

export default function RankingPage({ mangas }) {
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Navbar />

            <main className="container mx-auto px-4 py-8">
                <div className="mb-8 border-b border-gray-200 pb-4">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Bảng Xếp Hạng
                    </h1>
                    <p className="mt-2 text-gray-600">Top truyện được xem nhiều nhất</p>
                </div>

                {mangas && mangas.length > 0 ? (
                    <MangaList mangas={mangas} showRank={true} />
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <p className="text-lg text-gray-500">Chưa có dữ liệu xếp hạng</p>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}

export async function getServerSideProps() {
    try {
        const { data: mangas, error } = await supabase
            .from('mangas') // Use correct table
            .select('*, manga_genres(genres(name, slug))') // Include genre info for cards
            .order('views', { ascending: false })
            .limit(50); // Limit to top 50

        if (error) {
            console.error('Error fetching ranking:', error);
            return { props: { mangas: [] } };
        }

        return {
            props: {
                mangas: mangas || [],
            },
        };
    } catch (error) {
        console.error('Server error:', error);
        return {
            props: {
                mangas: []
            }
        };
    }
}
