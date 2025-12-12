# CHƯƠNG 3: THIẾT KẾ HỆ THỐNG

## 3.1. Thiết kế Cơ sở dữ liệu (Database Design)

Trước khi đi vào chi tiết các lớp đối tượng, dưới đây là mô hình thực thể kết hợp (ERD - Entity Relationship Diagram) của hệ thống:

Mô tả: Hệ thống sử dụng PostgreSQL thông qua Supabase. Các bảng chính bao gồm Users (auth), Profiles, Mangas, Chapters, Genres, Comments, Follows.

### 3.1.1. Bảng `profiles` (Hồ sơ người dùng)
| STT | Tên thuộc tính | Kiểu dữ liệu | Giải thích | Ghi chú |
|:---:|:---|:---|:---|:---|
| 1 | `id` | UUID | Khóa chính, định danh người dùng | PK, FK (ref `auth.users`) |
| 2 | `username` | Text | Tên hiển thị trên hệ thống | Unique |
| 3 | `avatar_url` | Text | Đường dẫn ảnh đại diện | |

### 3.1.2. Bảng `mangas` (Truyện tranh)
| STT | Tên thuộc tính | Kiểu dữ liệu | Giải thích | Ghi chú |
|:---:|:---|:---|:---|:---|
| 1 | `id` | UUID | Khóa chính, định danh truyện | PK, Default: `uuid_generate_v4()` |
| 2 | `title` | Text | Tên truyện | Not Null |
| 3 | `slug` | Text | Đường dẫn thân thiện (SEO) | Unique, Not Null |
| 4 | `cover_url` | Text | Đường dẫn ảnh bìa | |
| 5 | `author` | Text | Tên tác giả | |
| 6 | `summary` | Text | Tóm tắt nội dung | |
| 7 | `views` | Integer | Tổng lượt xem | Default: 0 |
| 8 | `user_id` | UUID | Người đăng truyện | FK (ref `profiles.id`) |
| 9 | `created_at` | Timestamptz | Thời gian tạo | Default: `now()` |
| 10 | `updated_at` | Timestamptz | Thời gian cập nhật cuối cùng | |

### 3.1.3. Bảng `chapters` (Chương truyện)
| STT | Tên thuộc tính | Kiểu dữ liệu | Giải thích | Ghi chú |
|:---:|:---|:---|:---|:---|
| 1 | `id` | UUID | Khóa chính, định danh chương | PK |
| 2 | `manga_id` | UUID | Thuộc về bộ truyện nào | FK (ref `mangas.id`) |
| 3 | `title` | Text | Tên chương (VD: Chương 1 - Mở đầu) | |
| 4 | `slug` | Text | Đường dẫn thân thiện | |
| 5 | `chapter_number` | Float | Số thứ tự chương | Used for sorting |
| 6 | `images` | JSONB | Danh sách URL các trang truyện | |
| 7 | `created_at` | Timestamptz | Thời gian đăng | Default: `now()` |

### 3.1.4. Bảng `genres` (Thể loại)
| STT | Tên thuộc tính | Kiểu dữ liệu | Giải thích | Ghi chú |
|:---:|:---|:---|:---|:---|
| 1 | `id` | UUID | Khóa chính | PK |
| 2 | `name` | Text | Tên thể loại (Hành động, Tình cảm...) | Unique |
| 3 | `slug` | Text | Slug thể loại | Unique |
| 4 | `created_at` | Timestamptz | Thời gian tạo | |

### 3.1.5. Bảng `manga_genres` (Liên kết Truyện - Thể loại)
| STT | Tên thuộc tính | Kiểu dữ liệu | Giải thích | Ghi chú |
|:---:|:---|:---|:---|:---|
| 1 | `id` | UUID | Khóa chính | PK |
| 2 | `manga_id` | UUID | ID Truyện | FK (ref `mangas.id`) |
| 3 | `genre_id` | UUID | ID Thể loại | FK (ref `genres.id`) |

