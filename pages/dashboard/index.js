import DashboardLayout from '../../src/components/dashboard/DashboardLayout';

export default function DashboardIndex() {
    return (
        <DashboardLayout>
            <h1 className="text-3xl font-bold mb-6">Dashboard Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h3 className="text-gray-400 text-sm font-medium">Tổng truyện đã đăng</h3>
                    <p className="text-3xl font-bold text-white mt-2">0</p>
                </div>
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h3 className="text-gray-400 text-sm font-medium">Lượt xem tổng</h3>
                    <p className="text-3xl font-bold text-white mt-2">0</p>
                </div>
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h3 className="text-gray-400 text-sm font-medium">Lượt theo dõi</h3>
                    <p className="text-3xl font-bold text-white mt-2">0</p>
                </div>
            </div>

            <div className="mt-10 p-6 bg-gray-800 rounded-xl border border-gray-700 text-center text-gray-400">
                <p>Chào mừng bạn đến với trang quản trị truyện!</p>
                <p className="mt-2 text-sm">Chọn "Tải truyện lên" ở menu bên trái để bắt đầu.</p>
            </div>
        </DashboardLayout>
    );
}
