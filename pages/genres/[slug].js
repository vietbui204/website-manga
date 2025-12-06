import { supabase } from '../../lib/supabaseClient';
import Navbar from '../../src/components/UI/Navbar';
import MangaList from '../../src/components/manga/MangaList';
import Footer from '../../src/components/UI/Footer';

export default function GenrePage({ genre, mangas }) {
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Navbar />

            <main className="container mx-auto px-4 py-8">
                <div className="mb-8 border-b border-gray-200 pb-4">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Truyện thể loại: <span className="text-brand">{genre.name}</span>
                    </h1>
                    {genre.description && (
                        <p className="mt-2 text-gray-600">{genre.description}</p>
                    )}
                </div>

                {mangas && mangas.length > 0 ? (
                    <MangaList mangas={mangas} />
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <p className="text-lg text-gray-500">không có truyện thuộc thể loại này</p>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}

export async function getServerSideProps({ params }) {
    const { slug } = params;

    try {
        // 1. Get Genre info
        const { data: genre, error: genreError } = await supabase
            .from('genres')
            .select('*')
            .eq('slug', slug)
            .single();

        if (genreError || !genre) {
            return {
                notFound: true,
            };
        }

        // 2. Get Mangas for this genre
        // Workaround: Perform application-side join if matching Foreign Key is missing in DB
        const { data: relations, error: relError } = await supabase
            .from('manga_genres')
            .select('manga_id')
            .eq('genre_id', genre.id);

        if (relError) {
            console.error('Error fetching manga_genres:', relError);
            return { props: { genre, mangas: [] } };
        }

        if (!relations || relations.length === 0) {
            return { props: { genre, mangas: [] } };
        }

        const mangaIds = relations.map(r => r.manga_id);

        const { data: mangas, error: mangaError } = await supabase
            .from('mangas')
            .select('*')
            .in('id', mangaIds);

        if (mangaError) {
            console.error('Error fetching mangas:', mangaError);
            return { props: { genre, mangas: [] } };
        }

        return {
            props: {
                genre,
                mangas,
            },
        };
    } catch (error) {
        console.error('Server error:', error);
        return {
            notFound: true,
        };
    }
}