### 3.1.6. Bảng `comments` (Bình luận)
| STT | Tên thuộc tính | Kiểu dữ liệu | Giải thích | Ghi chú |
|:---:|:---|:---|:---|:---|
| 1 | `id` | UUID | Khóa chính | PK |
| 2 | `user_id` | UUID | Người bình luận | FK (ref `profiles.id`) |
| 3 | `manga_id` | UUID | Bình luận về truyện nào | FK (ref `mangas.id`) |
| 4 | `content` | Text | Nội dung bình luận | Not Null |
| 5 | `created_at` | Timestamptz | Thời gian bình luận | Default: `now()` |

### 3.1.7. Bảng `follows` (Theo dõi)
| STT | Tên thuộc tính | Kiểu dữ liệu | Giải thích | Ghi chú |
|:---:|:---|:---|:---|:---|
| 1 | `id` | UUID | Khóa chính | PK |
| 2 | `user_id` | UUID | Người theo dõi | FK (ref `profiles.id`) |
| 3 | `manga_id` | UUID | Truyện được theo dõi | FK (ref `mangas.id`) |
| 4 | `created_at` | Timestamptz | Thời gian theo dõi | |

### 3.1.8. Bảng `reading_history` (Lịch sử đọc)
| STT | Tên thuộc tính | Kiểu dữ liệu | Giải thích | Ghi chú |
|:---:|:---|:---|:---|:---|
| 1 | `id` | UUID | Khóa chính | PK |
| 2 | `user_id` | UUID | Người đọc | FK (ref `profiles.id`) |
| 3 | `manga_id` | UUID | Truyện đang đọc | FK (ref `mangas.id`) |
| 4 | `chapter_id` | UUID | Chương mới nhất đã đọc | FK (ref `chapters.id`) |
| 5 | `last_read_at` | Timestamptz | Thời gian đọc gần nhất | |


## 3.2. Biểu đồ Lớp (Class Diagram)

Biểu đồ dưới đây mô tả cấu trúc các lớp (Class) trong hệ thống, bao gồm các thuộc tính (Attributes) và phương thức (Methods) chính, cũng như mối quan hệ giữa chúng.

```plantuml
@startuml
skinparam classAttributeIconSize 0

class User {
  +id: UUID
  +email: String
  +password: String
  +signUp()
  +signIn()
  +signOut()
}

class Profile {
  +id: UUID
  +username: String
  +avatar_url: String
  +created_at: DateTime
  +updateInfo(username, avatar)
  +changePassword(newPass)
}

class Manga {
  +id: UUID
  +title: String
  +slug: String
  +cover_url: String
  +author: String
  +summary: Text
  +views: Integer
  +user_id: UUID
  +created_at: DateTime
  +updated_at: DateTime
  +create()
  +update()
  +delete()
  +getDetails()
  +increaseView()
}

class Chapter {
  +id: UUID
  +manga_id: UUID
  +title: String
  +slug: String
  +chapter_number: Float
  +images: List<String>
  +created_at: DateTime
  +create()
  +delete()
  +getImages()
}

class Genre {
  +id: UUID
  +name: String
  +slug: String
  +list()
}

class Comment {
  +id: UUID
  +user_id: UUID
  +manga_id: UUID
  +content: Text
  +created_at: DateTime
  +post()
  +delete()
}

class Follow {
  +id: UUID
  +user_id: UUID
  +manga_id: UUID
  +created_at: DateTime
  +add()
  +remove()
}

class ReadingHistory {
  +id: UUID
  +user_id: UUID
  +manga_id: UUID
  +chapter_id: UUID
  +last_read_at: DateTime
  +save()
  +getRecent()
}

' Relationships

User "1" -- "1" Profile : has >

Profile "1" -- "0..*" Manga : uploads >
Profile "1" -- "0..*" Comment : writes >
Profile "1" -- "0..*" Follow : follows >
Profile "1" -- "0..*" ReadingHistory : has >

Manga "1" *-- "0..*" Chapter : contains >
Manga "0..*" -- "0..*" Genre : has >
Manga "1" -- "0..*" Comment : has >
Manga "1" -- "0..*" Follow : is followed by >
Manga "1" -- "0..*" ReadingHistory : tracked in >

Chapter "1" -- "0..*" ReadingHistory : last read in >

@enduml
```

