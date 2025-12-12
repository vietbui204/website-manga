import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import DashboardLayout from '../../../src/components/dashboard/DashboardLayout';
import Link from 'next/link';
import Image from 'next/image';

export default function DashboardMangas() {
    const [mangas, setMangas] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyMangas();
    }, []);

    async function fetchMyMangas() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('mangas')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (data) setMangas(data);
        setLoading(false);
    }

    async function handleDelete(id) {
        if (!confirm('Bạn có chắc chắn muốn xoá truyện này? Hành động này không thể hoàn tác.')) return;

        const { error } = await supabase.from('mangas').delete().eq('id', id);
        if (error) alert('Lỗi xoá: ' + error.message);
        else fetchMyMangas();
    }

    return (
        <DashboardLayout>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">Truyện Của Tôi</h1>
                <Link href="/dashboard/upload" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-bold">
                    + Thêm mới
                </Link>
            </div>

            {loading ? <p>Đang tải...</p> : (
                <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-700 text-gray-300 text-sm uppercase tracking-wider">
                                <th className="p-4">Ảnh bìa</th>
                                <th className="p-4">Tên truyện</th>
                                <th className="p-4">Lượt xem</th>
                                <th className="p-4 text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {mangas.map(m => (
                                <tr key={m.id} className="hover:bg-gray-750">
                                    <td className="p-4">
                                        <div className="relative w-12 h-16 rounded overflow-hidden">
                                            <Image src={m.cover_url || '/placeholder.jpg'} alt={m.title} fill className="object-cover" />
                                        </div>
                                    </td>
                                    <td className="p-4 font-medium text-white">{m.title}</td>
                                    <td className="p-4 text-gray-400">{m.views || 0}</td>
                                    <td className="p-4 text-right space-x-2">
                                        <Link href={`/dashboard/mangas/${m.id}`} className="text-blue-400 hover:text-blue-300 text-sm font-bold">Sửa</Link>
                                        <button onClick={() => handleDelete(m.id)} className="text-red-400 hover:text-red-300 text-sm font-bold">Xoá</button>
                                    </td>
                                </tr>
                            ))}
                            {mangas.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-gray-500">
                                        Bạn chưa đăng truyện nào.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </DashboardLayout>
    );
}
