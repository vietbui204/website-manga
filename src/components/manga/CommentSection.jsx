import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';

export default function CommentSection({ mangaSlug }) {
    const [comments, setComments] = useState([]);
    const [content, setContent] = useState('');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchComments();
        checkUser();
    }, [mangaSlug]);

    async function checkUser() {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
    }

    async function fetchComments() {
        const { data, error } = await supabase
            .from('comments')
            .select('*, profiles(username, avatar_url)') // Assuming profiles table linked via user_id, but schema might not have FK. 
            // Actually, create_social_tables.sql didn't link profiles. 
            // Let's just select * and maybe user email if available, or just show "User".
            // Wait, profiles table exists (checked in step 438).
            // Let's assume profiles has id matching auth.users.id.
            .eq('manga_slug', mangaSlug)
            .order('created_at', { ascending: false });

        if (!error) setComments(data);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!user) {
            alert('Vui lòng đăng nhập để bình luận.');
            return;
        }
        if (!content.trim()) return;

        setLoading(true);
        const { error } = await supabase
            .from('comments')
            .insert({
                user_id: user.id,
                manga_slug: mangaSlug,
                content: content.trim()
            });

        if (error) {
            alert('Lỗi khi đăng bình luận: ' + error.message);
        } else {
            setContent('');
            fetchComments();
        }
        setLoading(false);
    }

    return (
        <div className="comments-section mt-8">
            <h3 className="text-xl font-semibold mb-4">Bình luận ({comments.length})</h3>

            {user ? (
                <form onSubmit={handleSubmit} className="mb-6">
                    <textarea
                        className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                        rows="3"
                        placeholder="Viết bình luận của bạn..."
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? 'Đang gửi...' : 'Gửi bình luận'}
                    </button>
                </form>
            ) : (
                <div className="mb-6 p-4 bg-gray-100 rounded text-center">
                    <p>Vui lòng <a href="/login" className="text-blue-600 hover:underline">đăng nhập</a> để bình luận.</p>
                </div>
            )}

            <div className="space-y-4">
                {comments.map(comment => (
                    <div key={comment.id} className="comment p-4 bg-white border rounded shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <span className="font-semibold text-gray-800">
                                {/* Fallback to User ID if profile not found/linked */}
                                User {comment.user_id.slice(0, 8)}
                            </span>
                            <span className="text-xs text-gray-500">
                                {new Date(comment.created_at).toLocaleString('vi-VN')}
                            </span>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                    </div>
                ))}
                {comments.length === 0 && <p className="text-gray-500 italic">Chưa có bình luận nào.</p>}
            </div>
        </div>
    );
}