### 3.2.1. Chi tiết các Lớp (Classes Detail)

#### 1. Lớp User (Tài khoản)
   Mô tả: Đại diện cho tài khoản người dùng được quản lý bởi hệ thống xác thực (Supabase Auth).
   Thuộc tính:
       `id`: UUID (Khóa chính).
       `email`: Email đăng nhập.
       `password`: Mật khẩu (đã mã hóa).
   Phương thức:
       `signUp()`: Đăng ký tài khoản mới.
       `signIn()`: Đăng nhập vào hệ thống.
       `signOut()`: Đăng xuất.

#### 2. Lớp Profile (Hồ sơ người dùng)
   Mô tả: Chứa thông tin bổ sung của người dùng, liên kết 1-1 với bảng `users`.
   Thuộc tính:
       `id`: UUID (Khóa chính, trùng với User ID).
       `username`: Tên hiển thị người dùng.
       `avatar_url`: Đường dẫn ảnh đại diện.
   Phương thức:
       `updateInfo()`: Cập nhật tên và ảnh đại diện.
       `changePassword()`: Thay đổi mật khẩu đăng nhập.

#### 3. Lớp Manga (Truyện tranh)
   Mô tả: Đối tượng chính của hệ thống, chứa thông tin về các bộ truyện.
   Thuộc tính:
       `id`: UUID (Khóa chính).
       `title`: Tên truyện.
       `cover_url`: Ảnh bìa.
       `author`: Tên tác giả.
       `views`: Tổng lượt xem.
       `slug`: Đường dẫn thân thiện SEO.
   Phương thức:
       `create()`: Tạo truyện mới.
       `update()`: Cập nhật thông tin truyện.
       `delete()`: Xóa truyện (Soft delete hoặc Hard delete).
       `increaseView()`: Tăng lượt xem khi có người đọc.

#### 4. Lớp Chapter (Chương truyện)
   Mô tả: Các chương thuộc về một bộ truyện cụ thể.
   Thuộc tính:
       `id`: Data ID.
       `manga_id`: Khóa ngoại tham chiếu đến Manga.
       `images`: Danh sách URL các trang truyện (JSON Array).
       `chapter_number`: Số thứ tự chương (VD: 1, 1.5, 2).
   Phương thức:
       `create()`: Đăng chương mới.
       `getImages()`: Lấy danh sách ảnh để hiển thị.

#### 5. Lớp Follow (Theo dõi)
   Mô tả: Lưu trữ trạng thái người dùng theo dõi các bộ truyện.
   Thuộc tính:
       `user_id`: Người theo dõi.
       `manga_id`: Truyện được theo dõi.
   Phương thức:
       `add()`: Thêm vào danh sách theo dõi.
       `remove()`: Hủy theo dõi.

### 3.2.2. Mối quan hệ giữa các lớp (Relationships)

1.  User - Profile (1 - 1):
       Mỗi tài khoản `User` có duy nhất một `Profile` tương ứng để lưu thông tin hiển thị.
2.  Profile - Manga (1 - N):
       Một người dùng (`Profile`) có thể đăng tải nhiều bộ truyện (`Manga`).
       Mỗi bộ truyện thuộc về một người đăng (Uploader).
3.  Manga - Chapter (1 - N - Composition):
       Một bộ truyện gồm nhiều chương.
       Quan hệ Composition (--): Nếu bộ truyện bị xóa, các chương con của nó cũng sẽ bị xóa theo.
4.  Manga - Genre (N - N):
       Một truyện có thể thuộc nhiều thể loại, và một thể loại chứa nhiều truyện.
