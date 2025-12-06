import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import Navbar from '../src/components/UI/Navbar';
import Container from '../src/components/UI/Container';
import Footer from '../src/components/UI/Footer';
import Image from 'next/image';

export default function ProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [uploading, setUploading] = useState(false);

    // Edit states
    const [editingUsername, setEditingUsername] = useState(false);
    const [tempUsername, setTempUsername] = useState('');

    // Password states
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [changingPassword, setChangingPassword] = useState(false);

    async function handlePasswordChange(e) {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            alert('Mật khẩu xác nhận không khớp!');
            return;
        }
        if (newPassword.length < 6) {
            alert('Mật khẩu phải có ít nhất 6 ký tự.');
            return;
        }

        try {
            setChangingPassword(true);
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            alert('Đổi mật khẩu thành công!');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            alert('Lỗi: ' + error.message);
        } finally {
            setChangingPassword(false);
        }
    }

    useEffect(() => {
        getProfile();
    }, []);

    async function getProfile() {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push('/login');
                return;
            }
            setUser(user);

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) {
                // If no profile, maybe insert one? Or just show empty.
                console.warn(error);
            } else {
                setProfile(data);
                setTempUsername(data.username || '');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    async function updateProfile(updates) {
        try {
            setLoading(true);
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    ...updates,
                    updated_at: new Date(),
                });

            if (error) throw error;
            await getProfile(); // Refresh
        } catch (error) {
            alert('Lỗi cập nhật: ' + error.message);
        } finally {
            setLoading(false);
            setEditingUsername(false);
        }
    }

    async function uploadAvatar(event) {
        try {
            setUploading(true);
            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('Bạn cần chọn ảnh để tải lên.');
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Math.random()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            let { error: uploadError } = await supabase.storage
                .from('manga-images') // Reusing existing bucket or assume 'avatars' bucket exists? 
                // Let's use 'manga-images' and put in 'avatars/' folder since we know we have RLS setup for it (maybe).
                // Wait, RLS for 'manga-images' lets authenticated users insert? Yes.
                // But does it let them update/delete? 
                // The policy "User Delete Own File" checks owner. So it should work.
                .upload(filePath, file);

            if (uploadError) {
                // If bucket 404, might need to create it. But we assume we use manga-images for now logic.
                // Or maybe create 'avatars' bucket.
                throw uploadError;
            }

            const { data: { publicUrl } } = supabase.storage.from('manga-images').getPublicUrl(filePath);

            await updateProfile({ avatar_url: publicUrl });

        } catch (error) {
            alert(error.message);
        } finally {
            setUploading(false);
        }
    }

    if (loading && !profile) {
        return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
            <Navbar />

            <Container className="flex-1 py-12">
                <div className="max-w-3xl mx-auto bg-gray-800 rounded-2xl border border-gray-700 p-8 shadow-xl">
                    <h1 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                        Hồ sơ cá nhân
                    </h1>

                    <div className="flex flex-col items-center mb-8">
                        <div className="relative w-32 h-32 mb-4 group">
                            <Image
                                src={profile?.avatar_url || '/default-avatar.png'}
                                alt="Avatar"
                                fill
                                className="rounded-full object-cover border-4 border-purple-500 shadow-lg"
                            />
                            <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                <label htmlFor="avatar-upload" className="cursor-pointer text-white text-xs font-bold uppercase tracking-wider">
                                    Đổi ảnh
                                </label>
                                <input
                                    id="avatar-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={uploadAvatar}
                                    disabled={uploading}
                                />
                            </div>
                        </div>
                        <p className="text-gray-400 text-sm">Email: {user?.email}</p>
                    </div>

                    <div className="space-y-6">
                        {/* Username Field */}
                        <div className="bg-gray-700/50 rounded-xl p-4 flex items-center justify-between border border-gray-600">
                            <div className="flex-1">
                                <span className="block text-xs uppercase text-gray-400 font-bold tracking-wider mb-1">
                                    Tên hiển thị (Username)
                                </span>
                                {editingUsername ? (
                                    <input
                                        type="text"
                                        className="w-full bg-gray-900 border border-gray-500 rounded px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                        value={tempUsername}
                                        onChange={(e) => setTempUsername(e.target.value)}
                                        autoFocus
                                    />
                                ) : (
                                    <span className="text-lg font-medium text-white">
                                        {profile?.username || 'Chưa đặt tên'}
                                    </span>
                                )}
                            </div>

                            <div className="ml-4">
                                {editingUsername ? (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => updateProfile({ username: tempUsername })}
                                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
                                        >
                                            Lưu
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditingUsername(false);
                                                setTempUsername(profile?.username || '');
                                            }}
                                            className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded transition-colors"
                                        >
                                            Hủy
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setEditingUsername(true)}
                                        className="text-purple-400 hover:text-purple-300 transition-colors p-2 hover:bg-white/5 rounded-full"
                                        title="Chỉnh sửa"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Password Change Field */}
                        <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600">
                            <h3 className="text-lg font-semibold text-white mb-4">Đổi mật khẩu</h3>
                            <form onSubmit={handlePasswordChange} className="space-y-4">
                                <div>
                                    <label className="block text-xs uppercase text-gray-400 font-bold tracking-wider mb-1">Mật khẩu mới</label>
                                    <input
                                        type="password"
                                        required
                                        className="w-full bg-gray-900 border border-gray-500 rounded px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                                        minLength={6}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase text-gray-400 font-bold tracking-wider mb-1">Xác nhận mật khẩu</label>
                                    <input
                                        type="password"
                                        required
                                        className="w-full bg-gray-900 border border-gray-500 rounded px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        placeholder="Nhập lại mật khẩu mới"
                                        minLength={6}
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={changingPassword || !newPassword}
                                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-lg transition-all disabled:opacity-50"
                                    >
                                        {changingPassword ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </Container>
            <Footer />
        </div>
    );
}
