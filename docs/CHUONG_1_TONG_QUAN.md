# CHƯƠNG 1: TỔNG QUAN VỀ ĐỀ TÀI

## 1.1. Giới thiệu đề tài

### 1.1.1. Lý do chọn đề tài

Trong kỷ nguyên số hóa hiện nay, công nghệ thông tin đã và đang len lỏi vào mọi ngóc ngách của đời sống xã hội, làm thay đổi căn bản cách thức con người tiếp cận thông tin và giải trí. Sự bùng nổ của Internet cùng với sự phổ biến của các thiết bị di động thông minh đã tạo ra một nhu cầu khổng lồ về các nền tảng giải trí trực tuyến. Trong đó, truyện tranh (Manga/Manhwa/Manhua) là một hình thức giải trí văn hóa đặc sắc, thu hút sự quan tâm của hàng triệu độc giả trên toàn thế giới, đặc biệt là giới trẻ.

Theo các thống kê gần đây, xu hướng đọc truyện tranh trực tuyến đang tăng trưởng mạnh mẽ, dần thay thế phương thức đọc sách giấy truyền thống nhờ vào tính tiện lợi, khả năng cập nhật nhanh chóng và kho tàng nội dung phong phú. Tuy nhiên, khi khảo sát thực tế các website đọc truyện hiện nay tại thị trường Việt Nam, có thể nhận thấy một số vấn đề tồn tại như: giao diện người dùng kém thân thiện, chưa tối ưu hóa trải nghiệm trên các thiết bị di động, xuất hiện quá nhiều quảng cáo gây phiền nhiễu, và tốc độ tải trang chưa đáp ứng được kỳ vọng của người dùng trong bối cảnh mạng tốc độ cao.

Xuất phát từ niềm đam mê với lĩnh vực phát triển web và mong muốn tạo ra một sản phẩm phục vụ cộng đồng độc giả truyện tranh chất lượng cao, tôi đã quyết định lựa chọn đề tài: "Xây dựng Website đọc truyện tranh". Đề tài này không chỉ mang tính thực tiễn cao, đáp ứng nhu cầu giải trí ngày càng tăng, mà còn là cơ hội để tôi áp dụng và kiểm chứng các kiến thức đã học về quy trình phát triển phần mềm, thiết kế cơ sở dữ liệu, và các công nghệ lập trình web hiện đại.

Dự án này hướng tới việc xây dựng một hệ thống website đọc truyện tranh trực tuyến với trải nghiệm người dùng tối ưu (User Experience), giao diện hiện đại (User Interface), tốc độ truy xuất dữ liệu nhanh và khả năng tương thích đa nền tảng. Hệ thống hứa hẹn sẽ giải quyết được các hạn chế của các nền tảng cũ, mang lại không gian giải trí lành mạnh và tiện ích cho độc giả.

### 1.1.2. Mục tiêu nghiên cứu

Đề tài tập trung vào các mục tiêu nghiên cứu và phát triển chính sau đây:

a. Mục tiêu tổng quát:
- Nghiên cứu và áp dụng quy trình phát triển phần mềm chuyên nghiệp để xây dựng một ứng dụng web hoàn chỉnh từ khâu phân tích yêu cầu, thiết kế hệ thống, cài đặt chương trình đến kiểm thử và triển khai.
- Tìm hiểu và làm chủ các công nghệ lập trình web tiên tiến hiện nay (ReactJS/Next.js, TailwindCSS, Supabase).

b. Mục tiêu cụ thể:
- Về mặt chức năng: Xây dựng hệ thống với đầy đủ các tính năng cốt lõi của một website đọc truyện:
    - Tìm kiếm và hiển thị danh sách truyện theo nhiều tiêu chí (thể loại, thời gian cập nhật, lượt xem).
    - Hệ thống đọc truyện mượt mà, hỗ trợ các chế độ đọc khác nhau.
    - Chức năng quản lý tài khoản người dùng, theo dõi truyện yêu thích, và tương tác (bình luận).
    - Hệ thống quản trị (Admin) cho phép cập nhật nội dung, quản lý người dùng và theo dõi thống kê.
- Về mặt phi chức năng:
    - Đảm bảo hiệu năng hệ thống: Tối ưu hóa thời gian tải trang và phản hồi của máy chủ.
    - Khả năng mở rộng: Thiết kế kiến trúc phần mềm linh hoạt, dễ dàng nâng cấp và bảo trì trong tương lai.
    - Bảo mật: Đảm bảo an toàn thông tin người dùng và dữ liệu hệ thống.

## 1.2. Các công nghệ sử dụng

Để đáp ứng các yêu cầu về hiệu năng và trải nghiệm người dùng hiện đại, đề tài sử dụng bộ công nghệ (Tech Stack) tiên tiến bao gồm:

