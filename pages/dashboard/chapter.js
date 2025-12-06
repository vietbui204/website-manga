import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';
import DashboardLayout from '../../src/components/dashboard/DashboardLayout';

export default function DashboardChapter() {
    const [loading, setLoading] = useState(false);
    const [mangas, setMangas] = useState([]);

    // Form
    const [selectedMangaId, setSelectedMangaId] = useState('');
    const [chapterNumber, setChapterNumber] = useState('');
    const [chapterTitle, setChapterTitle] = useState('');
    const [files, setFiles] = useState([]);

    useEffect(() => {
        fetchMangas();
    }, []);

    async function fetchMangas() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch user's mangas
        const { data } = await supabase
            .from('mangas')
            .select('id, title, slug')
            .eq('user_id', user.id)
            .order('title');

        if (data) setMangas(data);
    }

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!selectedMangaId || !files.length || !chapterNumber) {
            alert('Vui lòng nhập đủ thông tin!');
            return;
        }
        setLoading(true);

        try {
            const manga = mangas.find(m => m.id === selectedMangaId);
            if (!manga) throw new Error('Manga not found');

            const chapterSlug = `chapter-${chapterNumber}`;
            const basePath = `${manga.slug}/${chapterSlug}`;

            // 1. Upload Images
            // Sort files if needed? Usually input file list order depends on OS selection.
            // Requirement: "01", "02"...
            // We'll trust the order the user selected OR simple alphanumeric sort if they have names?
            // "quy tắc đặt tên ảnh upload bắt buộc phải theo dạng 01, 02..." 
            // I will rename them sequentially based on the input array order.

            const fileArray = Array.from(files);

            // Optional: Sort by name to ensure 1.jpg comes before 2.jpg if user drag-dropped mixed
            // fileArray.sort((a,b) => a.name.localeCompare(b.name, undefined, {numeric: true}));

            for (let i = 0; i < fileArray.length; i++) {
                const file = fileArray[i];
                const ext = file.name.split('.').pop();
                // "01", "02" ... (pad 2)
                const newName = String(i + 1).padStart(2, '0') + '.' + ext;
                const path = `${basePath}/${newName}`;

                const { error } = await supabase.storage
                    .from('manga-images')
                    .upload(path, file, { upsert: true });

                if (error) throw error;
            }

            // 2. Insert Chapter Record
            const { error: dbError } = await supabase
                .from('chapters')
                .insert({
                    manga_id: manga.id,
                    slug: chapterSlug, // standard slug
                    chapter_number: Number(chapterNumber),
                    title: chapterTitle || `Chapter ${chapterNumber}`
                });

            if (dbError) throw dbError;

            // 3. Update Manga 'updated_at' (optional but good)
            await supabase.from('mangas').update({ updated_at: new Date() }).eq('id', manga.id);

            alert('Đăng chương mới thành công!');
            // Reset form
            setFiles([]);
            setChapterNumber('');
            setChapterTitle('');

        } catch (err) {
            console.error(err);
            alert('Lỗi: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <h1 className="text-3xl font-bold mb-8">Đăng Chương Mới</h1>

            <form onSubmit={handleUpload} className="max-w-2xl bg-gray-800 p-8 rounded-xl border border-gray-700 space-y-6">

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Chọn Truyện</label>
                    <select
                        required
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500"
                        value={selectedMangaId}
                        onChange={e => setSelectedMangaId(e.target.value)}
                    >
                        <option value="">-- Chọn truyện --</option>
                        {mangas.map(m => (
                            <option key={m.id} value={m.id}>{m.title}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Số chương (VD: 1, 2)</label>
                        <input
                            required
                            type="number"
                            step="0.1"
                            className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500"
                            value={chapterNumber}
                            onChange={e => setChapterNumber(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Tên chương (Tùy chọn)</label>
                        <input
                            type="text"
                            placeholder="VD: Sự khởi đầu"
                            className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500"
                            value={chapterTitle}
                            onChange={e => setChapterTitle(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Upload Ảnh Chương</label>
                    <div className="p-4 border-2 border-dashed border-gray-600 rounded-lg bg-gray-900/50 text-center">
                        <input
                            required
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            id="chapter-files"
                            onChange={e => setFiles(e.target.files)}
                        />
                        <label htmlFor="chapter-files" className="cursor-pointer flex flex-col items-center">
                            <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                            <span className="text-purple-400 font-bold hover:text-purple-300">Chọn ảnh</span>
                            <span className="text-sm text-gray-500 mt-1">
                                {files.length > 0 ? `Đã chọn ${files.length} ảnh` : 'Kéo thả hoặc click để chọn nhiều ảnh'}
                            </span>
                        </label>
                    </div>
                    {files.length > 0 && (
                        <div className="mt-2 text-sm text-gray-400 max-h-32 overflow-y-auto">
                            {Array.from(files).map((f, i) => (
                                <p key={i} className="truncate">{i + 1}. {f.name}</p>
                            ))}
                        </div>
                    )}
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-all shadow-lg disabled:opacity-50"
                    >
                        {loading ? 'Đang Upload...' : 'Đăng Chương'}
                    </button>
                    <p className="mt-2 text-xs text-center text-gray-500">Lưu ý: Ảnh sẽ tự động được đổi tên theo thứ tự (01.jpg, 02.jpg...)</p>
                </div>
            </form>
        </DashboardLayout>
    );
}