5.  User - Manga (Follow & Comment & History):
       Người dùng có thể theo dõi (`Follow`), bình luận (`Comment`), và lưu lịch sử đọc (`ReadingHistory`) trên nhiều bộ truyện khác nhau.


## 3.3. Biểu đồ Trạng thái (State Diagram)

Dưới đây là các biểu đồ trạng thái mô tả vòng đời của các đối tượng chính trong hệ thống.

### 3.3.1. Biểu đồ trạng thái của Truyện (Manga)

Mô tả các trạng thái của một bộ truyện từ khi được tạo cho đến khi hoàn thành hoặc bị xóa.

```plantuml
@startuml
[*] --> Mới_Tạo : Đăng truyện

state "Mới Tạo (New)" as Mới_Tạo
state "Đang Tiến Hành (Ongoing)" as Đang_Tiến_Hành
state "Hoàn Thành (Completed)" as Hoàn_Thành
state "Tạm Ngưng (On Hold)" as Tạm_Ngưng
state "Đã Ẩn (Hidden)" as Đã_Ẩn

Mới_Tạo --> Đang_Tiến_Hành : Cập nhật chương mới
Đang_Tiến_Hành --> Tạm_Ngưng : Tác giả thông báo nghỉ
Tạm_Ngưng --> Đang_Tiến_Hành : Ra chương mới
Đang_Tiến_Hành --> Hoàn_Thành : Đăng chương cuối
Hoàn_Thành --> Đang_Tiến_Hành : Viết phần tiếp theo (Sequel)

state Admin_Action {
  Đang_Tiến_Hành --> Đã_Ẩn : Vi phạm quy định
  Hoàn_Thành --> Đã_Ẩn : Vi phạm
  Đã_Ẩn --> Đang_Tiến_Hành : Khôi phục
}

Đã_Ẩn --> [*] : Xóa vĩnh viễn
@enduml
```

### 3.3.2. Biểu đồ trạng thái của Tài khoản (User Account)

Mô tả các trạng thái hoạt động của tài khoản người dùng trên hệ thống.

```plantuml
@startuml
[*] --> Chưa_Xác_Thực : Đăng ký

state "Chưa Xác Thực\n(Unverified)" as Chưa_Xác_Thực
state "Hoạt Động\n(Active)" as Hoạt_Động
state "Bị Khóa\n(Banned)" as Bị_Khóa

Chưa_Xác_Thực --> Hoạt_Động : Xác nhận Email
Hoạt_Động --> Bị_Khóa : Vi phạm (Admin Ban)
Bị_Khóa --> Hoạt_Động : Mở khóa (Admin Unban)

Hoạt_Động --> [*] : Người dùng xóa tài khoản
Bị_Khóa --> [*] : Xóa vĩnh viễn
@enduml
```

### 3.3.3. Biểu đồ trạng thái của Chương truyện (Chapter)

Mô tả quá trình xử lý một chương truyện khi đăng tải.

```plantuml
@startuml
[*] --> Soạn_Thảo : Chọn ảnh & Nhập thông tin

state "Soạn Thảo (Draft)" as Soạn_Thảo
state "Đang Upload (Uploading)" as Đang_Upload
state "Đã Đăng (Published)" as Đã_Đăng
state "Lỗi (Error)" as Lỗi

Soạn_Thảo --> Đang_Upload : Nhấn "Đăng tải"
Đang_Upload --> Đã_Đăng : Upload & Lưu DB thành công
Đang_Upload --> Lỗi : Mất mạng / Lỗi Server
Lỗi --> Đang_Upload : Thử lại

Đã_Đăng --> [*] : Xóa chương
@enduml
```

### Giải thích các lớp chính:

1.  User: Đại diện cho tài khoản xác thực (Auth User).
2.  Profile: Thông tin mở rộng của người dùng (tên hiển thị, avatar).
3.  Manga: Đối tượng truyện tranh, chứa thông tin cơ bản và thống kê.
4.  Chapter: Các chương của truyện, chứa danh sách ảnh.
5.  Genre: Thể loại truyện.
6.  Comment: Bình luận của người dùng.
7.  Follow: Quan hệ theo dõi giữa người dùng và truyện.
8.  ReadingHistory: Lưu vết đọc truyện của người dùng.

