import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import DashboardLayout from '../../src/components/dashboard/DashboardLayout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function DashboardIndex() {
    const [stats, setStats] = useState({
        totalMangas: 0,
        totalViews: 0,
        totalFollows: 0
    });
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    async function fetchStats() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Fetch Mangas & Views
            const { data: mangas, error: mangaError } = await supabase
                .from('mangas')
                .select('id, title, views')
                .eq('user_id', user.id);

            if (mangaError) throw mangaError;

            const totalMangas = mangas.length;
            const totalViews = mangas.reduce((sum, m) => sum + (Number(m.views) || 0), 0);

            // 2. Fetch Follows
            // We need to count follows for all mangas owned by this user
            const mangaIds = mangas.map(m => m.id);
            let totalFollows = 0;

            if (mangaIds.length > 0) {
                const { count, error: followError } = await supabase
                    .from('follows')
                    .select('*', { count: 'exact', head: true })
                    .in('manga_id', mangaIds);

                if (!followError) totalFollows = count || 0;
            }

            setStats({ totalMangas, totalViews, totalFollows });
            // Prepare chart data (Top 10 mangas by views)
            const sorted = [...mangas].sort((a, b) => (Number(b.views) || 0) - (Number(a.views) || 0)).slice(0, 10);
            setChartData(sorted.map(m => ({
                name: m.title.length > 20 ? m.title.substring(0, 20) + '...' : m.title,
                views: Number(m.views) || 0
            })));

        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <DashboardLayout>
            <h1 className="text-3xl font-bold mb-6">Dashboard Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h3 className="text-gray-400 text-sm font-medium">Tổng truyện đã đăng</h3>
                    <p className="text-3xl font-bold text-white mt-2">
                        {loading ? '...' : stats.totalMangas}
                    </p>
                </div>
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h3 className="text-gray-400 text-sm font-medium">Lượt xem tổng</h3>
                    <p className="text-3xl font-bold text-white mt-2">
                        {loading ? '...' : stats.totalViews.toLocaleString()}
                    </p>
                </div>
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h3 className="text-gray-400 text-sm font-medium">Lượt theo dõi</h3>
                    <p className="text-3xl font-bold text-white mt-2">
                        {loading ? '...' : stats.totalFollows}
                    </p>
                </div>
            </div>

            {/* Chart Section */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-10">
                <h3 className="text-xl font-bold text-white mb-6">Thống kê lượt xem (Top 10)</h3>
                <div className="h-[400px] w-full">
                    {loading ? (
                        <div className="h-full flex items-center justify-center text-gray-500">Loading chart...</div>
                    ) : chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="name" stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
                                <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }}
                                    itemStyle={{ color: '#F3F4F6' }}
                                />
                                <Legend />
                                <Bar dataKey="views" name="Lượt xem" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-gray-500 text-center pt-20">Chưa có dữ liệu hiển thị</p>
                    )}
                </div>
            </div>

            <div className="p-6 bg-gray-800 rounded-xl border border-gray-700 text-center text-gray-400">
                <p>Chào mừng bạn đến với trang quản trị truyện!</p>
                <p className="mt-2 text-sm">Chọn "Tải truyện lên" ở menu bên trái để bắt đầu.</p>
            </div>
        </DashboardLayout>
    );
}
