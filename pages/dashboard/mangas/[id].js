import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../../lib/supabaseClient';
import DashboardLayout from '../../../src/components/dashboard/DashboardLayout';
import slugify from 'slugify';
import Link from 'next/link';

export default function DashboardMangaEdit() {
    const router = useRouter();
    const { id } = router.query;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [genres, setGenres] = useState([]);
    const [chapters, setChapters] = useState([]);

    // Form State
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [description, setDescription] = useState('');
    const [coverFile, setCoverFile] = useState(null);
    const [currentCover, setCurrentCover] = useState('');
    const [selectedGenres, setSelectedGenres] = useState([]);

    useEffect(() => {
        if (id) {
            fetchMangaData();
            fetchGenres();
        }
    }, [id]);

    async function fetchGenres() {
        const { data } = await supabase.from('genres').select('*');
        if (data) setGenres(data);
    }

    async function fetchMangaData() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return router.push('/login');

        // Fetch Manga
        const { data: manga, error } = await supabase
            .from('mangas')
            .select('*, manga_genres(genre_id)')
            .eq('id', id)
            .single();

        if (error || !manga) {
            alert('Không tìm thấy truyện hoặc bạn không có quyền sửa.');
            return router.push('/dashboard/mangas');
        }

        if (manga.user_id !== user.id) {
            alert('Bạn không có quyền sửa truyện này.');
            return router.push('/dashboard/mangas');
        }

        setTitle(manga.title);
        setAuthor(manga.author);
        setDescription(manga.description || '');
        setCurrentCover(manga.cover_url);

        // Set selected genres
        const genreIds = manga.manga_genres?.map(mg => mg.genre_id) || [];
        setSelectedGenres(genreIds);

        // Fetch Chapters
        const { data: chaps } = await supabase
            .from('chapters')
            .select('*')
            .eq('manga_id', id)
            .order('chapter_number', { ascending: false });

        setChapters(chaps || []);
        setLoading(false);
    }

    const handleGenreToggle = (gid) => {
        if (selectedGenres.includes(gid)) {
            setSelectedGenres(selectedGenres.filter(g => g !== gid));
        } else {
            setSelectedGenres([...selectedGenres, gid]);
        }
    };

    const handleDeleteChapter = async (chapId) => {
        if (!confirm('Bạn có chắc chắn muốn xoá chương này?')) return;

        const { error } = await supabase.from('chapters').delete().eq('id', chapId);
        if (error) alert('Lỗi: ' + error.message);
        else {
            setChapters(chapters.filter(c => c.id !== chapId));
            // Optional: Update chapters_count in mangas if trigger doesn't handle specific edge cases, 
            // but the trigger IS handled already.
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            // 1. Upload new cover if exists
            let coverUrl = currentCover;
            const newSlug = slugify(title, { lower: true, strict: true });

            if (coverFile) {
                const fileExt = coverFile.name.split('.').pop();
                const fileName = `${newSlug}/cover-${Date.now()}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('manga-images')
                    .upload(fileName, coverFile);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage.from('manga-images').getPublicUrl(fileName);
                coverUrl = publicUrl;
            }

            // 2. Update Manga
            const { error: updateError } = await supabase
                .from('mangas')
                .update({
                    title,
                    slug: newSlug, // Updating slug might break SEO links if not handled, but requested.
                    author,
                    description,
                    cover_url: coverUrl,
                    // updated_at: new Date() // If column exists
                })
                .eq('id', id);

            if (updateError) throw updateError;

            // 3. Update Genres (Delete All -> Insert New is simplest)
            // Ideally should be transaction or smart diff, but Delete-Insert is safe here
            await supabase.from('manga_genres').delete().eq('manga_id', id);

            if (selectedGenres.length > 0) {
                const genreInserts = selectedGenres.map(gid => ({
                    manga_id: id,
                    genre_id: gid
                }));
                await supabase.from('manga_genres').insert(genreInserts);
            }

            alert('Cập nhật thành công!');
            // Reload data to ensure consistency
            // fetchMangaData(); OR redirect
            router.push('/dashboard/mangas');

        } catch (err) {
            console.error(err);
            alert('Lỗi cập nhật: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <DashboardLayout><p className="p-8">Đang tải dữ liệu...</p></DashboardLayout>;

    return (
        <DashboardLayout>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">Sửa Truyện: {title}</h1>
                <Link href="/dashboard/mangas" className="text-gray-400 hover:text-white">
                    Quay lại
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Edit Form */}
                <div className="lg:col-span-2 space-y-6">
                    <form onSubmit={handleUpdate} className="bg-gray-800 p-6 rounded-xl border border-gray-700 space-y-6">
                        <h2 className="text-xl font-bold border-b border-gray-700 pb-4">Thông tin chung</h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Tên truyện</label>
                            <input required type="text" className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white" value={title} onChange={e => setTitle(e.target.value)} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Tác giả</label>
                            <input required type="text" className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white" value={author} onChange={e => setAuthor(e.target.value)} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Mô tả</label>
                            <textarea className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white h-32" value={description} onChange={e => setDescription(e.target.value)} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Ảnh bìa mới (Tuỳ chọn)</label>
                            <input type="file" accept="image/*" className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-gray-300" onChange={e => setCoverFile(e.target.files[0])} />
                            {currentCover && <p className="text-xs text-gray-500 mt-1">Hiện tại: <a href={currentCover} target="_blank" rel="noreferrer" className="text-blue-400">{currentCover}</a></p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Thể loại</label>
                            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 bg-gray-900 rounded border border-gray-600">
                                {genres.map(g => (
                                    <button
                                        type="button"
                                        key={g.id}
                                        onClick={() => handleGenreToggle(g.id)}
                                        className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${selectedGenres.includes(g.id) ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
                                    >
                                        {g.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button type="submit" disabled={saving} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all shadow-lg disabled:opacity-50">
                            {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                        </button>
                    </form>
                </div>

                {/* Chapter Management */}
                <div className="space-y-6">
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                        <h2 className="text-xl font-bold border-b border-gray-700 pb-4 mb-4">Quản lý Chương</h2>

                        <div className="max-h-[600px] overflow-y-auto space-y-2">
                            {chapters.length === 0 ? (
                                <p className="text-gray-500 text-center">Chưa có chương nào.</p>
                            ) : (
                                chapters.map(c => (
                                    <div key={c.id} className="flex items-center justify-between bg-gray-900 p-3 rounded-lg">
                                        <div>
                                            <p className="font-bold text-sm">Chương {c.chapter_number}</p>
                                            <p className="text-xs text-gray-500 truncate w-32">{c.title}</p>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteChapter(c.id)}
                                            className="bg-red-900/50 hover:bg-red-900 text-red-400 p-2 rounded text-xs font-bold transition-colors"
                                        >
                                            Xoá
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