## 3.4. Biểu đồ Trình tự (Sequence Diagram)

Dưới đây là các biểu đồ trình tự mô tả tương tác giữa Người dùng (Actor), Giao diện (VIew), Controller và Database.

### 3.4.1. Đăng ký & Đăng nhập

```plantuml
@startuml
actor User
boundary "Login/Register Page" as UI
control "Auth Controller" as Auth
database "Supabase DB" as DB

== Đăng ký ==
User -> UI: Nhập Email, Pass
UI -> Auth: Đăng ký(email, pass)
Auth -> DB: createAccount()
alt Trùng Email
    DB --> Auth: Lỗi (User exist)
    Auth --> UI: Báo lỗi Email tồn tại
else Thành công
    DB --> Auth: OK
    Auth --> UI: Thông báo thành công
end

== Đăng nhập ==
User -> UI: Nhập Email, Pass
UI -> Auth: Đăng nhập(email, pass)
Auth -> DB: authenticate()
alt Sai thông tin
    DB --> Auth: Lỗi
    Auth --> UI: Báo lỗi đăng nhập
else Đúng
    DB --> Auth: Token/Session
    Auth --> UI: Chuyển hướng Dashboard
end
@enduml
```

### 3.4.2. Tìm kiếm Truyện

```plantuml
@startuml
actor User
boundary "Search Page" as UI
control "Search Controller" as Ctrl
database "Manga Table" as DB

User -> UI: Nhập từ khóa "abc"
UI -> Ctrl: searchManga("abc")
Ctrl -> DB: query(title ilike %abc%)
DB --> Ctrl: List<Manga>
Ctrl --> UI: Hiển thị danh sách kết quả
User -> UI: Click chọn truyện
UI -> User: Chuyển trang chi tiết
@enduml
```

### 3.4.3. Đọc Truyện (Load Chương)

```plantuml
@startuml
actor User
boundary "Chapter Page" as UI
control "Chapter Controller" as Ctrl
database "Database (Chapters)" as DB
participant "Storage (Images)" as Storage

User -> UI: Chọn đọc chương X
UI -> Ctrl: getChapterImages(chapter_id)
Ctrl -> DB: getImagesList()
DB --> Ctrl: List<ImagePaths>
loop Tải từng ảnh
    Ctrl -> Storage: getPublicUrl(path)
    Storage --> Ctrl: URL
end
Ctrl --> UI: Danh sách Image URLs
UI -> User: Hiển thị nội dung truyện
@enduml
```

### 3.4.4. Đăng Bình luận

```plantuml
@startuml
actor User
boundary "Manga Detail UI" as UI
control "Comment Controller" as Ctrl
database "Comments Table" as DB

User -> UI: Nhập nội dung & Gửi
UI -> Ctrl: postComment(content, manga_id)
alt Chưa đăng nhập
    Ctrl --> UI: Yêu cầu đăng nhập
else Đã đăng nhập
    Ctrl -> DB: insert(user_id, content)
    DB --> Ctrl: OK
    Ctrl --> UI: Cập nhật danh sách bình luận
    UI -> User: Hiển thị bình luận mới
end
@enduml
```

### 3.4.5. Đăng Chương mới (Upload)

```plantuml
@startuml
actor Uploader
boundary "Upload UI" as UI
control "Upload Controller" as Ctrl
participant "Supabase Storage" as Storage
database "Database" as DB

Uploader -> UI: Chọn ảnh & Nhập info
UI -> Ctrl: uploadRequest(files, metadata)
loop Từng file ảnh
    Ctrl -> Storage: upload(file)
    alt Lỗi
        Storage --> Ctrl: Fail
        Ctrl --> UI: Báo lỗi dừng upload
    else OK
        Storage --> Ctrl: Success (Path)
    end
end
Ctrl -> DB: createChapter(info, image_paths)
DB --> Ctrl: Success
Ctrl --> UI: Thông báo thành công
@enduml
```

