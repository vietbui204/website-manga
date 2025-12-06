# Manga website (mẫu tĩnh)

Đây là scaffold tĩnh tối giản để đọc truyện bằng ảnh. Mục tiêu: nhanh chóng có thể mở local để test reader.

Files tạo:
- `index.html` - danh sách truyện (tải từ `data/manga.json`)
- `reader.html` - trang đọc cho mỗi chương (tham số query `m` và `c`)
- `assets/css/style.css` - style cơ bản
- `assets/js/reader.js` - logic reader, lazy-load
- `data/manga.json` - sample metadata

Thêm ảnh:
Với sample data ở trên, đặt ảnh ở:
`assets/images/sample-manga/chapter-001/01.jpg`, `02.jpg`, `03.jpg`

Chạy local (PowerShell):
```powershell
# chạy một webserver tĩnh bằng Python 3
python -m http.server 8000
# rồi mở http://localhost:8000/index.html
```

Gợi ý tiếp theo:
- Thay đổi `data/manga.json` để thêm truyện/chapter
- Tối ưu ảnh (webp, resize)
- Thêm một trang admin hoặc sử dụng Firebase/Supabase để lưu metadata và upload ảnh

Supabase upload script
----------------------
Nếu bạn chọn Supabase (khuyến nghị), tôi đã thêm một script để upload tất cả ảnh trong `assets/images` lên Supabase Storage
1. Tạo project trên https://app.supabase.com
2. Tạo một bucket (ví dụ `manga-images`) hoặc dùng tên mặc định `manga-images`.
3. Lấy `SUPABASE_URL` và `SUPABASE_SERVICE_ROLE_KEY` từ project (service role key cho phép server upload). KHÔNG public key này.
4. Trong PowerShell, đặt biến môi trường và chạy upload:

```powershell
$env:SUPABASE_URL = "https://xyzcompany.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY = "<service-role-key>"
$env:SUPABASE_BUCKET = "manga-images"
node scripts/upload-images.js
```

Sau upload, ảnh sẽ có public URL:
`https://<SUPABASE_URL>/storage/v1/object/public/manga-images/<manga>/<chapter>/<page>`

Đồng bộ bảng `pages` với Storage
--------------------------------
Storage chỉ giữ file ảnh; để front-end biết thứ tự trang bạn cần ghi metadata vào Postgres.

1. Đảm bảo `data/manga.json` phản ánh slug/chapter và danh sách file (đúng như thư mục trong `assets/images`).
2. Đặt biến môi trường (giống phần upload) rồi chạy:
   ```powershell
   $env:SUPABASE_URL = "https://xyzcompany.supabase.co"
   $env:SUPABASE_SERVICE_ROLE_KEY = "<service-role-key>"
   $env:SUPABASE_BUCKET = "manga-images"
   npm run sync-pages
   ```
3. Script `scripts/sync-pages.js` sẽ:
   - tạo manga/chapter nếu chưa có trong bảng `mangas`/`chapters`
   - xóa & chèn lại bản ghi `pages` cho từng chapter với đường dẫn dạng `<mangaSlug>/<chapterSlug>/<file>`

Sau bước này, API hoặc helper có thể lấy danh sách trang từ Postgres và chuyển thành URL Storage (public hoặc signed) để render trong reader.

Next steps
----------
- Tôi có thể scaffold Next.js app (đã thêm skeleton) để hiển thị ảnh từ Supabase Storage.
- Khi bạn sẵn sàng, chạy script upload để chuyển ảnh hiện tại lên Storage.
