import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';
import DashboardLayout from '../../src/components/dashboard/DashboardLayout';
import slugify from 'slugify';

export default function DashboardUpload() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [genres, setGenres] = useState([]);

    // Form State
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [description, setDescription] = useState('');
    const [coverFile, setCoverFile] = useState(null);
    const [selectedGenres, setSelectedGenres] = useState([]);

    useEffect(() => {
        // Fetch genres for selection
        supabase.from('genres').select('*').then(({ data }) => {
            if (data) setGenres(data);
        });
    }, []);

    const handleGenreToggle = (id) => {
        if (selectedGenres.includes(id)) {
            setSelectedGenres(selectedGenres.filter(g => g !== id));
        } else {
            setSelectedGenres([...selectedGenres, id]);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const user = (await supabase.auth.getUser()).data.user;
            if (!user) throw new Error('Not authenticated');

            // 1. Upload Cover if exists
            // 2. Insert Manga logic (moved up slightly or just calculate slug first)
            const slug = slugify(title, { lower: true, strict: true });

            // 1. Upload Cover if exists
            let coverUrl = '/placeholder.jpg';
            if (coverFile) {
                const fileExt = coverFile.name.split('.').pop();
                // User requirement: Folder name = slug (e.g. "one-piece")
                // file name inside: cover.ext or timestamp-cover.ext
                const fileName = `${slug}/cover-${Date.now()}.${fileExt}`;

                const { error: uploadError, data } = await supabase.storage
                    .from('manga-images')
                    .upload(fileName, coverFile); // bucket 'manga-images' assumed

                if (uploadError) throw uploadError;

                // Get Public URL
                const { data: { publicUrl } } = supabase.storage.from('manga-images').getPublicUrl(fileName);
                coverUrl = publicUrl;
            }

            // 2. Insert Manga
            // const slug = slugify(title, ...); // Already calculated above
            const { data: manga, error: insertError } = await supabase
                .from('mangas')
                .insert({
                    title,
                    slug,
                    author,
                    description,
                    cover_url: coverUrl,
                    user_id: user.id, // Assuming column exists now
                })
                .select()
                .single();

            if (insertError) throw insertError;

            // 3. Insert Genres
            if (selectedGenres.length > 0 && manga) {
                const genreInserts = selectedGenres.map(gid => ({
                    manga_id: manga.id,
                    genre_id: gid
                }));
                const { error: gError } = await supabase.from('manga_genres').insert(genreInserts);
                if (gError) console.warn('Genre insert error:', gError);
            }

            alert('Đăng truyện thành công!');
            router.push('/dashboard/mangas');

        } catch (err) {
            console.error(err);
            alert('Lỗi: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <h1 className="text-3xl font-bold mb-8">Tải Truyện Mới</h1>

            <form onSubmit={handleUpload} className="max-w-2xl bg-gray-800 p-8 rounded-xl border border-gray-700 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Tên truyện</label>
                    <input
                        required
                        type="text"
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Tác giả</label>
                    <input
                        required
                        type="text"
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500"
                        value={author}
                        onChange={e => setAuthor(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Mô tả</label>
                    <textarea
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 h-32"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Ảnh bìa</label>
                    <input
                        type="file"
                        accept="image/*"
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                        onChange={e => setCoverFile(e.target.files[0])}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Thể loại</label>
                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 bg-gray-900 rounded border border-gray-600">
                        {genres.map(g => (
                            <button
                                type="button"
                                key={g.id}
                                onClick={() => handleGenreToggle(g.id)}
                                className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${selectedGenres.includes(g.id)
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                                    }`}
                            >
                                {g.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-all shadow-lg disabled:opacity-50"
                    >
                        {loading ? 'Đang xử lý...' : 'Đăng Truyện'}
                    </button>
                </div>
            </form>
        </DashboardLayout>
    );
}