### 3.4.6. Theo dõi Truyện

```plantuml
@startuml
actor User
boundary "Manga Detail UI" as UI
control "Follow Controller" as Ctrl
database "Follows Table" as DB

User -> UI: Nhấn nút "Theo dõi"
UI -> Ctrl: toggleFollow(manga_id)
Ctrl -> DB: checkExists(user_id, manga_id)
alt Đã theo dõi
    DB --> Ctrl: True
    Ctrl -> DB: delete()
    DB --> Ctrl: OK
    Ctrl --> UI: Đổi nút thành "Theo dõi"
else Chưa theo dõi
    DB --> Ctrl: False
    Ctrl -> DB: insert()
    DB --> Ctrl: OK
    Ctrl --> UI: Đổi nút thành "Đang theo dõi"
end
@enduml
```

## 3.4. Biểu đồ Trình tự (Sequence Diagram)

Dưới đây là các biểu đồ trình tự mô tả tương tác giữa Người dùng (Actor), Giao diện (VIew), Controller và Database.

### 3.4.1. Đăng ký & Đăng nhập

```plantuml
@startuml
actor User
boundary "Login/Register Page" as UI
control "Auth Controller" as Auth
database "Supabase DB" as DB

== Đăng ký ==
User -> UI: Nhập Email, Pass
UI -> Auth: Đăng ký(email, pass)
Auth -> DB: createAccount()
alt Trùng Email
    DB --> Auth: Lỗi (User exist)
    Auth --> UI: Báo lỗi Email tồn tại
else Thành công
    DB --> Auth: OK
    Auth --> UI: Thông báo thành công
end

== Đăng nhập ==
User -> UI: Nhập Email, Pass
UI -> Auth: Đăng nhập(email, pass)
Auth -> DB: authenticate()
alt Sai thông tin
    DB --> Auth: Lỗi
    Auth --> UI: Báo lỗi đăng nhập
else Đúng
    DB --> Auth: Token/Session
    Auth --> UI: Chuyển hướng Dashboard
end
@enduml
```

### 3.4.2. Tìm kiếm Truyện

```plantuml
@startuml
actor User
boundary "Search Page" as UI
control "Search Controller" as Ctrl
database "Manga Table" as DB

User -> UI: Nhập từ khóa "abc"
UI -> Ctrl: searchManga("abc")
Ctrl -> DB: query(title ilike %abc%)
DB --> Ctrl: List<Manga>
Ctrl --> UI: Hiển thị danh sách kết quả
User -> UI: Click chọn truyện
UI -> User: Chuyển trang chi tiết
@enduml
```

### 3.4.3. Đọc Truyện (Load Chương)

```plantuml
@startuml
actor User
boundary "Chapter Page" as UI
control "Chapter Controller" as Ctrl
database "Database (Chapters)" as DB
participant "Storage (Images)" as Storage

User -> UI: Chọn đọc chương X
UI -> Ctrl: getChapterImages(chapter_id)
Ctrl -> DB: getImagesList()
DB --> Ctrl: List<ImagePaths>
loop Tải từng ảnh
    Ctrl -> Storage: getPublicUrl(path)
    Storage --> Ctrl: URL
end
Ctrl --> UI: Danh sách Image URLs
UI -> User: Hiển thị nội dung truyện
@enduml
```

### 3.4.4. Đăng Bình luận

```plantuml
@startuml
actor User
boundary "Manga Detail UI" as UI
control "Comment Controller" as Ctrl
database "Comments Table" as DB

User -> UI: Nhập nội dung & Gửi
UI -> Ctrl: postComment(content, manga_id)
alt Chưa đăng nhập
    Ctrl --> UI: Yêu cầu đăng nhập
else Đã đăng nhập
    Ctrl -> DB: insert(user_id, content)
    DB --> Ctrl: OK
    Ctrl --> UI: Cập nhật danh sách bình luận
    UI -> User: Hiển thị bình luận mới
end
@enduml
```

