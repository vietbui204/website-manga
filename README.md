# FPTxManga - Modern Manga Reading Platform

FPTxManga là một nền tảng đọc truyện tranh trực tuyến hiện đại, được xây dựng với công nghệ web mới nhất, tập trung vào trải nghiệm người dùng và tính năng quản lý nội dung mạnh mẽ.

## ✨ Tính Năng Nổi Bật

### 📖 Trải Nghiệm Đọc (Reader)
- **Giao diện hiện đại**: Thiết kế Dark Mode, tối ưu cho việc đọc truyện.
- **Lazy Loading**: Tải ảnh mượt mà, tiết kiệm băng thông.
- **Điều hướng thông minh**: Chuyển chương nhanh chóng, menu điều khiển ẩn hiện tự động.
- **Lịch sử đọc**: Tự động lưu lại chương đang đọc dở cho từng user.

### 🛠️ Dashboard Quản Lý (Creator Studio)
Dành cho người dùng đóng góp nội dung:
- **Upload Truyện**: Đăng tải truyện mới với đầy đủ thông tin (Ảnh bìa, Tác giả, Thể loại).
- **Upload Chương**: Hỗ trợ upload nhiều ảnh cùng lúc, tự động đổi tên và sắp xếp file.
- **Thống kê**: Xem tổng quan lượt xem, lượt theo dõi và số lượng truyện đã đăng (có biểu đồ trực quan).
- **Quản lý nội dung**: Xem và xoá các truyện/chương đã đăng.

### 👤 Người Dùng & Cộng Đồng
- **Hệ thống Tài khoản**: Đăng ký, Đăng nhập bảo mật (Supabase Auth).
- **Hồ sơ cá nhân**: Tuỳ chỉnh Avatar, Bút danh (Username) và Đổi mật khẩu.
- **Bình luận**: Thảo luận dưới mỗi chương truyện (Real-time).
- **Theo dõi**: Đánh dấu truyện yêu thích để nhận thông báo mới.
- **Tìm kiếm**: Tìm kiếm nhanh với gợi ý (Search Suggestions).

## 🚀 Công Nghệ Sử Dụng

- **Frontend**: [Next.js](https://nextjs.org/) (React Framework)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL)
- **File Storage**: Supabase Storage
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: Heroicons

## 🛠️ Cài Đặt & Chạy Local

1.  **Clone dự án**:
    ```bash
    git clone https://github.com/vietbui204/website-manga.git
    cd website-manga
    ```

2.  **Cài đặt dependencies**:
    ```bash
    npm install
    ```

3.  **Cấu hình môi trường**:
    Tạo file `.env.local` và điền thông tin Supabase của bạn:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your-project-url
    NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
    ```
    *(Lưu ý: Service Role Key chỉ dùng cho các script server-side, cẩn thận khi deploy)*

4.  **Chạy Development Server**:
    ```bash
    npm run dev
    ```
    Truy cập [http://localhost:3000](http://localhost:3000) để xem kết quả.

## 🗄️ Cấu Trúc Database (Supabase)

- **Auth**: `auth.users` (Quản lý user tích hợp sẵn của Supabase)
- **Profiles**: `public.profiles` (Thông tin mở rộng: username, avatar...)
- **Mangas**: `public.mangas` (Thông tin truyện)
- **Chapters**: `public.chapters` (Thông tin chương)
- **Comments**: `public.comments` (Bình luận)
- **Follows**: `public.follows` (Theo dõi truyện)
- **Reading History**: `public.reading_history` (Lịch sử đọc)

## 🤝 Đóng Góp

Mọi đóng góp đều được hoan nghênh! Vui lòng tạo Pull Request hoặc Issue để thảo luận.