1. Next.js (Frontend Framework):
- Đây là một framework React mạnh mẽ cho phép xây dựng các ứng dụng web với hiệu năng cao.
- Server-Side Rendering (SSR) & Static Site Generation (SSG): Next.js hỗ trợ render nội dung từ phía máy chủ hoặc tạo trang tĩnh, giúp tối ưu hóa SEO (Search Engine Optimization) và cải thiện tốc độ tải trang ban đầu đáng kể so với các ứng dụng React truyền thống (CSR).
- Routing: Hệ thống định tuyến dựa trên cấu trúc thư mục (File-based routing) giúp việc quản lý và điều hướng trang trở nên trực quan và dễ dàng.

2. React.js (Thư viện UI):
- Sử dụng React để xây dựng giao diện người dùng dựa trên thành phần (Component-based). Điều này giúp tái sử dụng mã nguồn, dễ dàng quản lý trạng thái (State) của ứng dụng và tạo ra các giao diện tương tác phức tạp một cách linh hoạt.

3. Supabase (Backend-as-a-Service):
- Supabase là một nền tảng mã nguồn mở thay thế cho Firebase, cung cấp một bộ công cụ backend hoàn chỉnh.
- PostgreSQL Database: Sử dụng PostgreSQL - hệ quản trị cơ sở dữ liệu quan hệ mạnh mẽ và phổ biến nhất thế giới mã nguồn mở, đảm bảo tính toàn vẹn và cấu trúc dữ liệu chặt chẽ.
- Authentication: Cung cấp giải pháp xác thực người dùng tích hợp sẵn, hỗ trợ đăng ký, đăng nhập và bảo mật phiên làm việc.
- Storage: Lưu trữ hình ảnh truyện và các tài nguyên tĩnh khác.

4. Tailwind CSS (Utility-first CSS Framework):
- Tailwind CSS cho phép xây dựng giao diện tùy biến nhanh chóng thông qua các lớp tiện ích (utility classes) được định nghĩa trước. Việc sử dụng Tailwind giúp giảm thiểu việc viết CSS thủ công, đảm bảo tính nhất quán trong thiết kế và hỗ trợ Responsive Design (thiết kế đáp ứng) dễ dàng cho mọi kích thước màn hình.

5. SASS (Syntactically Awesome Style Sheets):
- Sử dụng SASS (SCSS) kết hợp với các mô-đun CSS để xử lý các yêu cầu tùy chỉnh giao diện phức tạp mà các lớp tiện ích mặc định chưa đáp ứng đủ, đồng thời giúp tổ chức mã CSS rõ ràng hơn.

## 1.3. Xác định các Actor (Tác nhân) hệ thống

Dựa trên phân tích yêu cầu nghiệp vụ, hệ thống được thiết kế để phục vụ các nhóm tác nhân chính sau:

1. Khách (Guest / Visitor):
- Là người dùng chưa đăng nhập hoặc chưa có tài khoản trên hệ thống.
- Quyền hạn:
    - Truy cập trang chủ, xem danh sách truyện đề cử, truyện mới cập nhật.
    - Tìm kiếm truyện theo tên hoặc bộ lọc (thể loại, tác giả).
    - Xem chi tiết thông tin của một bộ truyện.
    - Đọc nội dung các chương truyện.
    - Xem các bình luận của người khác (nhưng không được phép bình luận).

2. Người dùng (User / Member):
Thừa hưởng tất cả các quyền của Khách, kèm theo các chức năng cá nhân hóa:
- Quyền hạn:
    - Đăng ký và đăng nhập tài khoản cá nhân.
    - Quản lý thông tin hồ sơ cá nhân (thay đổi ảnh đại diện, mật khẩu).
    - Chức năng "Theo dõi" (Follow): Lưu các truyện yêu thích vào danh sách riêng để nhận thông báo khi có chương mới.
    - Chức năng "Bình luận" (Comment): Tham gia thảo luận, chia sẻ ý kiến tại các trang truyện hoặc chương truyện.
    - Quản lý truyện cá nhân: Cho phép người dùng đăng tải, chỉnh sửa hoặc xóa các bộ truyện thuộc quyền sở hữu của mình (chức năng này yêu cầu người dùng phải đăng nhập).
    - Xem lịch sử đọc truyện của bản thân.

3. Quản trị viên (Administrator):
Là nhóm người dùng có quyền hạn cao nhất, chịu trách nhiệm vận hành toàn bộ hệ thống.
- Quyền hạn:
    - Quản trị cơ sở dữ liệu (Database Administration): Có quyền truy cập, chỉnh sửa và quản lý trực tiếp cơ sở dữ liệu của hệ thống.
    - Quản lý Người dùng: Quản lý toàn bộ danh sách người dùng, có quyền phân quyền, sửa đổi thông tin hoặc khóa tài khoản khi cần thiết.
    - Quản lý Truyện (Manga): Thêm mới, chỉnh sửa thông tin, xóa truyện, ẩn/hiện truyện (bao gồm cả truyện do người dùng đăng).
    - Quản lý Chương (Chapter): Đăng tải hình ảnh chương mới, sắp xếp thứ tự chương.
    - Quản lý Thể loại (Genre): Định nghĩa và cập nhật các thể loại truyện.

Việc xác định rõ ràng các Actor giúp định hình ranh giới chức năng của hệ thống và là cơ sở để xây dựng Biểu đồ Use Case (Use Case Diagram) trong các chương tiếp theo.