### 3.4.5. Đăng Chương mới (Upload)

```plantuml
@startuml
actor Uploader
boundary "Upload UI" as UI
control "Upload Controller" as Ctrl
participant "Supabase Storage" as Storage
database "Database" as DB

Uploader -> UI: Chọn ảnh & Nhập info
UI -> Ctrl: uploadRequest(files, metadata)
loop Từng file ảnh
    Ctrl -> Storage: upload(file)
    alt Lỗi
        Storage --> Ctrl: Fail
        Ctrl --> UI: Báo lỗi dừng upload
    else OK
        Storage --> Ctrl: Success (Path)
    end
end
Ctrl -> DB: createChapter(info, image_paths)
DB --> Ctrl: Success
Ctrl --> UI: Thông báo thành công
@enduml
```

### 3.4.6. Theo dõi Truyện

```plantuml
@startuml
actor User
boundary "Manga Detail UI" as UI
control "Follow Controller" as Ctrl
database "Follows Table" as DB

User -> UI: Nhấn nút "Theo dõi"
UI -> Ctrl: toggleFollow(manga_id)
Ctrl -> DB: checkExists(user_id, manga_id)
alt Đã theo dõi
    DB --> Ctrl: True
    Ctrl -> DB: delete()
    DB --> Ctrl: OK
    Ctrl --> UI: Đổi nút thành "Theo dõi"
else Chưa theo dõi
    DB --> Ctrl: False
    Ctrl -> DB: insert()
    DB --> Ctrl: OK
    Ctrl --> UI: Đổi nút thành "Đang theo dõi"
end
@enduml
```

## 3.5. Biểu đồ Thành phần (Component Diagram)

Biểu đồ này mô tả các thành phần phần mềm chính và sự phụ thuộc giữa chúng.

```plantuml
@startuml
package "Client Side (Next.js)" {
  [Pages (UI)] as Pages
  [Components] as Comps
  [API Client (Supabase JS)] as Client
  
  Pages ..> Comps : use
  Pages ..> Client : call
}

package "Serverless Backend" {
  [Next.js API Routes] as API
  [Supabase Auth] as Auth
  [Supabase Storage] as Storage
}

database "PostgreSQL DB" {
  [Tables (Users, Manga...)] as DB
}

Client ..> Auth : authenticate
Client ..> DB : query (via REST/Realtime)
Client ..> Storage : upload/download
Client ..> API : fetch (proxy)

API ..> DB : execute SQL
@enduml
```

## 3.6. Biểu đồ Triển khai (Deployment Diagram)

Biểu đồ mô tả kiến trúc phần cứng và môi trường triển khai của hệ thống.

```plantuml
@startuml
node "Client Device (PC/Mobile)" {
  component "Web Browser" as Browser
}

node "Vercel Cloud" {
  component "Next.js Application" as NextApp
  component "API Routes (Serverless)" as API
}

cloud "Supabase Cloud" {
  database "PostgreSQL" as DB
  component "Authentication Service" as Auth
  component "Storage Service" as Storage
}

Browser -- NextApp : HTTPS (HTML/JS)
Browser -- API : HTTPS (JSON)
Browser -- Auth : HTTPS (Auth API)
Browser -- Storage : HTTPS (Assets)

NextApp -- DB : SQL over HTTPS
API -- DB : SQL over HTTPS
API -- Storage : S3 API
@enduml
```

## 3.7. Thiết kế Giao diện (User Interface Design)

Mô tả chi tiết các trang giao diện chính của hệ thống.

### 3.7.1. Trang Chủ (Homepage)
   Mục đích: Là trang đích chính, giới thiệu các truyện nổi bật và điều hướng người dùng.
   Thành phần chính:
       Thanh điều hướng (Navbar): Logo, Tìm kiếm (Search Bar), Danh mục thể loại, Nút Đăng nhập/Đăng ký hoặc Avatar User.
       Banner/Hero Section: Slide ảnh bìa các truyện "Hot" nhất, kèm nút "Đọc ngay".
       Danh sách Truyện Nổi bật: Grid hiển thị Top truyện theo lượt xem (Ảnh bìa, Tên, Badge Rank).
       Danh sách Mới cập nhật: Lưới các truyện vừa có chương mới, sắp xếp theo thời gian giảm dần.
       Footer: Thông tin bản quyền, liên hệ.

### 3.7.2. Trang Chi tiết Truyện (Manga Detail)
   Mục đích: Cung cấp đầy đủ thông tin về một bộ truyện và danh sách chương.
   Thành phần chính:
       Info Block: Ảnh bìa lớn, Tên truyện, Tác giả, Tình trạng, Thể loại (Tags), Tóm tắt nội dung.
       Action Buttons: Nút "Đọc từ đầu", "Đọc mới nhất", "Theo dõi" (Toggle Button).
       Danh sách Chương: Bảng liệt kê các chương (Số chương, Tên chương, Ngày đăng, Lượt xem), có phân trang hoặc cuộn.
       Bình luận: Khu vực cho phép người dùng viết và xem bình luận.

### 3.7.3. Trang Đọc Truyện (Reader)
   Mục đích: Hiển thị nội dung truyện (ảnh) cho người đọc.
   Thành phần chính:
       Sticky Control Bar: Thanh công cụ cố định (hoặc ẩn hiện khi scroll) chứa: Tên truyện, Dropdown chọn chương, Nút Trước/Sau (Prev/Next), Nút Home, Cài đặt hiển thị (nếu có).
       Image Viewer: Danh sách ảnh truyện hiển thị dọc (Webtoon style) hoặc từng trang, tải dạng Lazy Load.
       Navigation Bottom: Nút điều hướng cuối trang để chuyển sang chương tiếp theo.

### 3.7.4. Trang Tìm kiếm & Lọc (Search & Filter)
   Mục đích: Giúp người dùng tìm truyện theo từ khóa hoặc tiêu chí.
   Thành phần chính:
       Thanh tìm kiếm nâng cao: Input nhập từ khóa.
       Bộ lọc (Filter): Checkbox/Dropdown chọn Thể loại (Action, Romance...), Trạng thái (Hoàn thành/Đang tiến hành), Sắp xếp (View/New).
       Kết quả: Grid danh sách truyện thỏa mãn điều kiện.

### 3.7.5. Dashboard Quản lý (User/Admin Dashboard)
   Mục đích: Khu vực quản trị dành cho người dùng có quyền đăng truyện.
   Thành phần chính:
       Sidebar: Menu chức năng (Thống kê, Quản lý Truyện, Đăng truyện, Cài đặt).
       Overview Stats: Cards hiển thị Tổng view, Tổng truyện, Tổng follow.
       Biểu đồ: Bar Chart thống kê lượt xem theo thời gian hoặc theo truyện.
       Danh sách Truyện của tôi: Bảng quản lý (CRUD) các truyện đã đăng, kèm nút Sửa/Xóa/Thêm chương.

### 3.7.6. Trang Hồ sơ & Cài đặt (Profile & Settings)
   Mục đích: Quản lý thông tin cá nhân.
   Thành phần chính:
       Profile Info: Avatar (cho phép upload thay đổi), Username (cho phép sửa), Email (read-only).
       Đổi mật khẩu: Form nhập Mật khẩu cũ/mới để thay đổi.
       Tủ truyện: Tab hiển thị "Truyện đang theo dõi" và "Lịch sử đọc".

### 3.7.7. Trang Đăng nhập / Đăng ký (Auth Pages)
   Mục đích: Xác thực người dùng.
   Giao diện:
       Thiết kế dạng Card căn giữa màn hình, nền mờ (Glassmorphism).
       Form: Input Email, Password.
       Action: Nút "Đăng nhập", "Đăng ký", Link "Quên mật khẩu", Link chuyển đổi giữa Login/Register.

